import { LinkedImage, resolveImage, type DimensionLookup } from "./work-image";

/** Wider than 2:1 reads too small at half the column, so the pair stacks full width instead. */
const STACK_ASPECT = 2;

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
  const stacked = [
    resolveImage(before, beforeAlt, "beforeAlt", lookup),
    resolveImage(after, afterAlt, "afterAlt", lookup),
  ].some(({ width, height }) => width / height > STACK_ASPECT);
  return (
    <figure className="case-study__before-after">
      <div className="case-study__before-after-grid" data-stacked={stacked || undefined}>
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
