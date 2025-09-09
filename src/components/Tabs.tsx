'use client';

import { useState } from 'react';
import { Button } from '@mui/material';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const Tabs = ({ tabs, activeTab, onTabChange }: TabsProps) => {
  return (
    <div className="border-b border-slate-600/50 bg-slate-800/30 backdrop-blur-sm rounded-t-xl p-2">
      <nav className="flex space-x-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative py-3 px-6 rounded-xl font-medium text-sm transition-all duration-300 font-poppins overflow-hidden ${
              activeTab === tab.id
                ? 'text-white shadow-xl'
                : 'text-gray-300 hover:text-white hover:bg-slate-700/30'
            }`}
          >
            {activeTab === tab.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"></div>
            )}
            <div className="relative flex items-center space-x-2 z-10">
              {tab.icon}
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};
