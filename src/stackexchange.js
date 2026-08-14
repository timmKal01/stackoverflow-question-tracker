const BASE_URL = 'https://api.stackexchange.com/2.3/questions';

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

    const res = await fetch(url, { headers: { Connection: 'close' } });
    if (!res.ok) {
        throw new Error(`Stack Exchange API request failed: ${res.status} ${res.statusText}`);
    }
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
