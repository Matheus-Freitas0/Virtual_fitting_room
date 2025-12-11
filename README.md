# Virtual Fitting Room - Visualiza AI

Sistema de provador virtual que utiliza inteligência artificial para gerar imagens fotorrealistas combinando fotos de pessoas com roupas.

## 🚀 Tecnologias

- **React 19** - Framework frontend
- **Material-UI (MUI)** - Componentes de interface
- **Vite** - Build tool e dev server
- **Axios** - Cliente HTTP
- **React Router** - Roteamento
- **Google Gemini API** - Geração de imagens com IA

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Chave de API do Google Gemini (gratuita no Google AI Studio)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd Virtual_fitting_room
```

2. Instale as dependências:
```bash
npm install
```

3. Configure a chave da API:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione sua chave:
   ```
   VITE_GEMINI_API_KEY=sua_chave_aqui
   ```
   - Obtenha sua chave em: https://ai.google.dev/

4. Execute o projeto:
```bash
npm run dev
```

## 📖 Como Usar a API Gratuitamente

Consulte o guia completo em [GEMINI_API_FREE_TIER.md](./GEMINI_API_FREE_TIER.md) para:
- Configuração da API gratuita
- Limites do free tier
- Estratégias para economizar quota
- Solução de problemas comuns

## 🎯 Funcionalidades

- ✅ Upload de imagens (drag-and-drop ou click)
- ✅ Preview das imagens antes da geração
- ✅ Descrição de estilo opcional
- ✅ Sugestões automáticas de estilo
- ✅ Geração de prova virtual com IA
- ✅ Download da imagem gerada
- ✅ Contador visual de tempo de espera (quando há quota)
- ✅ Tratamento inteligente de erros
- ✅ Interface responsiva (mobile e desktop)

## 📁 Estrutura do Projeto

```
src/
├── client/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── ImageDropzone.jsx
│   │   └── ResultDisplay.jsx
│   ├── pages/          # Páginas da aplicação
│   │   └── VisualizaTryOn.jsx
│   ├── service/        # Serviços de API
│   │   └── tryOnService.js
│   └── utils/          # Utilitários
│       └── imageUtils.js
├── theme/              # Tema MUI
│   └── index.js
├── App.jsx             # Componente principal com rotas
└── main.jsx            # Entry point
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## 📝 Notas Importantes

- O free tier do Google AI Studio tem limites (60 req/min, 300k tokens/dia)
- Alguns modelos de geração de imagens podem ter limites mais restritivos
- O sistema tenta automaticamente modelos alternativos quando um falha
- Aguarde o tempo de retry quando receber erro de quota

## 📚 Documentação

- [Guia do Free Tier](./GEMINI_API_FREE_TIER.md)
- [Documentação Gemini API](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://aistudio.google.com/)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.
