import base64, math, sys
S, OUT = sys.argv[1], sys.argv[2]
BG, INK, RED, WHITE = "#E9EBEA", "#141414", "#E2542B", "#FFFFFF"
FONT = base64.b64encode(open(S + "/hn-logo.woff2", "rb").read()).decode()
SCALE = 3                     # both canvases are 3x phones
MARGIN = 16 * SCALE           # 48 px: Tally's mobile text margin
LOGO_PX = 26 * SCALE          # same size as the site nav logo (26 CSS px)

def bands(x0, x1, y_base, angle_deg, spec):
    """Parallel bands rising left to right. spec: list of (thickness, gap_after, colour), bottom band first."""
    k = math.tan(math.radians(angle_deg)); out = []; y = y_base
    for th, gap, col in spec:
        yb, yt = y, y - th
        out.append(f'<path fill="{col}" d="M{x0} {yb + k*(-x0):.1f}L{x1} {yb - k*x1:.1f}L{x1} {yt - k*x1:.1f}L{x0} {yt + k*(-x0):.1f}Z"/>')
        y = yt - gap
    return "".join(out)

def svg(W, H, variant):
    top_h = round(H * 0.12); bot_h = round(H * 0.10)
    parts = [f'<rect width="{W}" height="{H}" fill="{BG}"/>']
    # Logo: the site's text logo, Helvetica Neue Medium, letter-spacing -0.06em, ink colour
    base = round(top_h * 0.5 + LOGO_PX * 0.26)
    logo = f'<text x="{MARGIN}" y="{base}" font-family="NoaLogo" font-size="{LOGO_PX}" font-weight="500" letter-spacing="{-0.06*LOGO_PX:.2f}" fill="{INK}">noa</text>'
    spec = [(round(H*0.030), round(H*0.0055), RED), (round(H*0.010), round(H*0.0055), WHITE), (round(H*0.012), 0, RED)]
    if variant == "bottom":
        # three livery bands across the bottom band, rising 3 degrees to the right, bleeding off both edges
        parts.append(bands(-20, W + 20, H - round(bot_h*0.10), 3.0, spec))
    else:
        # bands in the top band, starting right of the logo and bleeding off the right edge
        # clear space after the logo = the logo's own x-height, about 14 CSS px
        lw = round(LOGO_PX * 1.62); x0 = MARGIN + lw + 14 * SCALE
        top_spec = [(max(round(th*0.62), 8*SCALE), round(g*0.8), c) for th, g, c in spec]
        parts.append(bands(x0, W + 20, base, 3.0, top_spec))
    parts.append(logo)
    # Fine monochrome grain at 4% so it reads as print texture
    grain = ('<filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch"/>'
             '<feColorMatrix type="saturate" values="0"/></filter>'
             f'<rect width="{W}" height="{H}" filter="url(#g)" opacity="0.04"/>')
    style = f'<style>@font-face{{font-family:NoaLogo;src:url(data:font/woff2;base64,{FONT}) format("woff2");font-weight:500}}</style>'
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><defs>{style}{grain.split("</filter>")[0]}</filter></defs>{"".join(parts)}{grain.split("</filter>")[1]}</svg>\n'

for W, H in [(1080, 2340), (1290, 2796)]:
    for v in ["bottom", "top"]:
        open(f"{OUT}/noa-tally-backdrop-{v}-{W}x{H}.svg", "w").write(svg(W, H, v))
print("ok")
