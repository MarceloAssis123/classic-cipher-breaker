/**
 * Monoalphabetic Substitution Cipher Breaker
 * 
 * This module implements a hill-climbing algorithm with multiple random restarts
 * to break monoalphabetic substitution ciphers over the fixed alphabet A-Z + space.
 * 
 * The algorithm uses:
 * - Frequency analysis for initial key estimation
 * - Simple hill-climbing (only accepts improvements)
 * - Multiple random restarts to escape local maxima
 * - English language model scoring to guide the search
 */

// ============================================================================
// IMPORTS
// ============================================================================

import {
    ALPHABET,
    ALPHABET_SIZE,
    normalizeEnglish,
    LanguageModel,
    scoreText
} from '../../englishScore';

// ============================================================================
// CHARACTER MAPPINGS
// ============================================================================

/** Map each character to its index in the alphabet for quick lookup */
const charToIndex: Record<string, number> = {};
for (let i = 0; i < ALPHABET.length; i++) {
    charToIndex[ALPHABET[i]] = i;
}

/** Map each index to its character in the alphabet */
const indexToChar: string[] = ALPHABET.split('');

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Substitution key representation.
 * key[cipherIndex] = plainIndex
 * 
 * Example: If key[5] = 10, then cipher character at index 5 (which is 'F')
 * decodes to plaintext character at index 10 (which is 'K').
 */
export type SubstitutionKey = Int16Array;

/** Options for the cipher breaking algorithm */
export interface BreakSubstitutionOptions {
    /** Number of independent hill-climbing restarts (default: 20) */
    restarts?: number;
    /** Maximum iterations per restart (default: 5000) */
    maxIterations?: number;
    /** Use frequency-based initial key on first restart (default: true) */
    useFrequencyInit?: boolean;
}

/** Result of the cipher breaking algorithm */
export interface BreakSubstitutionResult {
    /** Best decoded English plaintext */
    plaintext: string;
    /** Substitution key (cipherIndex -> plainIndex) */
    key: SubstitutionKey;
    /** Human-readable mapping (cipherChar -> plainChar) */
    mapping: Record<string, string>;
    /** Final language model score (higher = more English-like) */
    score: number;
}

// ============================================================================
// HELPER FUNCTIONS (INTERNAL)
// ============================================================================

/**
 * Create an identity substitution key where each character maps to itself.
 * 
 * @returns Identity permutation key
 */
function createIdentityKey(): SubstitutionKey {
    const key = new Int16Array(ALPHABET_SIZE);
    for (let i = 0; i < ALPHABET_SIZE; i++) {
        key[i] = i;
    }
    return key;
}

/**
 * Create a random substitution key using Fisher-Yates shuffle.
 * This ensures a uniform random permutation.
 * 
 * @returns Random permutation key
 */
function createRandomKey(): SubstitutionKey {
    // Start with identity and shuffle
    const key = createIdentityKey();

    // Fisher-Yates shuffle
    for (let i = ALPHABET_SIZE - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        // Swap key[i] and key[j]
        const temp = key[i];
        key[i] = key[j];
        key[j] = temp;
    }

    return key;
}

/**
 * Count the frequency of each character in the normalized ciphertext.
 * 
 * @param normalized - Normalized ciphertext (already processed by normalizeEnglish)
 * @returns Array of counts where counts[i] = frequency of ALPHABET[i]
 */
function countFrequencies(normalized: string): Float64Array {
    const counts = new Float64Array(ALPHABET_SIZE);

    for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i];
        const idx = charToIndex[char];
        counts[idx]++;
    }

    return counts;
}

/**
 * Build an initial substitution key based on frequency analysis.
 * 
 * Strategy:
 * - Count character frequencies in the ciphertext
 * - Sort characters by descending frequency
 * - Map them to English characters in expected frequency order
 * 
 * The target frequency order for English (including space) is:
 * " ETAONRISHDLFCMUGYPWBVKJXQZ"
 * (Space is most frequent, followed by E, T, A, etc.)
 * 
 * @param cipherNormalized - Normalized ciphertext
 * @returns Frequency-based initial key
 */
function buildFrequencyInitialKey(cipherNormalized: string): SubstitutionKey {
    // Expected English character frequency order (space first, then E, T, A, ...)
    const targetFreqOrder = " ETAONRISHDLFCMUGYPWBVKJXQZ";

    // Count character frequencies in ciphertext
    const counts = countFrequencies(cipherNormalized);

    // Create array of (index, count) pairs
    const indexCountPairs: Array<{ idx: number; count: number }> = [];
    for (let i = 0; i < ALPHABET_SIZE; i++) {
        indexCountPairs.push({ idx: i, count: counts[i] });
    }

    // Sort by descending frequency (most frequent first)
    indexCountPairs.sort((a, b) => b.count - a.count);

    // Build the key: map k-th most frequent cipher char to k-th target char
    const key = new Int16Array(ALPHABET_SIZE);
    for (let rank = 0; rank < ALPHABET_SIZE; rank++) {
        const cipherIdx = indexCountPairs[rank].idx;
        const plainChar = targetFreqOrder[rank];
        const plainIdx = charToIndex[plainChar];
        key[cipherIdx] = plainIdx;
    }

    return key;
}

