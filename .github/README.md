# GitHub Issues for VISIONFLOW Development

Este diretório contém templates e arquivos para criar issues estruturadas no GitHub para o desenvolvimento do projeto VISIONFLOW.

## 📁 Estrutura

```
.github/
├── ISSUE_TEMPLATE/          # Templates de issues
│   ├── feature.md           # Template para features
│   ├── bug.md               # Template para bugs
│   └── config.yml           # Configuração de templates
├── issues/                  # Conteúdo das issues
│   ├── issue-01-setup-projeto.md
│   ├── issue-02-image-loader.md
│   ├── issue-03-canvas-editor.md
│   ├── issue-04-layer-system.md
│   ├── issue-05-export-engine.md
│   ├── issue-06-history-undo-redo.md
│   ├── issue-07-palette-extractor.md
│   ├── issue-08-tone-mapping.md
│   ├── issue-09-hsl-adjustments.md
│   └── issue-10-lut-system.md
├── create_issues.py         # Script para criar issues automaticamente
└── README.md                # Este arquivo
```

## 🎯 Issues Disponíveis

### 🔵 Camada 1: CORE ENGINE (6 issues)

1. **Setup do Projeto** - Frontend Next.js + Backend FastAPI
   - Labels: `setup`, `camada-1-core`, `priority-high`
   - Complexidade: Média (2-3 dias)

2. **Image Loader** - Upload e Visualização de Imagens
   - Labels: `feature`, `camada-1-core`, `priority-high`
   - Complexidade: Baixa (1-2 dias)

3. **Canvas Editor** - Fabric.js Integration
   - Labels: `feature`, `camada-1-core`, `priority-high`
   - Complexidade: Média (2-3 dias)

4. **Layer System** - Sistema de Camadas Não-Destrutivo
   - Labels: `feature`, `camada-1-core`, `priority-medium`
   - Complexidade: Alta (3-5 dias)

5. **Export Engine** - Exportação de Imagens
   - Labels: `feature`, `camada-1-core`, `priority-medium`
   - Complexidade: Baixa (1-2 dias)

6. **History & Undo/Redo** - Sistema de Histórico
   - Labels: `feature`, `camada-1-core`, `priority-low`
   - Complexidade: Média (2-3 dias)

### 🟢 Camada 2: COLOR FLOW ENGINE (4 issues)

7. **Palette Extractor** - Extração de Cores Dominantes
   - Labels: `feature`, `camada-2-color`, `priority-medium`
   - Complexidade: Média (2-3 dias)

8. **Tone Mapping** - Controle de Shadows/Midtones/Highlights
   - Labels: `feature`, `camada-2-color`, `priority-medium`
   - Complexidade: Alta (3-5 dias)

9. **HSL Adjustments** - Controle de Hue/Saturation/Lightness
   - Labels: `feature`, `camada-2-color`, `priority-low`
   - Complexidade: Baixa (1-2 dias)

10. **LUT System** - Lookup Tables para Color Grading
    - Labels: `feature`, `camada-2-color`, `priority-low`
    - Complexidade: Alta (4-5 dias)

## 🚀 Como Criar as Issues

### Opção 1: Script Automático (Recomendado)

1. **Instalar dependências**:
   ```bash
   pip install requests
   ```

2. **Configurar token do GitHub**:
   - Vá para: https://github.com/settings/tokens
   - Gere um novo token com permissão `repo`
   - Exporte o token:
     ```bash
     export GITHUB_TOKEN="seu_token_aqui"
     ```

3. **Executar o script**:
   ```bash
   cd .github
   python create_issues.py
   ```

4. **Verificar os resultados**:
   - O script criará todas as 10 issues
   - Criará os labels necessários
   - Imprimirá os links das issues criadas

### Opção 2: GitHub CLI

1. **Instalar GitHub CLI**:
   ```bash
   # macOS
   brew install gh
   
   # Windows
   winget install --id GitHub.cli
   
   # Linux
   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
   ```

2. **Autenticar**:
   ```bash
   gh auth login
   ```

3. **Criar issues manualmente**:
   ```bash
   cd .github/issues
   
   # Issue 1
   gh issue create \
     --title "Setup do Projeto - Frontend Next.js + Backend FastAPI" \
     --body-file issue-01-setup-projeto.md \
     --label "setup,camada-1-core,priority-high"
   
   # Issue 2
   gh issue create \
     --title "Image Loader - Upload e Visualização de Imagens" \
     --body-file issue-02-image-loader.md \
     --label "feature,camada-1-core,priority-high"
   
   # ... repetir para todas as issues
   ```

