type JsonLdProps = {
  data: Record<string, unknown>;
};

// Structured data for search engines. Server-rendered static markup, so there
// is nothing to hydrate; "<" is escaped so the JSON can never close the tag early.
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
