import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  it("renders the name as the h1", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: /Eric\s*Lingren/ })).toBeInTheDocument();
  });

  it("renders only the polished layer", () => {
    const { container } = render(<Home />);
    expect(container.querySelector('[data-layer="sketch"]')).toBeNull();
    expect(container.querySelector('[data-layer="polished"]')).not.toBeNull();
  });
});
