import { readFile } from "node:fs/promises";
import path from "node:path";

const PROVINCE_FILES = [
  "alberta.txt",
  "british_columbia.txt",
  "manitoba.txt",
  "new_brunswick.txt",
  "newfoundland_and_labrador.txt",
  "northwest_territories.txt",
  "nova_scotia.txt",
  "ontario.txt",
  "quebec.txt",
  "saskatchewan.txt",
  "yukon.txt",
] as const;

const PROVINCE_ALIASES: Array<[string, string]> = [
  ["newfoundland and labrador", "newfoundland_and_labrador.txt"],
  ["newfoundland", "newfoundland_and_labrador.txt"],
  ["british columbia", "british_columbia.txt"],
  ["northwest territories", "northwest_territories.txt"],
  ["new brunswick", "new_brunswick.txt"],
  ["nova scotia", "nova_scotia.txt"],
  ["saskatchewan", "saskatchewan.txt"],
  ["manitoba", "manitoba.txt"],
  ["ontario", "ontario.txt"],
  ["quebec", "quebec.txt"],
  ["alberta", "alberta.txt"],
  ["yukon", "yukon.txt"],
  ["bc", "british_columbia.txt"],
  ["nwt", "northwest_territories.txt"],
];

const provinceContextCache = new Map<string, Promise<string>>();

function getProvincePath(fileName: string) {
  return path.resolve(process.cwd(), fileName);
}

async function loadProvinceFile(fileName: string) {
  return readFile(getProvincePath(fileName), "utf8");
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
}

function guessProvinceFile(prompt: string, origin?: string) {
  const source = normalizeText([origin, prompt].filter(Boolean).join(" "));

  for (const [alias, fileName] of PROVINCE_ALIASES) {
    if (source.includes(alias)) {
      return fileName;
    }
  }

  return null;
}

async function getProvinceText(fileName: string) {
  const cached = provinceContextCache.get(fileName);
  if (cached) {
    return cached;
  }

  const loader = loadProvinceFile(fileName).catch(() => "");
  provinceContextCache.set(fileName, loader);
  return loader;
}

export async function buildProvinceContext(prompt: string, origin?: string) {
  const matchedFile = guessProvinceFile(prompt, origin);
  const orderedFiles = matchedFile
    ? [matchedFile, ...PROVINCE_FILES.filter((fileName) => fileName !== matchedFile)]
    : [...PROVINCE_FILES];

  const sections: string[] = [];

  for (const fileName of orderedFiles) {
    const text = (await getProvinceText(fileName)).trim();
    if (!text) {
      continue;
    }

    sections.push(`### ${fileName}\n${text.slice(0, 4000)}`);
  }

  return sections.length > 0
    ? `Province reference context:\n\n${sections.join("\n\n")}`
    : "Province reference context: unavailable.";
}