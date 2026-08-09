import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";

import { PageHeader } from "./page-header";
import { SourceNote } from "./source-note";

describe("PageHeader", () => {
  it("should render the title as the page's only top-level heading", () => {
    render(<PageHeader title="Overview" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Overview" }),
    ).toBeInTheDocument();
  });

  it("should render the description when there is one, and leave it out entirely rather than reserve empty space when there is not", () => {
    const description = "What lands here.";
    const { rerender } = render(
      <PageHeader title="Overview" description={description} />,
    );

    expect(screen.getByText(description)).toBeInTheDocument();

    rerender(<PageHeader title="Overview" />);

    expect(screen.queryByText(description)).not.toBeInTheDocument();
  });

  it("should place page actions alongside the heading", () => {
    render(
      <PageHeader title="Overview">
        <Button>New post</Button>
      </PageHeader>,
    );

    expect(
      screen.getByRole("button", { name: "New post" }),
    ).toBeInTheDocument();
  });
});

describe("SourceNote", () => {
  it("should name the file that renders the page", () => {
    render(<SourceNote path="src/app/dashboard/page.tsx" />);

    expect(screen.getByText("src/app/dashboard/page.tsx")).toBeInTheDocument();
  });

  /*
   * The full stop follows the chip in JSX source, and a newline between them
   * would render as a space — leaving the sentence to end with a stop floating
   * away from the path. Testing Library collapses runs of whitespace but never
   * removes one, so this exact match is what catches it coming back.
   */
  it("should end the sentence tight against the path, not a space away from it", () => {
    render(<SourceNote path="src/app/dashboard/page.tsx" />);

    // A function matcher, because the default one reads only an element's
    // direct text nodes and would skip straight past the `<code>` chip.
    expect(
      screen.getByText(
        (_content, element) =>
          element?.tagName === "P" &&
          element.textContent ===
            "Build this page in src/app/dashboard/page.tsx.",
      ),
    ).toBeInTheDocument();
  });
});
