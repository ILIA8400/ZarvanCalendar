#!/bin/sh
# Zarvan Calendar - build (POSIX sh: macOS, Linux, Git Bash, WSL)
#
#   sh build/build.sh
#
# Concatenates the files listed in each manifest, then assembles dist/.
# No node, no npm, no install.

set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)

# One source of truth for the version: package.json. Substituted for __ZARVAN_VERSION__.
version=$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$root/package.json" | head -1)
[ -n "$version" ] || { echo "could not read the version from package.json" >&2; exit 1; }

# Manifest lines that are neither blank nor comments.
list_parts() {
  sed -e 's/\r$//' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' "$root/$1" |
    grep -v '^#' | grep -v '^$'
}

build_one() {
  manifest="$1"; banner="$2"; srcdir="$3"; out="$4"

  # Checked up front: the loop below runs in a pipeline subshell, where `exit` would not stop the run.
  missing=$(list_parts "$manifest" | while IFS= read -r p; do
    [ -f "$root/$srcdir/$p" ] || printf '  %s\n' "$p"
  done)
  if [ -n "$missing" ]; then
    printf '%s lists missing file(s):\n%s\n' "$manifest" "$missing" >&2
    exit 1
  fi

  sed -e 's/[[:space:]]*$//' "$root/$banner" > "$out.tmp"
  list_parts "$manifest" | while IFS= read -r p; do
    printf '\n' >> "$out.tmp"
    cat "$root/$srcdir/$p" >> "$out.tmp"
  done

  sed -e "s/__ZARVAN_VERSION__/$version/g" "$out.tmp" > "$out"
  rm -f "$out.tmp"
  echo "built ${out#"$root/"} ($(wc -l < "$out" | tr -d ' ') lines)"
}

# ---- 1. assembled sources
build_one build/manifest-css.txt build/banner.txt    src/css "$root/src/css/zarvan.css"
build_one build/manifest-js.txt  build/banner-js.txt src/js  "$root/src/js/zarvan.js"

# ---- 2. dist: the folder a consumer copies. jalaali goes first, inside the same file.
mkdir -p "$root/dist/fonts"

{
  sed -e 's/[[:space:]]*$//' "$root/build/banner-dist.txt"
  printf '\n'
  cat "$root/src/libs/jalaali.js"
  printf '\n'
  cat "$root/src/js/zarvan.js"
} | sed -e "s/__ZARVAN_VERSION__/$version/g" > "$root/dist/zarvan.js"

cp "$root/src/css/zarvan.css" "$root/dist/zarvan.css"
sed -e "s/__ZARVAN_VERSION__/$version/g" "$root/src/zarvan.d.ts" > "$root/dist/zarvan.d.ts"

# The theme's font URL is relative to the stylesheet; in dist/ the fonts sit one level down.
sed -e 's|\.\./\.\./fonts/|./fonts/|g' "$root/src/css/zarvan-theme-fa.css" > "$root/dist/zarvan-theme-fa.css"
cp "$root/fonts/Vazir-FD-WOL.ttf" "$root/dist/fonts/Vazir-FD-WOL.ttf"

echo "built dist/  v$version"
for f in dist/zarvan.js dist/zarvan.css dist/zarvan.d.ts dist/zarvan-theme-fa.css; do
  echo "  $f  $(wc -c < "$root/$f" | tr -d ' ') bytes"
done
