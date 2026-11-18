const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const DIR = process.argv[2], OUTP = process.argv[3];
(async () => {
  const b = await chromium.launch();
  for (const [W, H] of [[1080, 2340], [1290, 2796]]) for (const v of ['bottom', 'top']) {
    const name = `noa-tally-backdrop-${v}-${W}x${H}`;
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    await p.goto('file://' + path.join(DIR, name + '.svg'));
    await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(DIR, name + '.png') });
    await p.close();
  }
  // Preview: backdrop as the page background at real phone size (390 x 844 CSS px at 3x), mock Tally question on top
  for (const v of ['bottom', 'top']) {
    const p = await b.newPage({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 3 });
    const html = `<!doctype html><html><head><meta name=viewport content="width=device-width"><style>
      @font-face{font-family:HN;src:url(file:///home/user/noaweb/fonts/HelveticaNeueRoman.otf);font-weight:400}
      @font-face{font-family:HN;src:url(file:///home/user/noaweb/fonts/HelveticaNeueMedium.otf);font-weight:500 700}
      html,body{margin:0;height:100%}
      body{background:#E9EBEA url(file://${DIR}/noa-tally-backdrop-${v}-1080x2340.png) center top/cover no-repeat;font-family:HN,sans-serif;color:#37352F}
      main{position:absolute;left:16px;right:16px;top:${Math.round(780*0.15)}px}
      h1{font-size:22px;font-weight:700;line-height:1.3;margin:0 0 6px}
      p{font-size:14px;line-height:1.5;margin:0 0 18px}
      .c{display:flex;align-items:center;gap:10px;height:44px;padding:0 12px;margin-bottom:10px;border:1px solid rgba(55,53,47,.16);border-radius:8px;background:rgba(255,255,255,.55);font-size:15px}
      .c b{display:inline-grid;place-items:center;width:22px;height:22px;border:1px solid rgba(55,53,47,.3);border-radius:4px;font-size:12px;font-weight:500}
      .btn{display:inline-block;margin-top:14px;height:42px;line-height:42px;padding:0 18px;border-radius:8px;background:#E2542B;color:#141414;font-weight:500;font-size:15px}
      .guide{position:fixed;left:16px;right:16px;top:${Math.round(780*0.12)}px;bottom:${Math.round(780*0.10)}px;outline:1px dashed rgba(0,120,255,.0)}
    </style></head><body><main>
      <h1>What's your main sport?</h1><p>Pick the one you train for most. You can add others later.</p>
      <div class=c><b>A</b>Running</div><div class=c><b>B</b>Cycling</div><div class=c><b>C</b>Gym and strength</div>
      <span class=btn>Next</span></main></body></html>`;
    fs.writeFileSync(path.join(OUTP, `prev-${v}.html`), html);
    await p.goto('file://' + path.join(OUTP, `prev-${v}.html`)); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(DIR, `preview-${v}.png`) });
    await p.close();
  }
  await b.close();
})();
