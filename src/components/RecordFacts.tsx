interface Fact {
  label: string;
  value: string;
}

interface RecordFactsProps {
  facts: Fact[];
}

export function RecordFacts({ facts }: RecordFactsProps) {
  return (
    <dl className="record-facts">
      {facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
