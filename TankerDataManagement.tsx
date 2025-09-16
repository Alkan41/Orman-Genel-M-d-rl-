import React, { useState } from 'react';
import { Modal } from './Modal.js';
import type { Tanker } from '../types.js';

interface TankerDataManagementProps {
    tankerData: Tanker[];
    onUpdate: (data: Tanker[]) => void;
    showMessage: (text: string, type: 'success' | 'error') => void;
}

export const TankerDataManagement = ({ tankerData, onUpdate, showMessage }: TankerDataManagementProps) => {
    const [newTanker, setNewTanker] = useState({ plate: '', region: '', company: '', capacity: '' });
    const [editingTanker, setEditingTanker] = useState<Tanker | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewTanker(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAddTanker = () => {
        if (!newTanker.plate || !newTanker.region || !newTanker.company || !newTanker.capacity) {
            showMessage('Lütfen tüm alanları doldurun.', 'error');
            return;
        }
        const updatedList = [...tankerData, { ...newTanker, id: `tk-${Date.now()}`, plate: newTanker.plate.toUpperCase(), capacity: parseFloat(newTanker.capacity) }];
        onUpdate(updatedList);
        showMessage('Tanker başarıyla eklendi.', 'success');
        setNewTanker({ plate: '', region: '', company: '', capacity: '' });
    };

    const handleUpdateTanker = () => {
        if (!editingTanker) return;
        const updatedList = tankerData.map(t => (t.id === editingTanker.id ? { ...editingTanker, capacity: parseFloat(String(editingTanker.capacity)) } : t));
        onUpdate(updatedList);
        showMessage('Tanker güncellendi.', 'success');
        setEditingTanker(null);
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) {
            showMessage('Lütfen silmek için en az bir kayıt seçin.', 'error');
            return;
        }
        const updatedList = tankerData.filter(t => !selectedIds.has(t.id));
        onUpdate(updatedList);
        showMessage(`${selectedIds.size} tanker kaydı silindi.`, 'success');
        setSelectedIds(new Set());
    };

    const handleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(tankerData.map(t => t.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-black/5 rounded-lg border border-slate-200 space-y-4">
                <h3 className="text-lg font-semibold text-slate-700">Manuel Tanker Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input type="text" name="plate" value={newTanker.plate} onChange={handleInputChange} placeholder="Tanker Plakası" className="p-2 border rounded" />
                    <input type="text" name="region" value={newTanker.region} onChange={handleInputChange} placeholder="Konuşlu Bölge" className="p-2 border rounded" />
                    <input type="text" name="company" value={newTanker.company} onChange={handleInputChange} placeholder="Firma Adı" className="p-2 border rounded" />
                    <input type="number" name="capacity" value={newTanker.capacity} onChange={handleInputChange} placeholder="Kapasite (Litre)" className="p-2 border rounded" />
                </div>
                <button onClick={handleAddTanker} className="py-2 px-5 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700">Ekle</button>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Mevcut Tankerler</h3>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 w-10"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size === tankerData.length && tankerData.length > 0} /></th>
                                <th className="p-3 text-left font-semibold text-slate-600">Plaka</th>
                                <th className="p-3 text-left font-semibold text-slate-600">Bölge</th>
                                <th className="p-3 text-left font-semibold text-slate-600">Firma</th>
                                <th className="p-3 text-left font-semibold text-slate-600">Kapasite (lt)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {tankerData.map(tanker => (
                                <tr key={tanker.id} onDoubleClick={() => setEditingTanker(tanker)} className="hover:bg-slate-50 cursor-pointer">
                                    <td className="p-3"><input type="checkbox" checked={selectedIds.has(tanker.id)} onChange={() => handleSelect(tanker.id)} /></td>
                                    <td className="p-3">{tanker.plate}</td>
                                    <td className="p-3">{tanker.region}</td>
                                    <td className="p-3">{tanker.company}</td>
                                    <td className="p-3">{tanker.capacity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {selectedIds.size > 0 &&
                <button onClick={handleDeleteSelected} className="mt-4 py-2 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">Seçilenleri Sil</button>
                }
            </div>
            <Modal isOpen={!!editingTanker} onClose={() => setEditingTanker(null)} title="Tanker Düzenle">
                {editingTanker && (
                    <div className="space-y-4">
                        <input type="text" value={editingTanker.plate} onChange={e => setEditingTanker(p => p && { ...p, plate: e.target.value.toUpperCase() })} className="w-full p-2 border rounded" placeholder="Tanker Plakası" />
                        <input type="text" value={editingTanker.region} onChange={e => setEditingTanker(p => p && { ...p, region: e.target.value })} className="w-full p-2 border rounded" placeholder="Konuşlu Bölge" />
                        <input type="text" value={editingTanker.company} onChange={e => setEditingTanker(p => p && { ...p, company: e.target.value })} className="w-full p-2 border rounded" placeholder="Firma Adı" />
                        <input type="number" value={editingTanker.capacity} onChange={e => setEditingTanker(p => p && { ...p, capacity: Number(e.target.value) })} className="w-full p-2 border rounded" placeholder="Kapasite (Litre)" />
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setEditingTanker(null)} className="py-2 px-5 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300">İptal</button>
                            <button onClick={handleUpdateTanker} className="py-2 px-5 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700">Kaydet</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
