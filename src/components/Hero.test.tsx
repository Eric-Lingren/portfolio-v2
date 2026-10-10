import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { Hero } from "./Hero";

describe("Hero", () => {
  it("has the exact eyebrow", () => {
    render(<Hero />);
    expect(screen.getByText("FRONTEND-FIRST FULL-STACK ENGINEER").textContent).toBe(
      "FRONTEND-FIRST FULL-STACK ENGINEER",
    );
  });

  it("links View work to #work and email to the mailto helper", () => {
    render(<Hero />);
    expect(screen.getByRole("link", { name: "View work" })).toHaveAttribute("href", "#work");
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute(
      "href",
      "mailto:ericlingren@gmail.com?subject=Hello%20from%20ericlingren.com",
    );
  });

  it("contains no photo", () => {
    const { container } = render(<Hero />);
    expect(container.querySelectorAll("img, picture, svg, [style*='background-image']")).toHaveLength(0);
    expect(container.innerHTML).not.toMatch(/profile/i);
  });

  it("shows the component tag", () => {
    render(<Hero />);
    expect(screen.getByText("<Hero /> z=0")).toBeInTheDocument();
  });

  it("is present in static HTML with no JS", () => {
    const html = renderToStaticMarkup(<Hero />);
    expect(html).toContain("FRONTEND-FIRST FULL-STACK ENGINEER");
    expect(html).toContain("View work");
    expect(html).not.toContain("<script");
  });
});