/**
 * Apply a substitution key to decode normalized ciphertext.
 * 
 * @param cipherNormalized - Normalized ciphertext
 * @param key - Substitution key to apply
 * @returns Decoded plaintext
 */
function applySubstitutionToNormalized(cipherNormalized: string, key: SubstitutionKey): string {
    let result = "";

    for (let i = 0; i < cipherNormalized.length; i++) {
        const cipherChar = cipherNormalized[i];
        const cipherIdx = charToIndex[cipherChar];
        const plainIdx = key[cipherIdx];
        const plainChar = indexToChar[plainIdx];
        result += plainChar;
    }

    return result;
}

/**
 * Hill-climbing algorithm for finding the best substitution key.
 * 
 * Strategy:
 * - Start with an initial key
 * - Repeatedly generate neighbor keys by swapping two random positions
 * - Accept improvements only (simple hill-climbing, no annealing)
 * - Track the best key found throughout the search
 * 
 * @param cipherNormalized - Normalized ciphertext to decode
 * @param model - Language model for scoring candidate plaintexts
 * @param initialKey - Starting substitution key
 * @param maxIterations - Maximum number of iterations to run
 * @returns Best key, plaintext, and score found
 */
function hillClimbSubstitution(
    cipherNormalized: string,
    model: LanguageModel,
    initialKey: SubstitutionKey,
    maxIterations: number
): { key: SubstitutionKey; plaintext: string; score: number } {
    // Clone the initial key to avoid modifying the input
    const currentKey = new Int16Array(initialKey);
    let currentPlain = applySubstitutionToNormalized(cipherNormalized, currentKey);
    let currentScore = scoreText(currentPlain, model);

    // Track the best solution found
    let bestKey = new Int16Array(currentKey);
    let bestPlain = currentPlain;
    let bestScore = currentScore;

    // Hill-climbing iterations
    for (let iter = 0; iter < maxIterations; iter++) {
        // Generate a neighbor by swapping two random positions
        // Pick two distinct indices
        let i = Math.floor(Math.random() * ALPHABET_SIZE);
        let j = Math.floor(Math.random() * ALPHABET_SIZE);

        // Ensure i and j are different
        while (i === j) {
            j = Math.floor(Math.random() * ALPHABET_SIZE);
        }

        // Create neighbor key by swapping positions i and j
        const neighborKey = new Int16Array(currentKey);
        const temp = neighborKey[i];
        neighborKey[i] = neighborKey[j];
        neighborKey[j] = temp;

        // Evaluate the neighbor
        const neighborPlain = applySubstitutionToNormalized(cipherNormalized, neighborKey);
        const neighborScore = scoreText(neighborPlain, model);

        // Accept if improvement (simple hill-climbing)
        if (neighborScore > currentScore) {
            // Update current solution
            currentKey.set(neighborKey);
            currentPlain = neighborPlain;
            currentScore = neighborScore;

            // Update best if this is the best so far
            if (currentScore > bestScore) {
                bestKey.set(currentKey);
                bestPlain = currentPlain;
                bestScore = currentScore;
            }
        }
        // Otherwise reject (no simulated annealing)
    }

    return { key: bestKey, plaintext: bestPlain, score: bestScore };
}

/**
 * Convert a substitution key to a human-readable mapping.
 * 
 * @param key - Substitution key (cipherIndex -> plainIndex)
 * @returns Dictionary mapping cipher characters to plain characters
 */
function keyToMapping(key: SubstitutionKey): Record<string, string> {
    const mapping: Record<string, string> = {};

    for (let cipherIdx = 0; cipherIdx < ALPHABET_SIZE; cipherIdx++) {
        const cipherChar = ALPHABET[cipherIdx];
        const plainIdx = key[cipherIdx];
        const plainChar = ALPHABET[plainIdx];
        mapping[cipherChar] = plainChar;
    }

    return mapping;
}

// ============================================================================
// MAIN EXPORTED FUNCTION
// ============================================================================

