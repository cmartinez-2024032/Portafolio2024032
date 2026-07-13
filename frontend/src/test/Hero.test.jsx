import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Hero from "../components/Hero";
import { mockPersonal } from "./mocks";

describe("Hero", () => {
  it("renders the full name", () => {
    render(<Hero data={mockPersonal} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Cristopher Martínez");
  });

  it("shows photo with initial fallback", () => {
    const dataNoPhoto = { ...mockPersonal, photo: null };
    render(<Hero data={dataNoPhoto} />);
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("shows typing cursor initially", () => {
    render(<Hero data={mockPersonal} />);
    const cursor = document.querySelector(".typewriter-cursor");
    expect(cursor).toBeInTheDocument();
  });

  it("renders title container with cursor", () => {
    render(<Hero data={mockPersonal} />);
    const sub = document.querySelector(".hero-sub");
    expect(sub).toBeInTheDocument();
    const cursor = sub.querySelector(".typewriter-cursor");
    expect(cursor).toBeInTheDocument();
  });
});
