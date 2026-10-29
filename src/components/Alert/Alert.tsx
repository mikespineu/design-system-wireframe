import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import { Icon } from "../Icon/Icon";
import type { IconComponent, IconRole } from "../Icon";
import { useIcon } from "../Icon";

export type AlertSeverity = "info" | "success" | "error";

export interface AlertProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  severity?: AlertSeverity;
  title: ReactNode;
  /** Body text. */
  children?: ReactNode;
  /** Replaces the severity glyph for this instance. `null` hides it. */
  icon?: IconComponent | null;
}

/** Colors come from the Foundations/Colors/Status tokens. Severity is also shown by border weight, icon and title weight, never by hue alone. */
const config: Record<
  AlertSeverity,
  {
    icon: IconRole;
    strokeWidth: number;
    box: string;
    titleWeight: string;
    body: string;
    role: "status" | "alert";
  }
> = {
  info: {
    icon: "info",
    strokeWidth: 1.5,
    box: "border border-info-border bg-info-bg text-info",
    titleWeight: "",
    body: "text-text",
    role: "status",
  },
  success: {
    icon: "success",
    strokeWidth: 2,
    box: "border border-success-border bg-success-bg text-success",
    titleWeight: "",
    body: "text-text",
    role: "status",
  },
  error: {
    icon: "warning",
    strokeWidth: 2,
    box: "border border-error-border bg-error-bg text-error",
    titleWeight: "font-bold",
    body: "text-text-strong",
    role: "alert",
  },
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ severity = "info", title, children, className, icon, ...rest }, ref) => {
    const c = config[severity];
    const Glyph = useIcon(c.icon, icon);
    return (
      <div
        ref={ref}
        role={c.role}
        data-severity={severity}
        className={cx("flex gap-3 rounded-lg p-4", c.box, className)}
        {...rest}
      >
        {Glyph && <Icon icon={Glyph} size="lg" strokeWidth={c.strokeWidth} className="flex-none" />}
        <div className="flex flex-col gap-1">
          <strong className={cx("font-label text-ui", c.titleWeight)}>
            {title}
          </strong>
          {children != null && (
            <span className={cx("font-sans text-body-xs", c.body)}>
              {children}
            </span>
          )}
        </div>
      </div>
    );
  },
);
Alert.displayName = "Alert";