/**
 * Break a monoalphabetic substitution cipher using hill-climbing with restarts.
 * 
 * Algorithm:
 * 1. Normalize the ciphertext to the fixed alphabet
 * 2. Run multiple hill-climbing restarts:
 *    - First restart (optional): use frequency-based initial key
 *    - Subsequent restarts: use random initial keys
 * 3. Track the best solution across all restarts
 * 4. Return the best plaintext, key, mapping, and score
 * 
 * @param ciphertextRaw - Raw ciphertext (will be normalized)
 * @param model - Trained language model for scoring
 * @param options - Algorithm parameters (restarts, iterations, etc.)
 * @returns Best decryption result found
 * @throws Error if normalized ciphertext is empty
 */
export function breakSubstitutionCipher(
    ciphertextRaw: string,
    model: LanguageModel,
    options: BreakSubstitutionOptions = {}
): BreakSubstitutionResult {
    // Normalize the ciphertext
    const cipherNormalized = normalizeEnglish(ciphertextRaw);
    console.log("==".repeat(50), cipherNormalized, "==".repeat(50));

    // Validate input
    if (cipherNormalized.length === 0) {
        throw new Error(
            "Ciphertext is empty after normalization. Cannot break cipher with no input."
        );
    }

    // Extract options with defaults
    const restarts = options.restarts ?? 20;
    const maxIterations = options.maxIterations ?? 5000;
    const useFrequencyInit = options.useFrequencyInit ?? true;

    // Track the global best solution across all restarts
    let globalBestKey: SubstitutionKey | null = null;
    let globalBestPlain = "";
    let globalBestScore = Number.NEGATIVE_INFINITY;

    // Perform multiple restarts of hill-climbing
    for (let r = 0; r < restarts; r++) {
        // Choose initial key for this restart
        let initialKey: SubstitutionKey;

        if (r === 0 && useFrequencyInit) {
            // First restart: use frequency-based initial key
            initialKey = buildFrequencyInitialKey(cipherNormalized);
        } else {
            // Subsequent restarts: use random initial key
            initialKey = createRandomKey();
        }

        // Run hill-climbing from this initial key
        const result = hillClimbSubstitution(
            cipherNormalized,
            model,
            initialKey,
            maxIterations
        );

        // Update global best if this restart found a better solution
        if (result.score > globalBestScore) {
            globalBestKey = result.key;
            globalBestPlain = result.plaintext;
            globalBestScore = result.score;
        }
    }

    // Validate that we found at least one solution
    if (globalBestKey === null) {
        throw new Error(
            "No solution found. This should never happen in normal operation."
        );
    }

    // Convert the best key to a human-readable mapping
    const mapping = keyToMapping(globalBestKey);

    // Return the final result
    return {
        plaintext: globalBestPlain,
        key: globalBestKey,
        mapping: mapping,
        score: globalBestScore
    };
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
// Example: Breaking a substitution cipher

import { buildLanguageModel } from '../englishScore';
import { breakSubstitutionCipher } from './substitutionBreaker';

// 1. Prepare a training corpus for the language model
const trainingCorpus = `
  The quick brown fox jumps over the lazy dog.
  This is a sample English text for training a simple language model.
  Statistical analysis of character frequencies helps identify English text.
  Bigram probabilities capture common letter pairs like TH, HE, and AN.
  We need enough text to build reliable statistics for breaking ciphers.
  The more training data we have, the better our language model will be.
  Common words like THE, AND, OF, TO, IN, IS, IT, FOR, AS, and WITH appear frequently.
  Letter frequency in English is approximately: E T A O I N S H R D L C U M W F G Y P B V K J X Q Z
  Space is the most common character in natural text with spaces.
`;

// 2. Build the language model from the corpus
const model = buildLanguageModel(trainingCorpus, {
  smoothingK: 1.0,
  lambdaBigram: 0.7
});

// 3. Example ciphertext (this would be the encrypted message you want to break)
// For demonstration, let's say we have a ciphertext like:
const ciphertext = "FZG ELJNO WKPUD RPV TLQXY PMGK FZG IJCB HPB";

// 4. Break the cipher
const result = breakSubstitutionCipher(ciphertext, model, {
  restarts: 30,
  maxIterations: 8000,
  useFrequencyInit: true
});

// 5. Display the results
console.log("=== Cipher Breaking Results ===");
console.log("Plaintext:", result.plaintext);
console.log("Score:", result.score.toFixed(2));
console.log("\nMapping (Cipher -> Plain):");
for (const [cipherChar, plainChar] of Object.entries(result.mapping)) {
  if (cipherChar !== ' ') {  // Skip space for cleaner output
    console.log(`  ${cipherChar} -> ${plainChar}`);
  }
}

// Expected output:
// The algorithm should recover the original plaintext (or very close to it)
// by finding the correct substitution mapping through hill-climbing.
*/

