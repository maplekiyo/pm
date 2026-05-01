$ErrorActionPreference = "Stop"

$ImageName = "pm-mvp"
$ContainerName = "pm-mvp"

docker build -t $ImageName .

$Existing = docker ps -a --filter "name=^/$ContainerName$" --format "{{.Names}}"
if ($Existing -eq $ContainerName) {
    docker rm -f $ContainerName | Out-Null
}

$EnvArgs = @()
if (Test-Path ".env") {
    $EnvArgs = @("--env-file", ".env")
}

docker run -d --name $ContainerName -p 8000:8000 @EnvArgs $ImageName
Write-Host "Project Management MVP is running at http://localhost:8000"
