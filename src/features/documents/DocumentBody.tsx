import type { DocumentBlock } from "../../content/schemas";

interface DocumentBodyProps {
  blocks: readonly DocumentBlock[];
}

export function DocumentBody({ blocks }: DocumentBodyProps) {
  return (
    <div className="document-body">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return <h2 key={index}>{block.text}</h2>;
          case "paragraph":
            return <p key={index}>{block.text}</p>;
          case "callout":
            return (
              <aside className="document-callout" key={index}>
                <strong>{block.label}</strong>
                <p>{block.text}</p>
              </aside>
            );
          case "redaction":
            return (
              <p key={index}>
                <span className="redaction" aria-label="Redacted text">
                  {"█".repeat(block.length)}
                </span>
                {block.explanation ? (
                  <span className="redaction__explanation"> ({block.explanation})</span>
                ) : null}
              </p>
            );
        }
      })}
    </div>
  );
}
