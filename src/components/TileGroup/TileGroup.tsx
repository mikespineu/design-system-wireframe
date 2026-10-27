import { forwardRef, type ElementRef, type ReactNode, type Ref } from 'react';
import type { RadioGroup } from 'radix-ui';
import './TileGroup.css';
import { ChoiceGroup, type ChoiceGroupProps, type ChoiceOption } from '../ChoiceGroup/ChoiceGroup';

export interface TileOption<V extends string = string> extends ChoiceOption<V> {
  /** Decorative icon (for example `<Icon icon={PlusIcon} />`); rendered `aria-hidden` and sized by the tile (24 px md, 16 px sm). */
  icon: ReactNode;
}

export interface TileGroupProps<V extends string = string>
  extends Omit<ChoiceGroupProps<V>, 'variant' | 'renderContent' | 'options' | 'fullWidth'> {
  /** Icon + label options. A value is always selected. Keep labels to one or two words. */
  options: readonly TileOption<V>[];
}

/**
 * Pick exactly one of several options shown as icon + label tiles. Built on Radix `RadioGroup`
 * through the internal `ChoiceGroup` base: arrow keys move and select, Home/End move focus only,
 * and the value can never be cleared. Tiles grow to fit their label and the row scrolls when it overflows.
 */
function TileGroupInner<V extends string>(
  { labelPosition = 'top', options, ...props }: TileGroupProps<V>,
  ref: Ref<ElementRef<typeof RadioGroup.Root>>,
) {
  return (
    <ChoiceGroup<V>
      {...props}
      ref={ref}
      options={options}
      labelPosition={labelPosition}
      variant="tile"
      renderContent={(o) => (
        <>
          <span className="ds-tile-icon" aria-hidden="true">
            {(o as TileOption<V>).icon}
          </span>
          <span className="ds-tile-label">{o.label}</span>
        </>
      )}
    />
  );
}

export const TileGroup = forwardRef(TileGroupInner) as <V extends string>(
  props: TileGroupProps<V> & { ref?: Ref<ElementRef<typeof RadioGroup.Root>> },
) => ReturnType<typeof TileGroupInner>;
