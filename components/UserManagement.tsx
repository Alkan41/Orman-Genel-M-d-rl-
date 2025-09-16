import React, { useState } from 'react';
import type { User } from '../types.js';

interface UserManagementProps {
    adminCredentials: User[];
    onAddUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    showMessage: (text: string, type: 'success' | 'error') => void;
}

export const UserManagement = ({ adminCredentials, onAddUser, onDeleteUser, showMessage }: UserManagementProps) => {
    const [newUser, setNewUser] = useState({ name: '', username: '', password: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const handleAddUser = () => {
        if (!newUser.name || !newUser.username || !newUser.password) {
            showMessage('Lütfen tüm alanları doldurun.', 'error');
            return;
        }
        if (adminCredentials.some(u => u.username === newUser.username)) {
            showMessage('Bu kullanıcı adı zaten mevcut.', 'error');
            return;
        }
        const userToAdd: User = { ...newUser, id: `user-${Date.now()}` };
        onAddUser(userToAdd);
        showMessage('Yeni kullanıcı başarıyla eklendi.', 'success');
        setNewUser({ name: '', username: '', password: '' });
    };

    const handleDeleteUser = (userId: string) => {
        if (adminCredentials.length <= 1) {
            showMessage('En az bir yönetici kalmalıdır.', 'error');
            return;
        }
        onDeleteUser(userId);
        showMessage('Kullanıcı silindi.', 'success');
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-black/5 rounded-lg border border-slate-200 space-y-4">
                <h3 className="text-lg font-semibold text-slate-700">Yeni Kullanıcı Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" name="name" value={newUser.name} onChange={handleInputChange} placeholder="Adı Soyadı" className="p-2 border rounded" />
                    <input type="text" name="username" value={newUser.username} onChange={handleInputChange} placeholder="Kullanıcı Adı" className="p-2 border rounded" />
                    <input type="password" name="password" value={newUser.password} onChange={handleInputChange} placeholder="Parola" className="p-2 border rounded" />
                    <button onClick={handleAddUser} className="py-2 px-5 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700">Ekle</button>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Mevcut Kullanıcılar</h3>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 text-left font-semibold text-slate-600">Adı Soyadı</th>
                                <th className="p-3 text-left font-semibold text-slate-600">Kullanıcı Adı</th>
                                <th className="p-3 text-left font-semibold text-slate-600">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {adminCredentials.map(user => (
                                <tr key={user.id}>
                                    <td className="p-3">{user.name}</td>
                                    <td className="p-3">{user.username}</td>
                                    <td className="p-3">
                                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700">Sil</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
