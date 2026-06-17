import { execFile } from "node:child_process";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { GraphicHook } from "../lib/categories";

type HookSource = Omit<GraphicHook, "source" | "originalUrl" | "screenshot" | "sequence" | "gif"> & {
  url: string;
  source?: GraphicHook["source"];
};

const execFileAsync = promisify(execFile);
const root = process.cwd();
const publicDir = path.join(root, "public", "hooks");
const tempDir = path.join(root, "tmp", "hooks");

async function run(command: string, args: string[]) {
  await execFileAsync(command, args, { maxBuffer: 1024 * 1024 * 16 });
}

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadReel(url: string, outputPath: string) {
  await run("yt-dlp", [
    "--no-update",
    "-f",
    "bv*[height<=720]+ba/b[height<=720]/bv*+ba/b",
    "--merge-output-format",
    "mp4",
    "--download-sections",
    "*00:00-00:08",
    "-o",
    outputPath,
    url,
  ]);
}

async function captureAssets(source: HookSource) {
  const videoPath = path.join(tempDir, `${source.id}.mp4`);
  const outputDir = path.join(publicDir, source.id);
  const screenshot = path.join(outputDir, "screenshot.jpg");
  const frameOne = path.join(outputDir, "frame-01.jpg");
  const frameTwo = path.join(outputDir, "frame-02.jpg");
  const frameThree = path.join(outputDir, "frame-03.jpg");
  const gif = path.join(outputDir, "sequence.gif");

  await mkdir(outputDir, { recursive: true });

  const hasAssets = await Promise.all([screenshot, frameOne, frameTwo, frameThree, gif].map(fileExists));

  if (!hasAssets.every(Boolean)) {
    await downloadReel(source.url, videoPath);

    await run("ffmpeg", ["-y", "-ss", "1", "-i", videoPath, "-frames:v", "1", "-q:v", "3", screenshot]);
    await run("ffmpeg", ["-y", "-ss", "0.5", "-i", videoPath, "-frames:v", "1", "-q:v", "4", frameOne]);
    await run("ffmpeg", ["-y", "-ss", "1.4", "-i", videoPath, "-frames:v", "1", "-q:v", "4", frameTwo]);
    await run("ffmpeg", ["-y", "-ss", "2.3", "-i", videoPath, "-frames:v", "1", "-q:v", "4", frameThree]);
    await run("ffmpeg", [
      "-y",
      "-ss",
      "0",
      "-t",
      "3",
      "-i",
      videoPath,
      "-vf",
      "fps=8,scale=360:-1:flags=lanczos",
      gif,
    ]);
  }

  return {
    ...source,
    source: source.source ?? "Instagram",
    originalUrl: source.url,
    screenshot: `/hooks/${source.id}/screenshot.jpg`,
    sequence: [
      `/hooks/${source.id}/frame-01.jpg`,
      `/hooks/${source.id}/frame-02.jpg`,
      `/hooks/${source.id}/frame-03.jpg`,
    ],
    gif: `/hooks/${source.id}/sequence.gif`,
  };
}

async function main() {
  await mkdir(publicDir, { recursive: true });
  await mkdir(tempDir, { recursive: true });

  const sourceLimit = Number(process.env.HOOK_LIMIT ?? 0);
  const concurrency = Number(process.env.HOOK_CONCURRENCY ?? 3);
  const allSources = JSON.parse(await readFile("data/hook-sources.json", "utf-8")) as HookSource[];
  const sources = sourceLimit > 0 ? allSources.slice(0, sourceLimit) : allSources;
  const hooks: GraphicHook[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < sources.length) {
      const source = sources[cursor++];
      console.log(`Capturing ${source.creator}: ${source.id}`);

      try {
        hooks.push(await captureAssets(source));
      } catch (error) {
        console.warn(`Skipped ${source.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  const sourceOrder = new Map(sources.map((source, index) => [source.id, index]));
  hooks.sort((a, b) => (sourceOrder.get(a.id) ?? 0) - (sourceOrder.get(b.id) ?? 0));
  await writeFile("data/graphic-hooks.json", `${JSON.stringify(hooks, null, 2)}\n`, "utf-8");
  await rm(tempDir, { recursive: true, force: true });
  console.log(`Saved ${hooks.length} graphic hooks.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
