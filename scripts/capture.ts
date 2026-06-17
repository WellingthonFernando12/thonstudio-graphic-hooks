import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { GraphicHook } from "../lib/categories";

type HookSource = Omit<GraphicHook, "source" | "originalUrl" | "screenshot" | "sequence" | "gif"> & {
  url: string;
};

const execFileAsync = promisify(execFile);
const root = process.cwd();
const publicDir = path.join(root, "public", "hooks");
const tempDir = path.join(root, "tmp", "hooks");

async function run(command: string, args: string[]) {
  await execFileAsync(command, args, { maxBuffer: 1024 * 1024 * 16 });
}

async function downloadReel(url: string, outputPath: string) {
  await run("yt-dlp", [
    "--no-update",
    "-f",
    "bv*+ba/b",
    "--merge-output-format",
    "mp4",
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

  return {
    ...source,
    source: "Instagram" as const,
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

  const sources = JSON.parse(await readFile("data/hook-sources.json", "utf-8")) as HookSource[];
  const hooks: GraphicHook[] = [];

  for (const source of sources) {
    console.log(`Capturing ${source.creator}: ${source.id}`);
    hooks.push(await captureAssets(source));
  }

  await writeFile("data/graphic-hooks.json", `${JSON.stringify(hooks, null, 2)}\n`, "utf-8");
  await rm(tempDir, { recursive: true, force: true });
  console.log(`Saved ${hooks.length} graphic hooks.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
