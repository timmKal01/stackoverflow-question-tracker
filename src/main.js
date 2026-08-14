import { Actor, log } from 'apify';
import { fetchQuestions } from './stackexchange.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
const { tags, site = 'stackoverflow', unansweredOnly = false, daysBack = 7, maxResults = 25 } = input;

if (!tags) {
    throw new Error('"tags" is required.');
}

/** Must match the event name configured in this Actor's pay-per-event pricing on Apify. */
const QUESTION_SEARCH_EVENT = 'question-search';

const endDate = new Date();
const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

const questions = await fetchQuestions({
    tags,
    site,
    unansweredOnly,
    startDate,
    endDate,
    maxResults: Math.min(maxResults, 100),
});

for (const question of questions) {
    await Actor.pushData(question);
}

await Actor.charge({ eventName: QUESTION_SEARCH_EVENT });

log.info(`Pushed ${questions.length} question(s)`);

await Actor.exit();
