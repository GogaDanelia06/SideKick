/** A JSON-LD graph node. Loosely typed on purpose — schemas are built from our
 *  own trusted content, not user input. */
export type JsonLdData = Record<string, unknown>;

/** Renders a JSON-LD structured-data block. Server-only; "<" is escaped so the
 *  inline script can't be terminated early by the serialized content. */
export function JsonLd({ data }: { data: JsonLdData }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
