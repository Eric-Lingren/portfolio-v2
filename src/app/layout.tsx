import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { WorkThumbFilters } from "@/components/panels/WorkThumbFilters";
import { RESTORE_GATE_SCRIPT } from "@/components/flythrough/scroll-memory";
import "./globals.css";

export { metadata, viewport } from "./metadata";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The head script may set data-restoring-scroll on <html> before hydration.
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Must run before first paint: hides the home page while a returning reader's scroll is restored. */}
        <script dangerouslySetInnerHTML={{ __html: RESTORE_GATE_SCRIPT }} />
      </head>
      <body>
        <WorkThumbFilters />
        {children}
      </body>
    </html>
  );
}
