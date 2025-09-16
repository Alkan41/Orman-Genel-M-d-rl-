import React, { useState } from 'react';
import type { User } from '../types.js';

interface AdminLoginProps {
    onLoginSuccess: (user: User) => void;
    showMessage: (text: string, type: 'success' | 'error') => void;
    adminCredentials: User[];
}

export const AdminLogin = ({ onLoginSuccess, showMessage, adminCredentials }: AdminLoginProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        const user = adminCredentials.find(u => u.username === username && String(u.password) === password);
        if (user) {
            showMessage('Giriş başarılı!', 'success');
            const userWithLoginTime = { ...user, loginTime: new Date() };
            onLoginSuccess(userWithLoginTime);
        } else {
            showMessage('Kullanıcı adı veya parola yanlış.', 'error');
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-sm mx-auto p-6 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-2xl font-semibold text-slate-700 mb-6">Yönetici Girişi</h3>
            <div className="w-full space-y-4">
                <div>
                    <label className="font-semibold text-slate-600 mb-2 block">Kullanıcı Adı:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full p-3 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-ogm-green-500"
                        placeholder="Kullanıcı Adı"
                    />
                </div>
                <div>
                    <label className="font-semibold text-slate-600 mb-2 block">Parola:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        className="w-full p-3 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-ogm-green-500"
                        placeholder="Parola"
                    />
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full py-3 px-6 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700 transition-colors"
                >
                    Giriş
                </button>
            </div>
        </div>
    );
};
