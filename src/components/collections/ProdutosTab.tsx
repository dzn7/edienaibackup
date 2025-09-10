'use client';

import { useState, useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Chip, TextField, InputAdornment } from '@mui/material';
import { Search, Download, FileSpreadsheet } from 'lucide-react';
import { Produto } from '@/types';
import { exportToCSV, exportToXLSX, formatCurrency } from '@/utils/export';

interface ProdutosTabProps {
  produtos: Produto[];
}

export const ProdutosTab = ({ produtos }: ProdutosTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProdutos = useMemo(() => {
    return produtos.filter(produto => {
      const matchesSearch = 
        produto.data.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.data.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || produto.data.categoria === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [produtos, searchTerm, categoryFilter]);

  const getStatusColor = (disponivel: boolean) => {
    return disponivel ? 'success' : 'error';
  };

  const columns: GridColDef[] = [
    { field: 'nome', headerName: 'Nome', width: 250 },
    { field: 'categoria', headerName: 'Categoria', width: 150 },
    { field: 'preco', headerName: 'Preço', width: 120, renderCell: (params) => formatCurrency(params.value) },
    { field: 'disponivel', headerName: 'Status', width: 120, renderCell: (params) => (
      <Chip 
        label={params.value ? 'Disponível' : 'Indisponível'} 
        color={getStatusColor(params.value)} 
        size="small" 
      />
    )},
    { field: 'descricao', headerName: 'Descrição', width: 300 },
  ];

  const rows = filteredProdutos.map(produto => ({
    id: produto.id,
    nome: produto.data.nome,
    categoria: produto.data.categoria,
    preco: produto.data.preco,
    disponivel: produto.data.disponivel,
    descricao: produto.data.descricao || '-',
  }));

  const handleExportCSV = () => {
    exportToCSV(rows, 'produtos');
  };

  const handleExportXLSX = () => {
    exportToXLSX(rows, 'produtos');
  };

  const uniqueCategories = [...new Set(produtos.map(p => p.data.categoria))];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <TextField
          placeholder="Buscar por nome ou descrição..."
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
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
        >
          <option value="all">Todas as Categorias</option>
          {uniqueCategories.map(categoria => (
            <option key={categoria} value={categoria}>{categoria}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <Button
            onClick={handleExportCSV}
            startIcon={<Download className="h-4 w-4" />}
            variant="outlined"
            sx={{ borderColor: '#475569', color: '#f8fafc' }}
          >
            CSV
          </Button>
          <Button
            onClick={handleExportXLSX}
            startIcon={<FileSpreadsheet className="h-4 w-4" />}
            variant="outlined"
            sx={{ borderColor: '#475569', color: '#f8fafc' }}
          >
            XLSX
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-slate-800/90 border border-slate-600 rounded-lg shadow-xl backdrop-blur-sm p-4">
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
  );
};
