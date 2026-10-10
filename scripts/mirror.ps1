# Dev helper (Windows virtualised-path workaround): mirror project to a short temp path and build/test there.
param([string]$Cmd = "npx astro build")
$src = (Get-Location).Path; $dst = "$env:LOCALAPPDATA\Temp\zen"
robocopy $src $dst /E /XD node_modules dist .git .astro .wrangler test-results playwright-report /NFL /NDL /NJH /NJS /NP | Out-Null
Set-Location $dst; Invoke-Expression $Cmd
