import { createRef, useState, type ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Slider, SliderField } from './Slider';

const LIST = [1, 2, 3, 5, 8, 10];
const thumb = () => screen.getByRole('slider');
const nbsp = ' ';
const ticks = (c: HTMLElement) => c.querySelectorAll('.ds-slider-tick');
const markLabels = (c: HTMLElement) => Array.from(c.querySelectorAll('.ds-slider-mark-label')).map((n) => n.textContent);

describe('Slider keyboard, uniform', () => {
  it('moves by arrows, Page keys, Home and End and fires callbacks', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    const onValueCommit = jest.fn();
    render(<SliderField label="Level" defaultValue={50} step={5} onValueChange={onValueChange} onValueCommit={onValueCommit} />);
    await user.tab();
    expect(thumb()).toHaveFocus();
    expect(thumb()).toHaveAttribute('aria-valuenow', '50');
    await user.keyboard('{ArrowRight}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '55');
    await user.keyboard('{ArrowUp}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '60');
    await user.keyboard('{ArrowLeft}{ArrowDown}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '50');
    await user.keyboard('{PageUp}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '100');
    await user.keyboard('{PageDown}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '50');
    await user.keyboard('{Shift>}{ArrowRight}{/Shift}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '100');
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '50');
    await user.keyboard('{End}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '100');
    await user.keyboard('{Home}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '0');
    expect(onValueChange).toHaveBeenLastCalledWith(0);
    expect(onValueCommit).toHaveBeenLastCalledWith(0);
    expect(onValueChange).toHaveBeenCalledTimes(onValueCommit.mock.calls.length);
  });

  it('clamps at the ends', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<SliderField label="Level" defaultValue={100} onValueChange={onValueChange} />);
    await user.tab();
    await user.keyboard('{ArrowRight}{PageUp}{End}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '100');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('defaults to min and respects custom min/max/step', () => {
    render(<SliderField label="Level" min={20} max={60} step={10} />);
    expect(thumb()).toHaveAttribute('aria-valuenow', '20');
    expect(thumb()).toHaveAttribute('aria-valuemin', '20');
    expect(thumb()).toHaveAttribute('aria-valuemax', '60');
    expect(thumb()).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('reverses the horizontal arrows in rtl', async () => {
    const user = userEvent.setup();
    render(<SliderField label="Level" dir="rtl" defaultValue={50} />);
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '51');
  });
});

describe('Slider keyboard, custom values', () => {
  it('steps through the list and reports real values', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(
      <SliderField label="Rating" values={LIST} defaultValue={3} onValueChange={onValueChange} formatValue={(v) => `${v} stars`} />,
    );
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '5');
    expect(thumb()).toHaveAttribute('aria-valuetext', '5 stars');
    expect(thumb()).toHaveAttribute('aria-valuemin', '1');
    expect(thumb()).toHaveAttribute('aria-valuemax', '10');
    expect(onValueChange).toHaveBeenLastCalledWith(5);
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '2');
    await user.keyboard('{PageUp}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '10');
    await user.keyboard('{PageDown}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '1');
    await user.keyboard('{End}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '10');
    await user.keyboard('{Home}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '1');
  });

  it('overrides Radix ARIA with real values (not indices)', () => {
    render(<SliderField label="Rating" values={[24, 27, 32, 43]} defaultValue={32} />);
    expect(thumb()).toHaveAttribute('aria-valuemin', '24');
    expect(thumb()).toHaveAttribute('aria-valuemax', '43');
    expect(thumb()).toHaveAttribute('aria-valuenow', '32');
    expect(thumb()).toHaveAttribute('aria-valuetext', '32');
  });

  it('snaps an off-list value for display without firing onValueChange', () => {
    const onValueChange = jest.fn();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(<SliderField label="Rating" values={LIST} value={4} onValueChange={onValueChange} />);
    expect(thumb()).toHaveAttribute('aria-valuenow', '5');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('not an allowed value'));
  });
});

describe('Slider controlled and uncontrolled', () => {
  it('works controlled', async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [v, setV] = useState(10);
      return (
        <>
          <SliderField label="Level" value={v} onValueChange={setV} />
          <output>{v}</output>
        </>
      );
    };
    render(<Controlled />);
    await user.tab();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '12');
  });

  it('does not move when a controlled value is not updated', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<SliderField label="Level" value={10} onValueChange={onValueChange} />);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(onValueChange).toHaveBeenCalledWith(11);
    expect(thumb()).toHaveAttribute('aria-valuenow', '10');
  });

  it('forwards the ref to the Radix root', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Slider ref={ref} aria-label="Level" className="custom" />);
    expect(ref.current).toHaveAttribute('data-orientation', 'horizontal');
    expect(ref.current?.closest('.ds-slider')).toHaveClass('custom');
  });
});

