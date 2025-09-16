import React from 'react';
import { VIEW_FUEL_ENTRY, VIEW_SEARCH_RECORDS, VIEW_ADMIN_PANEL } from '../constants.js';
import type { View } from '../types.js';

interface TabButtonProps {
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}

const TabButton = ({ onClick, isActive, children }: TabButtonProps) => {
    const baseClasses = "py-3 px-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 flex-1 text-center relative";
    const activeClasses = "bg-ogm-green-600 text-white shadow-md";
    const inactiveClasses = "bg-white/60 text-ogm-green-900 font-semibold hover:bg-white/80";
    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {children}
        </button>
    );
};

interface TabsProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

export const Tabs = ({ activeView, setActiveView }: TabsProps) => {
    return (
        <nav className="flex justify-center w-full gap-2 sm:gap-4">
            <TabButton onClick={() => setActiveView(VIEW_FUEL_ENTRY)} isActive={activeView === VIEW_FUEL_ENTRY}>Yakıt Girişi</TabButton>
            <TabButton onClick={() => setActiveView(VIEW_SEARCH_RECORDS)} isActive={activeView === VIEW_SEARCH_RECORDS}>Kayıtları Ara</TabButton>
            <TabButton onClick={() => setActiveView(VIEW_ADMIN_PANEL)} isActive={activeView === VIEW_ADMIN_PANEL}>Yönetici Paneli</TabButton>
        </nav>
    );
};