### Opção 3: Interface Web do GitHub

1. Vá para: https://github.com/GabrielaMoretti/VISIONFLOW/issues/new
2. Copie o conteúdo de cada arquivo `.md` em `issues/`
3. Cole no corpo da issue
4. Adicione o título e labels correspondentes
5. Clique em "Submit new issue"

## 🏷️ Labels do Projeto

Os seguintes labels devem ser criados no repositório (o script faz isso automaticamente):

### Camadas
- `camada-1-core` (🔵 Azul) - Layer 1: Core Engine
- `camada-2-color` (🟢 Verde) - Layer 2: Color Flow Engine
- `camada-3-lenses` (🟡 Amarelo) - Layer 3: Lens Simulation
- `camada-4-ia` (🟠 Laranja) - Layer 4: IA Processing
- `camada-5-campaign` (🔴 Vermelho) - Layer 5: Campaign Management
- `camada-6-ux` (🟣 Roxo) - Layer 6: UX/UI

### Prioridade
- `priority-high` (🔴 Vermelho escuro) - High priority
- `priority-medium` (🟡 Amarelo) - Medium priority
- `priority-low` (🟢 Verde claro) - Low priority

### Tipo
- `feature` (🔵 Azul claro) - New feature
- `setup` (⚪ Cinza) - Project setup
- `bug` (🔴 Vermelho) - Bug or error
- `documentation` (🟢 Verde escuro) - Documentation

## 📋 Workflow de Desenvolvimento

### 1. Selecionar Issue
```bash
# Ver issues disponíveis
gh issue list --label "camada-1-core"

# Atribuir issue para você
gh issue edit 1 --add-assignee @me
```

### 2. Criar Branch
```bash
git checkout -b feature/issue-1-setup-project
```

### 3. Desenvolver
- Seguir o checklist da issue
- Fazer commits granulares
- Referenciar a issue nos commits:
  ```bash
  git commit -m "[#1] Configurar docker-compose"
  ```

### 4. Abrir Pull Request
```bash
gh pr create \
  --title "[#1] Setup do Projeto - Frontend e Backend" \
  --body "Closes #1"
```

### 5. Code Review
- Aguardar review
- Fazer ajustes se necessário
- Mergear quando aprovado

### 6. Issue Fechada Automaticamente
- Quando o PR é mergeado, a issue fecha automaticamente (devido ao "Closes #1")

## 📊 Ordem de Implementação Recomendada

### Sprint 1 (Semana 1)
1. Issue #1: Setup do Projeto
2. Issue #2: Image Loader

### Sprint 2 (Semana 2)
3. Issue #3: Canvas Editor
4. Issue #4: Layer System

### Sprint 3 (Semana 3)
5. Issue #5: Export Engine
6. Issue #6: History & Undo/Redo

### Sprint 4-5 (Semanas 4-5)
7. Issue #7: Palette Extractor
8. Issue #8: Tone Mapping
9. Issue #9: HSL Adjustments
10. Issue #10: LUT System

## 🔧 Troubleshooting

### Erro: "GITHUB_TOKEN not set"
```bash
export GITHUB_TOKEN="seu_token_aqui"
```

### Erro: "Label already exists"
- Normal se executar o script múltiplas vezes
- O script continuará criando as issues

### Erro: "Issue already exists with this title"
- Verifique se a issue já foi criada
- Modifique o título no script se necessário

## 📚 Recursos Adicionais

- [GitHub Issues Documentation](https://docs.github.com/en/issues)
- [GitHub CLI Manual](https://cli.github.com/manual/)
- [GitHub API - Issues](https://docs.github.com/en/rest/issues/issues)

## ✅ Checklist de Setup

- [ ] Labels criados no repositório
- [ ] Issues criadas (10 issues)
- [ ] Milestone "Camada 1" criada (opcional)
- [ ] Milestone "Camada 2" criada (opcional)
- [ ] Project Board configurado (opcional)
- [ ] Templates de issue testados

## 🤝 Contribuindo

Se você quiser adicionar mais issues ou modificar as existentes:

1. Edite os arquivos em `issues/`
2. Atualize `create_issues.py` se necessário
3. Execute o script novamente (ele não criará duplicatas se o título for o mesmo)

---

**Criado para o projeto VISIONFLOW**
*Professional Image Editor by Physical Control and Intuitive Flow*
