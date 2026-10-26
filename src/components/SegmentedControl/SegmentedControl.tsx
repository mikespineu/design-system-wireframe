import { forwardRef, type ElementRef, type Ref } from 'react';
import type { RadioGroup } from 'radix-ui';
import './SegmentedControl.css';
import { ChoiceGroup, type ChoiceGroupProps, type ChoiceOption } from '../ChoiceGroup/ChoiceGroup';

export type { ChoiceOption };

export interface SegmentedControlProps<V extends string = string>
  extends Omit<ChoiceGroupProps<V>, 'variant' | 'renderContent' | 'options'> {
  /** 2 to 7 short text options. A value is always selected. */
  options: readonly ChoiceOption<V>[];
  /** Segments share the width equally and never scroll. Use for 2 to 4 short options. */
  fullWidth?: boolean;
}

/**
 * Pick exactly one of a few short text options. Built on Radix `RadioGroup`:
 * arrow keys move and select, Home/End move focus only, and the value can never be cleared.
 * The `sm` size is for fine pointers only.
 */
function SegmentedControlInner<V extends string>(
  { labelPosition = 'start', ...props }: SegmentedControlProps<V>,
  ref: Ref<ElementRef<typeof RadioGroup.Root>>,
) {
  return (
    <ChoiceGroup<V>
      {...props}
      ref={ref}
      labelPosition={labelPosition}
      variant="segmented"
      renderContent={(o) => o.label}
    />
  );
}

export const SegmentedControl = forwardRef(SegmentedControlInner) as <V extends string>(
  props: SegmentedControlProps<V> & { ref?: Ref<ElementRef<typeof RadioGroup.Root>> },
) => ReturnType<typeof SegmentedControlInner>;
