'use client';

import { useState, useMemo } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Chip, TextField, InputAdornment } from '@mui/material';
import { Search, Download, FileSpreadsheet, User } from 'lucide-react';
import { Usuario } from '@/types';
import { exportToCSV, exportToXLSX, formatDate } from '@/utils/export';

interface UsuariosTabProps {
  usuarios: Usuario[];
}

export const UsuariosTab = ({ usuarios }: UsuariosTabProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsuarios = useMemo(() => {
    return usuarios.filter(usuario => {
      const matchesSearch = 
        usuario.data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        usuario.data.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = roleFilter === 'all' || usuario.data.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [usuarios, searchTerm, roleFilter]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'owner': return 'warning';
      case 'waiter': return 'info';
      case 'user': return 'default';
      default: return 'default';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Nome', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'role', headerName: 'Função', width: 120, renderCell: (params) => (
      <Chip label={params.value} color={getRoleColor(params.value)} size="small" />
    )},
    { field: 'isActive', headerName: 'Status', width: 120, renderCell: (params) => (
      <Chip 
        label={params.value ? 'Ativo' : 'Inativo'} 
        color={getStatusColor(params.value)} 
        size="small" 
      />
    )},
    { field: 'createdAt', headerName: 'Criado em', width: 180, renderCell: (params) => formatDate(params.value) },
  ];

  const rows = filteredUsuarios.map(usuario => ({
    id: usuario.id,
    name: usuario.data.name,
    email: usuario.data.email,
    role: usuario.data.role,
    isActive: usuario.data.isActive,
    createdAt: usuario.data.createdAt,
  }));

  const handleExportCSV = () => {
    exportToCSV(rows, 'usuarios');
  };

  const handleExportXLSX = () => {
    exportToXLSX(rows, 'usuarios');
  };

  const uniqueRoles = [...new Set(usuarios.map(u => u.data.role))];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <TextField
          placeholder="Buscar por nome ou email..."
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
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white"
        >
          <option value="all">Todas as Funções</option>
          {uniqueRoles.map(role => (
            <option key={role} value={role}>{role}</option>
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
