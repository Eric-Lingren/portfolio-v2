/**
 * The EL mark from src/app/icon.svg without its background tile: a coral L (Lingren) that
 * forms the spine and base of a cyan-barred E (Eric). Keep the rects in sync with icon.svg.
 */
export const BRAND_MARK_RECTS = [
  { x: 16, y: 12, width: 8, height: 40, fill: "#ff6b57" },
  { x: 16, y: 44, width: 32, height: 8, fill: "#ff6b57" },
  { x: 28, y: 12, width: 20, height: 8, fill: "#06b6d4" },
  { x: 28, y: 28, width: 16, height: 8, fill: "#06b6d4" },
] as const;

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="16 12 32 40" aria-hidden="true" focusable="false">
      {BRAND_MARK_RECTS.map((r) => (
        <rect key={`${r.x}-${r.y}`} {...r} />
      ))}
    </svg>
  );
}
