# Test the endpoint with multipart form data
$uri = "http://localhost:8000/api/v1/users/test"

# Create a multipart form data body
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"fullname`"$LF",
    "Shivang",
    "--$boundary",
    "Content-Disposition: form-data; name=`"email`"$LF", 
    "shivang@gmail.com",
    "--$boundary",
    "Content-Disposition: form-data; name=`"password`"$LF",
    "123456",
    "--$boundary",
    "Content-Disposition: form-data; name=`"username`"$LF",
    "ffuguggfw",
    "--$boundary--"
) -join $LF

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary"
    Write-Host "Success!" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}
