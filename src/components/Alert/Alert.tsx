import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import { Icon, type IconName } from "../Icon";

export type AlertSeverity = "info" | "success" | "error";

export interface AlertProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  severity?: AlertSeverity;
  title: ReactNode;
  /** Body text. */
  children?: ReactNode;
}

/** Colors come from the Foundations/Colors/Status tokens. Severity is also shown by border weight, icon and title weight, never by hue alone. */
const config: Record<
  AlertSeverity,
  {
    icon: IconName;
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
    titleWeight: "font-medium",
    body: "text-text",
    role: "status",
  },
  success: {
    icon: "check",
    strokeWidth: 1.75,
    box: "border border-success-border bg-success-bg text-success",
    titleWeight: "font-medium",
    body: "text-text",
    role: "status",
  },
  error: {
    icon: "warning",
    strokeWidth: 1.75,
    box: "border border-error-border bg-error-bg text-error",
    titleWeight: "font-bold",
    body: "text-text-strong",
    role: "alert",
  },
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ severity = "info", title, children, className, ...rest }, ref) => {
    const c = config[severity];
    return (
      <div
        ref={ref}
        role={c.role}
        data-severity={severity}
        className={cx("flex gap-3 p-4", c.box, className)}
        {...rest}
      >
        <Icon
          name={c.icon}
          size={20}
          strokeWidth={c.strokeWidth}
          className="flex-none"
        />
        <div className="flex flex-col gap-1">
          <strong className={cx("font-mono text-sm", c.titleWeight)}>
            {title}
          </strong>
          {children != null && (
            <span className={cx("text-sm leading-normal", c.body)}>
              {children}
            </span>
          )}
        </div>
      </div>
    );
  },
);
Alert.displayName = "Alert";
