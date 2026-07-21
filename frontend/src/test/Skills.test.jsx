import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Skills from "../components/Skills";
import { mockSkills } from "./mocks";

describe("Skills", () => {
  it("renders all category buttons", () => {
    render(<Skills skills={mockSkills} />);
    expect(screen.getByRole("button", { name: "Frontend" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Backend" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Database" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "DevOps" })).toBeInTheDocument();
  });

  it("shows Frontend skills by default", () => {
    render(<Skills skills={mockSkills} />);
    expect(screen.getAllByText("JavaScript").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("React").length).toBeGreaterThanOrEqual(1);
  });

  it("switches to Backend when clicked", () => {
    render(<Skills skills={mockSkills} />);
    fireEvent.click(screen.getByRole("button", { name: "Backend" }));
    expect(screen.getAllByText("Node.js").length).toBeGreaterThanOrEqual(1);
  });
});
