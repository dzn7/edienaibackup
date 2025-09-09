# Edienai Dashboard

Dashboard completo para visualização e análise dos dados do sistema Edienai Lanches, construído com Next.js, Material UI e Tailwind CSS.

## 🚀 Funcionalidades

- **Dashboard Interativo**: Visualização completa de métricas e KPIs
- **Múltiplas Abas**: Navegação entre diferentes coleções de dados
- **Gráficos Dinâmicos**: Charts.js para visualização de dados
- **Exportação de Dados**: Suporte para CSV e XLSX
- **Tema Dark**: Interface moderna com tema escuro
- **Filtros Avançados**: Busca e filtros em tempo real
- **Responsivo**: Funciona em desktop e mobile

## 📊 Coleções Suportadas

- **Pedidos**: Análise completa de vendas e pedidos
- **Crediários**: Controle de crediários e saldos
- **Produtos**: Catálogo de produtos e categorias
- **Usuários**: Gestão de usuários e permissões
- **Estoque**: Controle de estoque
- **Mesas**: Configuração de mesas
- **Despesas**: Controle financeiro

## 🛠️ Tecnologias

- **Next.js 15**: Framework React
- **TypeScript**: Tipagem estática
- **Material UI**: Componentes de interface
- **Tailwind CSS**: Estilização
- **Chart.js**: Gráficos e visualizações
- **Lucide React**: Ícones
- **XLSX**: Exportação para Excel

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Certifique-se de que os arquivos JSON estão na pasta `public/data/`:
   - crediarios.json
   - pedidos.json
   - produtos.json
   - estoque.json
   - mesas.json
   - users.json
   - expenses.json
   - realtime_orders.json
   - complementos_disponiveis.json

4. Execute o projeto:
```bash
npm run dev
```

5. Acesse `http://localhost:3000`

## 📁 Estrutura do Projeto

```
src/
├── app/                 # Páginas Next.js
├── components/          # Componentes React
│   ├── collections/     # Componentes específicos das coleções
│   ├── Chart.tsx        # Componente de gráficos
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── MetricsCard.tsx  # Cards de métricas
│   └── Tabs.tsx         # Sistema de abas
├── hooks/               # Hooks customizados
├── types/               # Definições TypeScript
└── utils/               # Utilitários
```

## 🎨 Características da Interface

- **Tema Dark**: Cores escuras para melhor experiência
- **Cards de Métricas**: KPIs principais em destaque
- **Gráficos Interativos**: Visualizações dinâmicas
- **Tabelas Responsivas**: DataGrid do Material UI
- **Filtros Inteligentes**: Busca em tempo real
- **Exportação Fácil**: Botões para CSV e XLSX

## 📈 Métricas Disponíveis

- Total de pedidos e vendas
- Status dos pedidos
- Crediários ativos e saldos
- Produtos por categoria
- Usuários por função
- Vendas por período

## 🔧 Personalização

O dashboard é totalmente customizável:

- Cores e temas no `tailwind.config.ts`
- Componentes reutilizáveis
- Tipos TypeScript bem definidos
- Hooks para gerenciamento de estado

## 📱 Responsividade

- Design mobile-first
- Breakpoints do Tailwind CSS
- Componentes adaptáveis
- Navegação otimizada para touch

## 🚀 Deploy

O projeto pode ser deployado em qualquer plataforma que suporte Next.js:

- Vercel (recomendado)
- Netlify
- AWS Amplify
- Railway

## 📄 Licença

Este projeto é privado e pertence ao sistema Edienai Lanches.