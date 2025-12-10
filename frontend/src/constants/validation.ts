export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_LETTERS: true,
    REQUIRE_NUMBERS: true,
  },
  NAME: {
    PATTERN: /^[a-zA-ZæøåÆØÅ\s\-']+$/,
  },
  USERNAME: {
    DEBOUNCE_MS: 500,
  },
} as const;

