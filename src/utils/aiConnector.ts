import { Crediario, Pedido } from '@/types';


export interface AIConnection {
  crediarioId: string;
  pedidoIds: string[];
  confidence: number;
  matchDetails: {
    nameMatch: number;
    valueMatch: number;
    dateMatch: number;
  };
}

// Função para calcular similaridade entre strings (algoritmo de Levenshtein)
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  if (s1.length === 0 || s2.length === 0) return 0.0;
  
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= s2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  const maxLength = Math.max(s1.length, s2.length);
  return maxLength === 0 ? 1.0 : (maxLength - matrix[s2.length][s1.length]) / maxLength;
}

// Função para normalizar nomes (remover acentos, espaços extras, etc.)
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '');
}

// Função para calcular similaridade de valor
function calculateValueSimilarity(crediarioValue: number, pedidoValue: number): number {
  if (crediarioValue === 0 && pedidoValue === 0) return 1.0;
  if (crediarioValue === 0 || pedidoValue === 0) return 0.0;
  
  const diff = Math.abs(crediarioValue - pedidoValue);
  const maxValue = Math.max(crediarioValue, pedidoValue);
  const similarity = 1 - (diff / maxValue);
  
  return Math.max(0, similarity);
}

// Tipagem para Timestamps vindos do Firestore serializados, ou valores comuns
type FirestoreTimestamp = { _seconds: number; _nanoseconds: number } | string | number | Date;

function toMillis(input: FirestoreTimestamp): number {
  if (typeof input === 'number') return input;
  if (typeof input === 'string') return new Date(input).getTime();
  if (input instanceof Date) return input.getTime();
  // Firestore-like object
  return input._seconds * 1000;
}

// Função para calcular similaridade de data
function calculateDateSimilarity(crediarioDate: FirestoreTimestamp, pedidoDate: FirestoreTimestamp): number {
  try {
    const crediarioTime = toMillis(crediarioDate);
    const pedidoTime = toMillis(pedidoDate);
    
    const diffDays = Math.abs(crediarioTime - pedidoTime) / (1000 * 60 * 60 * 24);
    
    // Se a diferença for menor que 7 dias, considera uma boa correspondência
    if (diffDays <= 7) return 1.0;
    if (diffDays <= 30) return 0.8;
    if (diffDays <= 90) return 0.6;
    if (diffDays <= 180) return 0.4;
    
    return 0.2;
  } catch {
    return 0.0;
  }
}

// Função principal de IA para conectar crediários aos pedidos
export function connectCrediariosToPedidos(crediarios: Crediario[], pedidos: Pedido[]): AIConnection[] {
  const connections: AIConnection[] = [];
  
  for (const crediario of crediarios) {
    const crediarioName = normalizeName(crediario.data.customerName);
    // Aproximação do valor do crediário: somar lançamentos de consumo no histórico
    const crediarioValue = Array.isArray(crediario.subcollections?.history)
      ? crediario.subcollections.history
          .filter((h) => h?.data?.type === 'consumption')
          .reduce((sum, h) => sum + (typeof h.data.amount === 'number' ? h.data.amount : 0), 0)
      : 0;
    const crediarioDate = crediario.data.createdAt;
    
    const potentialMatches: { pedido: Pedido; score: number; details: { nameMatch: number; valueMatch: number; dateMatch: number } }[] = [];
    
    for (const pedido of pedidos) {
      const pedidoName = normalizeName(pedido.data.customerName);
      const pedidoValue = (typeof pedido.data.total === 'number' ? pedido.data.total : undefined) ??
        (typeof pedido.data.totalAmount === 'number' ? pedido.data.totalAmount : 0);
      const pedidoDate = pedido.data.sentAt;
      
      // Calcular similaridades
      const nameSimilarity = calculateStringSimilarity(crediarioName, pedidoName);
      const valueSimilarity = calculateValueSimilarity(crediarioValue, pedidoValue);
      const dateSimilarity = calculateDateSimilarity(crediarioDate, pedidoDate);
      
      // Score combinado (pesos: nome 50%, valor 30%, data 20%)
      const combinedScore = (nameSimilarity * 0.5) + (valueSimilarity * 0.3) + (dateSimilarity * 0.2);
      
      // Só considera matches com score mínimo de 0.6
      if (combinedScore >= 0.6) {
        potentialMatches.push({
          pedido,
          score: combinedScore,
          details: {
            nameMatch: nameSimilarity,
            valueMatch: valueSimilarity,
            dateMatch: dateSimilarity
          }
        });
      }
    }
    
    // Ordenar por score e pegar os melhores matches
    potentialMatches.sort((a, b) => b.score - a.score);
    
    // Pegar até 5 melhores matches
    const bestMatches = potentialMatches.slice(0, 5);
    
    if (bestMatches.length > 0) {
      connections.push({
        crediarioId: crediario.id,
        pedidoIds: bestMatches.map(match => match.pedido.id),
        confidence: bestMatches[0].score,
        matchDetails: bestMatches[0].details
      });
    }
  }
  
  return connections;
}

