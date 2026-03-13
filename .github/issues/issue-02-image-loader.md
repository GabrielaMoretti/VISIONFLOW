## 📝 Description

Implementar sistema de upload de imagens (JPEG, PNG) com preview e extração de metadados EXIF.

## 🎯 Acceptance Criteria

- [ ] Drag & drop de imagens funcional
- [ ] Preview da imagem após upload
- [ ] Extração de metadados EXIF (câmera, lente, ISO, aperture)
- [ ] Validação de formato de arquivo
- [ ] Exibição de informações básicas (dimensões, tamanho, DPI)

## ✅ Implementation Checklist

### Frontend
- [ ] Componente ImageUploader com drag & drop
- [ ] Área de preview da imagem
- [ ] Painel de metadados EXIF
- [ ] Loading states durante upload
- [ ] Validação de tipos de arquivo permitidos
- [ ] Feedback visual de erros

### Backend
- [ ] Endpoint POST /api/images/upload
- [ ] Processamento de multipart/form-data
- [ ] Extração de EXIF (biblioteca: exifread ou Pillow)
- [ ] Retorno de metadados estruturados (JSON)
- [ ] Salvamento temporário em /temp
- [ ] Limpeza de arquivos temporários antigos

### Testing
- [ ] Testes com diferentes formatos (JPEG, PNG)
- [ ] Testes com imagens sem EXIF
- [ ] Testes com imagens grandes (>10MB)
- [ ] Testes de validação de formato

## 📚 Libraries/Dependencies

### Frontend
- `react-dropzone` - Drag and drop de arquivos
- `axios` - Upload HTTP

### Backend
- `Pillow` (PIL) - Processamento de imagens
- `exifread` - Extração de metadados EXIF
- `python-multipart` - Parsing de multipart forms

## 🔗 Dependencies

- **Depends on**: #1 (Setup do Projeto)

## 📊 Complexity Estimate

**Complexity**: Baixa (1-2 dias)

## 📌 Additional Context

### Metadados EXIF esperados:
```json
{
  "camera": {
    "make": "Canon",
    "model": "EOS R5"
  },
  "lens": {
    "model": "RF 24-70mm f/2.8L IS USM",
    "focalLength": "50mm"
  },
  "settings": {
    "iso": 400,
    "aperture": "f/2.8",
    "shutterSpeed": "1/250",
    "exposureCompensation": "+0.3"
  },
  "image": {
    "width": 8192,
    "height": 5464,
    "fileSize": "12.5 MB",
    "dpi": 300,
    "colorSpace": "sRGB"
  },
  "datetime": "2024-10-15 14:30:25"
}
```

### Formatos suportados nesta issue:
- JPEG (.jpg, .jpeg)
- PNG (.png)

**Nota**: RAW e HEIC serão adicionados em issues futuras
