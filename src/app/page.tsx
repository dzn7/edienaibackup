'use client';

import { Dashboard } from '@/components/Dashboard';
import { useData } from '@/hooks/useData';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { data, loading, error } = useData();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erro ao carregar dados: {error}</p>
          <p className="text-gray-400">Verifique se os arquivos JSON estão na pasta /public/data/</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Nenhum dado encontrado</p>
        </div>
      </div>
    );
  }

  return <Dashboard data={data} />;
}