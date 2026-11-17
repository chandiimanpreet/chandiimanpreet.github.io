#!/bin/sh
# Post-build audit of dist/ (docs/SECURITY.md section 11, items 1, 2, 14, 15, 17, 18, 25).
# Run after `npm run build`. Collects every failure, then exits 1 if any.
set -eu

cd "$(dirname "$0")/.."
DIST=dist
HTML=$DIST/index.html
status=0
fail() {
  echo "check-dist: FAIL: $*" >&2
  status=1
}

[ -f "$HTML" ] || { echo "check-dist: $HTML missing; run npm run build first" >&2; exit 1; }

# Inline <script> (no src) in any HTML file.
hits=$(find "$DIST" -name '*.html' -exec grep -HoE '<script[^>]*>' {} + | grep -v 'src=' || true)
[ -z "$hits" ] || fail "inline <script> without src: $hits"

# Source maps.
hits=$(find "$DIST" -name '*.map')
[ -z "$hits" ] || fail "source maps in dist: $hits"

# data: URLs where they would need font-src/script-src data:.
hits=$(grep -rIlE 'data:(font/|application/(x-)?font|(application|text)/(x-)?javascript)|<script[^>]+src=["'\'']?data:' "$DIST" || true)
[ -z "$hits" ] || fail "data: URL in font or script context: $hits"

# Phone numbers: country code, 10-digit mobile, or 5+5 grouped. Pattern split so this file never holds the literal.
plus='[+]9''1'
hits=$(grep -rIlE "$plus|(^|[^0-9])[6-9][0-9]{9}([^0-9]|\$)|(^|[^0-9])[0-9]{5}[ -][0-9]{5}([^0-9]|\$)" "$DIST" || true)
[ -z "$hits" ] || fail "phone-number pattern in: $hits"

# Email literal anywhere except security.txt, where a mailto: Contact is its stated purpose (section 8).
email='manpreetchandi555''@''gmail.com'
hits=$(grep -rIlF "$email" "$DIST" | grep -v '/.well-known/security.txt$' || true)
[ -z "$hits" ] || fail "email literal in: $hits"

# CSP meta must be the first element in <head>.
tr -d '\n' <"$HTML" | awk '{ s = substr($0, index($0, "<head>") + 6); sub(/^[[:space:]]*/, "", s); print s }' |
  grep -q '^<meta http-equiv="Content-Security-Policy"' ||
  fail "CSP meta is not the first element of <head>"

# Shipped CSP directives must equal the policy in vite.config.ts exactly.
csp=$(grep -o 'http-equiv="Content-Security-Policy" content="[^"]*"' "$HTML" | sed 's/.*content="//; s/"$//; s/&#39;/'\''/g' |
  tr ';' '\n' | sed 's/^ *//; s/ *$//')
for d in script-src style-src img-src; do
  want=$(grep -oE "\"$d [^\"]*\"" vite.config.ts | tr -d '"')
  [ -n "$want" ] || { fail "$d not found in vite.config.ts"; continue; }
  printf '%s\n' "$csp" | grep -qFx "$want" || fail "$HTML $d does not match vite.config.ts ($want)"
done

# No third-party scripts or stylesheets.
hits=$(grep -oE '<script[^>]+src="https?:|<link[^>]+href="https?:[^"]*"[^>]*rel="stylesheet"|<link[^>]+rel="stylesheet"[^>]+href="https?:' "$HTML" || true)
[ -z "$hits" ] || fail "third-party script/stylesheet: $hits"

# security.txt shipped with Contact and an Expires in the future.
sec=$DIST/.well-known/security.txt
if [ -f "$sec" ]; then
  grep -q '^Contact: ' "$sec" || fail "$sec has no Contact"
  awk -v now="$(date -u +%Y-%m-%dT%H:%M:%S)" '/^Expires: /{ok = ($2 > now)} END{exit !ok}' "$sec" ||
    fail "$sec Expires missing or in the past"
else
  fail "$sec missing"
fi

[ "$status" -eq 0 ] && echo "check-dist: ok"
exit "$status"
