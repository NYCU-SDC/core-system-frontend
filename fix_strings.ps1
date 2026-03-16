$text = Get-Content src/features/form/components/QuestionRenderers/FileUploadRenderer.tsx -Raw
$text = $text -replace "[`"].*?重新上傳[`"]", '"下載失敗，請重新上傳"'
$text = $text -replace '".*?勬?妗堥???', '"無法重新上傳：找不到記錄"'
Set-Content src/features/form/components/QuestionRenderers/FileUploadRenderer.tsx -Value $text
