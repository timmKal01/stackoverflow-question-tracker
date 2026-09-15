const BASE_URL = 'https://api.stackexchange.com/2.3/questions';

const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const REQUEST_TIMEOUT_MS = 15_000;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url) {
    let lastError;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
        let res;
        try {
            res = await fetch(url, { headers: { Connection: 'close' }, signal: controller.signal });
        } catch (err) {
            lastError = err.name === 'AbortError' ? new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms: ${url}`) : err;
            if (attempt < MAX_ATTEMPTS) {
                await sleep(1000 * 2 ** (attempt - 1));
                continue;
            }
            throw lastError;
        } finally {
            clearTimeout(timeoutId);
        }
        if (res.ok) return res;
        if (!TRANSIENT_STATUSES.has(res.status)) {
            throw new Error(`Stack Exchange API request failed: ${res.status} ${res.statusText}`);
        }
        lastError = new Error(`Stack Exchange API request failed: ${res.status} ${res.statusText}`);
        if (attempt < MAX_ATTEMPTS) await sleep(1000 * 2 ** (attempt - 1));
    }
    throw lastError;
}

export async function fetchQuestions({ tags, site, unansweredOnly, startDate, endDate, maxResults }) {
    const url = new URL(BASE_URL);
    url.searchParams.set('order', 'desc');
    url.searchParams.set('sort', 'creation');
    url.searchParams.set('tagged', tags);
    url.searchParams.set('site', site);
    url.searchParams.set('fromdate', String(Math.floor(startDate.getTime() / 1000)));
    url.searchParams.set('todate', String(Math.floor(endDate.getTime() / 1000)));
    // Fetch extra since client-side unansweredOnly filtering can reduce the count below maxResults.
    url.searchParams.set('pagesize', String(Math.min(maxResults * (unansweredOnly ? 3 : 1), 100)));

    const res = await fetchWithRetry(url);
    const body = await res.json();
    if (body.error_message) {
        throw new Error(`Stack Exchange API error: ${body.error_message}`);
    }

    let items = body.items ?? [];
    if (unansweredOnly) items = items.filter((q) => q.answer_count === 0);

    return items.slice(0, maxResults).map((q) => ({
        questionId: q.question_id,
        title: q.title,
        tags: q.tags,
        site,
        isAnswered: q.is_answered,
        answerCount: q.answer_count,
        viewCount: q.view_count,
        score: q.score,
        owner: q.owner?.display_name ?? null,
        createdAt: new Date(q.creation_date * 1000).toISOString(),
        link: q.link,
    }));
}
