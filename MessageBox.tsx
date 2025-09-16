import React from 'react';

interface MessageBoxProps {
    text: string;
    type: 'success' | 'error';
}

export const MessageBox = ({ text, type }: MessageBoxProps) => {
    const baseClasses = "fixed top-8 left-1/2 -translate-x-1/2 text-white py-3 px-6 rounded-lg z-50 text-center text-lg shadow-xl transition-all duration-300";
    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
    };
    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            {text}
        </div>
    );
};
