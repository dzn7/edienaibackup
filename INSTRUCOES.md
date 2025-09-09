# 🚀 Instruções de Uso - Firestore Dashboard

## 📋 Pré-requisitos

- Node.js 18+ instalado
- NPM ou Yarn
- Arquivos JSON do backup do Firestore na pasta `public/data/`

## 🛠️ Instalação e Execução

### 1. Instalar Dependências
```bash
npm install
```

### 2. Verificar Arquivos de Dados
Certifique-se de que os seguintes arquivos estão na pasta `public/data/`:
- ✅ crediarios.json
- ✅ pedidos.json
- ✅ produtos.json
- ✅ estoque.json
- ✅ mesas.json
- ✅ users.json
- ✅ expenses.json
- ✅ realtime_orders.json
- ✅ complementos_disponiveis.json

### 3. Executar o Projeto
```bash
npm run dev
```

### 4. Acessar o Dashboard
Abra seu navegador e acesse: `http://localhost:3000`

## 🎯 Funcionalidades Principais

### 📊 Visão Geral (Overview)
- **Métricas Principais**: Total de pedidos, vendas, crediários ativos
- **Gráficos Interativos**: 
  - Vendas por status (gráfico de pizza)
  - Produtos por categoria (gráfico de barras)
  - Vendas dos últimos 6 meses (gráfico de linha)

### 🛒 Aba Pedidos
- **Filtros**: Busca por cliente ou ID do pedido
- **Filtro por Status**: Todos, pendente, concluído, cancelado
- **Exportação**: CSV e XLSX
- **Colunas**: ID, Cliente, Status, Total, Itens, Data, Mesa, Pagamento

### 💳 Aba Crediários
- **Filtros**: Busca por cliente, status (ativo/inativo)
- **Cálculos Automáticos**: Saldo atual, total consumido, total pago
- **Exportação**: CSV e XLSX
- **Colunas**: Cliente, Status, Saldo, Consumo, Pagamentos, Transações

### 📦 Aba Produtos
- **Filtros**: Busca por nome/descrição, categoria
- **Status**: Disponível/Indisponível
- **Exportação**: CSV e XLSX
- **Colunas**: Nome, Categoria, Preço, Status, Descrição

### 👥 Aba Usuários
- **Filtros**: Busca por nome/email, função
- **Funções**: Admin, Owner, Waiter, User
- **Exportação**: CSV e XLSX
- **Colunas**: Nome, Email, Função, Status, Data de Criação

## 🎨 Características da Interface

### 🌙 Tema Dark
- Cores escuras para melhor experiência visual
- Contraste otimizado para leitura
- Scrollbar customizada

### 📱 Responsivo
- Funciona em desktop, tablet e mobile
- Layout adaptável
- Componentes otimizados para touch

### ⚡ Performance
- Carregamento otimizado
- Lazy loading de componentes
- Compressão de assets

## 📤 Exportação de Dados

### CSV
- Formato compatível com Excel
- Codificação UTF-8
- Separação por vírgulas

### XLSX
- Formato Excel nativo
- Múltiplas abas
- Formatação preservada

## 🔧 Personalização

### Cores
Edite `tailwind.config.ts` para alterar o esquema de cores:
```typescript
colors: {
  primary: { /* suas cores */ },
  dark: { /* suas cores escuras */ }
}
```

### Componentes
Todos os componentes estão em `src/components/` e podem ser modificados.

### Tipos
Definições TypeScript em `src/types/index.ts`.

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente se necessário
3. Deploy automático

### Build Local
```bash
npm run build
npm start
```

## 🐛 Solução de Problemas

### Erro: "Erro ao carregar dados"
- Verifique se os arquivos JSON estão em `public/data/`
- Confirme que os arquivos não estão corrompidos
- Verifique o console do navegador para mais detalhes

### Erro: "Module not found"
- Execute `npm install` novamente
- Verifique se todas as dependências estão instaladas

### Performance Lenta
- Use filtros para reduzir a quantidade de dados exibidos
- Considere paginar os resultados
- Verifique o tamanho dos arquivos JSON

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique este arquivo de instruções
2. Consulte o README.md
3. Verifique o console do navegador para erros
4. Entre em contato com o desenvolvedor

## 🎉 Pronto!

Seu dashboard está funcionando! Explore todas as funcionalidades e aproveite a análise completa dos seus dados do Firestore.
