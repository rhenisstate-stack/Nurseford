const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const rootDir = path.join(__dirname, '..');
const srcAppDir = path.join(rootDir, 'src/app');
const publicDir = path.join(rootDir, 'public');
const publicFaviconsDir = path.join(publicDir, 'favicons');
const publicLogoDir = path.join(publicDir, 'logo');

if (!fs.existsSync(publicFaviconsDir)) fs.mkdirSync(publicFaviconsDir, { recursive: true });

// Master Symmetrical Equilibrium SVG
const svg_master = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Deep Authoritative Sapphire Navy Gradient -->
    <linearGradient id="bgSapphire" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06182B"/>
      <stop offset="45%" stop-color="#0A243F"/>
      <stop offset="100%" stop-color="#03101C"/>
    </linearGradient>

    <!-- Vibrant PubNurse Emerald/Teal Gradient -->
    <linearGradient id="pubTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2DD4BF"/>
      <stop offset="100%" stop-color="#0D9488"/>
    </linearGradient>

    <!-- Pure Medical Mint Cross Gradient -->
    <linearGradient id="mintCross" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5EEAD4"/>
      <stop offset="100%" stop-color="#14B8A6"/>
    </linearGradient>

    <!-- Ambient Core Glow -->
    <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" result="blur"/>
    </filter>

    <!-- Drop Shadow for Squircle Container -->
    <filter id="containerShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="14" stdDeviation="20" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
  </defs>

  <!-- Container Squircle (Apple/iOS standard rx = 114) -->
  <rect x="20" y="20" width="472" height="472" rx="114" fill="url(#bgSapphire)" stroke="#14B8A6" stroke-opacity="0.4" stroke-width="3.5" filter="url(#containerShadow)"/>

  <!-- Subtle Radial Backlight behind the central axis -->
  <circle cx="256" cy="256" r="130" fill="#0D9488" opacity="0.16" filter="url(#coreGlow)"/>

  <!-- 1. TOP CREST: The Sacred Medical Cross Badge (Nursing) -->
  <g transform="translate(256, 82)">
    <circle cx="0" cy="0" r="32" fill="#06182A" stroke="#2DD4BF" stroke-width="3.5"/>
    <rect x="-5.5" y="-17" width="11" height="34" rx="3.5" fill="url(#mintCross)"/>
    <rect x="-17" y="-5.5" width="34" height="11" rx="3.5" fill="url(#mintCross)"/>
  </g>

  <!-- 2. CENTRAL MONOGRAM: PN -->
  <g id="monogram-pn">
    <!-- LETTER P (Left: Vibrant PubNurse Teal) -->
    <path d="M 122 148
             C 113 148 106 155 106 164
             V 362
             C 106 371 113 378 122 378
             C 131 378 138 371 138 362
             V 270
             H 194
             C 228 270 246 248 246 209
             C 246 170 228 148 194 148
             H 122
             Z
             M 152 184
             H 190
             C 208 184 218 194 218 209
             C 218 224 208 234 190 234
             H 152
             V 184
             Z"
          fill="url(#pubTeal)"
          fill-rule="evenodd"/>

    <!-- LETTER N (Right: Pure Crisp White) -->
    <path d="M 282 148
             C 273 148 266 155 266 164
             V 362
             C 266 371 273 378 282 378
             C 291 378 298 371 298 362
             V 230
             L 374 372
             C 378 376 384 378 390 378
             C 399 378 406 371 406 362
             V 164
             C 406 155 399 148 390 148
             C 381 148 374 155 374 164
             V 296
             L 298 154
             C 294 150 288 148 282 148
             Z"
          fill="#FFFFFF"/>
  </g>

  <!-- 3. BOTTOM BASELINE: Clinical ECG Vital Signs Track -->
  <path d="M 106 414
           H 216
           L 230 398
           L 246 434
           L 262 414
           H 406"
        stroke="#2DD4BF"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-opacity="0.9"/>
