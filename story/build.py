"""Builds story/noa-story-survey.html and story/noa-story-survey-guide.html (1080 x 1920).
Crop: change PHOTO_POS to move the runner (x% y% of the photo shown in the frame)."""
PHOTO_POS = "50% 30%"
W, H = 1080, 1920
TOP_SAFE, BOTTOM_SAFE = 250, 340
STICKER = dict(w=640, h=200, top=1300)
STICKER["left"] = (W - STICKER["w"]) // 2

CSS = f"""
@font-face {{ font-family: "HN"; src: url("../assets/HelveticaNeueMedium.otf") format("opentype"); font-weight: 500; }}
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{ width: {W}px; height: {H}px; overflow: hidden; background: #141414; }}
.story {{ position: relative; width: {W}px; height: {H}px; overflow: hidden; background: #2b2b2b;
  font-family: "HN", "Helvetica Neue", Arial, sans-serif; font-weight: 500; color: #f4f2ee; }}
.photo {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: {PHOTO_POS}; filter: grayscale(1); }}
/* Neutral black shading only where text sits: a light veil behind the logo,
   and a deeper one from the headline down through the sticker area */
.shade {{ position: absolute; inset: 0; pointer-events: none;
  background:
    linear-gradient(180deg, rgba(20,20,20,.55) 0px, rgba(20,20,20,0) 460px),
    linear-gradient(180deg, rgba(20,20,20,0) 560px, rgba(20,20,20,.55) 900px, rgba(20,20,20,.72) 1300px, rgba(20,20,20,.72) {H}px); }}
.logo {{ position: absolute; left: 88px; top: 286px; font-size: 64px; line-height: 1; letter-spacing: -0.06em; }}
.copy {{ position: absolute; left: 88px; right: 88px; top: 700px; }}
.headline {{ font-size: 104px; line-height: 1.0; letter-spacing: -0.035em; }}
.subline {{ margin-top: 40px; max-width: 760px; font-size: 38px; line-height: 1.28; letter-spacing: -0.01em; color: rgba(244,242,238,.86); }}
.tap {{ position: absolute; left: 0; right: 0; top: {STICKER['top'] - 74}px; text-align: center; font-size: 30px; line-height: 1; letter-spacing: 0; }}
.accent {{ position: absolute; left: {(W-64)//2}px; top: {STICKER['top'] - 26}px; width: 64px; height: 4px; background: #e2542b; }}
.small {{ position: absolute; left: 0; right: 0; top: {STICKER['top'] + STICKER['h'] + 34}px; text-align: center; font-size: 26px; line-height: 1; color: rgba(244,242,238,.78); }}
/* Guide overlays (guide file only) */
.zone {{ position: absolute; left: 0; right: 0; background: rgba(226, 40, 40, .22); }}
.sticker {{ position: absolute; left: {STICKER['left']}px; top: {STICKER['top']}px; width: {STICKER['w']}px; height: {STICKER['h']}px; border: 3px dashed rgba(244,242,238,.9); }}
"""

def page(guide):
    g = ""
    if guide:
        g = (f'<div class="zone" style="top:0;height:{TOP_SAFE}px"></div>'
             f'<div class="zone" style="bottom:0;height:{BOTTOM_SAFE}px"></div>'
             f'<div class="sticker"></div>')
    return f"""<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Noa story</title><style>{CSS}</style></head>
<body><div class="story">
<img class="photo" src="../assets/story-bg.jpg" alt="" onerror="this.remove()">
<div class="shade"></div>
<div class="logo">noa</div>
<div class="copy"><p class="headline">Ready to push,<br>or should you<br>recover?</p>
<p class="subline">Help us understand how athletes decide.<br>3&nbsp;minute survey.</p></div>
<p class="tap">Tap the link below</p>
<div class="accent"></div>
<p class="small">Imperial College London research. Anonymous.</p>
{g}</div></body></html>"""

import os
d = os.path.dirname(os.path.abspath(__file__))
open(os.path.join(d, "noa-story-survey.html"), "w").write(page(False))
open(os.path.join(d, "noa-story-survey-guide.html"), "w").write(page(True))
print("built")
