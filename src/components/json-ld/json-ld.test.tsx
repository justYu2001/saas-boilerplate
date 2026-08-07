import { renderToStaticMarkup } from "react-dom/server";

import type { Graph, Person, Thing, WithContext } from "schema-dts";
import { describe, expect, it } from "vitest";

import { JsonLd } from "./json-ld";

/**
 * Renders the component the way Next.js does (server-side) and returns the raw
 * text inside the <script> tag. React inserts `dangerouslySetInnerHTML` content
 * verbatim, so this is exactly what ships to the browser.
 */
const renderScriptContent = (data: WithContext<Thing> | Graph) => {
  const markup = renderToStaticMarkup(<JsonLd data={data} />);

  const match =
    /^<script type="application\/ld\+json">([\s\S]*)<\/script>$/.exec(markup);

  if (!match?.[1]) {
    throw new Error(`Unexpected JsonLd markup: ${markup}`);
  }

  return match[1];
};

const personWithName = (name: string): WithContext<Person> => ({
  "@context": "https://schema.org",
  "@type": "Person",
  name,
});

describe("JsonLd", () => {
  it("should render a linked-data script tag", () => {
    const markup = renderToStaticMarkup(
      <JsonLd data={personWithName("Euan")} />,
    );

    expect(markup).toContain('<script type="application/ld+json">');
  });

  it("should escape angle brackets so a payload cannot close the script tag", () => {
    const content = renderScriptContent(
      personWithName("</script><script>alert(1)</script>"),
    );

    expect(content).not.toContain("</script");
    expect(content).not.toContain("<");
    expect(content).not.toContain(">");
    expect(content).toContain("\\u003C");
    expect(content).toContain("\\u003E");
  });

  it("should escape ampersands and single quotes", () => {
    const content = renderScriptContent(personWithName("Ben & Jerry's"));

    expect(content).not.toContain("&");
    expect(content).not.toContain("'");
    expect(content).toContain("\\u0026");
    expect(content).toContain("\\u0027");
  });

  it("should stay valid JSON that parses back to the original data", () => {
    const data = personWithName("</script> & 'quoted' <b>bold</b>");

    expect(JSON.parse(renderScriptContent(data))).toEqual(data);
  });

  it("should escape every occurrence, not just the first", () => {
    const content = renderScriptContent(personWithName("<<>>&&''"));

    expect(content).toContain(
      "\\u003C\\u003C\\u003E\\u003E\\u0026\\u0026\\u0027\\u0027",
    );
  });

  it("should serialize a @graph payload", () => {
    const data: Graph = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Person",
          "@id": "https://example.com/#author",
          name: "Euan",
        },
        {
          "@type": "WebSite",
          "@id": "https://example.com/#website",
          name: "SAAS",
        },
      ],
    };

    expect(JSON.parse(renderScriptContent(data))).toEqual(data);
  });
});
