import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const sourceFile = path.join(ROOT_DIR, "src", "seo", "buildMeta.shared.js");
const targetDir = path.join(ROOT_DIR, "dist", "seo");
const targetFile = path.join(targetDir, "buildMeta.js");

await mkdir(targetDir, { recursive: true });
await copyFile(sourceFile, targetFile);
