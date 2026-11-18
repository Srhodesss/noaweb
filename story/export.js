// Exports both story HTML files to out/ at exactly 1080 x 1920, then reports layout boxes
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const root = path.resolve(__dirname, '..'); const b = await chromium.launch();
  for (const name of ['noa-story-survey', 'noa-story-survey-guide']) {
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    await p.goto('file://' + path.join(root, 'story', name + '.html'));
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(300);
    if (name === 'noa-story-survey') {
      const info = await p.evaluate(() => {
        const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom), Math.round(b.left), Math.round(b.right)]; };
        const fontOK = document.fonts.check('500 64px HN');
        const photo = !!document.querySelector('.photo');
        return { fontOK, photo, logo: r('.logo'), headline: r('.headline'), subline: r('.subline'), tap: r('.tap'), accent: r('.accent'), small: r('.small') };
      });
      console.log(JSON.stringify(info));
    }
    await p.screenshot({ path: path.join(root, 'out', name + '.png') });
    await p.close();
  }
  await b.close();
})();
