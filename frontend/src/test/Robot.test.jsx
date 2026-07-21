import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Robot from "../components/robot/Robot";
import { resolveRobotPoint } from "../components/robot/RobotPath";

describe("Robot companion", () => {
  it("mounts as a decorative, non-interactive companion", () => {
    const { container } = render(<Robot />);
    const robot = container.querySelector(".robot-companion");

    expect(robot).toBeInTheDocument();
    expect(robot).toHaveAttribute("aria-hidden", "true");

    // Desktop / jsdom: controller starts. Touch devices stay dormant.
    if (robot?.getAttribute("data-touch") === "true") {
      expect(robot).toHaveAttribute("data-ready", "false");
    } else {
      expect(robot).toHaveAttribute("data-ready", "true");
      expect(robot).toHaveAttribute("data-mode", "idle");
    }
  });

  it("keeps route points inside the viewport", () => {
    const point = resolveRobotPoint({
      section: "projects",
      viewportWidth: 390,
      viewportHeight: 844,
      robotWidth: 104,
      robotHeight: 120,
      scrollDirection: 1,
      focusElement: null,
    });

    expect(point.x).toBeGreaterThanOrEqual(18);
    expect(point.y).toBeGreaterThanOrEqual(82);
    expect(point.x + 104 * point.scale).toBeLessThanOrEqual(390 - 18 + 0.01);
    expect(point.y + 120 * point.scale).toBeLessThanOrEqual(844 - 18 + 0.01);
  });

  it("suspends while the project detail modal is open", async () => {
    const { container } = render(<Robot />);
    const robot = container.querySelector(".robot-companion");

    // Touch policy leaves the companion dormant — nothing to suspend.
    if (robot?.getAttribute("data-touch") === "true") {
      expect(robot).toHaveAttribute("data-ready", "false");
      return;
    }

    const modal = document.createElement("div");
    modal.className = "project-detail-overlay";
    document.body.appendChild(modal);

    await waitFor(() => expect(robot).toHaveAttribute("data-suspended", "true"));

    modal.remove();
    await waitFor(() => expect(robot).toHaveAttribute("data-suspended", "false"));
  });
});
