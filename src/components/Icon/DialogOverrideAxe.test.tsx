import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Dialog } from '../Dialog';
import { IconProvider } from './IconProvider';
import { createIcon } from './createIcon';

const Prop = createIcon('PropIcon', <path data-testid="prop-glyph" d="M1 1h2" />);

describe('Dialog closeIcon real axe coverage (document.body)', () => {
  it('has no violations with overridden closeIcon and keeps name', async () => {
    render(
      <IconProvider icons={{}}>
        <Dialog defaultOpen title="T" description="D" closeIcon={Prop} />
      </IconProvider>,
    );
    expect(screen.getByTestId('prop-glyph')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
