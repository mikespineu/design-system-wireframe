import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { Default, Dark, KeyboardDefault, KeyboardDark, Scoped } from './Theming.stories';
import { themeRoleGroups } from '../styles/roles';

const markup = (story: { render?: unknown }) => (story.render as () => ReactElement)();

describe('Theming story', () => {
  it.each([
    ['Default', Default],
    ['Dark', Dark],
    ['KeyboardDefault', KeyboardDefault],
    ['KeyboardDark', KeyboardDark],
    ['Scoped', Scoped],
  ])('%s has no axe violations', async (_name, story) => {
    const { container } = render(markup(story));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('shows every color, font, weight, radius, shadow and shape role by name', () => {
    const { container } = render(markup(Default));
    const text = container.textContent ?? '';
    const { typeScale, ...direct } = themeRoleGroups;
    for (const role of Object.values(direct).flat()) expect(text).toContain(role);
    expect(typeScale.length).toBe(36);
    for (const style of ['display', 'h1', 'body', 'caption', 'label', 'ui', 'ui-xs']) {
      expect(text).toContain(`--ds-text-${style}-*`);
    }
  });

  it('renders the dark story under data-theme="dark"', () => {
    const { container } = render(markup(Dark));
    expect(container.querySelector('[data-theme="dark"]')).not.toBeNull();
  });

  it.each([
    ['default', KeyboardDefault],
    ['dark', KeyboardDark],
  ])('keeps tab order in the %s keyboard story', async (_name, story) => {
    const user = userEvent.setup();
    render(markup(story));
    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('checkbox')).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });
});
