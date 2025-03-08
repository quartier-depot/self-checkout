import '@testing-library/jest-dom/vitest';
import { setupServer } from 'msw/node';
import { handlers } from './handlers';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({
      onUnhandledRequest: 'error'
    }
  );
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});