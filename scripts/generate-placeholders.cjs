const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const rootDir = path.join(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const placeholdersDir = path.join(publicDir, "placeholders");

if (!fs.existsSync(placeholdersDir)) {
  fs.mkdirSync(placeholdersDir, { recursive: true });
}

const reactLogoSvg = fs.readFileSync(path.join(publicDir, "react-logo.svg"), "utf8");
const reactLogoBase64 = Buffer.from(reactLogoSvg).toString("base64");
const reactLogoHref = `data:image/svg+xml;base64,${reactLogoBase64}`;

function buildSvg({ width, height, body }) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">\n${body}\n</svg>`;
}

async function writePlaceholder({ filename, width, height, body }) {
  const svg = buildSvg({ width, height, body });
  const outputPath = path.join(placeholdersDir, filename);
  const pngBuffer = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer();
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`Generated placeholder: ${filename}`);
}

function gradientDefs(id, stops) {
  const stopsMarkup = stops
    .map(
      ({ offset, color, opacity }) =>
        `<stop offset="${offset}" stop-color="${color}"${
          typeof opacity === "number" ? ` stop-opacity="${opacity}"` : ""
        } />`
    )
    .join("");
  return `<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">${stopsMarkup}</linearGradient>`;
}

function radialDefs(id, stops, cx = "50%", cy = "50%", r = "50%") {
  const stopsMarkup = stops
    .map(
      ({ offset, color, opacity }) =>
        `<stop offset="${offset}" stop-color="${color}"${
          typeof opacity === "number" ? ` stop-opacity="${opacity}"` : ""
        } />`
    )
    .join("");
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stopsMarkup}</radialGradient>`;
}

function tumblerBodyGradient() {
  return `<linearGradient id="tumbler-body" x1="0%" y1="0%" x2="0%" y2="100%">
    <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.55" />
    <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.35" />
  </linearGradient>`;
}

const placeholders = [
  {
    filename: "collection-core.png",
    width: 800,
    height: 640,
    body: `
    <defs>
      ${gradientDefs("core-bg", [
        { offset: "0%", color: "#312e81" },
        { offset: "50%", color: "#4338ca" },
        { offset: "100%", color: "#7c3aed" },
      ])}
      ${radialDefs("core-glow-1", [
        { offset: "0%", color: "#6366f1", opacity: 0.6 },
        { offset: "100%", color: "#6366f1", opacity: 0 },
      ], "30%", "25%", "45%")}
      ${radialDefs("core-glow-2", [
        { offset: "0%", color: "#ec4899", opacity: 0.5 },
        { offset: "100%", color: "#ec4899", opacity: 0 },
      ], "75%", "70%", "45%")}
    </defs>
    <rect width="800" height="640" fill="url(#core-bg)" rx="48" />
    <circle cx="200" cy="180" r="220" fill="url(#core-glow-1)" />
    <circle cx="620" cy="420" r="240" fill="url(#core-glow-2)" />
    <rect x="120" y="160" width="560" height="320" rx="40" fill="rgba(15,23,42,0.45)" />
    <path d="M220 220h360v40H220zM220 300h260v32H220z" fill="rgba(226,232,240,0.35)" />
    <circle cx="300" cy="440" r="40" fill="rgba(15,23,42,0.45)" />
    <circle cx="520" cy="440" r="40" fill="rgba(15,23,42,0.45)" />
    `,
  },
  {
    filename: "collection-conference.png",
    width: 800,
    height: 640,
    body: `
    <defs>
      ${gradientDefs("conference-bg", [
        { offset: "0%", color: "#0f172a" },
        { offset: "100%", color: "#1e293b" },
      ])}
      ${gradientDefs("conference-card", [
        { offset: "0%", color: "#38bdf8", opacity: 0.55 },
        { offset: "100%", color: "#c084fc", opacity: 0.15 },
      ])}
    </defs>
    <rect width="800" height="640" fill="url(#conference-bg)" rx="48" />
    <rect x="80" y="120" width="640" height="200" rx="36" fill="url(#conference-card)" />
    <rect x="120" y="360" width="260" height="160" rx="28" fill="rgba(56,189,248,0.3)" />
    <rect x="420" y="360" width="260" height="160" rx="28" fill="rgba(192,132,252,0.3)" />
    <path d="M160 180h480v34H160zM160 240h320v26H160z" fill="rgba(226,232,240,0.32)" />
    <circle cx="640" cy="220" r="80" fill="rgba(255,255,255,0.12)" />
    `,
  },
  {
    filename: "collection-atelier.png",
    width: 800,
    height: 640,
    body: `
    <defs>
      ${gradientDefs("atelier-bg", [
        { offset: "0%", color: "#111827" },
        { offset: "100%", color: "#1f2937" },
      ])}
      ${radialDefs("atelier-glow-1", [
        { offset: "0%", color: "#fb7185", opacity: 0.8 },
        { offset: "60%", color: "#fb7185", opacity: 0.25 },
        { offset: "100%", color: "#fb7185", opacity: 0 },
      ], "35%", "35%", "55%")}
      ${radialDefs("atelier-glow-2", [
        { offset: "0%", color: "#38bdf8", opacity: 0.45 },
        { offset: "100%", color: "#38bdf8", opacity: 0 },
      ], "70%", "65%", "40%")}
    </defs>
    <rect width="800" height="640" fill="url(#atelier-bg)" rx="48" />
    <circle cx="280" cy="220" r="220" fill="url(#atelier-glow-1)" />
    <circle cx="620" cy="420" r="200" fill="url(#atelier-glow-2)" />
    <path d="M200 200h380v34H200zM200 260h260v28H200z" fill="rgba(248,250,252,0.28)" />
    <path d="M240 340h280v180H240z" fill="rgba(251,191,36,0.18)" />
    <path d="M240 340l48-64h184l48 64z" fill="rgba(251,191,36,0.25)" />
    <circle cx="520" cy="420" r="56" fill="rgba(244,63,94,0.28)" />
    `,
  },
  {
    filename: "drop-fiber.png",
    width: 640,
    height: 640,
    body: `
    <defs>
      ${gradientDefs("fiber-bg", [
        { offset: "0%", color: "#1e1b4b" },
        { offset: "100%", color: "#312e81" },
      ])}
      ${gradientDefs("fiber-panel", [
        { offset: "0%", color: "#4f46e5", opacity: 0.5 },
        { offset: "100%", color: "#22d3ee", opacity: 0.1 },
      ])}
      ${radialDefs("fiber-glow", [
        { offset: "0%", color: "#38bdf8", opacity: 0.55 },
        { offset: "100%", color: "#38bdf8", opacity: 0 },
      ], "70%", "30%", "45%")}
    </defs>
    <rect width="640" height="640" rx="48" fill="url(#fiber-bg)" />
    <rect x="140" y="100" width="360" height="220" rx="32" fill="url(#fiber-panel)" />
    <path d="M200 180h240v34H200zM200 240h160v24H200z" fill="rgba(224,231,255,0.4)" />
    <path d="M220 320h200l34 180H186z" fill="rgba(129,140,248,0.45)" />
    <path d="M220 320l26-50h188l34 50z" fill="rgba(224,231,255,0.3)" />
    <circle cx="430" cy="380" r="60" fill="url(#fiber-glow)" />
    `,
  },
  {
    filename: "drop-hoodie.png",
    width: 480,
    height: 400,
    body: `
    <defs>
      ${gradientDefs("hoodie-bg", [
        { offset: "0%", color: "#1e293b" },
        { offset: "100%", color: "#0f172a" },
      ])}
      ${gradientDefs("hoodie-body", [
        { offset: "0%", color: "#94a3b8", opacity: 0.25 },
        { offset: "100%", color: "#1f2937", opacity: 0.4 },
      ])}
    </defs>
    <rect width="480" height="400" rx="36" fill="url(#hoodie-bg)" />
    <path d="M160 112 Q200 60 240 60 Q280 60 320 112 L360 160 V320 H120 V160 Z" fill="url(#hoodie-body)" />
    <path d="M160 112 Q200 60 240 60 Q280 60 320 112" stroke="rgba(148, 163, 184, 0.45)" stroke-width="10" stroke-linecap="round"/>
    <path d="M188 150 Q240 210 292 150" stroke="rgba(148,163,184,0.35)" stroke-width="12" stroke-linecap="round"/>
    <rect x="198" y="220" width="84" height="60" rx="22" fill="rgba(15,23,42,0.5)" />
    <circle cx="150" cy="220" r="40" fill="rgba(94,234,212,0.25)" />
    <circle cx="340" cy="260" r="36" fill="rgba(96,165,250,0.22)" />
    `,
  },
  {
    filename: "drop-tumbler.png",
    width: 480,
    height: 400,
    body: `
    <defs>
      ${gradientDefs("tumbler-bg", [
        { offset: "0%", color: "#082f49" },
        { offset: "100%", color: "#111827" },
      ])}
      ${tumblerBodyGradient()}
    </defs>
    <rect width="480" height="400" rx="36" fill="url(#tumbler-bg)" />
    <ellipse cx="240" cy="120" rx="110" ry="30" fill="rgba(14,116,144,0.55)" />
    <path d="M140 120 L170 320 Q175 340 240 340 Q305 340 310 320 L340 120 Z" fill="url(#tumbler-body)" />
    <ellipse cx="240" cy="120" rx="100" ry="24" fill="rgba(226,232,240,0.35)" />
    <ellipse cx="240" cy="320" rx="90" ry="20" fill="rgba(15,23,42,0.75)" />
    <image href="${reactLogoHref}" x="205" y="190" width="70" height="70" opacity="0.85" />
    `,
  },
];

const teeVariants = [
  { filename: "drop-tee-01.png", accent: "#38bdf8", background: "#0f172a" },
  { filename: "drop-tee-02.png", accent: "#f472b6", background: "#1e1b4b" },
  { filename: "drop-tee-03.png", accent: "#facc15", background: "#111827" },
  { filename: "drop-tee-04.png", accent: "#22d3ee", background: "#0f172a" },
];

function teeBody(accent, background) {
  return `
    <defs>
      <linearGradient id="tee-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${background}"/>
        <stop offset="100%" stop-color="#020617"/>
      </linearGradient>
      <linearGradient id="tee-body" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${accent}" stop-opacity="0.28" />
        <stop offset="100%" stop-color="${accent}" stop-opacity="0.08" />
      </linearGradient>
    </defs>
    <rect width="480" height="400" rx="36" fill="url(#tee-bg)" />
    <path d="M150 120 L210 70 H270 L330 70 L390 120 L350 180 V340 H170 V180 Z" fill="url(#tee-body)" />
    <path d="M150 120 L210 70 H270 L330 70 L390 120" stroke="rgba(248,250,252,0.25)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
    <rect x="200" y="180" width="120" height="120" rx="24" fill="rgba(15,23,42,0.55)" />
    <image href="${reactLogoHref}" x="215" y="195" width="90" height="90" opacity="0.95" />
    <circle cx="120" cy="260" r="70" fill="${accent}26" />
    <circle cx="360" cy="300" r="50" fill="${accent}20" />
  `;
}

async function main() {
  for (const item of placeholders) {
    await writePlaceholder(item);
  }

  for (const variant of teeVariants) {
    await writePlaceholder({
      filename: variant.filename,
      width: 480,
      height: 400,
      body: teeBody(variant.accent, variant.background),
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
