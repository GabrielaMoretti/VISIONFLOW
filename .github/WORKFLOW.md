# VISIONFLOW Development Workflow

Este documento descreve o workflow completo de desenvolvimento do projeto VISIONFLOW, desde a seleção de uma issue até o merge do código.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Setup Inicial](#setup-inicial)
3. [Workflow de Desenvolvimento](#workflow-de-desenvolvimento)
4. [Convenções de Código](#convenções-de-código)
5. [Pull Request Guidelines](#pull-request-guidelines)
6. [Code Review Process](#code-review-process)

## 🎯 Visão Geral

O desenvolvimento do VISIONFLOW é organizado em **6 camadas**, cada uma com suas próprias issues:

```
Camada 1 (CORE ENGINE) → Camada 2 (COLOR FLOW) → Camada 3 (LENSES) → 
Camada 4 (IA) → Camada 5 (CAMPAIGN) → Camada 6 (UX)
```

**Prioridade atual**: Camada 1 (CORE ENGINE)

## 🚀 Setup Inicial

### 1. Clonar o Repositório

```bash
git clone https://github.com/GabrielaMoretti/VISIONFLOW.git
cd VISIONFLOW
```

### 2. Instalar GitHub CLI (opcional, mas recomendado)

```bash
# macOS
brew install gh

# Windows
winget install --id GitHub.cli

# Linux (Debian/Ubuntu)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### 3. Autenticar GitHub CLI

```bash
gh auth login
```

## 🔄 Workflow de Desenvolvimento

### Passo 1: Selecionar uma Issue

#### Opção A: Via GitHub Web
1. Vá para: https://github.com/GabrielaMoretti/VISIONFLOW/issues
2. Filtre por label (ex: `camada-1-core`)
3. Escolha uma issue disponível
4. Clique em "Assignees" → "assign yourself"

#### Opção B: Via GitHub CLI
```bash
# Listar issues da Camada 1
gh issue list --label "camada-1-core"

# Atribuir issue #5 para você
gh issue edit 5 --add-assignee @me
```

### Passo 2: Criar Branch de Trabalho

**Convenção de nomes de branches**:
```
feature/issue-{número}-{descrição-curta}
bugfix/issue-{número}-{descrição-curta}
refactor/issue-{número}-{descrição-curta}
```

**Exemplos**:
```bash
# Para Issue #1
git checkout -b feature/issue-1-setup-project

# Para Issue #4
git checkout -b feature/issue-4-layer-system

# Para um bugfix
git checkout -b bugfix/issue-12-canvas-zoom
```

### Passo 3: Desenvolver

#### Seguir o Checklist da Issue

Cada issue tem um checklist detalhado. Exemplo:

```markdown
### Frontend
- [ ] Criar componente ImageUploader
- [ ] Implementar drag & drop
- [ ] Adicionar preview

### Backend
- [ ] Endpoint POST /api/images/upload
- [ ] Extração de EXIF
```

**Marque os itens conforme você completa**:
```bash
# Editar a issue via web ou
gh issue edit 2 --body "$(cat updated-issue-body.md)"
```

#### Fazer Commits Granulares

**Convenção de mensagens de commit**:
```
[#{issue_number}] Descrição curta do commit

Descrição detalhada (opcional)
- Bullet points explicando mudanças
```

**Exemplos**:
```bash
git commit -m "[#1] Adicionar docker-compose.yml com frontend e backend"

git commit -m "[#2] Implementar componente ImageUploader

- Drag & drop funcional
- Preview de imagem
- Validação de formato"

git commit -m "[#4] Criar sistema de layers com Zustand

- Estado de layers
- Actions: add, remove, update
- Integração com Fabric.js"
```

#### Testar Continuamente

```bash
# Frontend (Next.js)
cd frontend
npm run dev
npm run test
npm run lint

# Backend (FastAPI)
cd backend
source venv/bin/activate
uvicorn main:app --reload
pytest
```

### Passo 4: Push e Pull Request

#### Push da Branch

```bash
git push origin feature/issue-1-setup-project
```

#### Criar Pull Request

**Opção A: Via GitHub CLI (recomendado)**
```bash
gh pr create \
  --title "[#1] Setup do Projeto - Frontend Next.js + Backend FastAPI" \
  --body "Closes #1

## Mudanças
- ✅ Docker Compose configurado
- ✅ Frontend Next.js funcionando
- ✅ Backend FastAPI funcionando
- ✅ Health check endpoint

## Como Testar
\`\`\`bash
docker-compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:5000/health
\`\`\`

## Screenshots
[anexar screenshots]
"
```

**Opção B: Via Web**
1. Vá para: https://github.com/GabrielaMoretti/VISIONFLOW/pulls
2. Clique em "New pull request"
3. Selecione sua branch
4. Preencha título e descrição
5. **Importante**: No corpo, adicione `Closes #1` para fechar a issue automaticamente

#### Template de Pull Request

```markdown
## Issue
Closes #{issue_number}

## Descrição
[Breve descrição das mudanças]

## Mudanças Principais
- [ ] Mudança 1
- [ ] Mudança 2
- [ ] Mudança 3

## Como Testar
\`\`\`bash
# Comandos para testar
\`\`\`

## Screenshots/Vídeos
[Se aplicável]

## Checklist
- [ ] Código testado localmente
- [ ] Testes passando
- [ ] Lint sem erros
- [ ] Documentação atualizada (se necessário)
- [ ] Issue referenciada com "Closes #X"
```

### Passo 5: Code Review

#### Responder a Comentários

```bash
# Ver comentários
gh pr view {PR_number} --comments

# Fazer alterações
git add .
git commit -m "[#1] Ajustes baseados no code review"
git push
```

#### Aprovar e Mergear

**Como revisor**:
```bash
# Revisar código
gh pr review {PR_number} --approve

# Ou solicitar mudanças
gh pr review {PR_number} --request-changes --body "Por favor, ajuste X"
```

**Como autor, após aprovação**:
```bash
# Mergear via CLI
gh pr merge {PR_number} --squash

# Ou mergear via web (botão "Merge pull request")
```

### Passo 6: Cleanup

```bash
# Voltar para main
git checkout main

# Atualizar main
git pull origin main

# Deletar branch local
git branch -d feature/issue-1-setup-project

# Deletar branch remota (se não foi deletada automaticamente)
git push origin --delete feature/issue-1-setup-project
```

## 📝 Convenções de Código

### TypeScript/JavaScript (Frontend)

```typescript
// Usar PascalCase para componentes
export function ImageUploader() { }

// Usar camelCase para funções e variáveis
const uploadImage = async () => { }

// Usar interfaces para tipos
interface Layer {
  id: string;
  name: string;
}

// Usar arrow functions
const handleClick = () => { }

// Preferir const sobre let
const layers = [];
```

### Python (Backend)

```python
# Usar snake_case para funções e variáveis
def extract_exif(image_path: str) -> dict:
    pass

# Usar PascalCase para classes
class ImageProcessor:
    pass

# Type hints obrigatórios
def process_image(
    file: UploadFile,
    quality: int = 85
) -> ProcessedImage:
    pass
```

### Estrutura de Pastas

```
frontend/
├── src/
│   ├── components/      # Componentes React
│   ├── pages/          # Páginas Next.js
│   ├── store/          # Estado (Zustand/Redux)
│   ├── utils/          # Utilitários
│   └── types/          # TypeScript types

backend/
├── app/
│   ├── api/            # Endpoints
│   ├── core/           # Processamento de imagem
│   ├── models/         # Modelos de dados
│   └── utils/          # Utilitários
```

## 🔍 Pull Request Guidelines

### Título do PR

```
[#{issue}] Descrição concisa
```

Exemplos:
- `[#1] Setup do Projeto - Frontend Next.js + Backend FastAPI`
- `[#4] Implementar sistema de layers com drag & drop`
- `[#7] Adicionar extração de paleta de cores com K-Means`

### Descrição do PR

- Referenciar a issue: `Closes #X`
- Descrever mudanças principais
- Incluir instruções de teste
- Adicionar screenshots para mudanças visuais

### Tamanho do PR

- **Ideal**: 200-500 linhas
- **Máximo**: 1000 linhas
- Se maior, considere dividir em múltiplos PRs

### Quando Fazer Merge

- ✅ Todos os testes passando
- ✅ Lint sem erros
- ✅ Aprovado por pelo menos 1 revisor
- ✅ Conflitos resolvidos
- ✅ Issue referenciada

## 👥 Code Review Process

### Como Revisor

#### O que revisar:

1. **Funcionalidade**: O código faz o que deveria?
2. **Testes**: Há testes adequados?
3. **Performance**: Há problemas de performance?
4. **Segurança**: Há vulnerabilidades?
5. **Legibilidade**: O código é fácil de entender?
6. **Padrões**: Segue as convenções do projeto?

#### Como comentar:

```markdown
# Sugestão
💡 Sugestão: Considere usar `useMemo` aqui para evitar recálculos

# Questão
❓ Por que você escolheu esta abordagem em vez de X?

# Problema
⚠️ Isso pode causar memory leak. Considere usar `useEffect` cleanup

# Aprovação
✅ LGTM! (Looks Good To Me)
```

### Como Autor

- Responda a todos os comentários
- Faça commits adicionais para correções
- Agradeça feedback construtivo
- Marque conversas como "Resolved" após correção

## 📊 Workflow Visual

```
┌─────────────────┐
│ Selecionar Issue│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Criar Branch   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Desenvolver     │◄───┐
│ + Commits       │    │
└────────┬────────┘    │
         │             │
         ▼             │
┌─────────────────┐    │
│ Testar          │    │
└────────┬────────┘    │
         │             │
         ▼             │
    ┌─────────┐        │
    │ OK?     │────Não─┘
    └────┬────┘
         │ Sim
         ▼
┌─────────────────┐
│ Push + PR       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Code Review    │◄───┐
└────────┬────────┘    │
         │             │
         ▼             │
    ┌─────────┐        │
    │Aprovado?│────Não─┘
    └────┬────┘
         │ Sim
         ▼
┌─────────────────┐
│     Merge       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Issue Fechada   │
└─────────────────┘
```

## 🎓 Recursos

- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Code Review Best Practices](https://google.github.io/eng-practices/review/)
- [GitHub CLI Manual](https://cli.github.com/manual/)

---

**Última atualização**: Outubro 2024
**Mantido por**: Equipe VISIONFLOW
