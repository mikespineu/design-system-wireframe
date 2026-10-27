import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import {
  BodyStyles,
  FocusTarget,
  HeadingStyles,
  Modifiers,
  Outline,
  TruncateAndClamp,
} from './Typography.stories';

const markup = (story: { render?: unknown }) => (story.render as () => ReactElement)();

describe('Typography story markup', () => {
  it.each([
    ['HeadingStyles', HeadingStyles],
    ['BodyStyles', BodyStyles],
    ['Outline', Outline],
    ['Modifiers', Modifiers],
    ['TruncateAndClamp', TruncateAndClamp],
    ['FocusTarget', FocusTarget],
  ])('%s has no axe violations', async (_name, story) => {
    const { container } = render(markup(story));
    expect(await axe(container)).toHaveNoViolations();
  });

  it('flags a skipped heading level and an empty heading', async () => {
    const { container } = render(
      <div>
        <h1 className="heading-xl">Title</h1>
        <h4 className="heading-sm">Skipped</h4>
      </div>,
    );
    const skipped = await axe(container, { rules: { 'heading-order': { enabled: true } } });
    expect(skipped.violations.map((v) => v.id)).toContain('heading-order');

    const empty = render(<h2 className="heading-lg" />);
    expect((await axe(empty.container)).violations.map((v) => v.id)).toContain('empty-heading');
  });

  it('Tab skips headings and paragraphs but lands on a link nested in a heading', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <h2 className="heading-md">Plain</h2>
        <p className="body-md">Paragraph</p>
        <h3 className="heading-md">
          <a href="#x">Linked</a>
        </h3>
      </div>,
    );
    await user.tab();
    expect(screen.getByRole('link', { name: 'Linked' })).toHaveFocus();
  });

  it('focus() on a tabIndex -1 heading makes it active', () => {
    render(markup(FocusTarget));
    const heading = screen.getByRole('heading', { name: 'Content' });
    heading.focus();
    expect(heading).toHaveFocus();
  });

  it('keeps the full text of a truncated sample', () => {
    render(markup(TruncateAndClamp));
    expect(screen.getByText(/A very long single line/).textContent).toContain('cut off with an ellipsis');
  });
});
