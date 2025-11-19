/**
 * Classical Cipher Breakers
 * 
 * Collection of cryptanalysis algorithms for breaking classical ciphers.
 */

// Export substitution cipher breaker
export { breakSubstitutionCipher } from './substitutionBreaker';

// Export types
export type {
    SubstitutionKey,
    BreakSubstitutionOptions,
    BreakSubstitutionResult
} from './substitutionBreaker';