describe('Slider attached input', () => {
  it('shows no input by default', () => {
    render(<SliderField label="Level" />);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('tab order is thumb then input, and the input mirrors the value', async () => {
    const user = userEvent.setup();
    render(<SliderField label="Level" showInput defaultValue={30} />);
    await user.tab();
    expect(thumb()).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.getByRole('textbox')).toHaveValue('30');
    await user.tab({ shift: true });
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('textbox')).toHaveValue('31');
  });

  it('is a native text input with decimal keyboard and no spin role', () => {
    render(<SliderField label="Level" showInput />);
    const input = screen.getByRole('textbox', { name: 'Level' });
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputmode', 'decimal');
    expect(input).not.toHaveAttribute('name');
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('commits a typed value on Enter, snapping to the step', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    const onValueCommit = jest.fn();
    render(<SliderField label="Level" showInput step={5} onValueChange={onValueChange} onValueCommit={onValueCommit} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '42{Enter}');
    expect(input).toHaveValue('40');
    expect(thumb()).toHaveAttribute('aria-valuenow', '40');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith(40);
    expect(onValueCommit).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenCalledWith(40);
  });

  it('breaks ties upward (42.5 with step 5 gives 45)', async () => {
    const user = userEvent.setup();
    render(<SliderField label="Level" showInput step={5} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '42.5{Enter}');
    expect(input).toHaveValue('45');
  });

  it('accepts a comma decimal separator', async () => {
    const user = userEvent.setup();
    render(<SliderField label="Level" showInput step={0.5} max={10} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '2,5{Enter}');
    expect(input).toHaveValue('2.5');
  });

  it('snaps in a custom list: 4 gives 5, once', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    const onValueCommit = jest.fn();
    render(<SliderField label="Rating" showInput values={LIST} onValueChange={onValueChange} onValueCommit={onValueCommit} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '4{Enter}');
    expect(input).toHaveValue('5');
    expect(thumb()).toHaveAttribute('aria-valuenow', '5');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenCalledTimes(1);
  });

  it('clamps 120 to 100 and -20 to 0', async () => {
    const user = userEvent.setup();
    render(<SliderField label="Level" showInput defaultValue={50} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '120{Enter}');
    expect(input).toHaveValue('100');
    await user.clear(input);
    await user.type(input, '-20{Enter}');
    expect(input).toHaveValue('0');
  });

  it('commits on blur', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<SliderField label="Level" showInput onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '33');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(thumb()).toHaveAttribute('aria-valuenow', '0');
    await user.tab();
    expect(onValueChange).toHaveBeenCalledWith(33);
    expect(thumb()).toHaveAttribute('aria-valuenow', '33');
  });

  it('reverts invalid text without callbacks', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    const onValueCommit = jest.fn();
    render(<SliderField label="Level" showInput defaultValue={20} onValueChange={onValueChange} onValueCommit={onValueCommit} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'abc{Enter}');
    expect(input).toHaveValue('20');
    await user.clear(input);
    await user.tab();
    expect(input).toHaveValue('20');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(onValueCommit).not.toHaveBeenCalled();
  });

  it('does not fire callbacks when the snapped value equals the current one', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    render(<SliderField label="Level" showInput defaultValue={50} step={10} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '52{Enter}');
    expect(input).toHaveValue('50');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('Esc discards the draft and keeps focus; without a draft it bubbles', async () => {
    const user = userEvent.setup();
    const onKeyDown = jest.fn();
    render(
      <div onKeyDown={(e) => onKeyDown(e.key)}>
        <SliderField label="Level" showInput defaultValue={20} />
      </div>,
    );
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '77');
    await user.keyboard('{Escape}');
    expect(input).toHaveValue('20');
    expect(input).toHaveFocus();
    expect(onKeyDown).not.toHaveBeenCalledWith('Escape');
    await user.keyboard('{Escape}');
    expect(onKeyDown).toHaveBeenCalledWith('Escape');
  });

  it('Enter does not submit a wrapping form', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn((e) => e.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <SliderField label="Level" showInput />
        <button type="submit">Go</button>
      </form>,
    );
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '12{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps arrow keys as caret movement in the input', async () => {
    const user = userEvent.setup();
    render(<SliderField label="Level" showInput defaultValue={20} />);
    const input = screen.getByRole('textbox');
    input.focus();
    await user.keyboard('{ArrowUp}{ArrowRight}{Home}{End}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '20');
  });

  it('discards the draft when the thumb moves', async () => {
    const user = userEvent.setup();
    render(<SliderField label="Level" showInput defaultValue={20} />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '77');
    fireEvent.keyDown(thumb(), { key: 'ArrowRight' });
    expect(input).toHaveValue('21');
  });

  it('announces when the typed value was snapped', async () => {
    const user = userEvent.setup();
    const { container } = render(<SliderField label="Rating" showInput values={LIST} unit="pt" />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '4 pt{Enter}');
    const live = container.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toBe(`Set to 5${nbsp}pt`);
  });

  it('does not announce when the typed value was exact', async () => {
    const user = userEvent.setup();
    const { container } = render(<SliderField label="Level" showInput />);
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '10{Enter}');
    expect(container.querySelector('[aria-live="polite"]')).toBeEmptyDOMElement();
  });
});

