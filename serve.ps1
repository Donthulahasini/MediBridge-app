# Light PowerShell Static Web Server for MediBridge App
$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
$listener.Start()
Write-Host "MediBridge Web Server running on http://localhost:$port/"

$root = "C:\Users\hasini\.gemini\antigravity\scratch\medibridge-app"

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        $urlPath = $req.Url.LocalPath.Replace('/', '\')
        if ($urlPath -eq '\') { $urlPath = '\index.html' }
        
        $localPath = Join-Path $root $urlPath

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            switch ($ext) {
                ".html" { $res.ContentType = "text/html; charset=utf-8" }
                ".css"  { $res.ContentType = "text/css; charset=utf-8" }
                ".js"   { $res.ContentType = "application/javascript; charset=utf-8" }
                ".jpg"  { $res.ContentType = "image/jpeg" }
                ".jpeg" { $res.ContentType = "image/jpeg" }
                ".png"  { $res.ContentType = "image/png" }
                default { $res.ContentType = "application/octet-stream" }
            }
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
            $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $res.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $res.Close()
    } catch {
        # Continue on minor error
    }
}
