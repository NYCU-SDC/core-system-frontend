from pathlib import Path
path = Path('src/features/dashboard/components/__tests__/AdminSettingsPage.ui.test.tsx')
text = path.read_text(encoding='utf-8')
text = text.replace('(data, { onSuccess }) =>', '(_, { onSuccess }) =>')
text = text.replace('(data, { onError }) =>', '(_, { onError }) =>')
text = text.replace('(id, { onSuccess }) =>', '(_, { onSuccess }) =>')
text = text.replace('(id, { onError }) =>', '(_, { onError }) =>')
path.write_text(text, encoding='utf-8')
