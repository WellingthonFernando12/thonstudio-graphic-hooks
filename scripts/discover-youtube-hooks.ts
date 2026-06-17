import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import type { GraphicHook } from "../lib/categories";

type ExistingSource = Omit<GraphicHook, "source" | "originalUrl" | "screenshot" | "sequence" | "gif"> & {
  url: string;
  source?: GraphicHook["source"];
};

type YoutubeResult = {
  id?: string;
  title?: string;
  webpage_url?: string;
};

type CreatorSeed = {
  name: string;
  query: string;
  category: GraphicHook["visualCategory"];
  complexity: GraphicHook["complexity"];
  limit: number;
};

const execFileAsync = promisify(execFile);

const creatorSeeds: CreatorSeed[] = [
  { name: "Devin Jatho", query: "Devin Jatho", category: "Motion Graphics", complexity: "Média", limit: 5 },
  { name: "Hillier Smith", query: "Hillier Smith editing", category: "Comparações", complexity: "Média", limit: 5 },
  { name: "Daniel Schiffer", query: "Daniel Schiffer", category: "Interfaces", complexity: "Alta", limit: 5 },
  { name: "Finzar", query: "Finzar editing", category: "Motion Graphics", complexity: "Média", limit: 5 },
  { name: "Jack Cole", query: "Jack Cole editing", category: "Motion Graphics", complexity: "Média", limit: 4 },
  { name: "Johnny Harris", query: "Johnny Harris", category: "Mapas & Diagramas", complexity: "Alta", limit: 4 },
  { name: "James Jani", query: "James Jani", category: "Documentos", complexity: "Alta", limit: 4 },
  { name: "Fern", query: "Fern documentary", category: "Mapas & Diagramas", complexity: "Alta", limit: 4 },
  { name: "neo", query: "neo documentary", category: "3D & HUDs", complexity: "Alta", limit: 4 },
  { name: "MagnatesMedia", query: "MagnatesMedia", category: "Documentos", complexity: "Alta", limit: 4 },
  { name: "Thomas Flight", query: "Thomas Flight", category: "Comparações", complexity: "Média", limit: 4 },
  { name: "Nerdwriter1", query: "Nerdwriter1", category: "Documentos", complexity: "Média", limit: 4 },
  { name: "Lessons from the Screenplay", query: "Lessons from the Screenplay", category: "Documentos", complexity: "Média", limit: 4 },
  { name: "Colin and Samir", query: "Colin and Samir", category: "Chats & DMs", complexity: "Média", limit: 4 },
  { name: "Ali Abdaal", query: "Ali Abdaal", category: "Dashboards", complexity: "Média", limit: 4 },
  { name: "Paddy Galloway", query: "Paddy Galloway", category: "Dashboards", complexity: "Média", limit: 4 },
  { name: "The Futur", query: "The Futur Chris Do", category: "Mapas & Diagramas", complexity: "Média", limit: 4 },
  { name: "Ben Marriott", query: "Ben Marriott motion design", category: "Motion Graphics", complexity: "Alta", limit: 4 },
  { name: "Jake In Motion", query: "Jake In Motion", category: "Motion Graphics", complexity: "Alta", limit: 4 },
  { name: "School of Motion", query: "School of Motion", category: "Motion Graphics", complexity: "Alta", limit: 4 },
  { name: "Flux Academy", query: "Flux Academy", category: "Interfaces", complexity: "Média", limit: 4 },
  { name: "DesignCourse", query: "DesignCourse", category: "Interfaces", complexity: "Média", limit: 4 },
];

const structureByCategory: Record<GraphicHook["visualCategory"], string[]> = {
  Interfaces: [
    "Interface em camadas com janelas, botões e estados visuais que transformam uma ideia abstrata em produto navegável.",
    "Mockup de aplicativo ou sistema com foco em um painel principal, usando cursor, zoom e recortes para guiar o olhar.",
  ],
  Dashboards: [
    "Painel analítico com métricas, gráficos e cards de status para comunicar progresso ou contraste em poucos frames.",
    "Sistema visual de dados com números grandes, blocos modulares e hierarquia clara para dar sensação de diagnóstico.",
  ],
  Documentos: [
    "Documento, arquivo ou página editorial usado como prova visual, com highlights e zoom no detalhe relevante.",
    "Pilha de documentos e recortes com movimento de câmera para criar sensação de pesquisa e investigação.",
  ],
  "Chats & DMs": [
    "Troca de mensagens, notificações ou inbox simulada para transformar interação social em objeto visual imediato.",
    "Bolhas de chat e cards de mensagem aparecendo em stagger para criar contexto antes da fala.",
  ],
  "Mapas & Diagramas": [
    "Mapa mental com nó central, linhas conectoras e cards laterais para explicar relação entre ideias rapidamente.",
    "Diagrama com setas, rotas e blocos conectados para mostrar sistema, processo ou causa e efeito.",
  ],
  Comparações: [
    "Antes/depois ou lado a lado com contraste forte entre dois estados visuais e transição curta de substituição.",
    "Sistema de comparação com colunas, labels e escala para evidenciar evolução, escolha ou diferença de qualidade.",
  ],
  "Motion Graphics": [
    "Composição gráfica com objetos, ícones e formas animadas por scale, blur e deslocamento rápido.",
    "Elemento central em destaque com micro animações periféricas para criar impacto visual antes da explicação.",
  ],
  "3D & HUDs": [
    "Overlay técnico com profundidade falsa, linhas de mira, grid e elementos flutuantes em estilo HUD.",
    "Cena com camadas 3D ou câmera parallax para dar sensação premium e tecnológica nos primeiros segundos.",
  ],
};

