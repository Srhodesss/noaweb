Rebuild the Tally backdrops from the repo root:
  python3 brand/tally/src/tally_bg.py brand/tally/src brand/tally
  node brand/tally/src/render_tally.js "$PWD/brand/tally" /tmp
tally_bg.py reads hn-logo.woff2 (Helvetica Neue Medium cut down to n, o, a) from the first argument.
