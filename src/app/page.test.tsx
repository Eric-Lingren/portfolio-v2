import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  it("renders the name as the h1", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: "Eric Lingren" })).toBeInTheDocument();
  });
});
