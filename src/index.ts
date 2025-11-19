import { llmScore } from '../lib/llmScore';

async function main() {
    const score = await llmScore('Hello, world!');
    console.log(score);
}

main();