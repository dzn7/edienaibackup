'use client';

import { useState, useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Chip, TextField, InputAdornment } from '@mui/material';
import { Search, Download, FileSpreadsheet, Eye, FileText, Filter } from 'lucide-react';
import { Crediario, ProcessedCrediario } from '@/types';
import { exportToCSV, exportToXLSX, formatDate, formatCurrency } from '@/utils/export';
import { Modal } from '../Modal';
import { generatePDF } from '@/utils/pdfGenerator';
import { useAIConnections } from '@/hooks/useAIConnections';
import { AIConnectionIndicator, AIStatsCard } from '../AIConnectionIndicator';

interface CrediariosTabProps {
  crediarios: Crediario[];
  pedidos: any[];
}

export const CrediariosTab = ({ crediarios, pedidos }: CrediariosTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [balanceFilter, setBalanceFilter] = useState('all');
  const [selectedCrediario, setSelectedCrediario] = useState<ProcessedCrediario | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIStats, setShowAIStats] = useState(false);

  // Hook de IA para conectar crediários aos pedidos
  const { 
    connections, 
    isLoading: aiLoading, 
    stats, 
    insights, 
    getConnectedPedidosForCrediario 
  } = useAIConnections({ crediarios, pedidos });

  const processedCrediarios = useMemo((): ProcessedCrediario[] => {
    return crediarios.map(crediario => {
      const history = crediario.subcollections.history || [];
      const totalConsumption = history
        .filter(h => h.data.type === 'consumption')
        .reduce((sum, h) => sum + h.data.amount, 0);
      const totalPayments = history
        .filter(h => h.data.type === 'payment')
        .reduce((sum, h) => sum + h.data.amount, 0);
      const currentBalance = totalConsumption - totalPayments;

      // Buscar conexão de IA para este crediário
      const aiConnection = connections.find(c => c.crediarioId === crediario.id);
      const connectedPedidos = aiConnection ? getConnectedPedidosForCrediario(crediario.id) : [];

      return {
        ...crediario,
        totalConsumption,
        totalPayments,
        currentBalance,
        transactionCount: history.length,
        aiConnection,
        connectedPedidos,
      };
    });
  }, [crediarios, connections, getConnectedPedidosForCrediario]);

  const filteredCrediarios = useMemo(() => {
    return processedCrediarios.filter(crediario => {
      const matchesSearch = 
        crediario.data.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && crediario.data.isActive) ||
        (statusFilter === 'inactive' && !crediario.data.isActive);
      
      const matchesBalance = balanceFilter === 'all' ||
        (balanceFilter === 'positive' && crediario.currentBalance > 0) ||
        (balanceFilter === 'negative' && crediario.currentBalance < 0) ||
        (balanceFilter === 'zero' && crediario.currentBalance === 0);
      
      return matchesSearch && matchesStatus && matchesBalance;
    }).sort((a, b) => {
      // Ordenar por data mais recente primeiro
      return b.data.createdAt._seconds - a.data.createdAt._seconds;
    });
  }, [processedCrediarios, searchTerm, statusFilter, balanceFilter]);

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'error'; // Vermelho para saldo positivo (devendo)
    if (balance < 0) return 'success'; // Verde para saldo negativo (pago a mais)
    return 'default'; // Cinza para saldo zero
  };

  const getBalanceTextColor = (balance: number) => {
    if (balance > 0) return 'text-red-400'; // Vermelho claro para saldo positivo
    if (balance < 0) return 'text-green-400'; // Verde claro para saldo negativo
    return 'text-gray-400'; // Cinza para saldo zero
  };

  const columns: GridColDef[] = [
    { 
      field: 'customerName', 
      headerName: 'Cliente', 
      width: 200,
      renderCell: (params) => (
        <span className="text-white font-medium">{params.value}</span>
      )
    },
    { 
      field: 'isActive', 
      headerName: 'Status', 
      width: 100, 
      renderCell: (params) => (
        <Chip 
          label={params.value ? 'Ativo' : 'Inativo'} 
          color={params.value ? 'success' : 'default'} 
          size="small"
          sx={{
            backgroundColor: params.value ? '#10b981' : '#6b7280',
            color: '#ffffff',
            fontWeight: '500'
          }}
        />
      )
    },
    { 
      field: 'currentBalance', 
      headerName: 'Saldo Atual', 
      width: 150, 
      renderCell: (params) => (
        <div className={`font-semibold ${getBalanceTextColor(params.value)}`}>
          {formatCurrency(params.value)}
        </div>
      )
    },
    { 
      field: 'totalConsumption', 
      headerName: 'Total Consumido', 
      width: 150, 
      renderCell: (params) => (
        <span className="text-white font-medium">{formatCurrency(params.value)}</span>
      )
    },
    { 
      field: 'totalPayments', 
      headerName: 'Total Pago', 
      width: 150, 
      renderCell: (params) => (
        <span className="text-white font-medium">{formatCurrency(params.value)}</span>
      )
    },
    { 
      field: 'transactionCount', 
      headerName: 'Transações', 
      width: 120,
      renderCell: (params) => (
        <span className="text-white font-medium">{params.value}</span>
      )
    },
    { 
      field: 'createdAt', 
      headerName: 'Criado em', 
      width: 180, 
      renderCell: (params) => (
        <span className="text-gray-300 text-sm">{formatDate(params.value)}</span>
      )
    },
    { 
      field: 'aiConnection', 
      headerName: 'IA', 
      width: 120, 
      renderCell: (params) => {
        const crediario = processedCrediarios.find(c => c.id === params.id);
        if (!crediario?.aiConnection) {
          return <span className="text-gray-500 text-sm">Sem conexão</span>;
        }
        return (
          <AIConnectionIndicator 
            confidence={crediario.aiConnection.confidence}
            matchDetails={crediario.aiConnection.matchDetails}
          />
        );
      }
    },
    { 
      field: 'actions', 
      headerName: 'Ações', 
      width: 120, 
      renderCell: (params) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              const crediario = processedCrediarios.find(c => c.id === params.id);
              setSelectedCrediario(crediario || null);
              setIsModalOpen(true);
            }}
            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
            title="Ver histórico"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      )
    },
  ];

  const rows = filteredCrediarios.map(crediario => ({
    id: crediario.id,
    customerName: crediario.data.customerName,
    isActive: crediario.data.isActive,
    currentBalance: crediario.currentBalance,
    totalConsumption: crediario.totalConsumption,
    totalPayments: crediario.totalPayments,
    transactionCount: crediario.transactionCount,
    createdAt: crediario.data.createdAt,
  }));

  const handleExportCSV = () => {
    exportToCSV(rows, 'crediarios');
  };

  const handleExportXLSX = () => {
    exportToXLSX(rows, 'crediarios');
  };

  const handleGeneratePDF = () => {
    generatePDF('crediarios-table', 'relatorio-crediarios');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setBalanceFilter('all');
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas de IA */}
      {stats.totalConnections > 0 && (
        <div className="flex justify-between items-center">
          <AIStatsCard stats={stats} insights={insights} />
          <Button
            onClick={() => setShowAIStats(!showAIStats)}
            variant="outlined"
            size="small"
            sx={{ borderColor: '#475569', color: '#f8fafc' }}
          >
            {showAIStats ? 'Ocultar' : 'Mostrar'} Detalhes IA
          </Button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white font-poppins">Filtros</h3>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<Filter className="h-4 w-4" />}
              variant="outlined"
              size="small"
              sx={{ borderColor: '#475569', color: '#f8fafc' }}
            >
              {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="outlined"
              size="small"
              sx={{ borderColor: '#475569', color: '#f8fafc' }}
            >
              Limpar
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <TextField
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="h-5 w-5 text-gray-400" />
                </InputAdornment>
              ),
            }}
            className="flex-1"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                '& fieldset': {
                  borderColor: '#475569',
                },
                '&:hover fieldset': {
                  borderColor: '#64748b',
                },
              },
            }}
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>

          <div className="flex gap-2">
            <Button
              onClick={handleExportCSV}
              startIcon={<Download className="h-4 w-4" />}
              variant="outlined"
              size="small"
              sx={{ borderColor: '#475569', color: '#f8fafc' }}
            >
              CSV
            </Button>
            <Button
              onClick={handleExportXLSX}
              startIcon={<FileSpreadsheet className="h-4 w-4" />}
              variant="outlined"
              size="small"
              sx={{ borderColor: '#475569', color: '#f8fafc' }}
            >
              XLSX
            </Button>
            <Button
              onClick={handleGeneratePDF}
              startIcon={<FileText className="h-4 w-4" />}
              variant="outlined"
              size="small"
              sx={{ borderColor: '#475569', color: '#f8fafc' }}
            >
              PDF
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-700/50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Filtrar por Saldo</label>
              <select
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              >
                <option value="all">Todos</option>
                <option value="positive">Saldo Positivo (Devendo)</option>
                <option value="negative">Saldo Negativo (Pago a mais)</option>
                <option value="zero">Saldo Zero</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div id="crediarios-table" className="relative group">
        {/* Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
        
        <div className="relative bg-slate-800/90 border border-slate-600/50 rounded-xl shadow-2xl backdrop-blur-sm p-4 group-hover:shadow-3xl transition-all duration-300">
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          sx={{
            border: 'none',
            color: '#f8fafc',
            fontFamily: 'var(--font-poppins), Poppins, sans-serif',
            '& .MuiDataGrid-root': {
              border: 'none',
              backgroundColor: 'transparent',
            },
            '& .MuiDataGrid-main': {
              backgroundColor: 'transparent',
            },
            '& .MuiDataGrid-virtualScroller': {
              backgroundColor: 'transparent',
            },
            '& .MuiDataGrid-cell': {
              borderColor: '#475569',
              backgroundColor: 'transparent !important',
              color: '#f8fafc !important',
            },
            '& .MuiDataGrid-row': {
              backgroundColor: 'transparent !important',
              '&:nth-of-type(even)': {
                backgroundColor: 'rgba(30, 41, 59, 0.3) !important',
              },
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.2) !important',
              },
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#1e293b !important',
              borderColor: '#475569',
              fontFamily: 'var(--font-poppins), Poppins, sans-serif',
              fontWeight: '600',
              color: '#f8fafc !important',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: '#1e293b !important',
              color: '#f8fafc !important',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: '#1e293b !important',
              borderColor: '#475569',
              color: '#f8fafc !important',
            },
            '& .MuiDataGrid-toolbarContainer': {
              backgroundColor: '#1e293b !important',
              color: '#f8fafc !important',
            },
            '& .MuiTablePagination-root': {
              color: '#f8fafc !important',
            },
            '& .MuiIconButton-root': {
              color: '#f8fafc !important',
            },
          }}
        />
        </div>
      </div>

      {/* Modal de Histórico do Crediário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Histórico do Crediário"
        size="lg"
      >
        {selectedCrediario && (
          <div className="space-y-6">
            {/* Informações do Cliente */}
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Informações do Cliente</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Nome:</span> <span className="text-white font-medium">{selectedCrediario.data.customerName}</span></div>
                <div><span className="text-gray-400">Status:</span> <span className="text-white">{selectedCrediario.data.isActive ? 'Ativo' : 'Inativo'}</span></div>
                <div><span className="text-gray-400">Total Consumido:</span> <span className="text-white font-semibold">{formatCurrency(selectedCrediario.totalConsumption)}</span></div>
                <div><span className="text-gray-400">Total Pago:</span> <span className="text-white font-semibold">{formatCurrency(selectedCrediario.totalPayments)}</span></div>
                <div><span className="text-gray-400">Saldo Atual:</span> <span className={`font-semibold ${getBalanceTextColor(selectedCrediario.currentBalance)}`}>{formatCurrency(selectedCrediario.currentBalance)}</span></div>
                <div><span className="text-gray-400">Criado em:</span> <span className="text-white">{formatDate(selectedCrediario.data.createdAt)}</span></div>
              </div>
            </div>

            {/* Pedidos Conectados por IA */}
            {selectedCrediario.connectedPedidos && selectedCrediario.connectedPedidos.length > 0 && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-lg font-semibold text-white">Pedidos Conectados por IA</h4>
                  <AIConnectionIndicator 
                    confidence={selectedCrediario.aiConnection?.confidence || 0}
                    matchDetails={selectedCrediario.aiConnection?.matchDetails || { nameMatch: 0, valueMatch: 0, dateMatch: 0 }}
                  />
                </div>
                <div className="space-y-4">
                  {selectedCrediario.connectedPedidos.map((pedido: any, index: number) => (
                    <div key={index} className="bg-slate-600/50 rounded-lg p-4">
                      {/* Cabeçalho do Pedido */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="font-medium text-white text-lg">Pedido {pedido.data.orderId}</div>
                          <div className="text-sm text-gray-400">
                            {pedido.data.customerName} • {formatDate(pedido.data.sentAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Status: {pedido.data.status} • Pagamento: {pedido.data.paymentMethod}
                          </div>
                          {pedido.data.observations && (
                            <div className="text-xs text-yellow-400 mt-1">
                              Obs: {pedido.data.observations}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-white text-lg">{formatCurrency(pedido.data.total || 0)}</div>
                          <div className="text-xs text-gray-400">{pedido.data.items.length} itens</div>
                        </div>
                      </div>

                      {/* Itens do Pedido */}
                      <div className="border-t border-slate-500 pt-3">
                        <h5 className="text-sm font-semibold text-white mb-2">Itens do Pedido:</h5>
                        <div className="space-y-2">
                          {pedido.data.items.map((item: any, itemIndex: number) => (
                            <div key={itemIndex} className="flex justify-between items-center p-2 bg-slate-500/30 rounded">
                              <div className="flex-1">
                                <div className="font-medium text-white text-sm">{item.name}</div>
                                <div className="text-xs text-gray-400">
                                  Quantidade: {item.quantity} • Preço unitário: {formatCurrency(item.basePrice)}
                                </div>
                                {item.complements && item.complements.length > 0 && (
                                  <div className="text-xs text-blue-400 mt-1">
                                    Complementos: {item.complements.map((c: any) => c.name).join(', ')}
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-white text-sm">
                                  {formatCurrency(item.totalItemPrice)}
                                </div>
                                {item.unitPriceWithComplements !== item.basePrice && (
                                  <div className="text-xs text-gray-400">
                                    + {formatCurrency(item.unitPriceWithComplements - item.basePrice)} complementos
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Informações de Entrega */}
                      {pedido.data.deliveryOption && (
                        <div className="border-t border-slate-500 pt-3 mt-3">
                          <h5 className="text-sm font-semibold text-white mb-2">Entrega:</h5>
                          <div className="text-sm text-gray-300">
                            <div>Tipo: {pedido.data.deliveryOption.type}</div>
                            {pedido.data.deliveryOption.address && (
                              <div>Endereço: {pedido.data.deliveryOption.address}</div>
                            )}
                            {pedido.data.tableNumber && (
                              <div>Mesa: {pedido.data.tableNumber}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Histórico de Transações */}
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Histórico de Transações</h4>
              {selectedCrediario.subcollections.history && selectedCrediario.subcollections.history.length > 0 ? (
                <div className="space-y-3">
                  {selectedCrediario.subcollections.history.map((entry, index) => {
                    // Tentar encontrar o pedido relacionado a esta transação
                    const relatedPedido = selectedCrediario.connectedPedidos?.find(pedido => 
                      entry.data.description?.includes(pedido.data.orderId) || 
                      entry.data.description?.includes('Pedido')
                    );

                    return (
                      <div key={index} className="bg-slate-600/50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-white">
                              {entry.data.type === 'consumption' ? 'Consumo' : 'Pagamento'}
                            </div>
                            <div className="text-sm text-gray-400">
                              {entry.data.description || entry.data.reason || 'Sem descrição'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(entry.data.timestamp || entry.data.date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${entry.data.type === 'consumption' ? 'text-red-400' : 'text-green-400'}`}>
                              {entry.data.type === 'consumption' ? '+' : '-'}{formatCurrency(entry.data.amount)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {entry.data.type === 'consumption' ? 'Consumo' : 'Pagamento'}
                            </div>
                          </div>
                        </div>

                        {/* Mostrar detalhes do pedido se encontrado */}
                        {relatedPedido && entry.data.type === 'consumption' && (
                          <div className="border-t border-slate-500 pt-3 mt-3">
                            <h5 className="text-sm font-semibold text-white mb-2">Detalhes do Pedido:</h5>
                            <div className="space-y-2">
                              {relatedPedido.data.items.map((item: any, itemIndex: number) => (
                                <div key={itemIndex} className="flex justify-between items-center p-2 bg-slate-500/30 rounded text-sm">
                                  <div className="flex-1">
                                    <div className="text-white">{item.name}</div>
                                    <div className="text-xs text-gray-400">
                                      Qtd: {item.quantity} • Unit: {formatCurrency(item.basePrice)}
                                    </div>
                                    {item.complements && item.complements.length > 0 && (
                                      <div className="text-xs text-blue-400">
                                        + {item.complements.map((c: any) => c.name).join(', ')}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-white font-medium">
                                      {formatCurrency(item.totalItemPrice)}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-500">
                              <div className="text-sm text-gray-300">
                                Total do Pedido: {formatCurrency((relatedPedido.data as any).total || relatedPedido.data.totalAmount || 0)}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatDate(relatedPedido.data.sentAt)}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  Nenhuma transação encontrada
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  // Gerar PDF do crediário específico
                  const element = document.createElement('div');
                  element.innerHTML = `
                    <div style="background: #0f172a; color: white; padding: 20px; font-family: Arial, sans-serif;">
                      <h1>Crediário - ${selectedCrediario.data.customerName}</h1>
                      <p>Saldo Atual: ${formatCurrency(selectedCrediario.currentBalance)}</p>
                      <p>Total Consumido: ${formatCurrency(selectedCrediario.totalConsumption)}</p>
                      <p>Total Pago: ${formatCurrency(selectedCrediario.totalPayments)}</p>
                    </div>
                  `;
                  document.body.appendChild(element);
                  generatePDF(element.id, `crediario-${selectedCrediario.data.customerName}`);
                  document.body.removeChild(element);
                }}
                startIcon={<FileText className="h-4 w-4" />}
                variant="outlined"
                sx={{ borderColor: '#475569', color: '#f8fafc' }}
              >
                Gerar PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
