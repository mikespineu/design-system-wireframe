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

/** Severity is shown by border weight, fill, icon and title weight, never by hue. */
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
    box: "border border-ink bg-white",
    titleWeight: "font-medium",
    body: "text-gray-700",
    role: "status",
  },
  success: {
    icon: "check",
    strokeWidth: 1.5,
    box: "bg-gray-100",
    titleWeight: "font-medium",
    body: "text-gray-700",
    role: "status",
  },
  error: {
    icon: "warning",
    strokeWidth: 2,
    box: "border-2 border-ink bg-gray-50",
    titleWeight: "font-bold",
    body: "text-gray-800",
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
        className={cx("flex gap-3 p-4 text-ink", c.box, className)}
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
