import React from 'react';

interface CriticalErrorDisplayProps {
    message: string;
}

export const CriticalErrorDisplay = ({ message }: CriticalErrorDisplayProps) => {
    const parts = message.split('\n\n');
    const title = parts.length > 0 ? parts[0] : 'Kritik Hata';
    const instructions = parts.slice(1);

    return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 sm:p-6">
            <div className="w-full max-w-3xl bg-white p-6 sm:p-8 rounded-2xl shadow-2xl border-2 border-red-400">
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-6">
                    <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                         <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                             <svg className="h-10 w-10 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-red-800">{title}</h1>
                         <p className="text-slate-600 mt-1">Lütfen aşağıdaki adımları takip ederek sorunu çözün ve sayfayı yenileyin.</p>
                    </div>
                </div>
                <div className="text-slate-700 space-y-4 bg-red-50/50 p-6 rounded-lg border border-red-200">
                    {instructions.map((instruction, index) => (
                        <p key={index} className="whitespace-pre-wrap leading-relaxed">{instruction}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};
