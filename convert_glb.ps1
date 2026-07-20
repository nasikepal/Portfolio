$bytes = [System.IO.File]::ReadAllBytes("C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\assets\models\model_player.glb")
$b64 = [System.Convert]::ToBase64String($bytes)
$js = "window.MODEL_B64 = `"data:model/gltf-binary;base64," + $b64 + "`";"
[System.IO.File]::WriteAllText("C:\Users\USER\.gemini\antigravity\scratch\portfolio-3d\assets\models\model_data.js", $js)
