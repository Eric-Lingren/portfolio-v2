// Writes src/content/work-cards.json. Card copy (title, outcome, number) is owned by the JSON;
// thumbnail fields come from case study frontmatter and the image build.
// The fly-through registry is bundled for the client, so it cannot read MDX
// with fs at render time. A sync test keeps this file honest.
// Run after `npm run work:images`: thumb tone and the retina srcset come from src/content/work-images.json.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const CARD_SLUGS = [
  "kpi-granularity",
  "investor-reports",
  "metrics-tab-v2",
  "frontend-platform",
  "render-performance",
];

function thumbSrcSet(images, thumbnail) {
  const hi = thumbnail.replace(/thumb\.webp$/, "thumb-2x.webp");
  const base = images[thumbnail];
  if (!base || hi === thumbnail || !images[hi]) return null;
  return `${thumbnail} ${base.width}w, ${hi} ${images[hi].width}w`;
}

function readJson(file, fallback) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

export function buildCards(root = process.cwd()) {
  const images = JSON.parse(fs.readFileSync(path.join(root, "src/content/work-images.json"), "utf8"));
  // Card copy is edited by hand in work-cards.json, so existing entries keep their text.
  // Frontmatter only seeds the copy for a card that is not in the JSON yet.
  const existing = readJson(path.join(root, "src/content/work-cards.json"), []);
  return CARD_SLUGS.map((slug) => {
    const { data } = matter(fs.readFileSync(path.join(root, "content/work", `${slug}.mdx`), "utf8"));
    const prev = existing.find((c) => c.slug === slug);
    return {
      slug,
      title: prev ? prev.title : data.title,
      outcome: prev ? prev.outcome : data.cardOutcome,
      number: prev ? prev.number : (data.cardNumber ?? null),
      numberLabel: prev ? prev.numberLabel : (data.cardNumberLabel ?? ""),
      thumbnail: data.thumbnail,
      thumbnailSrcSet: thumbSrcSet(images, data.thumbnail),
      thumbnailTone: images[data.thumbnail]?.tone ?? "light",
      hasThumbnail: fs.existsSync(path.join(root, "public", data.thumbnail)),
    };
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = path.join(process.cwd(), "src/content/work-cards.json");
  fs.writeFileSync(out, JSON.stringify(buildCards(), null, 2) + "\n");
  console.log(`wrote ${out}`);
}
