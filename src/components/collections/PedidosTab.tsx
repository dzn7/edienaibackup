'use client';

import { useState, useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Chip, TextField, InputAdornment } from '@mui/material';
import { Search, Download, FileSpreadsheet, Eye, FileText, Filter } from 'lucide-react';
import { Pedido } from '@/types';
import { exportToCSV, exportToXLSX, formatDate, formatCurrency } from '@/utils/export';
import { Modal } from '../Modal';
import { generatePDF } from '@/utils/pdfGenerator';

interface PedidosTabProps {
  pedidos: Pedido[];
}

export const PedidosTab = ({ pedidos }: PedidosTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredPedidos = useMemo(() => {
    return pedidos.filter(pedido => {
      const matchesSearch = 
        pedido.data.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pedido.data.orderId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || pedido.data.status === statusFilter;
      
      const matchesPaymentMethod = paymentMethodFilter === 'all' || 
        (pedido.data.paymentMethod && pedido.data.paymentMethod.toLowerCase().includes(paymentMethodFilter.toLowerCase()));
      
      const matchesDateFrom = !dateFrom || new Date(pedido.data.sentAt._seconds * 1000) >= new Date(dateFrom);
      const matchesDateTo = !dateTo || new Date(pedido.data.sentAt._seconds * 1000) <= new Date(dateTo);
      
      return matchesSearch && matchesStatus && matchesPaymentMethod && matchesDateFrom && matchesDateTo;
    }).sort((a, b) => {
      // Ordenar por data mais recente primeiro
      return b.data.sentAt._seconds - a.data.sentAt._seconds;
    });
  }, [pedidos, searchTerm, statusFilter, paymentMethodFilter, dateFrom, dateTo]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'success';
      case 'pendente': return 'warning';
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };

  const columns: GridColDef[] = [
    { field: 'orderId', headerName: 'ID do Pedido', width: 200 },
    { field: 'customerName', headerName: 'Cliente', width: 200 },
    { field: 'status', headerName: 'Status', width: 120, renderCell: (params) => (
      <Chip label={params.value} color={getStatusColor(params.value)} size="small" />
    )},
    { field: 'total', headerName: 'Total', width: 120, renderCell: (params) => formatCurrency(params.value) },
    { field: 'itemsCount', headerName: 'Itens', width: 80 },
    { field: 'sentAt', headerName: 'Data', width: 180, renderCell: (params) => formatDate(params.value) },
    { field: 'tableNumber', headerName: 'Mesa', width: 80 },
    { field: 'paymentMethod', headerName: 'Pagamento', width: 120 },
    { 
      field: 'actions', 
      headerName: 'Ações', 
      width: 120, 
      renderCell: (params) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              const pedido = pedidos.find(p => p.id === params.id);
              setSelectedPedido(pedido || null);
              setIsModalOpen(true);
            }}
            className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
            title="Ver detalhes"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      )
    },
  ];

  const rows = filteredPedidos.map(pedido => ({
    id: pedido.id,
    orderId: pedido.data.orderId,
    customerName: pedido.data.customerName,
    status: pedido.data.status,
    total: pedido.data.total || pedido.data.totalAmount || 0,
    itemsCount: pedido.data.items.length,
    sentAt: pedido.data.sentAt,
    tableNumber: pedido.data.tableNumber || '-',
    paymentMethod: pedido.data.paymentMethod || '-',
  }));

  const handleExportCSV = () => {
    exportToCSV(rows, 'pedidos');
  };

  const handleExportXLSX = () => {
    exportToXLSX(rows, 'pedidos');
  };

  const handleGeneratePDF = () => {
    generatePDF('pedidos-table', 'relatorio-pedidos');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setPaymentMethodFilter('all');
  };

  const uniqueStatuses = [...new Set(pedidos.map(p => p.data.status))];
  const uniquePaymentMethods = [...new Set(pedidos.map(p => p.data.paymentMethod).filter(Boolean))];

  return (
    <div className="space-y-6">
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
            placeholder="Buscar por cliente ou ID do pedido..."
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
            <option value="all">Todos os Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-700/50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data Inicial</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Data Final</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Método de Pagamento</label>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white"
              >
                <option value="all">Todos</option>
                {uniquePaymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div id="pedidos-table" className="bg-slate-800/90 border border-slate-600 rounded-lg shadow-xl backdrop-blur-sm p-4">
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

      {/* Modal de Detalhes do Pedido */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalhes do Pedido"
        size="lg"
      >
        {selectedPedido && (
          <div className="space-y-6">
            {/* Informações Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Informações do Pedido</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">ID:</span> <span className="text-white">{selectedPedido.data.orderId}</span></div>
                  <div><span className="text-gray-400">Cliente:</span> <span className="text-white">{selectedPedido.data.customerName}</span></div>
                  <div><span className="text-gray-400">Status:</span> <span className="text-white">{selectedPedido.data.status}</span></div>
                  <div><span className="text-gray-400">Total:</span> <span className="text-white font-semibold">{formatCurrency(selectedPedido.data.total || 0)}</span></div>
                  <div><span className="text-gray-400">Data:</span> <span className="text-white">{formatDate(selectedPedido.data.sentAt)}</span></div>
                  <div><span className="text-gray-400">Pagamento:</span> <span className="text-white">{selectedPedido.data.paymentMethod || '-'}</span></div>
                </div>
              </div>
              
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Entrega</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-400">Tipo:</span> <span className="text-white">{selectedPedido.data.deliveryOption?.type || '-'}</span></div>
                  <div><span className="text-gray-400">Endereço:</span> <span className="text-white">{selectedPedido.data.deliveryOption?.address || '-'}</span></div>
                  <div><span className="text-gray-400">Mesa:</span> <span className="text-white">{selectedPedido.data.tableNumber || '-'}</span></div>
                  <div><span className="text-gray-400">Observações:</span> <span className="text-white">{selectedPedido.data.observations || '-'}</span></div>
                </div>
              </div>
            </div>

            {/* Itens do Pedido */}
            <div className="bg-slate-700/50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Itens do Pedido</h4>
              <div className="space-y-3">
                {selectedPedido.data.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-slate-600/50 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{item.name}</div>
                      <div className="text-sm text-gray-400">Quantidade: {item.quantity}</div>
                      {item.complements && item.complements.length > 0 && (
                        <div className="text-sm text-gray-400">
                          Complementos: {item.complements.map(c => c.name).join(', ')}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">{formatCurrency(item.totalItemPrice)}</div>
                      <div className="text-sm text-gray-400">R$ {item.basePrice} cada</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Histórico */}
            {selectedPedido.data.history && selectedPedido.data.history.length > 0 && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-3">Histórico</h4>
                <div className="space-y-2">
                  {selectedPedido.data.history.map((entry, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-slate-600/30 rounded">
                      <div className="text-sm text-white">{entry.description || entry.action}</div>
                      <div className="text-sm text-gray-400">
                        {entry.timestamp
                          ? formatDate(entry.timestamp)
                          : entry.date
                            ? formatDate(entry.date)
                            : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => {
                  // Gerar PDF do pedido específico
                  const element = document.createElement('div');
                  element.innerHTML = `
                    <div style="background: #0f172a; color: white; padding: 20px; font-family: Arial, sans-serif;">
                      <h1>Pedido ${selectedPedido.data.orderId}</h1>
                      <p>Cliente: ${selectedPedido.data.customerName}</p>
                      <p>Total: ${formatCurrency(selectedPedido.data.total || 0)}</p>
                      <p>Data: ${formatDate(selectedPedido.data.sentAt)}</p>
                    </div>
                  `;
                  document.body.appendChild(element);
                  generatePDF(element.id, `pedido-${selectedPedido.data.orderId}`);
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
