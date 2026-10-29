import { LinkedImage, type DimensionLookup } from "./work-image";

export function BeforeAfter({
  before,
  after,
  beforeAlt,
  afterAlt,
  caption,
  lookup,
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  caption?: string;
  lookup?: DimensionLookup;
}) {
  return (
    <figure className="case-study__before-after">
      <div className="case-study__before-after-grid">
        <div className="case-study__before-after-item">
          <span className="case-study__before-after-label">Before</span>
          <LinkedImage src={before} alt={beforeAlt} altName="beforeAlt" lookup={lookup} />
        </div>
        <div className="case-study__before-after-item">
          <span className="case-study__before-after-label">After</span>
          <LinkedImage src={after} alt={afterAlt} altName="afterAlt" lookup={lookup} />
        </div>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
