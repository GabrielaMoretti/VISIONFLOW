## 📝 Description

Configurar a estrutura inicial do projeto com Docker Compose, Frontend (Next.js) e Backend (FastAPI/Flask).

## 🎯 Acceptance Criteria

- [ ] `docker-compose.yml` funcional com 2 containers (frontend e backend)
- [ ] Frontend Next.js rodando em `http://localhost:3000`
- [ ] Backend FastAPI rodando em `http://localhost:5000`
- [ ] Hot reload funcionando em ambos os containers
- [ ] Comunicação básica entre frontend e backend (health check endpoint)

## ✅ Implementation Checklist

### Frontend
- [ ] Criar projeto Next.js com TypeScript
- [ ] Configurar Dockerfile para Node.js
- [ ] Configurar next.config.js
- [ ] Adicionar variáveis de ambiente (.env.local)

### Backend
- [ ] Criar projeto FastAPI
- [ ] Configurar Dockerfile para Python
- [ ] Criar requirements.txt com dependências base
- [ ] Implementar endpoint /health

### Docker
- [ ] Criar docker-compose.yml
- [ ] Configurar volumes para persistência
- [ ] Configurar network entre containers
- [ ] Adicionar .dockerignore

### Testing
- [ ] Testar comunicação entre containers
- [ ] Verificar hot reload funcionando
- [ ] Validar endpoints de health check

## 📚 Libraries/Dependencies

### Frontend
- Next.js 14+ (Framework React)
- TypeScript (Type safety)
- Axios ou Fetch API (HTTP client)

### Backend
- FastAPI (Framework Python)
- Uvicorn (ASGI server)
- Pydantic (Validation)

### DevOps
- Docker
- Docker Compose

## 🔗 Dependencies

Nenhuma dependência - Esta é a primeira issue do projeto

## 📊 Complexity Estimate

**Complexity**: Média (2-3 dias)

## 📌 Additional Context

Esta issue estabelece a fundação do projeto. Após completá-la, teremos:
- Ambiente de desenvolvimento containerizado
- Comunicação frontend-backend estabelecida
- Base para adicionar features nas próximas issues

### Estrutura de pastas esperada:
```
VISIONFLOW/
├── frontend/
│   ├── Dockerfile
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   ├── requirements.txt
│   └── app/
├── docker-compose.yml
└── README.md
```

### Health Check Endpoint Exemplo:
```python
# backend/main.py
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "visionflow-api"}
```
