import data from "@/data/graphic-hooks.json";
import { GraphicHooksLibrary } from "@/components/graphic-hooks-library";
import type { GraphicHook } from "@/lib/categories";

export default function Home() {
  return <GraphicHooksLibrary items={data as GraphicHook[]} />;
}
