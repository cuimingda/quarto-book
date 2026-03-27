#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CURRENT_YEAR = String(new Date().getFullYear());
const SENTINEL_PATH = path.join(ROOT, ".template-init.json");

const PATHS = {
  indexPage: path.join(ROOT, "index.qmd"),
  packageJson: path.join(ROOT, "package.json"),
  packageLock: path.join(ROOT, "package-lock.json"),
  quarto: path.join(ROOT, "_quarto.yml"),
  readme: path.join(ROOT, "README.md"),
  readmeTemplate: path.join(ROOT, "template", "README.project.md.tpl"),
  licensePage: path.join(ROOT, "book", "license.qmd"),
  licenseTemplate: path.join(ROOT, "template", "license.qmd.tpl"),
};

function parseArgs(argv) {
  const args = {
    author: "",
    force: false,
    nonInteractive: false,
    repo: "",
    slug: "",
    title: "",
    year: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token === "--force") {
      args.force = true;
      continue;
    }

    if (token === "--non-interactive") {
      args.nonInteractive = true;
      continue;
    }

    if (token === "--help") {
      printHelp();
      process.exit(0);
    }

    if (!token.startsWith("--")) {
      throw new Error(`Unknown argument: ${token}`);
    }

    const [key, inlineValue] = token.slice(2).split("=", 2);
    const normalizedKey = key.replace(/-([a-z])/g, (_, character) =>
      character.toUpperCase(),
    );

    if (!(normalizedKey in args)) {
      throw new Error(`Unknown argument: --${key}`);
    }

    const nextToken = argv[index + 1] ?? "";
    const nextValue = inlineValue !== undefined ? inlineValue : nextToken;

    if (inlineValue === undefined) {
      if (!nextValue || nextValue.startsWith("--")) {
        throw new Error(`Missing value for --${key}`);
      }

      index += 1;
    }

    if (!nextValue) {
      throw new Error(`Missing value for --${key}`);
    }

    args[normalizedKey] = nextValue.trim();
  }

  return args;
}

