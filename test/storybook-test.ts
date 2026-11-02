/**
 * Jest stand-in for `storybook/test` (an ESM-only package). Story files import it for their `play`
 * functions; Jest never runs those, it only needs the import to resolve. Same names, backed by
 * Testing Library and Jest.
 */
export { fireEvent, screen, waitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export const fn = (impl?: (...args: unknown[]) => unknown) => jest.fn(impl);
const jestExpect = expect;
export { jestExpect as expect };