// Função para obter pedidos conectados a um crediário
export function getConnectedPedidos(crediarioId: string, connections: AIConnection[], pedidos: Pedido[]): Pedido[] {
  const connection = connections.find(c => c.crediarioId === crediarioId);
  if (!connection) return [];
  
  return pedidos.filter(pedido => connection.pedidoIds.includes(pedido.id));
}

// Função para obter crediários conectados a um pedido
export function getConnectedCrediarios(pedidoId: string, connections: AIConnection[], crediarios: Crediario[]): Crediario[] {
  const connection = connections.find(c => c.pedidoIds.includes(pedidoId));
  if (!connection) return [];
  
  return crediarios.filter(crediario => crediario.id === connection.crediarioId);
}

// Função para obter estatísticas de conexões
export function getConnectionStats(connections: AIConnection[]): {
  totalConnections: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  averageConfidence: number;
} {
  const totalConnections = connections.length;
  const highConfidence = connections.filter(c => c.confidence >= 0.8).length;
  const mediumConfidence = connections.filter(c => c.confidence >= 0.6 && c.confidence < 0.8).length;
  const lowConfidence = connections.filter(c => c.confidence < 0.6).length;
  const averageConfidence = totalConnections > 0 ? connections.reduce((sum, c) => sum + c.confidence, 0) / totalConnections : 0;
  
  return {
    totalConnections,
    highConfidence,
    mediumConfidence,
    lowConfidence,
    averageConfidence: Math.round(averageConfidence * 100) / 100
  };
}

// Função para obter insights de IA
export function getAIInsights(connections: AIConnection[], crediarios: Crediario[]): {
  insights: string[];
  recommendations: string[];
} {
  const insights: string[] = [];
  const recommendations: string[] = [];
  
  const stats = getConnectionStats(connections);
  
  // Insights baseados nas conexões
  if (stats.totalConnections > 0) {
    insights.push(`✅ ${stats.totalConnections} crediários conectados automaticamente aos pedidos`);
    insights.push(`🎯 ${stats.highConfidence} conexões de alta confiança (≥80%)`);
    insights.push(`📊 Confiança média: ${(stats.averageConfidence * 100).toFixed(1)}%`);
  }
  
  // Análise de padrões
  const crediariosSemConexao = crediarios.filter(c => !connections.find(conn => conn.crediarioId === c.id));
  if (crediariosSemConexao.length > 0) {
    insights.push(`⚠️ ${crediariosSemConexao.length} crediários sem conexão automática`);
  }
  
  // Recomendações
  if (stats.lowConfidence > 0) {
    recommendations.push(`🔍 Revisar ${stats.lowConfidence} conexões de baixa confiança`);
  }
  
  if (crediariosSemConexao.length > 0) {
    recommendations.push(`📝 Verificar manualmente crediários sem conexão`);
  }
  
  if (stats.averageConfidence < 0.7) {
    recommendations.push(`⚙️ Considerar ajustar critérios de matching`);
  }
  
  return { insights, recommendations };
}
