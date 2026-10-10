// Writes src/content/work-cards.json from case study frontmatter.
// The fly-through registry is bundled for the client, so it cannot read MDX
// with fs at render time. A sync test keeps this file honest.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export const CARD_SLUGS = ["kpi-granularity", "investor-reports", "frontend-platform", "render-performance"];

export function buildCards(root = process.cwd()) {
  return CARD_SLUGS.map((slug) => {
    const { data } = matter(fs.readFileSync(path.join(root, "content/work", `${slug}.mdx`), "utf8"));
    return {
      slug,
      title: data.title,
      outcome: data.cardOutcome,
      number: data.cardNumber ?? null,
      numberLabel: data.cardNumberLabel ?? "",
      thumbnail: data.thumbnail,
      hasThumbnail: fs.existsSync(path.join(root, "public", data.thumbnail)),
    };
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = path.join(process.cwd(), "src/content/work-cards.json");
  fs.writeFileSync(out, JSON.stringify(buildCards(), null, 2) + "\n");
  console.log(`wrote ${out}`);
}
