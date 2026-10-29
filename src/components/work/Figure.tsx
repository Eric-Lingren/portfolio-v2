import { LinkedImage, type DimensionLookup } from "./work-image";

export function Figure({
  src,
  alt,
  caption,
  lookup,
}: {
  src: string;
  alt: string;
  caption?: string;
  lookup?: DimensionLookup;
}) {
  return (
    <figure className="case-study__figure">
      <LinkedImage src={src} alt={alt} altName="alt" lookup={lookup} />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
