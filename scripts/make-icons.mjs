// 앱 아이콘/스플래시 원본 PNG를 생성한다. (npm run icons 후 npx capacitor-assets generate)
import sharp from "sharp";

const BG = "#7f95ce";
const CARD = "#fffdf9";
const LINE = "#b7c4e6";

// 달력 모양 전경 (안전 영역 안쪽에 그려서 어댑티브 아이콘에서도 잘리지 않는다)
const foreground = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect x="272" y="288" width="480" height="464" rx="56" fill="${CARD}"/>
  <path d="M272 344a56 56 0 0 1 56-56h368a56 56 0 0 1 56 56v72H272z" fill="#5b6fae"/>
  <rect x="352" y="248" width="40" height="80" rx="20" fill="${CARD}"/>
  <rect x="632" y="248" width="40" height="80" rx="20" fill="${CARD}"/>
  <rect x="336" y="480" width="352" height="20" rx="10" fill="${LINE}"/>
  <rect x="336" y="548" width="352" height="20" rx="10" fill="${LINE}"/>
  <path d="M356 656l44 44 84-96" fill="none" stroke="#5b6fae" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="528" y="650" width="160" height="20" rx="10" fill="${LINE}"/>
</svg>`;

const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="1024" height="1024" fill="${BG}"/></svg>`;

const png = (svg) => sharp(Buffer.from(svg)).png();

await png(foreground).toFile("assets/icon-foreground.png");
await png(bg).toFile("assets/icon-background.png");
await sharp(await png(bg).toBuffer())
  .composite([{ input: await png(foreground).toBuffer() }])
  .png()
  .toFile("assets/icon-only.png");

// 스플래시: 앱 배경색 위에 아이콘을 중앙 배치
const splashBase = (color) =>
  sharp({ create: { width: 2732, height: 2732, channels: 4, background: color } });
const logo = await sharp(await png(foreground).toBuffer()).resize(720, 720).toBuffer();
const logoCard = await sharp(await sharp(await png(bg).toBuffer()).composite([{ input: await png(foreground).toBuffer() }]).png().toBuffer())
  .resize(640, 640)
  .toBuffer();
await splashBase("#f3efe6").composite([{ input: logoCard, gravity: "center" }]).png().toFile("assets/splash.png");
await splashBase("#2b2f3a").composite([{ input: logoCard, gravity: "center" }]).png().toFile("assets/splash-dark.png");
void logo;
console.log("assets 생성 완료");