</svg>
`;

// Open Graph 1200x630 Card SVG
const svg_og = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#040F1B"/>
      <stop offset="40%" stop-color="#0A223B"/>
      <stop offset="100%" stop-color="#030C16"/>
    </linearGradient>
    <linearGradient id="ogTeal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2DD4BF"/>
      <stop offset="100%" stop-color="#0D9488"/>
    </linearGradient>
    <linearGradient id="ogMint" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5EEAD4"/>
      <stop offset="100%" stop-color="#14B8A6"/>
    </linearGradient>
    <filter id="ogShadow">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#ogBg)"/>

  <!-- Subtle Ambient Glow Orbs -->
  <circle cx="280" cy="315" r="220" fill="#0D9488" opacity="0.18" filter="blur(60px)"/>
  <circle cx="950" cy="180" r="180" fill="#2DD4BF" opacity="0.1" filter="blur(50px)"/>

  <!-- Top Decorative Border -->
  <rect x="0" y="0" width="1200" height="6" fill="url(#ogTeal)"/>

  <!-- LEFT: PubNurse PN Logo Badge -->
  <g transform="translate(140, 165)" filter="url(#ogShadow)">
    <!-- Squircle Container -->
    <rect x="0" y="0" width="300" height="300" rx="72" fill="#06182B" stroke="#14B8A6" stroke-opacity="0.45" stroke-width="3"/>
    
    <!-- Mini Master Logo Scaled Inside -->
    <g transform="translate(20, 20) scale(0.5078)">
      <!-- Top Crest Cross -->
      <g transform="translate(256, 82)">
        <circle cx="0" cy="0" r="32" fill="#06182A" stroke="#2DD4BF" stroke-width="3.5"/>
        <rect x="-5.5" y="-17" width="11" height="34" rx="3.5" fill="url(#ogMint)"/>
        <rect x="-17" y="-5.5" width="34" height="11" rx="3.5" fill="url(#ogMint)"/>
      </g>
      <!-- PN Monogram -->
      <path d="M 122 148 C 113 148 106 155 106 164 V 362 C 106 371 113 378 122 378 C 131 378 138 371 138 362 V 270 H 194 C 228 270 246 248 246 209 C 246 170 228 148 194 148 H 122 Z M 152 184 H 190 C 208 184 218 194 218 209 C 218 224 208 234 190 234 H 152 V 184 Z" fill="url(#ogTeal)" fill-rule="evenodd"/>
      <path d="M 282 148 C 273 148 266 155 266 164 V 362 C 266 371 273 378 282 378 C 291 378 298 371 298 362 V 230 L 374 372 C 378 376 384 378 390 378 C 399 378 406 371 406 362 V 164 C 406 155 399 148 390 148 C 381 148 374 155 374 164 V 296 L 298 154 C 294 150 288 148 282 148 Z" fill="#FFFFFF"/>
      <!-- Pulse Baseline -->
      <path d="M 106 414 H 216 L 230 398 L 246 434 L 262 414 H 406" stroke="#2DD4BF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>

  <!-- RIGHT: Typography & Brand -->
  <g transform="translate(500, 210)">
    <!-- Category Badge -->
    <rect x="0" y="0" width="230" height="34" rx="17" fill="#0D9488" fill-opacity="0.2" stroke="#2DD4BF" stroke-width="1.5"/>
    <text x="18" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#2DD4BF" letter-spacing="1.5">NURSING EXAM PREPARATION</text>

    <!-- Brand Name -->
    <text x="0" y="100" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="#FFFFFF" letter-spacing="-1">
      Pub<tspan fill="#2DD4BF">Nurse</tspan>
    </text>

    <!-- Subheadline -->
    <text x="0" y="150" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="500" fill="#E2E8F0">
      RN &amp; LPN Nursing Exam Prep &amp; Exit Q-Bank
    </text>

    <!-- Highlights -->
    <text x="0" y="196" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="#94A3B8">
      Expertly curated question banks, clinical rationales &amp; live drill simulations.
    </text>

    <!-- Domain Pill -->
    <g transform="translate(0, 226)">
      <rect x="0" y="0" width="168" height="32" rx="8" fill="#0A223B" stroke="#14B8A6" stroke-opacity="0.4" stroke-width="1"/>
      <circle cx="16" cy="16" r="4" fill="#10B981"/>
      <text x="28" y="21" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#F8FAFC">pubnurse.com</text>
    </g>
  </g>
</svg>
`;

function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4); // count

  let offset = 6 + count * 16;
  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map((p) => p.buffer)]);
}

async function run() {
  const svgBuffer = Buffer.from(svg_master.trim());
  const ogBuffer = Buffer.from(svg_og.trim());

  // Prepare PNG buffers
  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  const png128 = await sharp(svgBuffer).resize(128, 128).png().toBuffer();
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();

  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: png16 },
    { width: 32, height: 32, buffer: png32 },
    { width: 48, height: 48, buffer: png48 },
  ]);

  const ogPng = await sharp(ogBuffer).resize(1200, 630).png().toBuffer();

  // 1. Next.js App Router root metadata files in src/app/
  fs.writeFileSync(path.join(srcAppDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(srcAppDir, 'icon.png'), png512);
  fs.writeFileSync(path.join(srcAppDir, 'icon.svg'), svgBuffer);
  fs.writeFileSync(path.join(srcAppDir, 'apple-icon.png'), png180);
  fs.writeFileSync(path.join(srcAppDir, 'opengraph-image.png'), ogPng);

  // 2. Public directory standard web files
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
  fs.writeFileSync(path.join(publicDir, 'icon.png'), png512);
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgBuffer);

  // 3. Public favicons/ directory (fixes SeoHeader.tsx /favicons/favicon.png)
  fs.writeFileSync(path.join(publicFaviconsDir, 'favicon.png'), png512);
  fs.writeFileSync(path.join(publicFaviconsDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(publicFaviconsDir, 'apple-touch-icon.png'), png180);
  fs.writeFileSync(path.join(publicFaviconsDir, 'icon-192.png'), await sharp(svgBuffer).resize(192, 192).png().toBuffer());
  fs.writeFileSync(path.join(publicFaviconsDir, 'icon-512.png'), png512);

  // 4. Logo directory
  fs.writeFileSync(path.join(publicLogoDir, 'logo.png'), png512);
  fs.writeFileSync(path.join(publicLogoDir, 'logo-dark.png'), png512);
  fs.writeFileSync(path.join(publicLogoDir, 'logo.webp'), await sharp(svgBuffer).resize(512, 512).webp({ quality: 95 }).toBuffer());
  fs.writeFileSync(path.join(publicLogoDir, 'logo.svg'), svgBuffer);
  fs.writeFileSync(path.join(publicLogoDir, 'pn-icon.svg'), svgBuffer);

  console.log('Successfully deployed all icon and logo files across src/app, public/, public/favicons/, and public/logo/');
}

run().catch(console.error);
