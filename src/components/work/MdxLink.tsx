import type { AnchorHTMLAttributes } from "react";

/** Markdown links in case studies. Off-site URLs open in a new tab, like every other external link. */
export function MdxLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = /^https?:\/\//.test(props.href ?? "");
  return <a {...props} {...(external && { target: "_blank", rel: "noopener noreferrer" })} />;
}
