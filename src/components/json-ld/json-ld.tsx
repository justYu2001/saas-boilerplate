import type { Graph, Thing, WithContext } from "schema-dts";

interface JsonLdProps {
  data: WithContext<Thing> | Graph;
}

export const JsonLd = ({ data }: JsonLdProps) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLd(data),
      }}
    />
  );
};

const safeJsonLd = (data: WithContext<Thing> | Graph): string =>
  JSON.stringify(data)
    .replace(/</g, "\\u003C")
    .replace(/>/g, "\\u003E")
    .replace(/&/g, "\\u0026")
    .replace(/'/g, "\\u0027");
