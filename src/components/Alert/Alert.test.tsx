import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("renders title and body", () => {
    render(<Alert title="Info">New frames were added.</Alert>);
    expect(screen.getByText("Info")).toBeInTheDocument();
    expect(screen.getByText("New frames were added.")).toBeInTheDocument();
  });

  it.each([
    ["info", "status", "bg-info-bg", "font-medium", "M12 6.5v2"],
    ["success", "status", "bg-success-bg", "font-medium", "M7.5 12.5l3 3 6-7"],
    ["error", "alert", "bg-error-bg", "font-bold", "M12 3.5l9.5 17h-19z"],
  ] as const)(
    "%s uses role %s with distinct weight and icon",
    (severity, role, cls, weight, path) => {
      render(
        <Alert severity={severity} title="T">
          Body
        </Alert>,
      );
      const el = screen.getByRole(role);
      expect(el).toHaveClass(cls);
      expect(screen.getByText("T")).toHaveClass(weight);
      expect(el.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
      expect(el.innerHTML).toContain(path);
    },
  );

  it("uses 2 icon stroke for error, 1.5 for info", () => {
    const { container, rerender } = render(
      <Alert severity="error" title="T" />,
    );
    expect(container.querySelector("svg")).toHaveAttribute("stroke-width", "2");
    rerender(<Alert severity="info" title="T" />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "stroke-width",
      "1.5",
    );
  });

  it("defaults to info, forwards ref and rest props, merges className", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Alert ref={ref} title="T" data-testid="a" id="x" className="w-full" />,
    );
    expect(ref.current).toBe(screen.getByTestId("a"));
    expect(ref.current).toHaveAttribute("id", "x");
    expect(ref.current).toHaveClass("w-full", "p-4");
    expect(ref.current).toHaveAttribute("role", "status");
  });

  it.each(["info", "success", "error"] as const)(
    "has no a11y violations (%s)",
    async (severity) => {
      const { container } = render(
        <Alert severity={severity} title="T">
          Body
        </Alert>,
      );
      expect(await axe(container)).toHaveNoViolations();
    },
  );
});
