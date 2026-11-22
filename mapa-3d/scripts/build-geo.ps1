# ============================================================
# build-geo.ps1
# Convierte ../../mexico.geojson (32 estados) en js/geo-estados.js:
# polígonos proyectados (px) listos para extruir en el Mapa 3D
# abarcando la mitad sur de México (Occidente-Sur, Centro-Sur, Sur y Sureste).
# ============================================================
$root = Split-Path -Parent $PSScriptRoot
$geo  = Join-Path (Split-Path -Parent $root) "mexico.geojson"
$out1 = Join-Path $root "js\geo-estados.js"
$out2 = Join-Path (Split-Path -Parent $root) "geo-estados.js"
$out3 = Join-Path $root "geo-estados.js"

$j = Get-Content $geo -Raw -Encoding UTF8 | ConvertFrom-Json

# Ventana geográfica ampliada: Mitad Sur de México (de Michoacán a Quintana Roo)
$lonMin = -103.9; $lonMax = -86.5; $latMin = 14.3; $latMax = 22.6
$k = [Math]::Cos(18.5 * [Math]::PI / 180)   # corrección de longitud por latitud media
$scale = 62                                  # px por grado de latitud
$W = [Math]::Round(($lonMax - $lonMin) * $k * $scale)
$H = [Math]::Round(($latMax - $latMin) * $scale)

# 14 Estados interactivos de la mitad sur de México
$focus = @{
    "Veracruz"         = "veracruz"
    "Chiapas"          = "chiapas"
    "Tabasco"          = "tabasco"
    "Oaxaca"           = "oaxaca"
    "Campeche"         = "campeche"
    "Yucatán"          = "yucatan"
    "Quintana Roo"     = "quintanaroo"
    "Puebla"           = "puebla"
    "Guerrero"         = "guerrero"
    "Michoacán"        = "michoacan"
    "México"           = "edomex"
    "Morelos"          = "morelos"
    "Tlaxcala"         = "tlaxcala"
    "Ciudad de México" = "cdmx"
}

function RingToJs($ring) {
    $pts = New-Object System.Collections.ArrayList
    $lx = -999; $ly = -999
    foreach ($p in $ring) {
        $x = [Math]::Round(($p[0] - $lonMin) * $k * $scale, 1)
        $y = [Math]::Round(($latMax - $p[1]) * $scale, 1)
        # descartar puntos muy cercanos para mantener geometría ligera y rápida
        if ([Math]::Abs($x - $lx) -lt 1.0 -and [Math]::Abs($y - $ly) -lt 1.0) { continue }
        [void]$pts.Add("[$x,$y]"); $lx = $x; $ly = $y
    }
    if ($pts.Count -lt 3) { return $null }
    return "[" + ($pts -join ",") + "]"
}

$items = @()
foreach ($f in $j.features) {
    $n = $f.properties.name
    $rings = @()
    if ($f.geometry.type -eq "Polygon") { $polys = @(,$f.geometry.coordinates) } else { $polys = $f.geometry.coordinates }
    foreach ($poly in $polys) {
        $r = RingToJs $poly[0]
        if ($r) { $rings += $r }
    }
    if ($rings.Count -eq 0) { continue }
    if ($focus.ContainsKey($n)) { $id = $focus[$n]; $isF = "true" } else { $id = ""; $isF = "false" }
    $items += "  { name: ""$n"", id: ""$id"", focus: $isF, rings: [" + ($rings -join ",") + "] }"
}

$js  = "// GENERADO por scripts/build-geo.ps1 - Geometría ligera de la mitad sur de México.`n"
$js += "window.GEO_ESTADOS = {`n  width: $W, height: $H,`n  estados: [`n" + ($items -join ",`n") + "`n  ]`n};`n"

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($out1, $js, $utf8NoBom)
[System.IO.File]::WriteAllText($out2, $js, $utf8NoBom)
[System.IO.File]::WriteAllText($out3, $js, $utf8NoBom)

"Generado ($W x $H), estados totales: $($items.Count), interactivos: $($focus.Count), bytes: $((Get-Item $out2).Length)"
