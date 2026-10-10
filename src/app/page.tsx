import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { FlatStack } from "@/components/flythrough/FlatStack";
import { FlyThroughLoader } from "@/components/flythrough/FlyThroughLoader";

export default function Home() {
  return (
    <main>
      <Nav />
      <FlyThroughLoader>
        <FlatStack />
      </FlyThroughLoader>
      <Footer />
    </main>
  );
}