function printHelp() {
  process.stdout.write(`Usage: npm run init -- [options]

Required:
  --title <value>            Book title
  --author <value>           Author name

Optional:
  --year <value>             Copyright year (default: current year)
  --slug <value>             Repository slug / output file
  --repo <value>             Repository URL
  --non-interactive          Fail instead of prompting for missing fields
  --force                    Rewrite managed fields after initialization
`);
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeRepoUrl(value) {
  const trimmed = value.trim().replace(/\/+$/, "");

  if (!trimmed) {
    return "";
  }

  const sshMatch = trimmed.match(/^git@github\.com:(.+?)(?:\.git)?$/);

  if (sshMatch) {
    return `https://github.com/${sshMatch[1]}`;
  }

  const sshProtocolMatch = trimmed.match(
    /^ssh:\/\/git@github\.com\/(.+?)(?:\.git)?$/,
  );

  if (sshProtocolMatch) {
    return `https://github.com/${sshProtocolMatch[1]}`;
  }

  return trimmed.replace(/\.git$/, "");
}

function getOriginUrl() {
  const result = spawnSync("git", ["config", "--get", "remote.origin.url"], {
    cwd: ROOT,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return "";
  }

  return normalizeRepoUrl(result.stdout);
}

function stringifyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function yamlString(value) {
  return JSON.stringify(value);
}

function updateYamlField(content, pattern, replacement) {
  if (!pattern.test(content)) {
    throw new Error(`Could not find YAML field: ${pattern}`);
  }

  return content.replace(pattern, replacement);
}

function renderTemplate(content, replacements) {
  let rendered = content;

  for (const [key, value] of Object.entries(replacements)) {
    rendered = rendered.replaceAll(`{{${key}}}`, value);
  }

  const unresolved = rendered.match(/{{[A-Z_]+}}/g);

  if (unresolved) {
    throw new Error(
      `Template contains unresolved placeholders: ${unresolved.join(", ")}`,
    );
  }

  return rendered;
}

function normalizeYear(value) {
  const trimmed = value.trim();

  if (!/^\d{4}$/.test(trimmed)) {
    throw new Error("Year must be a four-digit number.");
  }

  return trimmed;
}

async function prompt(rl, label, defaultValue = "") {
  while (true) {
    const suffix = defaultValue ? ` [${defaultValue}]` : "";
    const answer = (await rl.question(`${label}${suffix}: `)).trim();
    const value = answer || defaultValue;

    if (value) {
      return value;
    }

    process.stdout.write("This field is required.\n");
  }
}

async function collectConfig(argv) {
  const repoDefault = argv.repo
    ? normalizeRepoUrl(argv.repo)
    : normalizeRepoUrl(getOriginUrl());
  const slugDefault = argv.slug
    ? slugify(argv.slug)
    : slugify(path.basename(ROOT)) || slugify(argv.title);

  if (argv.nonInteractive) {
    if (!argv.title) {
      throw new Error("Missing required argument: --title");
    }

    if (!argv.author) {
      throw new Error("Missing required argument: --author");
    }

    if (!slugDefault) {
      throw new Error("Could not derive a slug. Pass --slug explicitly.");
    }

    if (!repoDefault) {
      throw new Error(
        "Could not determine repository URL. Pass --repo explicitly.",
      );
    }

    return {
      author: argv.author.trim(),
      repo: repoDefault,
      slug: slugDefault,
      title: argv.title.trim(),
      year: argv.year ? normalizeYear(argv.year) : CURRENT_YEAR,
    };
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const title = argv.title.trim() || (await prompt(rl, "Book title"));
    const author = argv.author.trim() || (await prompt(rl, "Author name"));
    const year = normalizeYear(
      argv.year.trim() || (await prompt(rl, "Copyright year", CURRENT_YEAR)),
    );
    const slug = slugify(
      argv.slug.trim() ||
        (await prompt(rl, "Repository slug / output file", slugDefault)),
    );

    if (!slug) {
      throw new Error("Slug cannot be empty.");
    }

    const repo = normalizeRepoUrl(
      argv.repo.trim() || (await prompt(rl, "Repository URL", repoDefault)),
    );

    return {
      author,
      repo,
      slug,
      title,
      year,
    };
  } finally {
    rl.close();
  }
}

async function ensureNotInitialized(force) {
  try {
    await access(SENTINEL_PATH);
  } catch {
    return;
  }

  if (!force) {
    throw new Error(
      "This repository has already been initialized. Re-run with --force to rewrite managed fields.",
    );
  }
}

async function writeManagedFiles(config) {
  const [
    indexText,
    packageJsonText,
    packageLockText,
    quartoText,
    readmeTemplate,
    licenseTemplate,
  ] = await Promise.all([
    readFile(PATHS.indexPage, "utf8"),
    readFile(PATHS.packageJson, "utf8"),
    readFile(PATHS.packageLock, "utf8"),
    readFile(PATHS.quarto, "utf8"),
    readFile(PATHS.readmeTemplate, "utf8"),
    readFile(PATHS.licenseTemplate, "utf8"),
  ]);

  const packageJson = JSON.parse(packageJsonText);
  packageJson.name = config.slug;
  packageJson.description = `A Quarto book project for ${config.title}.`;

  const packageLock = JSON.parse(packageLockText);
  packageLock.name = config.slug;

  if (packageLock.packages?.[""]) {
    packageLock.packages[""].name = config.slug;
  }

  const quartoUpdated = [
    [
      /^copyright:.*$/m,
      `copyright: ${yamlString(`© ${config.year} ${config.author}`)}`,
    ],
    [/^  title:.*$/m, `  title: ${yamlString(config.title)}`],
    [/^  author:.*$/m, `  author: ${yamlString(config.author)}`],
    [/^  output-file:.*$/m, `  output-file: ${yamlString(config.slug)}`],
    [
      /^    left:.*$/m,
      `    left: ${yamlString(`© ${config.year} ${config.author} · 内容 CC BY-SA 4.0`)}`,
    ],
    [/^        href:.*$/m, `        href: ${yamlString(config.repo)}`],
  ].reduce(
    (content, [pattern, replacement]) =>
      updateYamlField(content, pattern, replacement),
    quartoText,
  );

  const repoLicenseUrl = `${config.repo}/blob/main/LICENSE-CC-BY-SA-4.0`;

  const readmeRendered = renderTemplate(readmeTemplate, {
    AUTHOR: config.author,
    REPO_URL: config.repo,
    TITLE: config.title,
  });

  const licenseRendered = renderTemplate(licenseTemplate, {
    AUTHOR: config.author,
    REPO_LICENSE_URL: repoLicenseUrl,
    REPO_URL: config.repo,
    YEAR: config.year,
  });
  const indexUpdated = indexText.replace(
    /^# .* \{\.unnumbered\}$/m,
    `# ${config.title} {.unnumbered}`,
  );

  const sentinel = {
    initializedAt: new Date().toISOString(),
    managed: {
      author: config.author,
      repo: config.repo,
      slug: config.slug,
      title: config.title,
      year: config.year,
    },
    template: "quarto-book",
  };

  await Promise.all([
    writeFile(PATHS.indexPage, indexUpdated),
    writeFile(PATHS.packageJson, stringifyJson(packageJson)),
    writeFile(PATHS.packageLock, stringifyJson(packageLock)),
    writeFile(PATHS.quarto, quartoUpdated),
    writeFile(PATHS.readme, readmeRendered),
    writeFile(PATHS.licensePage, licenseRendered),
    writeFile(SENTINEL_PATH, stringifyJson(sentinel)),
  ]);
}

async function main() {
  const argv = parseArgs(process.argv.slice(2));
  await ensureNotInitialized(argv.force);
  const config = await collectConfig(argv);
  await writeManagedFiles(config);

  process.stdout.write(`Initialized repository for "${config.title}".

Next steps:
  1. npm ci
  2. npm run build
`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});
