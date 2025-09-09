import { useState, useEffect } from 'react';
import { CollectionData } from '@/types';

export const useData = () => {
  const [data, setData] = useState<CollectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Carregar todos os arquivos JSON
        const [
          crediariosRes,
          pedidosRes,
          produtosRes,
          estoqueRes,
          mesasRes,
          usersRes,
          expensesRes,
          realtimeOrdersRes,
          complementosRes
        ] = await Promise.all([
          fetch('/data/crediarios.json'),
          fetch('/data/pedidos.json'),
          fetch('/data/produtos.json'),
          fetch('/data/estoque.json'),
          fetch('/data/mesas.json'),
          fetch('/data/users.json'),
          fetch('/data/expenses.json'),
          fetch('/data/realtime_orders.json'),
          fetch('/data/complementos_disponiveis.json')
        ]);

        const [
          crediarios,
          pedidos,
          produtos,
          estoque,
          mesas,
          users,
          expenses,
          realtime_orders,
          complementos_disponiveis
        ] = await Promise.all([
          crediariosRes.json(),
          pedidosRes.json(),
          produtosRes.json(),
          estoqueRes.json(),
          mesasRes.json(),
          usersRes.json(),
          expensesRes.json(),
          realtimeOrdersRes.json(),
          complementosRes.json()
        ]);

        setData({
          crediarios,
          pedidos,
          produtos,
          estoque,
          mesas,
          users,
          expenses,
          realtime_orders,
          complementos_disponiveis
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};
