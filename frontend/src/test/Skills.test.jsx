import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Skills from "../components/Skills";
import { mockSkills } from "./mocks";

describe("Skills", () => {
  it("renders all category buttons", () => {
    render(<Skills skills={mockSkills} />);
    expect(screen.getByText("Frontend")).toBeInTheDocument();
    expect(screen.getByText("Backend")).toBeInTheDocument();
    expect(screen.getByText("Database")).toBeInTheDocument();
    expect(screen.getByText("DevOps")).toBeInTheDocument();
  });

  it("shows Frontend skills by default", () => {
    render(<Skills skills={mockSkills} />);
    const frontendSkills = screen.getAllByText("JavaScript");
    expect(frontendSkills.length).toBe(1);
    expect(screen.getByText("React")).toBeInTheDocument();
  });

  it("switches to Backend when clicked", () => {
    render(<Skills skills={mockSkills} />);
    fireEvent.click(screen.getByRole("button", { name: "Backend" }));
    expect(screen.getByText("Node.js")).toBeInTheDocument();
  });
});
