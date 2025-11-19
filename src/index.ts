import { llmScore } from '../lib/llmScore';
import decryptSubstitutionCipher from './1';

const CIPHERTEXT = `
Xqghu vriw pruqlqj oljkw, Ohqd rshqhg khu odswrs dqg zurwh d surplvh wr khuvhoi.
Wrgdb vkh zrxog pryh rqh vwhs forvhu wr wkh ixwxuh vkh lpdjlqhg:
exloglqj surgxfwv wkdw vroyh uhdo sureohpv, ohduqlqj uhohqwohvvob, dqg uhixvlqj frpiruwdeoh hafxvhv.
Vkh olvwhg wkuhh dfwlrqv: vkls rqh xvhixo ihdwxuh, uhdg whq lqvljkwixo sdjhv, dqg vhqg d eudyh phvvdjh dvnlqj iru ihhgedfn.
Qrqh ri wkhp zhuh gudpdwlf, bhw wrjhwkhu wkhb iruphg txlhw prphqwxp.
Eb hyhqlqj, wkh fkhfnolvw zdv frpsohwh.
Surjuhvv ihow vpdoo exw vrolg, olnh odblqj d vlqjoh eulfn lq d olihorqj fdwkhgudo. Vkh vplohg, uhdolclqj glvflsolqh kdg jhqwob rxwjurzq olqjhulqj wudfh ri grxew.
`.trim();

async function main() {
    const plaintext = decryptSubstitutionCipher(CIPHERTEXT);
    const score = await llmScore(plaintext);
    console.log(`Score do LLM: ${score.score}`);
}

main();