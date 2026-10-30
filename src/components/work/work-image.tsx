import workImages from "@/content/work-images.json";

export type Dimensions = { width: number; height: number };
export type DimensionLookup = (src: string) => Dimensions | undefined;

export const defaultLookup: DimensionLookup = (src) =>
  (workImages as Record<string, Dimensions>)[src];

/** Resolves a work image or throws, so the static build fails instead of shipping a broken image. */
export function resolveImage(
  src: string,
  alt: string,
  altName: string,
  lookup: DimensionLookup = defaultLookup,
): Dimensions {
  if (typeof alt !== "string" || alt.trim() === "") {
    throw new Error(`Work image "${src}" is missing ${altName} text`);
  }
  const dims = lookup(src);
  if (!dims) throw new Error(`Work image "${src}" has no entry in work-images.json`);
  return dims;
}

/** Link to the full-size image (new tab, as Testimonials does) wrapping the image. */
export function LinkedImage({
  src,
  alt,
  altName,
  lookup,
}: {
  src: string;
  alt: string;
  altName: string;
  lookup?: DimensionLookup;
}) {
  const { width, height } = resolveImage(src, alt, altName, lookup);
  return (
    <a href={src} target="_blank" rel="noopener noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      <span className="sr-only">Open full-size image</span>
    </a>
  );
}
