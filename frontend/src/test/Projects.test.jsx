import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Projects from "../components/Projects";
import { mockProjects } from "./mocks";

describe("Projects", () => {
  it("renders all projects by default", () => {
    render(<Projects projects={mockProjects} />);
    expect(screen.getByText("Kinal Gourmet House")).toBeInTheDocument();
    expect(screen.getByText("AuthService")).toBeInTheDocument();
    expect(screen.getByText("GestorDeOpiniones")).toBeInTheDocument();
  });

  it("filters by backend category", () => {
    render(<Projects projects={mockProjects} />);
    fireEvent.click(screen.getByRole("button", { name: "backend" }));
    expect(screen.getByText("AuthService")).toBeInTheDocument();
    expect(screen.queryByText("GestorDeOpiniones")).not.toBeInTheDocument();
  });

  it("shows Todos as default active filter", () => {
    render(<Projects projects={mockProjects} />);
    const todosBtn = screen.getByRole("button", { name: "Todos" });
    expect(todosBtn.className).toMatch(/pill-active/);
  });
});
