# 🚀 Quick Start Guide - Creating GitHub Issues for VISIONFLOW

Esta é uma guia rápida para criar as issues estruturadas no repositório VISIONFLOW.

## ⚡ Opção 1: Script Automático (5 minutos)

### Pré-requisitos
```bash
# Python 3.6+
python --version

# pip
pip --version
```

### Passo a Passo

1. **Instalar dependências**
   ```bash
   pip install requests
   ```

2. **Criar GitHub Personal Access Token**
   - Vá para: https://github.com/settings/tokens
   - Clique em "Generate new token" → "Generate new token (classic)"
   - Nome: `VISIONFLOW Issues Creator`
   - Marque a permissão: `repo` (Full control of private repositories)
   - Clique em "Generate token"
   - **Copie o token** (você não verá ele novamente!)

3. **Executar o script**
   ```bash
   cd .github
   export GITHUB_TOKEN="cole_seu_token_aqui"
   python create_issues.py
   ```

4. **Verificar resultados**
   - O script criará 10 issues
   - Criará todos os labels necessários
   - Você verá uma saída como:
   ```
   ✓ Created label: camada-1-core
   ✓ Created label: priority-high
   ...
   ✓ Created issue #1: Setup do Projeto - Frontend Next.js + Backend FastAPI
   ✓ Created issue #2: Image Loader - Upload e Visualização de Imagens
   ...
   Summary: Created 10 / 10 issues
   ```

5. **Acessar as issues**
   ```
   https://github.com/GabrielaMoretti/VISIONFLOW/issues
   ```

## 📋 Opção 2: GitHub CLI (10 minutos)

### Pré-requisitos
```bash
# Instalar GitHub CLI
# macOS
brew install gh

# Windows
winget install --id GitHub.cli

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
```

### Passo a Passo

1. **Autenticar**
   ```bash
   gh auth login
   ```

2. **Criar issues manualmente** (repita para cada issue)
   ```bash
   cd .github/issues
   
   gh issue create \
     --title "Setup do Projeto - Frontend Next.js + Backend FastAPI" \
     --body-file issue-01-setup-projeto.md \
     --label "setup,camada-1-core,priority-high"
   ```

## 🌐 Opção 3: Interface Web (30 minutos)

### Para cada issue:

1. Vá para: https://github.com/GabrielaMoretti/VISIONFLOW/issues/new
2. Abra o arquivo correspondente em `.github/issues/`
3. Copie todo o conteúdo
4. Cole no corpo da issue
5. Adicione o título (veja abaixo)
6. Adicione os labels (veja abaixo)
7. Clique em "Submit new issue"

### Títulos e Labels

| # | Título | Labels |
|---|--------|--------|
| 1 | Setup do Projeto - Frontend Next.js + Backend FastAPI | `setup`, `camada-1-core`, `priority-high` |
| 2 | Image Loader - Upload e Visualização de Imagens | `feature`, `camada-1-core`, `priority-high` |
| 3 | Canvas Editor - Fabric.js Integration | `feature`, `camada-1-core`, `priority-high` |
| 4 | Layer System - Sistema de Camadas Não-Destrutivo | `feature`, `camada-1-core`, `priority-medium` |
| 5 | Export Engine - Exportação de Imagens | `feature`, `camada-1-core`, `priority-medium` |
| 6 | History & Undo/Redo System | `feature`, `camada-1-core`, `priority-low` |
| 7 | Palette Extractor - Extração de Cores Dominantes | `feature`, `camada-2-color`, `priority-medium` |
| 8 | Tone Mapping - Controle de Shadows/Midtones/Highlights | `feature`, `camada-2-color`, `priority-medium` |
| 9 | HSL Adjustments - Controle de Hue/Saturation/Lightness | `feature`, `camada-2-color`, `priority-low` |
| 10 | LUT System - Lookup Tables para Color Grading | `feature`, `camada-2-color`, `priority-low` |

## 🏷️ Criar Labels Primeiro

Antes de criar as issues, crie os labels necessários:

### Via Script Python (recomendado)
O script `create_issues.py` já cria os labels automaticamente!

### Via GitHub CLI
```bash
# Camadas
gh label create "camada-1-core" --color "0052CC" --description "Layer 1: Core Engine"
gh label create "camada-2-color" --color "00AA00" --description "Layer 2: Color Flow Engine"

# Prioridades
gh label create "priority-high" --color "B60205" --description "High priority"
gh label create "priority-medium" --color "FFA500" --description "Medium priority"
gh label create "priority-low" --color "90EE90" --description "Low priority"

# Tipos
gh label create "feature" --color "84B6EB" --description "New feature"
gh label create "setup" --color "CCCCCC" --description "Project setup"
```

### Via Web
1. Vá para: https://github.com/GabrielaMoretti/VISIONFLOW/labels
2. Clique em "New label"
3. Preencha nome, cor e descrição
4. Repita para cada label

## ✅ Verificação

Após criar as issues, verifique:

- [ ] 10 issues criadas
- [ ] Labels atribuídos corretamente
- [ ] Issues numeradas sequencialmente
- [ ] Todas as issues estão abertas
- [ ] Conteúdo formatado corretamente (markdown)

## 📊 Próximos Passos

1. **Configurar Milestones** (opcional)
   ```bash
   gh api repos/GabrielaMoretti/VISIONFLOW/milestones \
     -f title="Camada 1: Core Engine" \
     -f description="Primeira camada de funcionalidades"
   ```

2. **Criar Project Board** (opcional)
   - Vá para: https://github.com/GabrielaMoretti/VISIONFLOW/projects
   - Clique em "New project"
   - Escolha template "Board"
   - Adicione as issues ao board

3. **Começar o Desenvolvimento**
   ```bash
   # Atribuir primeira issue para você
   gh issue edit 1 --add-assignee @me
   
   # Criar branch
   git checkout -b feature/issue-1-setup-project
   
   # Começar a desenvolver!
   ```

## 🆘 Problemas Comuns

### "GITHUB_TOKEN not set"
```bash
export GITHUB_TOKEN="seu_token_aqui"
```

### "Label already exists"
Normal se executar o script múltiplas vezes. Pode ignorar.

### "Permission denied"
Verifique se seu token tem permissão `repo`.

### Script não executa
```bash
chmod +x .github/create_issues.py
python3 .github/create_issues.py
```

## 📚 Documentação Completa

Para mais detalhes, consulte:

- [README.md](.github/README.md) - Documentação completa
- [WORKFLOW.md](.github/WORKFLOW.md) - Workflow de desenvolvimento
- [Issue Templates](.github/ISSUE_TEMPLATE/) - Templates para futuras issues

## 💡 Dicas

1. **Use o script automático** - É a opção mais rápida e confiável
2. **Crie labels primeiro** - Facilita a organização
3. **Configure milestones** - Ajuda a acompanhar progresso
4. **Use GitHub CLI** - Facilita a gestão de issues via terminal

## 🎯 Meta

Ao final deste guia, você terá:
- ✅ 10 issues estruturadas criadas
- ✅ Labels organizacionais configurados
- ✅ Base para começar o desenvolvimento da Camada 1

---

**Tempo estimado**: 5-30 minutos (dependendo da opção escolhida)

**Próximo passo**: Começar desenvolvimento com Issue #1!
