import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The root site deploys a prebuilt Expo release; native dependencies are not
// installed in its CI. Reject incomplete or damaged artifacts before publishing.
export function verifyRecargaWeb(directory) {
  const root = directory instanceof URL ? fileURLToPath(directory) : directory;
  const manifestFile = path.join(root, "release.json");
  if (!existsSync(manifestFile)) throw new Error(`Missing Recarga release manifest: ${manifestFile}`);
  const release = JSON.parse(readFileSync(manifestFile, "utf8"));
  if (!/^\d+\.\d+\.\d+$/.test(release.version) || release.basePath !== "/recarga/" ||
      !Array.isArray(release.files) || release.files.length === 0) {
    throw new Error("Invalid Recarga release manifest");
  }

  const filePaths = new Set();
  for (const file of release.files) {
    if (typeof file.path !== "string" || file.path.startsWith("/") ||
        file.path.split("/").some((part) => !part || part === "." || part === "..") ||
        /[\\?#]/.test(file.path) || file.path === "release.json" ||
        filePaths.has(file.path) || !/^[a-f0-9]{64}$/.test(file.sha256)) {
      throw new Error(`Invalid Recarga release file: ${file.path}`);
    }
    filePaths.add(file.path);
    const fileName = path.join(root, file.path);
    if (!existsSync(fileName) || !lstatSync(fileName).isFile()) {
      throw new Error(`Missing Recarga release file: ${file.path}`);
    }
    const digest = createHash("sha256").update(readFileSync(fileName)).digest("hex");
    if (digest !== file.sha256) throw new Error(`Recarga release hash mismatch: ${file.path}`);
  }
  if (!filePaths.has("index.html")) throw new Error("Missing Recarga release file: index.html");

  const html = readFileSync(path.join(root, "index.html"), "utf8");
  if (!/<html\b[^>]*lang="pt-BR"/.test(html) ||
      !/<title>Tetelestai Recarga — Planejar recarga<\/title>/.test(html) ||
      !/<meta name="robots" content="noindex,nofollow"/.test(html) ||
      !/<link rel="canonical" href="https:\/\/tetelestai\.tech\/recarga\/"/.test(html)) {
    throw new Error("Invalid Recarga HTML language, title or indexing metadata");
  }

  let hasAppScript = false;
  for (const [tag] of html.matchAll(/<(?:script|link)\b[^>]*>/g)) {
    if (tag.startsWith("<link") && /\brel="(?:canonical|alternate)"/.test(tag)) continue;
    const resource = tag.match(/\b(?:src|href)="([^"]+)"/)?.[1];
    if (!resource || resource.startsWith("data:")) continue;
    if (!resource.startsWith(release.basePath)) {
      throw new Error(`Recarga resource outside its base path: ${resource}`);
    }
    const relativePath = resource.slice(release.basePath.length);
    if (!filePaths.has(relativePath)) throw new Error(`Missing Recarga HTML resource: ${resource}`);
    if (tag.startsWith("<script") && relativePath.startsWith("_expo/") && relativePath.endsWith(".js")) {
      hasAppScript = true;
    }
  }
  if (!hasAppScript) throw new Error("Missing Recarga app script");
  return release;
}
