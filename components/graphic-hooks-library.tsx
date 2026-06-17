"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { categories, type Category, type GraphicHook } from "@/lib/categories";
import { cn } from "@/lib/utils";

type Props = {
  items: GraphicHook[];
};

export function GraphicHooksLibrary({ items }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category>("Todos");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<GraphicHook | null>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = activeCategory === "Todos" || item.visualCategory === activeCategory;
      const searchable = [
        item.creator,
        item.visualCategory,
        item.complexity,
        item.hookStructure,
        item.howToRecreate,
        item.notes,
        ...item.assetsNeeded,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [activeCategory, items, query]);

  return (
    <div className="min-h-screen bg-background text-text">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-line bg-black px-5 py-6 lg:block">
        <div className="mb-9">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-panel text-sm font-black">
            TS
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#656565]">Thon Studio</p>
          <h1 className="mt-2 max-w-44 text-3xl font-black leading-[0.98] tracking-normal">
            Graphic Hooks
          </h1>
        </div>

        <nav className="grid gap-1" aria-label="Categorias visuais">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                className={cn(
                  "flex h-11 items-center justify-between rounded-full px-4 text-left text-sm font-semibold text-muted transition-colors",
                  isActive && "bg-panel text-text",
                  !isActive && "hover:bg-white/[0.035] hover:text-text",
                )}
                onClick={() => setActiveCategory(category)}
                type="button"
              >
                {category}
                {isActive ? <span className="h-1.5 w-1.5 rounded-full bg-green" /> : null}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="lg:pl-72">
        <div className="mx-auto w-full max-w-[1520px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <header className="sticky top-0 z-20 -mx-4 mb-5 border-b border-line bg-black/82 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#656565]">
                  Biblioteca privada
                </p>
                <div className="mt-2 flex items-end gap-3">
                  <h2 className="text-4xl font-black leading-none tracking-normal sm:text-5xl">
                    Graphic Hooks
                  </h2>
                  <span className="mb-1 rounded-full border border-line bg-panel px-3 py-1 text-xs font-bold text-muted">
                    {filteredItems.length} sistemas
                  </span>
                </div>
              </div>

              <label className="relative block w-full lg:w-[440px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className="h-12 w-full rounded-full border border-line bg-panel pl-11 pr-4 text-sm font-semibold text-text outline-none transition-colors placeholder:text-[#5f5f5f] focus:border-white/18 focus:bg-panelSoft"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar criador, sistema ou asset"
                  type="search"
                  value={query}
                />
              </label>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {categories.map((category) => (
                <button
                  key={category}
                  className={cn(
                    "h-10 shrink-0 rounded-full border border-line px-4 text-sm font-semibold text-muted",
                    activeCategory === category && "bg-panel text-text",
                  )}
                  onClick={() => setActiveCategory(category)}
                  type="button"
                >
                  {category}
                </button>
              ))}
            </div>
          </header>

          <AnimatePresence mode="popLayout">
            {filteredItems.length ? (
              <motion.section
                className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4"
                layout
                transition={{ duration: 0.22, ease: "easeOut" }}
              >
                {filteredItems.map((item) => (
                  <GraphicHookCard item={item} key={item.id} onSelect={() => setSelected(item)} />
                ))}
              </motion.section>
            ) : (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-line bg-panel p-10 text-center text-muted"
                initial={{ opacity: 0, y: 12 }}
              >
                Nenhum sistema visual encontrado.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        {selected ? (
          <DialogContent className="max-w-6xl">
            <DialogTitle className="sr-only">{selected.hookStructure}</DialogTitle>
            <DialogDescription className="sr-only">
              Graphic hook de {selected.creator}.
            </DialogDescription>

            <div className="grid gap-5 lg:grid-cols-[.72fr_1fr]">
              <div className="grid gap-3">
                <div className="overflow-hidden rounded-2xl border border-line bg-black">
                  <img
                    alt={`Screenshot do hook de ${selected.creator}`}
                    className="aspect-[9/16] h-[66vh] max-h-[720px] w-full object-cover"
                    src={selected.gif || selected.screenshot}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {selected.sequence.map((frame) => (
                    <img
                      alt={`Frame sequencial de ${selected.creator}`}
                      className="aspect-[9/16] rounded-xl border border-line object-cover"
                      key={frame}
                      src={frame}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between gap-6 p-1 pr-10 lg:pr-4">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-line bg-black/20 px-3 py-1 text-xs font-bold text-muted">
                      {selected.visualCategory}
                    </span>
                    <span className="rounded-full border border-line bg-black/20 px-3 py-1 text-xs font-bold text-muted">
                      {selected.complexity}
                    </span>
                    <span className="rounded-full border border-line bg-black/20 px-3 py-1 text-xs font-bold text-muted">
                      {selected.timestamp}
                    </span>
                  </div>

                  <h3 className="mt-5 text-2xl font-black leading-tight tracking-normal">
                    {selected.creator}
                  </h3>
                  <p className="mt-3 text-sm font-semibold text-muted">{selected.hookStructure}</p>

                  <InfoBlock title="Como recriar" text={selected.howToRecreate} />
                  <InfoBlock title="Assets necessários" text={selected.assetsNeeded.join(" · ")} />
                  <InfoBlock title="Tempo estimado" text={selected.estimatedProductionTime} />
                  <InfoBlock title="Padrão reutilizável" text={selected.notes} />
                </div>

                <Button asChild className="w-fit gap-2">
                  <a href={selected.originalUrl} rel="noopener noreferrer" target="_blank">
                    Abrir Referência
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="mt-5 border-t border-line pt-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#656565]">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-muted">{text}</p>
    </div>
  );
}

function GraphicHookCard({ item, onSelect }: { item: GraphicHook; onSelect: () => void }) {
  return (
    <motion.article
      animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-2xl border border-line bg-panel shadow-card"
      initial={{ opacity: 0, y: 12 }}
      layout
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <button className="block w-full text-left outline-none" onClick={onSelect} type="button">
        <div className="relative aspect-[9/16] overflow-hidden bg-[#101010]">
          <img
            alt={`Graphic hook de ${item.creator}`}
            className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-[1.025]"
            loading="lazy"
            src={item.screenshot}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-3 left-3 right-3">
            <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] font-bold text-white/74 backdrop-blur">
              {item.timestamp}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-black tracking-normal text-text">{item.creator}</h3>
              <p className="mt-1 text-sm font-semibold text-muted">{item.visualCategory}</p>
              <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-[#686868]">
                {item.hookStructure}
              </p>
            </div>
            <span className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-[#464646] transition-colors group-hover:text-text">
              <ExternalLink className="h-4 w-4" />
            </span>
          </div>
        </div>
      </button>
    </motion.article>
  );
}
