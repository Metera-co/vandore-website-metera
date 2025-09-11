$ErrorActionPreference = 'Stop'

Write-Host "Updating asset paths in moved HTML files under ./pages ..."

$files = Get-ChildItem -Path "pages" -Filter *.html -File -Recurse

foreach ($f in $files) {
  $content = Get-Content -Path $f.FullName -Raw

  # 1) Update common attributes that start with asset folders
  #    Matches: href/src/srcset/poster attributes when value begins with css|js|image|font/
  $content = $content -replace '(?i)(href|src|srcset|poster)=(["''])[ ]*(css|js|image|font)/', '$1=$2../$3/'

  # 2) Generic attribute values that begin with asset folders (covers data-*, etc.)
  $content = $content -replace '(?i)=(["''])[ ]*(css|js|image|font)/', '=$1../$2/'

  # 3) Inline CSS url(...) references
  $content = $content -replace '(?i)url\((["'']?)[ ]*(css|js|image|font)/', 'url($1../$2/'

  Set-Content -Path $f.FullName -Value $content -NoNewline
  Write-Host "Updated: $($f.FullName)"
}

Write-Host "Done."