describe('Slider unit and formatting', () => {
  it('appends the unit to aria-valuetext with the right separator', () => {
    const { rerender } = render(<SliderField label="Height" unit="cm" defaultValue={239} max={300} />);
    expect(thumb()).toHaveAttribute('aria-valuetext', `239${nbsp}cm`);
    rerender(<SliderField key="b" label="Height" unit="%" defaultValue={40} />);
    expect(thumb()).toHaveAttribute('aria-valuetext', '40%');
    rerender(<SliderField key="c" label="Height" unit="°" defaultValue={40} />);
    expect(thumb()).toHaveAttribute('aria-valuetext', '40°');
  });

  it('commits 239, 239cm and 239 cm identically', async () => {
    const user = userEvent.setup();
    for (const text of ['239', '239cm', '239 cm']) {
      const onValueChange = jest.fn();
      const { unmount } = render(<SliderField label="Height" unit="cm" showInput max={300} onValueChange={onValueChange} />);
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, `${text}{Enter}`);
      expect(onValueChange).toHaveBeenCalledWith(239);
      expect(input).toHaveValue('239');
      unmount();
    }
  });

  it('shows the bare number with an aria-hidden suffix and names the input with the unit', () => {
    const { container } = render(<SliderField label="Height" unit="cm" showInput defaultValue={180} max={300} />);
    const input = screen.getByRole('textbox', { name: 'Height cm' });
    expect(input).toHaveValue('180');
    const suffix = container.querySelector('.ds-slider-unit');
    expect(suffix).toHaveAttribute('aria-hidden', 'true');
    expect(suffix).toHaveTextContent('cm');
  });

  it('formatValue overrides the unit display', () => {
    render(<SliderField label="Price" unit="€" defaultValue={200} max={500} formatValue={(v) => `€${v}`} />);
    expect(thumb()).toHaveAttribute('aria-valuetext', '€200');
  });
});

describe('Slider bubble', () => {
  it('renders an aria-hidden auto bubble by default', () => {
    const { container } = render(<SliderField label="Level" defaultValue={10} />);
    const bubble = container.querySelector('.ds-slider-bubble');
    expect(bubble).toHaveAttribute('aria-hidden', 'true');
    expect(bubble).toHaveTextContent('10');
    expect(thumb()).toContainElement(bubble as HTMLElement);
  });

  it('renders none with bubble="off"', () => {
    const { container } = render(<SliderField label="Level" bubble="off" />);
    expect(container.querySelector('.ds-slider-bubble')).toBeNull();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  describe('always', () => {
    it('is a textbox named by the label, after the thumb in tab order, outside the thumb', async () => {
      const user = userEvent.setup();
      render(<SliderField label="Level" bubble="always" defaultValue={10} />);
      const box = screen.getByRole('textbox', { name: 'Level' });
      expect(thumb()).not.toContainElement(box);
      expect(box).not.toHaveAttribute('aria-hidden');
      expect(box).toHaveValue('10');
      await user.tab();
      expect(thumb()).toHaveFocus();
      await user.tab();
      expect(box).toHaveFocus();
    });

    it('label click focuses it, and there is no read-only bubble', async () => {
      const user = userEvent.setup();
      const { container } = render(<SliderField label="Level" bubble="always" />);
      await user.click(screen.getByText('Level'));
      expect(screen.getByRole('textbox')).toHaveFocus();
      expect(container.querySelector('.ds-slider-bubble')).toBeNull();
    });

    it('types 4 + Enter in a custom list to get 5', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<SliderField label="Rating" bubble="always" values={LIST} onValueChange={onValueChange} />);
      const box = screen.getByRole('textbox');
      await user.clear(box);
      await user.type(box, '4{Enter}');
      expect(box).toHaveValue('5');
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(thumb()).toHaveAttribute('aria-valuenow', '5');
      expect(thumb()).toHaveAttribute('aria-valuetext', '5');
    });

    it('Esc discards the draft', async () => {
      const user = userEvent.setup();
      render(<SliderField label="Level" bubble="always" defaultValue={20} />);
      const box = screen.getByRole('textbox');
      await user.clear(box);
      await user.type(box, '9');
      await user.keyboard('{Escape}');
      expect(box).toHaveValue('20');
    });

    it('pointer down on it does not change the value', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<SliderField label="Level" bubble="always" defaultValue={20} onValueChange={onValueChange} />);
      await user.pointer({ keys: '[MouseLeft>]', target: screen.getByRole('textbox') });
      expect(onValueChange).not.toHaveBeenCalled();
      expect(thumb()).toHaveAttribute('aria-valuenow', '20');
    });

    it('is disabled with the slider', () => {
      render(<SliderField label="Level" bubble="always" disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('warns and renders one input when showInput is also passed', () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // @ts-expect-error showInput is not allowed with bubble="always"
      render(<SliderField label="Level" bubble="always" showInput />);
      expect(screen.getAllByRole('textbox')).toHaveLength(1);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('showInput'));
    });
  });
});

