$ErrorActionPreference = "Stop"

$ContainerName = "pm-mvp"
$Existing = docker ps -a --filter "name=^/$ContainerName$" --format "{{.Names}}"

if ($Existing -eq $ContainerName) {
    docker rm -f $ContainerName | Out-Null
    Write-Host "Stopped $ContainerName"
} else {
    Write-Host "$ContainerName is not running"
}
