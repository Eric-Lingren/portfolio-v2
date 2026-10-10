import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  EMAIL,
  GITHUB_URL,
  LINKEDIN_URL,
  MAILTO_SUBJECT,
  MAILTO_URL,
  PROFILE_IMAGE_PATH,
  RESUME_PATH,
} from "./site";

describe("site constants", () => {
  it("exports contact constants", () => {
    expect(EMAIL).toBe("ericlingren@gmail.com");
    expect(GITHUB_URL).toBe("https://www.github.com/Eric-Lingren");
    expect(LINKEDIN_URL).toBe("https://www.linkedin.com/in/ericlingren/");
    expect(MAILTO_SUBJECT).toBe("Hello from ericlingren.com");
    expect(RESUME_PATH).toBe("/eric-lingren-resume.pdf");
  });

  it("builds a mailto URL with the encoded subject", () => {
    expect(MAILTO_URL).toBe(
      "mailto:ericlingren@gmail.com?subject=Hello%20from%20ericlingren.com",
    );
  });

  it("ships the profile image in public assets", () => {
    expect(existsSync(join(process.cwd(), "public", PROFILE_IMAGE_PATH))).toBe(true);
  });
});
