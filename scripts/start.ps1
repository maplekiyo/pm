$ErrorActionPreference = "Stop"

$ImageName = "pm-mvp"
$ContainerName = "pm-mvp"

docker build -t $ImageName .

$Existing = docker ps -a --filter "name=^/$ContainerName$" --format "{{.Names}}"
if ($Existing -eq $ContainerName) {
    docker rm -f $ContainerName | Out-Null
}

docker run -d --name $ContainerName -p 8000:8000 $ImageName
Write-Host "Project Management MVP is running at http://localhost:8000"
