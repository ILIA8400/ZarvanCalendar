# Zarvan Calendar - build (Windows PowerShell)
#
#   powershell -ExecutionPolicy Bypass -File build/build.ps1
#
# Concatenates the files listed in each manifest, then assembles dist/.
# No node, no npm, no install, no admin rights. PowerShell ships with Windows.
#
# Output is byte-identical to build.sh and build.mjs. That means LF, never CRLF: AppendLine() would
# emit "`r`n" here and silently make this runner's output differ from the other two.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$LF = "`n"

# UTF-8 without BOM: a BOM can surface as a stray glyph, and breaks a leading "use strict".
$utf8 = [System.Text.UTF8Encoding]::new($false)
function Write-Text($relPath, $text) {
    [System.IO.File]::WriteAllText((Join-Path $root $relPath), $text, $utf8)
}
function Read-Text($relPath) {
    return (Get-Content (Join-Path $root $relPath) -Raw -Encoding UTF8)
}

# One source of truth for the version: package.json. Substituted for __ZARVAN_VERSION__.
$version = (Read-Text 'package.json' | ConvertFrom-Json).version
if (-not $version) { throw 'could not read the version from package.json' }
function Stamp($text) { return $text.Replace('__ZARVAN_VERSION__', $version) }

function Build-One($manifest, $banner, $srcDir, $outFile) {
    $parts = Get-Content (Join-Path $root $manifest) -Encoding UTF8 |
        ForEach-Object { $_.Trim() } |
        Where-Object { $_ -and -not $_.StartsWith('#') }

    $missing = $parts | Where-Object { -not (Test-Path (Join-Path $root "$srcDir/$_")) }
    if ($missing) { throw "$manifest lists missing file(s): $($missing -join ', ')" }

    $chunks = @((Read-Text $banner).TrimEnd())
    foreach ($p in $parts) { $chunks += (Read-Text "$srcDir/$p").TrimEnd() }

    Write-Text $outFile (Stamp (($chunks -join "$LF$LF") + $LF))
    Write-Host "built $outFile  ($($parts.Count) parts)"
}

# ---- 1. assembled sources
Build-One 'build/manifest-css.txt' 'build/banner.txt'    'src/css' 'src/css/zarvan.css'
Build-One 'build/manifest-js.txt'  'build/banner-js.txt' 'src/js'  'src/js/zarvan.js'

# ---- 2. dist: the folder a consumer copies. jalaali goes first, inside the same file.
$distFonts = Join-Path $root 'dist/fonts'
if (-not (Test-Path $distFonts)) { New-Item -ItemType Directory -Force -Path $distFonts | Out-Null }

$distChunks = @(
    (Read-Text 'build/banner-dist.txt').TrimEnd(),
    (Read-Text 'src/libs/jalaali.js').TrimEnd(),
    (Read-Text 'src/js/zarvan.js').TrimEnd()
)
Write-Text 'dist/zarvan.js' (Stamp (($distChunks -join "$LF$LF") + $LF))

Write-Text 'dist/zarvan.css'  (Read-Text 'src/css/zarvan.css')
Write-Text 'dist/zarvan.d.ts' (Stamp (Read-Text 'src/zarvan.d.ts'))

# The theme's font URL is relative to the stylesheet; in dist/ the fonts sit one level down.
Write-Text 'dist/zarvan-theme-fa.css' ((Read-Text 'src/css/zarvan-theme-fa.css').Replace('../../fonts/', './fonts/'))
Copy-Item (Join-Path $root 'fonts/Vazir-FD-WOL.ttf') (Join-Path $distFonts 'Vazir-FD-WOL.ttf') -Force

Write-Host "built dist/  v$version"
foreach ($f in @('dist/zarvan.js', 'dist/zarvan.css', 'dist/zarvan.d.ts', 'dist/zarvan-theme-fa.css')) {
    $bytes = (Get-Item (Join-Path $root $f)).Length
    Write-Host "  $f  $bytes bytes"
}
