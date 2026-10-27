import { Icon, type IconProps } from './Icon';
import { useIcon } from './IconProvider';
import type { IconComponent, IconRole } from './types';

export interface RoleIconProps extends Omit<IconProps, 'icon' | 'label'> {
  role: IconRole;
  /** Per-instance replacement (prop > provider > default). */
  override?: IconComponent;
}

/** Internal: draws the glyph for a role through `useIcon`. Always decorative. Not exported from the package. */
export const RoleIcon = ({ role, override, ...rest }: RoleIconProps) => {
  const icon = useIcon(role, override);
  return <Icon icon={icon} {...rest} />;
};
