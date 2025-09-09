'use client';

import { Brain, Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface AIConnectionIndicatorProps {
  confidence: number;
  matchDetails: {
    nameMatch: number;
    valueMatch: number;
    dateMatch: number;
  };
  showDetails?: boolean;
}

export const AIConnectionIndicator = ({ 
  confidence, 
  matchDetails, 
  showDetails = false 
}: AIConnectionIndicatorProps) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-green-400';
    if (conf >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConfidenceIcon = (conf: number) => {
    if (conf >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (conf >= 0.6) return <AlertTriangle className="h-4 w-4" />;
    return <Info className="h-4 w-4" />;
  };

  const getConfidenceText = (conf: number) => {
    if (conf >= 0.8) return 'Alta Confiança';
    if (conf >= 0.6) return 'Média Confiança';
    return 'Baixa Confiança';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Brain className="h-4 w-4 text-blue-400" />
        <span className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
          {getConfidenceText(confidence)}
        </span>
        {getConfidenceIcon(confidence)}
      </div>
      
      {showDetails && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Nome: {(matchDetails.nameMatch * 100).toFixed(0)}%</span>
          <span>Valor: {(matchDetails.valueMatch * 100).toFixed(0)}%</span>
          <span>Data: {(matchDetails.dateMatch * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
};

interface AIStatsCardProps {
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
}

export const AIStatsCard = ({ stats, insights }: AIStatsCardProps) => {
  return (
    <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white font-poppins">Inteligência Artificial</h3>
        <Zap className="h-4 w-4 text-yellow-400" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{stats.totalConnections}</div>
          <div className="text-sm text-gray-400">Conexões</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{stats.highConfidence}</div>
          <div className="text-sm text-gray-400">Alta Confiança</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{stats.mediumConfidence}</div>
          <div className="text-sm text-gray-400">Média Confiança</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{(stats.averageConfidence * 100).toFixed(1)}%</div>
          <div className="text-sm text-gray-400">Confiança Média</div>
        </div>
      </div>
      
      {insights.insights.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-white mb-2">Insights:</h4>
          <div className="space-y-1">
            {insights.insights.map((insight, index) => (
              <div key={index} className="text-sm text-gray-300">{insight}</div>
            ))}
          </div>
        </div>
      )}
      
      {insights.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Recomendações:</h4>
          <div className="space-y-1">
            {insights.recommendations.map((recommendation, index) => (
              <div key={index} className="text-sm text-yellow-300">{recommendation}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
