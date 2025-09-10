
'use client';

import { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  CreditCard, 
  Package, 
  Users, 
  TrendingUp, 
  DollarSign,
  BarChart3
} from 'lucide-react';
import { MetricsCard } from './MetricsCard';
import { Chart } from './Chart';
import { Tabs } from './Tabs';
import { PedidosTab } from './collections/PedidosTab';
import { CrediariosTab } from './collections/CrediariosTab';
import { ProdutosTab } from './collections/ProdutosTab';
import { UsuariosTab } from './collections/UsuariosTab';
import { CollectionData } from '@/types';
import { formatCurrency } from '@/utils/export';

interface DashboardProps {
  data: CollectionData;
}

export const Dashboard = ({ data }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Cálculos de métricas
  const metrics = useMemo(() => {
    const totalPedidos = data.pedidos.length;
    const totalCrediarios = data.crediarios.length;
    const totalProdutos = data.produtos.length;
    const totalUsuarios = data.users.length;

    // Calcular vendas válidas (excluindo cancelados e não pagos)
    const pedidosValidos = data.pedidos.filter(pedido => {
      const status = pedido.data.status?.toLowerCase();
      return status !== 'cancelado' && status !== 'nao pago' && status !== 'não pago';
    });

    const totalVendas = pedidosValidos.reduce((sum, pedido) => {
      const amount = pedido.data.total || pedido.data.totalAmount;
      if (typeof amount === 'number' && !isNaN(amount) && amount > 0) {
        return sum + amount;
      }
      return sum;
    }, 0);

    // Calcular total de pedidos válidos
    const totalPedidosValidos = pedidosValidos.length;
    const pedidosConcluidos = data.pedidos.filter(p => p.data.status === 'concluido').length;
    const crediariosAtivos = data.crediarios.filter(c => c.data.isActive).length;

    // Calcular saldo total dos crediários
    const saldoTotalCrediarios = data.crediarios.reduce((sum, crediario) => {
      const history = crediario.subcollections.history || [];
      const totalConsumption = history
        .filter(h => h.data.type === 'consumption')
        .reduce((s, h) => s + h.data.amount, 0);
      const totalPayments = history
        .filter(h => h.data.type === 'payment')
        .reduce((s, h) => s + h.data.amount, 0);
      return sum + (totalConsumption - totalPayments);
    }, 0);

    return {
      totalPedidos,
      totalPedidosValidos,
      totalCrediarios,
      totalProdutos,
      totalUsuarios,
      totalVendas,
      pedidosConcluidos,
      crediariosAtivos,
      saldoTotalCrediarios,
    };
  }, [data]);

  // Dados para gráficos
  const chartData = useMemo(() => {
    // Gráfico de vendas por status
    const vendasPorStatus = data.pedidos.reduce((acc, pedido) => {
      const amount = pedido.data.total || pedido.data.totalAmount;
      if (typeof amount === 'number' && !isNaN(amount) && amount > 0) {
        acc[pedido.data.status] = (acc[pedido.data.status] || 0) + amount;
      }
      return acc;
    }, {} as Record<string, number>);

    // Gráfico de produtos por categoria
    const produtosPorCategoria = data.produtos.reduce((acc, produto) => {
      acc[produto.data.categoria] = (acc[produto.data.categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Gráfico de vendas por mês (últimos 6 meses)
    const vendasPorMes = data.pedidos.reduce((acc, pedido) => {
      const amount = pedido.data.total || pedido.data.totalAmount;
      if (typeof amount === 'number' && !isNaN(amount) && amount > 0) {
        const date = new Date(pedido.data.sentAt._seconds * 1000);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const ultimos6Meses = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }).reverse();

    return {
      vendasPorStatus: {
        labels: Object.keys(vendasPorStatus),
        datasets: [{
          label: 'Vendas por Status',
          data: Object.values(vendasPorStatus),
        }],
      },
      produtosPorCategoria: {
        labels: Object.keys(produtosPorCategoria),
        datasets: [{
          label: 'Produtos por Categoria',
          data: Object.values(produtosPorCategoria),
        }],
      },
      vendasPorMes: {
        labels: ultimos6Meses,
        datasets: [{
          label: 'Vendas por Mês',
          data: ultimos6Meses.map(mes => vendasPorMes[mes] || 0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
        }],
      },
    };
  }, [data]);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'pedidos', label: 'Pedidos', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'crediarios', label: 'Crediários', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'produtos', label: 'Produtos', icon: <Package className="h-4 w-4" /> },
    { id: 'usuarios', label: 'Usuários', icon: <Users className="h-4 w-4" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricsCard
                title="Total de Pedidos"
                value={metrics.totalPedidos}
                icon={ShoppingCart}
                color="blue"
                subtitle={`${metrics.totalPedidosValidos} válidos`}
              />
              <MetricsCard
                title="Vendas Válidas"
                value={formatCurrency(metrics.totalVendas)}
                icon={DollarSign}
                color="green"
                subtitle="Excluindo cancelados"
              />
              <MetricsCard
                title="Crediários Ativos"
                value={metrics.crediariosAtivos}
                icon={CreditCard}
                color="purple"
                subtitle={`${metrics.totalCrediarios} total`}
              />
              <MetricsCard
                title="Saldo Crediários"
                value={formatCurrency(metrics.saldoTotalCrediarios)}
                icon={TrendingUp}
                color={metrics.saldoTotalCrediarios > 0 ? "red" : "green"}
                subtitle="Valor em aberto"
              />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Chart
                type="doughnut"
                data={chartData.vendasPorStatus}
                title="Vendas por Status"
                height={300}
              />
              <Chart
                type="bar"
                data={chartData.produtosPorCategoria}
                title="Produtos por Categoria"
                height={300}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Chart
                type="line"
                data={chartData.vendasPorMes}
                title="Vendas dos Últimos 6 Meses"
                height={400}
              />
            </div>
          </div>
        );
      case 'pedidos':
        return <PedidosTab pedidos={data.pedidos} />;
        case 'crediarios':
          return <CrediariosTab crediarios={data.crediarios} pedidos={data.pedidos} />;
      case 'produtos':
        return <ProdutosTab produtos={data.produtos} />;
      case 'usuarios':
        return <UsuariosTab usuarios={data.users} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="mb-8 text-center">
                  <h1 className="text-5xl font-bold text-white mb-4 font-poppins bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Edienai Dashboard
                  </h1>
                  <p className="text-gray-300 text-xl font-poppins max-w-2xl mx-auto">
                    Análise completa dos dados do sistema Edienai Lanches
                  </p>
                </div>

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
