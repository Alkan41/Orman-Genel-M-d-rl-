import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-lg flex flex-col gap-4 border border-white/30"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-slate-200">
                    <h3 className="text-xl font-bold text-slate-700">{title}</h3>
                </div>
                <div className="p-5 flex flex-col gap-4">
                    {children}
                </div>
            </div>
        </div>
    );
};
