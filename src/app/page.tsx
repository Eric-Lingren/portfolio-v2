import { SITE_NAME } from "@/content/site";

export default function Home() {
  return (
    <main className="home">
      <h1>{SITE_NAME}</h1>
      <div className="build-line" role="presentation" />
    </main>
  );
}
