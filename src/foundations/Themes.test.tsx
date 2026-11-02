import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { SideBySide, Keyboard } from './Themes.stories';

const markup = (story: { render?: unknown }) => (story.render as () => ReactElement)();
const themes = ['default', 'dark', 'bold', 'bold-dark'];

describe('Themes docs page', () => {
  it.each([
    ['SideBySide', SideBySide],
    ['Keyboard', Keyboard],
  ])('%s has no axe violations', async (_name, story) => {
    const { container } = render(markup(story));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('shows the four themes side by side, each scoped with its own data-theme', () => {
    const { container } = render(markup(SideBySide));
    const panels = Array.from(container.querySelectorAll('[data-testid^="theme-panel-"]'));
    expect(panels.map((p) => p.getAttribute('data-theme'))).toEqual(themes);
  });

  it('renders the same component set in every panel', () => {
    render(markup(SideBySide));
    const sets = themes.map((theme) => {
      const panel = screen.getByTestId(`theme-panel-${theme}`);
      return within(panel)
        .getAllByRole('button')
        .map((b) => b.textContent);
    });
    for (const set of sets) expect(set).toEqual(sets[0]);
    expect(sets[0]).toEqual(expect.arrayContaining(['Continue', 'Cancel', 'Learn more', 'Delete print']));
    for (const theme of themes) {
      const panel = within(screen.getByTestId(`theme-panel-${theme}`));
      expect(panel.getAllByRole('textbox')).toHaveLength(3);
      expect(panel.getAllByRole('checkbox')).toHaveLength(2);
      expect(panel.getAllByRole('slider')).toHaveLength(1);
      expect(panel.getByText('Payment failed')).toBeInTheDocument();
    }
  });

  it('keeps the same tab order in every theme', async () => {
    const user = userEvent.setup();
    render(markup(Keyboard));
    for (const theme of themes) {
      const panel = within(screen.getByTestId(`theme-panel-${theme}`));
      await user.tab();
      expect(panel.getByRole('textbox')).toHaveFocus();
      await user.tab();
      expect(panel.getByRole('checkbox')).toHaveFocus();
      await user.tab();
      expect(panel.getByRole('button', { name: 'Continue' })).toHaveFocus();
      await user.tab();
      expect(panel.getByRole('button', { name: 'Cancel' })).toHaveFocus();
    }
  });

  it('opens the dialog trigger inside a themed panel', async () => {
    const user = userEvent.setup();
    render(markup(SideBySide));
    await user.click(within(screen.getByTestId('theme-panel-bold')).getByRole('button', { name: 'Delete print' }));
    expect(await screen.findByRole('dialog', { name: 'Delete print?' })).toBeInTheDocument();
  });

  it('adds no Tailwind classes: Tailwind scans all of src, so any utility here would change dist/styles.css', () => {
    const source = readFileSync(join(__dirname, 'Themes.stories.tsx'), 'utf8');
    expect(source).not.toMatch(/class(Name)?\s*=/);
  });

  it('isolates every panel from the toolbar theme: a default scope sits between the page and the panel', () => {
    // The toolbar puts a theme on <html>; `dark` only sets color roles, so without this reset the dark panel
    // would inherit bold's radius, fonts and uppercase headings when the toolbar is on bold or bold-dark.
    render(markup(SideBySide));
    for (const theme of themes) {
      const panel = screen.getByTestId(`theme-panel-${theme}`);
      expect(panel.getAttribute('data-theme')).toBe(theme);
      expect(panel.parentElement?.getAttribute('data-theme')).toBe('default');
    }
  });
});
