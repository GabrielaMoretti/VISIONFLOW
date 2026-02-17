# Guia de Contribuição - VISIONFLOW

Obrigado por considerar contribuir com o VISIONFLOW! Este documento fornece diretrizes para facilitar o processo de contribuição.

---

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Setup do Ambiente de Desenvolvimento](#setup-do-ambiente-de-desenvolvimento)
- [Workflow de Git](#workflow-de-git)
- [Padrões de Código](#padrões-de-código)
- [Testando Localmente](#testando-localmente)
- [Submetendo Mudanças](#submetendo-mudanças)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Features](#sugerindo-features)

---

## 📜 Código de Conduta

Este projeto e todos que participam dele são regidos por um código de conduta básico:

- **Seja respeitoso**: Trate todos com respeito e consideração
- **Seja colaborativo**: Estamos construindo juntos
- **Seja construtivo**: Forneça feedback útil e específico
- **Seja paciente**: Nem todos têm o mesmo nível de experiência

Esperamos que todos os contribuidores sigam essas diretrizes.

---

## 🤝 Como Posso Contribuir?

Existem várias formas de contribuir:

### 1. Reportar Bugs
- Use a [issue template de bug](https://github.com/GabrielaMoretti/VISIONFLOW/issues/new?template=bug_report.md)
- Descreva o problema claramente
- Inclua passos para reproduzir
- Adicione screenshots se aplicável

### 2. Sugerir Features
- Use a [issue template de feature](https://github.com/GabrielaMoretti/VISIONFLOW/issues/new?template=feature_request.md)
- Explique o caso de uso
- Descreva a solução desejada
- Considere alternativas

### 3. Melhorar Documentação
- Corrigir typos
- Adicionar exemplos
- Clarificar instruções
- Traduzir documentação

### 4. Contribuir Código
- Implementar features
- Corrigir bugs
- Melhorar performance
- Adicionar testes

---

## 🛠️ Setup do Ambiente de Desenvolvimento

### Pré-requisitos

- **Docker** 24.0+ e **Docker Compose** 2.20+
- **Git** 2.30+
- **(Opcional) Node.js** 20+ para executar testes localmente
- **(Opcional) Python** 3.11+ para executar backend localmente

### Instalação

1. **Fork do Repositório**
   ```bash
   # Vá para https://github.com/GabrielaMoretti/VISIONFLOW
   # Click "Fork" no canto superior direito
   ```

2. **Clonar seu Fork**
   ```bash
   git clone https://github.com/SEU-USERNAME/VISIONFLOW.git
   cd VISIONFLOW
   ```

3. **Adicionar Upstream Remote**
   ```bash
   git remote add upstream https://github.com/GabrielaMoretti/VISIONFLOW.git
   ```

4. **Configurar Ambiente**
   ```bash
   # Copiar exemplo de .env
   cp .env.example .env
   
   # Editar .env com suas configurações (se necessário)
   nano .env
   ```

5. **Iniciar Containers Docker**
   ```bash
   docker compose up --build
   ```

6. **Verificar Instalação**
   ```bash
   # Frontend deve estar rodando em http://localhost:3000
   # Backend deve estar rodando em http://localhost:8000
   # API docs em http://localhost:8000/docs
   ```

### Estrutura de Pastas

Familiarize-se com a estrutura:

```
visionflow/
├── frontend/          # Código Next.js/React
├── backend/           # Código Python/FastAPI
├── docs/              # Documentação
├── docker-compose.yml # Configuração Docker
└── volumes/           # Dados persistentes (gitignored)
```

Veja [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) para detalhes completos.

---

## 🔄 Workflow de Git

### Branches

Usamos o modelo de branches:

- `main` - Branch principal (production-ready)
- `develop` - Branch de desenvolvimento (integration)
- `feature/*` - Branches de features
- `bugfix/*` - Branches de correção de bugs
- `hotfix/*` - Branches de correções urgentes

### Criando uma Feature Branch

```bash
# Atualizar develop
git checkout develop
git pull upstream develop

# Criar feature branch
git checkout -b feature/nome-da-feature

# Ou para bugfix
git checkout -b bugfix/nome-do-bug
```

### Fazendo Commits

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo>): <descrição curta>

<descrição longa (opcional)>

<footer (opcional)>
```

**Tipos:**
- `feat`: Nova feature
- `fix`: Correção de bug
- `docs`: Mudanças em documentação
- `style`: Formatação, ponto e vírgula, etc. (sem mudança de código)
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adição/correção de testes
- `chore`: Mudanças em build, CI, etc.

**Exemplos:**

```bash
git commit -m "feat(canvas): adicionar zoom com mouse wheel"
git commit -m "fix(backend): corrigir upload de imagens >10MB"
git commit -m "docs(readme): atualizar instruções de instalação"
```

### Mantendo Branch Atualizado

```bash
# Atualizar seu fork com upstream
git fetch upstream
git checkout develop
git merge upstream/develop

# Rebase sua feature branch (opcional mas recomendado)
git checkout feature/nome-da-feature
git rebase develop
```

---

## 📝 Padrões de Código

### Frontend (TypeScript/React)

#### Estilo de Código
- Usar **TypeScript** para todo código novo
- Seguir [Airbnb Style Guide](https://github.com/airbnb/javascript)
- Usar **ESLint** e **Prettier** (configurados no projeto)

```bash
# Executar linter
docker compose exec frontend npm run lint

# Formatar código
docker compose exec frontend npm run format
```

#### Componentes React
```typescript
// Preferir functional components com hooks
import React, { useState, useEffect } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  disabled = false 
}) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className="btn-primary"
    >
      {label}
    </button>
  );
};
```

#### Nomenclatura
- Componentes: `PascalCase` (ex: `ColorPicker.tsx`)
- Funções/variáveis: `camelCase` (ex: `handleClick`)
- Constantes: `UPPER_SNAKE_CASE` (ex: `MAX_FILE_SIZE`)
- Arquivos de tipos: `*.types.ts`

### Backend (Python/FastAPI)

#### Estilo de Código
- Seguir [PEP 8](https://peps.python.org/pep-0008/)
- Usar **type hints** sempre que possível
- Usar **Black** para formatação
- Usar **Ruff** para linting

```bash
# Formatar código
docker compose exec backend black .

# Linting
docker compose exec backend ruff check .
```

#### Estrutura de Endpoints
```python
from fastapi import APIRouter, UploadFile, HTTPException
from typing import List

from schemas.upload import UploadResponse
from services.upload_service import upload_image

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_endpoint(
    file: UploadFile,
    project_id: str
) -> UploadResponse:
    """
    Upload de imagem para projeto.
    
    Args:
        file: Arquivo de imagem
        project_id: ID do projeto
        
    Returns:
        UploadResponse com URL e metadata
        
    Raises:
        HTTPException: Se arquivo inválido ou projeto não existe
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "Arquivo deve ser uma imagem")
    
    result = await upload_image(file, project_id)
    return result
```

#### Nomenclatura
- Funções/variáveis: `snake_case` (ex: `process_image`)
- Classes: `PascalCase` (ex: `ImageProcessor`)
- Constantes: `UPPER_SNAKE_CASE` (ex: `MAX_IMAGE_SIZE`)
- Arquivos: `snake_case.py`

### Documentação de Código

#### TypeScript/JavaScript
```typescript
/**
 * Extrai paleta de cores dominantes da imagem usando K-Means
 * 
 * @param imageData - ImageData do canvas
 * @param numColors - Número de cores a extrair (default: 5)
 * @returns Array de cores em formato hex
 * 
 * @example
 * const palette = extractPalette(imageData, 5);
 * // Returns: ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#F9F7F7']
 */
export function extractPalette(
  imageData: ImageData, 
  numColors: number = 5
): string[] {
  // Implementation
}
```

#### Python
```python
def extract_palette(image: np.ndarray, num_colors: int = 5) -> List[str]:
    """
    Extrai paleta de cores dominantes usando K-Means clustering.
    
    Args:
        image: Imagem em formato numpy array (RGB)
        num_colors: Número de cores a extrair (default: 5)
        
    Returns:
        Lista de cores em formato hex
        
    Example:
        >>> image = cv2.imread('photo.jpg')
        >>> palette = extract_palette(image, 5)
        >>> print(palette)
        ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#F9F7F7']
    """
    # Implementation
```

---

## 🧪 Testando Localmente

### Frontend Tests

```bash
# Executar todos os testes
docker compose exec frontend npm test

# Executar com coverage
docker compose exec frontend npm run test:coverage

# Executar testes específicos
docker compose exec frontend npm test -- ColorPicker.test.tsx
```

#### Escrevendo Testes (Jest + React Testing Library)

```typescript
// ColorPicker.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ColorPicker } from './ColorPicker';

describe('ColorPicker', () => {
  it('should render color picker', () => {
    render(<ColorPicker onChange={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call onChange when color selected', () => {
    const handleChange = jest.fn();
    render(<ColorPicker onChange={handleChange} />);
    
    const colorButton = screen.getByRole('button');
    fireEvent.click(colorButton);
    
    expect(handleChange).toHaveBeenCalled();
  });
});
```

### Backend Tests

```bash
# Executar todos os testes
docker compose exec backend pytest

# Executar com coverage
docker compose exec backend pytest --cov=.

# Executar testes específicos
docker compose exec backend pytest tests/unit/test_color_flow.py
```

#### Escrevendo Testes (pytest)

```python
# test_color_flow.py
import pytest
import numpy as np
from processing.color_flow import extract_palette

def test_extract_palette_returns_correct_number_of_colors():
    """Testa se extração retorna número correto de cores"""
    # Arrange
    image = np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)
    num_colors = 5
    
    # Act
    palette = extract_palette(image, num_colors)
    
    # Assert
    assert len(palette) == num_colors
    assert all(color.startswith('#') for color in palette)

def test_extract_palette_with_invalid_image_raises_error():
    """Testa se função levanta erro com imagem inválida"""
    with pytest.raises(ValueError):
        extract_palette(None, 5)
```

### Testes de Integração

```bash
# Frontend: Testes E2E com Playwright (opcional)
docker compose exec frontend npm run test:e2e

# Backend: Testes de API
docker compose exec backend pytest tests/integration/
```

---

## 📤 Submetendo Mudanças

### Checklist Pré-Submissão

Antes de criar um Pull Request, certifique-se de:

- [ ] Código segue os padrões de estilo
- [ ] Testes passam (frontend + backend)
- [ ] Novos testes adicionados (se aplicável)
- [ ] Documentação atualizada (se aplicável)
- [ ] Commits seguem Conventional Commits
- [ ] Branch está atualizado com `develop`

### Criando Pull Request

1. **Push sua branch**
   ```bash
   git push origin feature/nome-da-feature
   ```

2. **Criar PR no GitHub**
   - Vá para seu fork no GitHub
   - Click "Compare & pull request"
   - Base: `GabrielaMoretti/VISIONFLOW` `develop`
   - Compare: `SEU-USERNAME/VISIONFLOW` `feature/nome-da-feature`

3. **Preencher Template de PR**
   ```markdown
   ## Descrição
   Breve descrição do que foi mudado
   
   ## Tipo de Mudança
   - [ ] Bug fix
   - [ ] Nova feature
   - [ ] Breaking change
   - [ ] Documentação
   
   ## Como Testar
   1. Passo 1
   2. Passo 2
   3. Passo 3
   
   ## Screenshots (se aplicável)
   [Adicionar screenshots]
   
   ## Checklist
   - [ ] Testes passam
   - [ ] Código linted
   - [ ] Documentação atualizada
   ```

4. **Aguardar Review**
   - Mantenedor revisará seu PR
   - Responda aos comentários
   - Faça ajustes se necessário

5. **Merge**
   - PR será merged após aprovação
   - Branch será deletada automaticamente

---

## 🐛 Reportando Bugs

### Antes de Reportar

1. **Procure issues existentes**: Seu bug pode já estar reportado
2. **Use versão mais recente**: Atualize para `develop` e teste novamente
3. **Verifique documentação**: Pode ser comportamento esperado

### Template de Bug Report

```markdown
## Descrição do Bug
Descrição clara e concisa do bug

## Passos para Reproduzir
1. Vá para '...'
2. Click em '...'
3. Scroll até '...'
4. Veja o erro

## Comportamento Esperado
Descrição do que deveria acontecer

## Comportamento Atual
Descrição do que acontece

## Screenshots
Adicione screenshots se aplicável

## Ambiente
- OS: [ex: Ubuntu 22.04]
- Docker version: [ex: 24.0.0]
- Browser (se aplicável): [ex: Chrome 120]

## Logs
```
Cole logs relevantes aqui
```

## Informações Adicionais
Qualquer outra informação relevante
```

---

## 💡 Sugerindo Features

### Antes de Sugerir

1. **Procure issues existentes**: Sua feature pode já estar sugerida
2. **Verifique roadmap**: Pode estar planejada em [ROADMAP.md](./docs/ROADMAP.md)
3. **Considere escopo**: Feature se alinha com objetivos do projeto?

### Template de Feature Request

```markdown
## Problema a Resolver
Descrição clara do problema que esta feature resolve

## Solução Proposta
Descrição clara da solução desejada

## Alternativas Consideradas
Outras soluções que você considerou

## Contexto Adicional
Screenshots, mockups, exemplos de outros apps, etc.

## Impacto Estimado
- Usuários beneficiados: [poucos/muitos]
- Complexidade de implementação: [baixa/média/alta]
- Prioridade sugerida: [baixa/média/alta]
```

---

## 🎓 Recursos Adicionais

### Documentação do Projeto
- [ROADMAP.md](./docs/ROADMAP.md) - Planejamento de desenvolvimento
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitetura do sistema
- [DOCKER_SETUP.md](./docs/DOCKER_SETUP.md) - Setup Docker
- [PROJECT_STRUCTURE.md](./docs/PROJECT_STRUCTURE.md) - Estrutura de código

### Recursos Externos
- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Docker Docs](https://docs.docker.com/)
- [Fabric.js Docs](http://fabricjs.com/docs/)
- [OpenCV Docs](https://docs.opencv.org/)

---

## 📞 Obtendo Ajuda

Se precisar de ajuda:

1. **Documentação**: Consulte os docs em `/docs`
2. **Issues**: Procure issues similares
3. **Discussions**: Use [GitHub Discussions](https://github.com/GabrielaMoretti/VISIONFLOW/discussions)
4. **Discord** (futuro): Comunidade VISIONFLOW

---

## 🙏 Agradecimentos

Obrigado por contribuir com VISIONFLOW! Toda contribuição, por menor que seja, é valiosa e apreciada.

**Lista de Contribuidores**: [CONTRIBUTORS.md](./CONTRIBUTORS.md) (futuro)

---

**Happy Coding! 🚀**
