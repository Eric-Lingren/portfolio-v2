import { FlyThroughLoader } from "@/components/flythrough/FlyThroughLoader";
import { PANELS } from "@/components/flythrough/registry";

export default function Home() {
  return (
    <main>
      <FlyThroughLoader>
        <div className="stack">
          {PANELS.map((p) => (
            <div key={p.id}>{p.render(0)}</div>
          ))}
        </div>
      </FlyThroughLoader>
    </main>
  );
}
