import { useState, useEffect, useMemo } from 'react';
import { Crediario, Pedido } from '@/types';
import { 
  connectCrediariosToPedidos, 
  getConnectedPedidos, 
  getConnectionStats, 
  getAIInsights,
  AIConnection 
} from '@/utils/aiConnector';

interface UseAIConnectionsProps {
  crediarios: Crediario[];
  pedidos: Pedido[];
}

interface UseAIConnectionsReturn {
  connections: AIConnection[];
  isLoading: boolean;
  stats: {
    totalConnections: number;
    highConfidence: number;
    mediumConfidence: number;
    lowConfidence: number;
    averageConfidence: number;
  };
  insights: {
    insights: string[];
    recommendations: string[];
  };
  getConnectedPedidosForCrediario: (crediarioId: string) => Pedido[];
  refreshConnections: () => void;
}

export function useAIConnections({ crediarios, pedidos }: UseAIConnectionsProps): UseAIConnectionsReturn {
  const [connections, setConnections] = useState<AIConnection[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para processar conexões
  const processConnections = async () => {
    if (crediarios.length === 0 || pedidos.length === 0) {
      setConnections([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simular processamento assíncrono para não bloquear a UI
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newConnections = connectCrediariosToPedidos(crediarios, pedidos);
      setConnections(newConnections);
    } catch (error) {
      console.error('Erro ao processar conexões de IA:', error);
      setConnections([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Processar conexões quando os dados mudarem
  useEffect(() => {
    processConnections();
  }, [crediarios, pedidos]);

  // Estatísticas das conexões
  const stats = useMemo(() => {
    return getConnectionStats(connections);
  }, [connections]);

  // Insights de IA
  const insights = useMemo(() => {
    return getAIInsights(connections, crediarios, pedidos);
  }, [connections, crediarios, pedidos]);

  // Função para obter pedidos conectados a um crediário
  const getConnectedPedidosForCrediario = (crediarioId: string): Pedido[] => {
    return getConnectedPedidos(crediarioId, connections, pedidos);
  };

  // Função para atualizar conexões
  const refreshConnections = () => {
    processConnections();
  };

  return {
    connections,
    isLoading,
    stats,
    insights,
    getConnectedPedidosForCrediario,
    refreshConnections
  };
}
