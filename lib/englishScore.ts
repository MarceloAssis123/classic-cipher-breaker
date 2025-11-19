/**
 * English Statistical Language Model for Classical Cipher Breaking
 * 
 * This module provides a deterministic language model that scores text
 * based on English character frequency statistics (unigrams and bigrams).
 */

// ============================================================================
// CONSTANTS AND MAPPINGS
// ============================================================================

/** Fixed alphabet: A-Z plus space (27 characters total) */
export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ";

/** Total number of characters in the alphabet */
export const ALPHABET_SIZE = 27;

/** Map each character to its index in the alphabet for quick lookup */
const charToIndex: Record<string, number> = {};
for (let i = 0; i < ALPHABET.length; i++) {
    charToIndex[ALPHABET[i]] = i;
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Optional parameters for building the language model */
export interface LanguageModelOptions {
    /** Add-k smoothing parameter (default: 1.0 for Laplace smoothing) */
    smoothingK?: number;
    /** Weight for bigram score in final calculation (default: 0.7) */
    lambdaBigram?: number;
}

/** Trained language model containing probability distributions */
export interface LanguageModel {
    /** The alphabet used by this model */
    alphabet: string;
    /** Log-probabilities for each character (unigram model) */
    unigramLogProb: Float64Array;
    /** Log-probabilities for each character pair (bigram model, flattened) */
    bigramLogProb: Float64Array;
    /** Weight for bigram score in final calculation */
    lambdaBigram: number;
}

// ============================================================================
// TEXT NORMALIZATION
// ============================================================================

/**
 * Normalize text to contain only uppercase A-Z and space.
 * Newlines, tabs, and punctuation are converted to spaces.
 * Multiple consecutive spaces are collapsed to a single space.
 * 
 * @param text - Raw input text
 * @returns Normalized text containing only characters from ALPHABET
 */
export function normalizeEnglish(text: string): string {
    // Primeiro, converte quebras de linha, tabs e pontuação comum em espaços
    let normalized = text
        .replace(/[\n\r\t]+/g, ' ')           // Quebras de linha e tabs → espaço
        .replace(/[.,;:!?'"()\[\]{}]/g, ' ')  // Pontuação → espaço
        .toUpperCase();

    let result = "";
    let lastWasSpace = true; // Evita espaços no início

    for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i];
        if (char in charToIndex) {
            // Se for espaço, só adiciona se o último não foi espaço
            if (char === ' ') {
                if (!lastWasSpace) {
                    result += char;
                    lastWasSpace = true;
                }
            } else {
                result += char;
                lastWasSpace = false;
            }
        }
    }

    // Remove espaço final se houver
    return result.trim();
}

// ============================================================================
// MODEL TRAINING
// ============================================================================

/**
 * Build a language model from a training corpus.
 * Uses add-k smoothing and computes log-probabilities for efficient scoring.
 * 
 * @param corpusRaw - Raw training text (will be normalized internally)
 * @param options - Optional parameters for smoothing and bigram weight
 * @returns Trained language model
 * @throws Error if normalized corpus is too short (< 2 characters)
 */
export function buildLanguageModel(
    corpusRaw: string,
    options?: LanguageModelOptions
): LanguageModel {
    // Extract options with defaults
    const smoothingK = options?.smoothingK ?? 1.0;
    const lambdaBigram = options?.lambdaBigram ?? 0.7;

    // Normalize the corpus
    const corpus = normalizeEnglish(corpusRaw);

    // Validate corpus size
    if (corpus.length < 2) {
        throw new Error(
            `Corpus too short after normalization. Need at least 2 characters, got ${corpus.length}.`
        );
    }

    // Initialize counters
    const unigramCounts = new Float64Array(ALPHABET_SIZE);
    const bigramCounts = new Float64Array(ALPHABET_SIZE * ALPHABET_SIZE);
    const rowTotals = new Float64Array(ALPHABET_SIZE); // Total bigrams starting with each char

    // Count unigrams and bigrams
    for (let i = 0; i < corpus.length; i++) {
        const currIdx = charToIndex[corpus[i]];

        // Count unigram
        unigramCounts[currIdx]++;

        // Count bigram (if not the first character)
        if (i > 0) {
            const prevIdx = charToIndex[corpus[i - 1]];
            const bigramIdx = prevIdx * ALPHABET_SIZE + currIdx;
            bigramCounts[bigramIdx]++;
            rowTotals[prevIdx]++;
        }
    }

    // Calculate total unigrams
    const totalUnigrams = corpus.length;

    // Compute unigram log-probabilities with add-k smoothing
    const unigramLogProb = new Float64Array(ALPHABET_SIZE);
    for (let i = 0; i < ALPHABET_SIZE; i++) {
        const smoothedProb = (unigramCounts[i] + smoothingK) / (totalUnigrams + smoothingK * ALPHABET_SIZE);
        unigramLogProb[i] = Math.log(smoothedProb);
    }

    // Compute bigram log-probabilities with add-k smoothing
    const bigramLogProb = new Float64Array(ALPHABET_SIZE * ALPHABET_SIZE);
    for (let prev = 0; prev < ALPHABET_SIZE; prev++) {
        for (let curr = 0; curr < ALPHABET_SIZE; curr++) {
            const bigramIdx = prev * ALPHABET_SIZE + curr;
            const smoothedProb =
                (bigramCounts[bigramIdx] + smoothingK) /
                (rowTotals[prev] + smoothingK * ALPHABET_SIZE);
            bigramLogProb[bigramIdx] = Math.log(smoothedProb);
        }
    }

    return {
        alphabet: ALPHABET,
        unigramLogProb,
        bigramLogProb,
        lambdaBigram
    };
}

// ============================================================================
// TEXT SCORING
// ============================================================================

/**
 * Score a candidate text using the trained language model.
 * Higher scores indicate more English-like text.
 * 
 * The score combines unigram and bigram log-probabilities:
 *   score = sum(log P(char)) + lambda * sum(log P(char | prev_char))
 * 
 * @param textRaw - Candidate text to score (will be normalized)
 * @param model - Trained language model
 * @returns Numeric score (higher = more English-like)
 */
export function scoreText(textRaw: string, model: LanguageModel): number {
    const text = normalizeEnglish(textRaw);

    // Empty text gets the worst possible score
    if (text.length === 0) {
        return Number.NEGATIVE_INFINITY;
    }

    let scoreUnigram = 0;
    let scoreBigram = 0;

    for (let i = 0; i < text.length; i++) {
        const currIdx = charToIndex[text[i]];

        // Add unigram log-probability
        scoreUnigram += model.unigramLogProb[currIdx];

        // Add bigram log-probability (if not the first character)
        if (i > 0) {
            const prevIdx = charToIndex[text[i - 1]];
            const bigramIdx = prevIdx * ALPHABET_SIZE + currIdx;
            scoreBigram += model.bigramLogProb[bigramIdx];
        }
    }

    // Combine scores with weighted bigram contribution
    return scoreUnigram + model.lambdaBigram * scoreBigram;
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
// Example: Training and scoring with the language model

// 1. Prepare a small English corpus for training
const trainingCorpus = `
  The quick brown fox jumps over the lazy dog.
  This is a sample English text for training a simple language model.
  Statistical analysis of character frequencies helps identify English text.
  Bigram probabilities capture common letter pairs like TH, HE, and AN.
`;

// 2. Build the language model from the corpus
const model = buildLanguageModel(trainingCorpus, {
  smoothingK: 1.0,      // Laplace smoothing
  lambdaBigram: 0.7     // Weight bigrams moderately
});

// 3. Score candidate texts
const englishText = "the quick brown fox";
const gibberishText = "xqz wvb zzk plm";

const englishScore = scoreText(englishText, model);
const gibberishScore = scoreText(gibberishText, model);

console.log("English text score:", englishScore.toFixed(2));
console.log("Gibberish text score:", gibberishScore.toFixed(2));
console.log("English is better:", englishScore > gibberishScore);

// Expected output:
// English text score: -XX.XX (some negative number)
// Gibberish text score: -YY.YY (more negative, indicating worse fit)
// English is better: true
*/

