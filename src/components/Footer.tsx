import { GITHUB_REPO_URL } from "@/content/site";
import "./footer.css";

/** Plain page-level DOM, outside the 3D world, shown in every render mode. */
export function Footer() {
  return (
    <footer className="site-footer">
      <p>Based near Seattle. Sailing, vintage video games, and travel (50+ countries).</p>
      <p>
        Built with Next.js and CSS 3D. <a href={GITHUB_REPO_URL}>Source on GitHub</a>.
      </p>
    </footer>
  );
}
