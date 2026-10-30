import { defineConfig } from 'vitest/config';

// Unit tests cover pure modules (terminal parser/commands, data validation) — no DOM needed.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
