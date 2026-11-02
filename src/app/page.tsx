import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { FlatStack } from "@/components/flythrough/FlatStack";
import { FlyThroughLoader } from "@/components/flythrough/FlyThroughLoader";
import { FIRST_PAINT_SCRIPT } from "@/components/flythrough/first-paint";

export default function Home() {
  return (
    <main>
      <Nav />
      {/* Must run before first paint and after the nav, which it measures (see first-paint.ts). */}
      <script dangerouslySetInnerHTML={{ __html: FIRST_PAINT_SCRIPT }} />
      <FlyThroughLoader>
        <FlatStack />
      </FlyThroughLoader>
      <Footer />
    </main>
  );
}
