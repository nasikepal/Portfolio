$bytes = [System.IO.File]::ReadAllBytes('C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\assets\models\model_player.glb')
$jsonLength = [System.BitConverter]::ToUInt32($bytes, 12)
$jsonString = [System.Text.Encoding]::UTF8.GetString($bytes, 20, $jsonLength)
$jsonString.Substring(0, [math]::Min(2000, $jsonString.Length))