const recreateByCategory: Record<GraphicHook["visualCategory"], string> = {
  Interfaces:
    "Criar um mockup 1080x1920 com painel principal, barra superior, botões e um cursor animado. Usar scale-in curto, highlight no elemento focal e blur leve no fundo.",
  Dashboards:
    "Montar cards de métrica, gráfico simples e status visual. Animar os números com count-up curto, revelar barras em sequência e manter contraste alto.",
  Documentos:
    "Criar uma página ou arquivo falso, adicionar marcações, sublinhados e recortes. Animar com zoom de câmera e pequenas batidas de highlight.",
  "Chats & DMs":
    "Construir bolhas de mensagem e notificações modulares. Revelar cada bloco com stagger de 80ms e usar um cursor ou badge para indicar o ponto principal.",
  "Mapas & Diagramas":
    "Criar nó central, cards pequenos, linhas conectoras e setas. Animar expansão radial e organizar tudo em uma grade invisível para manter leitura rápida.",
  Comparações:
    "Criar dois estados visuais lado a lado, destacar a diferença com cor, escala ou seta e animar a troca em menos de um segundo.",
  "Motion Graphics":
    "Separar objeto principal, ícones auxiliares e formas de apoio. Aplicar scale, position, motion blur e glow discreto para gerar impacto rápido.",
  "3D & HUDs":
    "Empilhar painéis semi-transparentes, adicionar linhas, grid e marcadores. Simular profundidade com escala, sombra e movimento de câmera lento.",
};

const assetsByCategory: Record<GraphicHook["visualCategory"], string[]> = {
  Interfaces: ["Mockup de app/software", "Cursor", "Ícones", "Cards UI", "Preset de glass/blur"],
  Dashboards: ["Cards de métricas", "Gráficos simples", "Ícones de status", "Grid", "Preset de count-up"],
  Documentos: ["Mockup de documento", "Highlights", "Recortes", "Sombra de papel", "Textura sutil"],
  "Chats & DMs": ["Bolhas de mensagem", "Avatares", "Badges", "Cursor", "SFX curto de notificação"],
  "Mapas & Diagramas": ["Cards modulares", "Linhas conectoras", "Setas", "Ícones de categoria", "Preset de stagger"],
  Comparações: ["Dois painéis", "Seta ou divisor", "Labels curtos", "Textura de fundo", "SFX de impacto"],
  "Motion Graphics": ["Objeto principal", "Ícones", "Formas simples", "Glow/blur", "Whoosh curto"],
  "3D & HUDs": ["Painéis glass", "Grid técnico", "Linhas HUD", "Marcadores", "Câmera/parallax"],
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 72);
}

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

async function searchYoutube(seed: CreatorSeed) {
  const { stdout } = await execFileAsync(
    "yt-dlp",
    [
      "--no-update",
      "--flat-playlist",
      "--playlist-end",
      String(seed.limit),
      "--print",
      "%(id)s\t%(title)s\t%(webpage_url)s",
      `ytsearch${seed.limit}:${seed.query}`,
    ],
    { maxBuffer: 1024 * 1024 * 8 },
  );

  return stdout
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [id, title, webpageUrl] = line.split("\t");
      return { id, title, webpage_url: webpageUrl } satisfies YoutubeResult;
    })
    .filter((item) => item.id && item.webpage_url && item.title)
    .slice(0, seed.limit);
}

function toSource(seed: CreatorSeed, item: YoutubeResult, index: number): ExistingSource {
  const title = item.title ?? seed.name;
  const structure = pick(structureByCategory[seed.category], index);

  return {
    id: `${slugify(seed.name)}-${slugify(title || item.id || String(index))}`,
    creator: seed.name,
    source: "YouTube",
    url: item.webpage_url || `https://www.youtube.com/watch?v=${item.id}`,
    timestamp: "00:01",
    visualCategory: seed.category,
    complexity: seed.complexity,
    hookStructure: structure,
    howToRecreate: recreateByCategory[seed.category],
    assetsNeeded: assetsByCategory[seed.category],
    estimatedProductionTime: seed.complexity === "Alta" ? "90-180 min" : seed.complexity === "Média" ? "45-120 min" : "30-60 min",
    notes: `Referência coletada para estudar estrutura visual de ${seed.category.toLowerCase()} nos primeiros segundos, ignorando título e copy.`,
  };
}

async function main() {
  const existing = JSON.parse(await readFile("data/hook-sources.json", "utf-8")) as ExistingSource[];
  const seenUrls = new Set(existing.map((item) => item.url));
  const seenIds = new Set(existing.map((item) => item.id));
  const discovered: ExistingSource[] = [];

  for (const seed of creatorSeeds) {
    console.log(`Searching ${seed.name}`);
    const results = await searchYoutube(seed);

    for (const [index, item] of results.entries()) {
      const source = toSource(seed, item, index);
      if (seenUrls.has(source.url) || seenIds.has(source.id)) {
        continue;
      }

      seenUrls.add(source.url);
      seenIds.add(source.id);
      discovered.push(source);
    }
  }

  const sources = [...existing, ...discovered].slice(0, 96);
  await writeFile("data/hook-sources.json", `${JSON.stringify(sources, null, 2)}\n`, "utf-8");
  console.log(`Added ${discovered.length} sources. Total: ${sources.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