describe('Slider marks', () => {
  it('uniform default has none', () => {
    const { container } = render(<SliderField label="Level" step={25} />);
    expect(ticks(container)).toHaveLength(0);
    expect(markLabels(container)).toEqual([]);
  });

  it('uniform steps ticks every value and labels min and max', () => {
    const { container } = render(<SliderField label="Level" step={25} marks="steps" />);
    expect(ticks(container)).toHaveLength(5);
    expect(markLabels(container)).toEqual(['0', '100']);
  });

  it('uniform steps with more than 21 values falls back to ends with a warning', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(<SliderField label="Level" marks="steps" />);
    expect(ticks(container)).toHaveLength(2);
    expect(markLabels(container)).toEqual(['0', '100']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('21'));
  });

  it('ends gives two ticks and two labels', () => {
    const { container } = render(<SliderField label="Level" marks="ends" unit="%" />);
    expect(ticks(container)).toHaveLength(2);
    expect(markLabels(container)).toEqual(['0%', '100%']);
  });

  it('none renders nothing even for a list', () => {
    const { container } = render(<SliderField label="Rating" values={LIST} marks="none" />);
    expect(ticks(container)).toHaveLength(0);
    expect(markLabels(container)).toEqual([]);
  });

  it('a list defaults to steps with every value labelled at equal spacing', () => {
    const { container } = render(<SliderField label="Rating" values={LIST} />);
    expect(ticks(container)).toHaveLength(6);
    expect(markLabels(container)).toEqual(['1', '2', '3', '5', '8', '10']);
    const ps = Array.from(ticks(container)).map((t) => (t as HTMLElement).style.getPropertyValue('--slider-p'));
    expect(ps).toEqual(['0', '0.2', '0.4', '0.6', '0.8', '1']);
  });

  it('a list with ends labels first and last only', () => {
    const { container } = render(<SliderField label="Rating" values={LIST} marks="ends" />);
    expect(ticks(container)).toHaveLength(2);
    expect(markLabels(container)).toEqual(['1', '10']);
  });

  it('a number[] on a uniform scale ticks and labels the listed values', () => {
    const { container } = render(<SliderField label="Level" marks={[0, 50, 100]} />);
    expect(ticks(container)).toHaveLength(3);
    expect(markLabels(container)).toEqual(['0', '50', '100']);
  });

  it('a number[] on a list keeps every tick but labels only the listed values', () => {
    const { container } = render(<SliderField label="Rating" values={LIST} marks={[1, 5, 10]} />);
    expect(ticks(container)).toHaveLength(6);
    expect(markLabels(container)).toEqual(['1', '5', '10']);
  });

  it('warns for a mark that is not an allowed value and snaps it', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(<SliderField label="Rating" values={LIST} marks={[4]} />);
    expect(markLabels(container)).toEqual(['5']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('marks'));
  });

  it('marks fill state and the current label follow the value', async () => {
    const user = userEvent.setup();
    const { container } = render(<SliderField label="Rating" values={LIST} defaultValue={3} />);
    const filled = () => Array.from(ticks(container)).filter((t) => t.hasAttribute('data-filled')).length;
    expect(filled()).toBe(3);
    expect(container.querySelector('.ds-slider-mark-label[data-current]')).toHaveTextContent('3');
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(filled()).toBe(4);
    expect(container.querySelector('.ds-slider-mark-label[data-current]')).toHaveTextContent('5');
  });

  it('marks are presentational', () => {
    const { container } = render(<SliderField label="Rating" values={LIST} />);
    expect(container.querySelector('.ds-slider-ticks')).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.ds-slider-labels')).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Slider stepper', () => {
  const stepperName = (dir: 'Decrease' | 'Increase') => new RegExp(`^${dir} Height$`);

  it('steps a uniform scale by step', async () => {
    const user = userEvent.setup();
    const onValueChange = jest.fn();
    const onValueCommit = jest.fn();
    render(
      <SliderField label="Height" stepper min={100} max={250} step={10} defaultValue={180} unit="cm" onValueChange={onValueChange} onValueCommit={onValueCommit} />,
    );
    await user.click(screen.getByRole('button', { name: stepperName('Increase') }));
    expect(thumb()).toHaveAttribute('aria-valuenow', '190');
    expect(thumb()).toHaveAttribute('aria-valuetext', `190${nbsp}cm`);
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueCommit).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: stepperName('Decrease') }));
    expect(thumb()).toHaveAttribute('aria-valuenow', '180');
  });

  it('steps a list item by item', async () => {
    const user = userEvent.setup();
    render(<SliderField label="Height" stepper values={[24, 27, 32, 43, 55, 65]} defaultValue={43} />);
    await user.click(screen.getByRole('button', { name: stepperName('Increase') }));
    expect(thumb()).toHaveAttribute('aria-valuenow', '55');
    await user.click(screen.getByRole('button', { name: stepperName('Decrease') }));
    await user.click(screen.getByRole('button', { name: stepperName('Decrease') }));
    expect(thumb()).toHaveAttribute('aria-valuenow', '32');
  });

  it('disables minus at min and plus at max', async () => {
    const user = userEvent.setup();
    render(<SliderField label="Height" stepper max={2} />);
    expect(screen.getByRole('button', { name: stepperName('Decrease') })).toBeDisabled();
    expect(screen.getByRole('button', { name: stepperName('Increase') })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: stepperName('Increase') }));
    await user.click(screen.getByRole('button', { name: stepperName('Increase') }));
    expect(screen.getByRole('button', { name: stepperName('Increase') })).toBeDisabled();
    expect(screen.getByRole('button', { name: stepperName('Decrease') })).toBeEnabled();
  });

  it('disables both buttons when disabled', () => {
    render(<SliderField label="Height" stepper disabled defaultValue={5} />);
    expect(screen.getByRole('button', { name: stepperName('Decrease') })).toBeDisabled();
    expect(screen.getByRole('button', { name: stepperName('Increase') })).toBeDisabled();
  });

  it('buttons are skipped by Tab, controlled thumb, and announce the value', async () => {
    const user = userEvent.setup();
    const { container } = render(<SliderField label="Height" stepper unit="cm" defaultValue={50} />);
    const plus = screen.getByRole('button', { name: stepperName('Increase') });
    expect(plus).toHaveAttribute('tabindex', '-1');
    expect(plus).toHaveAttribute('aria-controls', thumb().id);
    expect(plus).toHaveAttribute('type', 'button');
    await user.tab();
    expect(thumb()).toHaveFocus();
    await user.tab();
    expect(document.body).toHaveFocus();
    await user.click(plus);
    expect(container.querySelector('[aria-live="polite"]')?.textContent).toBe(`51${nbsp}cm`);
  });

  it('keyboard activation of a button steps once', async () => {
    const user = userEvent.setup();
    render(<SliderField label="Height" stepper defaultValue={5} />);
    const plus = screen.getByRole('button', { name: stepperName('Increase') });
    plus.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(thumb()).toHaveAttribute('aria-valuenow', '7');
  });

  it('the pill is the thumb and shows the formatted value', () => {
    render(<SliderField label="Height" stepper unit="cm" defaultValue={50} />);
    const text = thumb().querySelector('.ds-slider-pill-text');
    expect(text?.textContent).toBe(`50${nbsp}cm`);
    expect(text).toHaveAttribute('aria-hidden', 'true');
  });

  it('names buttons from aria-label outside a Field', () => {
    render(<Slider stepper aria-label="Zoom" />);
    expect(screen.getByRole('button', { name: 'Increase Zoom' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decrease Zoom' })).toBeInTheDocument();
  });

  it('names buttons from aria-labelledby outside a Field and with no label at all', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { unmount } = render(
      <>
        <span id="lab">Zoom</span>
        <Slider stepper aria-labelledby="lab" />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Increase Zoom' })).toBeInTheDocument();
    unmount();
    render(<Slider stepper />);
    expect(screen.getByRole('button', { name: 'Increase' })).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('aria-label'));
  });

  describe('edit mode (bubble="always")', () => {
    it('has no separate bubble input until opened; Enter on the pill opens it, typing commits', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<SliderField label="Height" stepper bubble="always" unit="cm" max={300} onValueChange={onValueChange} />);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      await user.tab();
      await user.keyboard('{Enter}');
      const box = screen.getByRole('textbox');
      expect(box).toHaveFocus();
      expect(box).toHaveValue('0');
      await user.keyboard('239 cm{Enter}');
      expect(onValueChange).toHaveBeenCalledWith(239);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(thumb()).toHaveFocus();
      expect(thumb()).toHaveAttribute('aria-valuenow', '239');
    });

    it('Esc discards, closes and refocuses the pill and stops propagation', async () => {
      const user = userEvent.setup();
      const onKeyDown = jest.fn();
      render(
        <div onKeyDown={(e) => onKeyDown(e.key)}>
          <SliderField label="Height" stepper bubble="always" defaultValue={20} />
        </div>,
      );
      await user.tab();
      await user.keyboard('{Enter}');
      await user.keyboard('77{Escape}');
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(thumb()).toHaveFocus();
      expect(thumb()).toHaveAttribute('aria-valuenow', '20');
      expect(onKeyDown).not.toHaveBeenCalledWith('Escape');
    });

    it('blur and Tab commit and close', async () => {
      const user = userEvent.setup();
      render(<SliderField label="Height" stepper bubble="always" />);
      await user.tab();
      await user.keyboard('{Enter}');
      await user.keyboard('42');
      await user.tab();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(thumb()).toHaveAttribute('aria-valuenow', '42');
    });

    it('a click on the pill that does not move opens edit mode', () => {
      render(<SliderField label="Height" stepper bubble="always" defaultValue={20} />);
      fireEvent.pointerDown(thumb(), { clientX: 100, pointerId: 1 });
      fireEvent.pointerUp(thumb(), { clientX: 102, pointerId: 1 });
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('a pointer move of more than 4 px does not open it', () => {
      render(<SliderField label="Height" stepper bubble="always" defaultValue={20} />);
      fireEvent.pointerDown(thumb(), { clientX: 100, pointerId: 1 });
      fireEvent.pointerUp(thumb(), { clientX: 120, pointerId: 1 });
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('Enter does nothing on a plain stepper', async () => {
      const user = userEvent.setup();
      render(<SliderField label="Height" stepper />);
      await user.tab();
      await user.keyboard('{Enter}');
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('stepper with showInput also has the attached input', () => {
      render(<SliderField label="Height" stepper showInput />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});

describe('Slider Field wiring', () => {
  it('names the thumb through aria-labelledby and the label click focuses it', async () => {
    const user = userEvent.setup();
    render(<SliderField label="Volume" />);
    expect(thumb()).toHaveAccessibleName('Volume');
    expect(thumb().getAttribute('aria-labelledby')).toMatch(/-label$/);
    await user.click(screen.getByText('Volume'));
    expect(thumb()).toHaveFocus();
  });

  it('with showInput the label click focuses the input', async () => {
    const user = userEvent.setup();
    render(<SliderField label="Volume" showInput />);
    await user.click(screen.getByText('Volume'));
    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(thumb()).toHaveAccessibleName('Volume');
  });

  it('wires hint, error, required and invalid to the thumb and the input', () => {
    render(<SliderField label="Volume" hint="Keep it low" error="too loud" required showInput />);
    for (const el of [thumb(), screen.getByRole('textbox')]) {
      expect(el).toHaveAttribute('aria-invalid', 'true');
      expect(el).toHaveAttribute('aria-required', 'true');
      expect(el).toHaveAccessibleDescription(/Keep it low.*too loud/);
    }
    expect(screen.getByText('too loud')).toBeInTheDocument();
  });

  it('wires invalid and describedby to the bubble input too', () => {
    render(<SliderField label="Volume" hint="Hint" error="bad" bubble="always" />);
    const box = screen.getByRole('textbox');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription(/Hint.*bad/);
  });

  it('supports the invalid prop without a Field', () => {
    render(<Slider aria-label="Level" invalid />);
    expect(thumb()).toHaveAttribute('aria-invalid', 'true');
  });

  it('disabled from the Field disables the thumb and the input and removes them from the tab order', async () => {
    const user = userEvent.setup();
    const { container } = render(<SliderField label="Volume" disabled showInput />);
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(thumb()).toHaveAttribute('data-disabled');
    expect(container.querySelector('.ds-slider')).toHaveAttribute('data-disabled');
    await user.tab();
    expect(thumb()).not.toHaveFocus();
    expect(screen.getByRole('textbox')).not.toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(thumb()).toHaveAttribute('aria-valuenow', '0');
  });

  it('uses aria-label on a bare Slider', () => {
    render(<Slider aria-label="Zoom" />);
    expect(screen.getByRole('slider', { name: 'Zoom' })).toBeInTheDocument();
  });

  it('uses aria-labelledby on a bare Slider and on its input', () => {
    render(
      <>
        <span id="lab">Zoom</span>
        <Slider aria-labelledby="lab" showInput unit="x" />
      </>,
    );
    expect(screen.getByRole('slider', { name: 'Zoom' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Zoom x' })).toBeInTheDocument();
  });

  it('names a bare input with aria-label plus unit', () => {
    render(<Slider aria-label="Zoom" showInput unit="x" />);
    expect(screen.getByRole('textbox', { name: 'Zoom x' })).toBeInTheDocument();
  });

  it('uses an explicit id on a bare Slider thumb', () => {
    render(<Slider aria-label="Zoom" id="zoom" />);
    expect(thumb()).toHaveAttribute('id', 'zoom');
  });

  it('warns when a bare Slider has no name', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Slider />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('aria-label'));
  });

  it('warns for invalid values lists and non-multiple steps', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(<Slider aria-label="a" values={[3, 1, 1]} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('sorted'));
    render(<Slider aria-label="b" min={0} max={10} step={3} />);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('multiple'));
  });
});

describe('Slider form', () => {
  it('submits the real value, not the index', async () => {
    const user = userEvent.setup();
    let data: FormData | undefined;
    render(
      <form
        onSubmit={(e) => {
          e.preventDefault();
          data = new FormData(e.currentTarget);
        }}
      >
        <SliderField label="Rating" name="rating" values={LIST} defaultValue={3} />
        <button type="submit">Go</button>
      </form>,
    );
    await user.tab();
    await user.keyboard('{ArrowRight}');
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(data?.get('rating')).toBe('5');
  });

  it('renders no hidden input without a name, and the attached input has no name', () => {
    const { container } = render(<SliderField label="Level" showInput />);
    expect(container.querySelector('input[type="hidden"]')).toBeNull();
  });
});

describe('Slider structure', () => {
  it('sets size and touch sizes via data attributes', () => {
    const { container, rerender } = render(<SliderField label="Level" />);
    expect(container.querySelector('.ds-slider')).toHaveAttribute('data-size', 'md');
    rerender(<SliderField label="Level" size="lg" />);
    expect(container.querySelector('.ds-slider')).toHaveAttribute('data-size', 'lg');
    rerender(<SliderField label="Level" size="sm" />);
    expect(container.querySelector('.ds-slider')).toHaveAttribute('data-size', 'sm');
  });

  it('sets the thumb position from the value', () => {
    const { container } = render(<SliderField label="Level" defaultValue={25} />);
    expect((container.querySelector('.ds-slider') as HTMLElement).style.getPropertyValue('--slider-p')).toBe('0.25');
  });

  it('works with a single-value list', () => {
    render(<Slider aria-label="One" values={[7]} />);
    expect(thumb()).toHaveAttribute('aria-valuenow', '7');
  });
});

describe('Slider auto bubble clamping', () => {
  // jsdom has no layout, so assert the stylesheet contract: the box is a size container and the
  // bubble shifts inward by comparing its half width with the thumb position in 100cqw units.
  const css = readFileSync(join(__dirname, 'Slider.css'), 'utf8');
  const bubbleRule = css.slice(css.indexOf('.ds-slider-bubble {'), css.indexOf('}', css.indexOf('.ds-slider-bubble {')));

  it('makes the track box a container so the bubble can read its width', () => {
    expect(css).toMatch(/\.ds-slider-box \{[^}]*container-type: inline-size/);
  });

  it('clamps the bubble to both root edges', () => {
    expect(bubbleRule).toMatch(/--slider-bubble-shift/);
    expect(bubbleRule).toMatch(/max\(0px, var\(--slider-bubble-auto-w\) \/ 2 - var\(--slider-bubble-auto-x\)\)/);
    expect(bubbleRule).toMatch(/min\(0px, 100cqw - var\(--slider-bubble-auto-w\) \/ 2 - var\(--slider-bubble-auto-x\)\)/);
    expect(bubbleRule).toMatch(/translate: calc\(\(-50% \+ var\(--slider-bubble-shift\)\)/);
  });

  it('sizes the bubble from the longest formatted value and exposes position', () => {
    const { container } = render(<SliderField label="Level" unit="%" defaultValue={100} />);
    const root = container.querySelector('.ds-slider') as HTMLElement;
    expect(root.style.getPropertyValue('--slider-ch')).toBe('4');
    expect(root.style.getPropertyValue('--slider-p')).toBe('1');
  });
});

describe('Slider mark positions and input widths', () => {
  const css = readFileSync(join(__dirname, 'Slider.css'), 'utf8');
  const rule = (sel: string) => css.slice(css.indexOf(`${sel} {`), css.indexOf('}', css.indexOf(`${sel} {`)));

  it('gives every list mark and label its own position, index based', () => {
    const { container } = render(<SliderField label="Rating" values={LIST} />);
    const pos = (sel: string) =>
      Array.from(container.querySelectorAll<HTMLElement>(sel)).map((n) => n.style.getPropertyValue('--slider-p'));
    const expected = ['0', '0.2', '0.4', '0.6', '0.8', '1'];
    expect(pos('.ds-slider-tick')).toEqual(expected);
    expect(pos('.ds-slider-mark-label')).toEqual(expected);
    expect(new Set(pos('.ds-slider-mark-label')).size).toBe(6);
  });

  it('ends marks sit at the track ends', () => {
    const { container } = render(<SliderField label="Rating" values={LIST} marks="ends" />);
    const pos = Array.from(container.querySelectorAll<HTMLElement>('.ds-slider-mark-label')).map((n) => n.style.getPropertyValue('--slider-p'));
    expect(pos).toEqual(['0', '1']);
  });

  it('uniform marks are placed by value', () => {
    const { container } = render(<SliderField label="Level" min={0} max={200} marks={[0, 50, 200]} />);
    const pos = Array.from(container.querySelectorAll<HTMLElement>('.ds-slider-mark-label')).map((n) => n.style.getPropertyValue('--slider-p'));
    expect(pos).toEqual(['0', '0.25', '1']);
  });

  it('ticks and labels compute --slider-x from their own --slider-p (custom properties resolve where declared)', () => {
    for (const sel of ['.ds-slider-tick', '.ds-slider-mark-label']) {
      expect(rule(sel)).toMatch(/--slider-x: calc\(var\(--slider-thumb-size\) \/ 2 \+ var\(--slider-p\)/);
    }
  });

  it('sizes the bubble input from the widest value plus the unit, not the current value', () => {
    const { container, rerender } = render(<SliderField label="Level" bubble="always" unit="%" defaultValue={5} />);
    const root = container.querySelector('.ds-slider') as HTMLElement;
    expect(root.style.getPropertyValue('--slider-bare-ch')).toBe('3');
    expect(root.style.getPropertyValue('--slider-unit-ch')).toBe('1');
    expect(root).toHaveAttribute('data-unit');
    expect(rule('.ds-slider-bubble-input')).toMatch(/--slider-unit-w/);
    expect(rule('.ds-slider-bubble-input')).toMatch(/var\(--slider-bare-ch\) \* 1ch[^;]*var\(--slider-unit-w\)/);
    rerender(<SliderField key="b" label="Level" bubble="always" min={-100} max={100} defaultValue={5} />);
    expect((container.querySelector('.ds-slider') as HTMLElement).style.getPropertyValue('--slider-bare-ch')).toBe('4');
    expect(container.querySelector('.ds-slider')).not.toHaveAttribute('data-unit');
  });

  it('counts decimals and the longest list label', () => {
    const { container } = render(<SliderField label="Level" bubble="always" min={0} max={1} step={0.25} />);
    expect((container.querySelector('.ds-slider') as HTMLElement).style.getPropertyValue('--slider-bare-ch')).toBe('4');
  });

  it('pads long scales to the step decimals and sizes the stepper pill from the formatted text', () => {
    const { container } = render(<SliderField label="Level" stepper min={0} max={100} step={0.01} unit="cm" />);
    const root = container.querySelector('.ds-slider') as HTMLElement;
    // "100.00" + nbsp + "cm" = 9 chars at the widest
    expect(root.style.getPropertyValue('--slider-ch')).toBe('9');
  });
});

describe('Slider a11y (axe)', () => {
  const cases: Array<[string, ReactElement]> = [
    ['default', <SliderField key="1" label="Volume" />],
    ['hint', <SliderField key="2" label="Volume" hint="Keep it low" />],
    ['invalid', <SliderField key="3" label="Volume" error="too loud" />],
    ['disabled', <SliderField key="4" label="Volume" disabled />],
    ['showInput', <SliderField key="5" label="Volume" showInput />],
    ['unit + input', <SliderField key="6" label="Height" showInput unit="cm" />],
    ['bubble always', <SliderField key="7" label="Volume" bubble="always" />],
    ['bubble always invalid', <SliderField key="8" label="Volume" bubble="always" error="bad" />],
    ['bubble always disabled', <SliderField key="9" label="Volume" bubble="always" disabled />],
    ['list steps', <SliderField key="10" label="Rating" values={LIST} marks="steps" />],
    ['list none', <SliderField key="11" label="Rating" values={LIST} marks="none" />],
    ['list ends', <SliderField key="12" label="Rating" values={LIST} marks="ends" />],
    ['stepper', <SliderField key="13" label="Height" stepper defaultValue={5} />],
    ['stepper at min', <SliderField key="14" label="Height" stepper />],
    ['stepper disabled', <SliderField key="15" label="Height" stepper disabled />],
    ['stepper invalid', <SliderField key="16" label="Height" stepper error="bad" />],
    ['bare', <Slider key="17" aria-label="Zoom" />],
  ];

  it.each(cases)('has no violations: %s', async (_name, ui) => {
    const { container } = render(ui);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no violations in stepper edit mode', async () => {
    const user = userEvent.setup();
    const { container } = render(<SliderField label="Height" stepper bubble="always" />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
