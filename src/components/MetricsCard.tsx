'use client';

import { Card, CardContent, Typography } from '@mui/material';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  subtitle?: string;
}

export const MetricsCard = ({ title, value, icon: Icon, color = 'blue', subtitle }: MetricsCardProps) => {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
    green: 'bg-gradient-to-br from-green-500 to-green-600',
    red: 'bg-gradient-to-br from-red-500 to-red-600',
    yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
    indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
  };

  return (
    <div className="relative group">
      {/* Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
      
      <Card 
        className="relative bg-slate-800/90 border-slate-600/50 text-white shadow-2xl backdrop-blur-sm hover:shadow-3xl transition-all duration-300 group-hover:scale-105"
        sx={{
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          color: '#f8fafc',
          backdropFilter: 'blur(12px)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.6)',
          }
        }}
      >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Typography 
              variant="body2" 
              className="text-sm font-medium text-gray-300 mb-2 font-poppins"
              sx={{ color: '#cbd5e1', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              className="text-3xl font-bold text-white mb-1 font-poppins"
              sx={{ color: '#f8fafc', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography 
                variant="caption" 
                className="text-xs text-gray-400 font-poppins"
                sx={{ color: '#94a3b8', fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}
              >
                {subtitle}
              </Typography>
            )}
          </div>
          <div className={`p-4 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} shadow-lg`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
      </CardContent>
      </Card>
    </div>
  );
};
