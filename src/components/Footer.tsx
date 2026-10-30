import { GITHUB_REPO_URL, TRAVEL_MAP_URL } from "@/content/site";
import "./footer.css";

/** Plain page-level DOM, outside the 3D world, shown in every render mode. */
export function Footer() {
  return (
    <footer className="site-footer">
      <p>
        Based near Seattle. Sailing, retro video games, and travel (
        <a href={TRAVEL_MAP_URL} target="_blank" rel="noopener noreferrer">
          50+ countries
        </a>
        ).
      </p>
      <p>
        Built with Next.js and CSS 3D. <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
          Source on GitHub
        </a>
        .
      </p>
    </footer>
  );
}
