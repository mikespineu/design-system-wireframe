import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import './test/dom-stubs';

expect.extend(toHaveNoViolations);
