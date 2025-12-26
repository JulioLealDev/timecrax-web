# Timecrax Web

Interface web desenvolvida em React + TypeScript para o sistema Timecrax - uma solução de controle de ponto e gerenciamento de tempo.

## Tecnologias

- React 19
- TypeScript
- Vite (bundler e dev server)
- React Router DOM para roteamento
- ESLint para linting

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd timecrax-web
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env` e ajuste conforme necessário
   - Configure a URL da API backend

## Como rodar

### Modo de desenvolvimento

Inicia o servidor de desenvolvimento com Hot Module Replacement (HMR):

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para produção

Compila e gera os arquivos otimizados para produção:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`

### Preview do build

Visualiza o build de produção localmente:

```bash
npm run preview
```

### Linting

Executa o ESLint para verificar problemas no código:

```bash
npm run lint
```

## Estrutura do Projeto

```
src/
├── assets/          # Imagens, ícones e outros recursos estáticos
├── components/      # Componentes React reutilizáveis
├── pages/           # Páginas/views da aplicação
├── services/        # Serviços para comunicação com API
├── routes/          # Configuração de rotas
├── styles/          # Arquivos de estilo globais
└── utils/           # Funções utilitárias
```

## Desenvolvimento

Este projeto usa:
- **Vite** para build rápido e HMR
- **TypeScript** para type safety
- **ESLint** para manter a qualidade do código

Para uma melhor experiência de desenvolvimento, recomendamos usar um editor com suporte a TypeScript, como VS Code.
