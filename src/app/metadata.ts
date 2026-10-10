import type { Metadata, Viewport } from "next";
import { SITE_NAME } from "@/content/site";

export const CANONICAL_URL = "https://ericlingren.com";
export const OG_IMAGE_PATH = "/og.png";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const TITLE = `${SITE_NAME} | Frontend-first full-stack engineer`;
const DESCRIPTION =
  "Portfolio of Eric Lingren, a frontend-first full-stack engineer.";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: `${SITE_NAME}, frontend-first full-stack engineer`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c0a0e",
};
