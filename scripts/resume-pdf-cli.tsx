/** Interactive wrapper for `npm run resume:pdf`. No flags: it only prompts and calls the core. */
import { createInterface } from "node:readline/promises";
import { listVariants } from "../src/content/resume-variants";
import { chooseVariant, generateResumePdf } from "./resume-pdf";

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const variant = await chooseVariant(listVariants(), (q) => rl.question(q));
    const out = await generateResumePdf({ variant });
    console.log(`Wrote ${out.path}`);
    if (out.publicPath) console.log(`Wrote ${out.publicPath} (no phone)`);
    if (out.hash) console.log("Updated src/content/resume-pdf.sha256");
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
