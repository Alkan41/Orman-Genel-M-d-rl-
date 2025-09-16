import React, { useState } from 'react';
import { Modal } from './Modal.js';
import type { Airport } from '../types.js';

interface AirportDataManagementProps {
    airportList: Airport[];
    onUpdate: (data: Airport[]) => void;
    showMessage: (text: string, type: 'success' | 'error') => void;
}

export const AirportDataManagement = ({ airportList, onUpdate, showMessage }: AirportDataManagementProps) => {
    const [newAirport, setNewAirport] = useState({ name: '', type: 'Sivil' as 'Sivil' | 'Askeri' });
    const [editingAirport, setEditingAirport] = useState<Airport | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewAirport(prev => ({...prev, [name]: value as any}));
    };

     const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditingAirport(prev => (prev ? {...prev, [name]: value as any} : null));
    };

    const handleAddAirport = () => {
        if (!newAirport.name) {
            showMessage('Lütfen hava limanı adını girin.', 'error');
            return;
        }
        const updatedList = [...airportList, { ...newAirport, id: `airport-${Date.now()}` }];
        onUpdate(updatedList);
        showMessage('Hava limanı başarıyla eklendi.', 'success');
        setNewAirport({ name: '', type: 'Sivil' });
    };

    const handleUpdateAirport = () => {
        if (!editingAirport) return;
        const updatedList = airportList.map(a => (a.id === editingAirport.id ? editingAirport : a));
        onUpdate(updatedList);
        showMessage('Hava limanı güncellendi.', 'success');
        setEditingAirport(null);
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) {
            showMessage('Lütfen silmek için en az bir kayıt seçin.', 'error');
            return;
        }
        const updatedList = airportList.filter(a => !selectedIds.has(a.id));
        onUpdate(updatedList);
        showMessage(`${selectedIds.size} hava limanı kaydı silindi.`, 'success');
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
            setSelectedIds(new Set(airportList.map(a => a.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-black/5 rounded-lg border border-slate-200 space-y-4">
                <h3 className="text-lg font-semibold text-slate-700">Manuel Hava Limanı Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <input type="text" name="name" value={newAirport.name} onChange={handleInputChange} placeholder="Hava Limanı Adı" className="p-2 border rounded col-span-1 md:col-span-2" />
                    <select
                        name="type"
                        value={newAirport.type}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-slate-300 rounded-md bg-white"
                    >
                        <option value="Sivil">Sivil</option>
                        <option value="Askeri">Askeri</option>
                    </select>
                    <button onClick={handleAddAirport} className="py-2 px-5 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700 md:col-span-3">Ekle</button>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Mevcut Hava Limanları</h3>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 w-10"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size === airportList.length && airportList.length > 0} /></th>
                                <th className="p-3 text-left font-semibold text-slate-600">Hava Limanı Adı</th>
                                <th className="p-3 text-left font-semibold text-slate-600">Tipi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {airportList.map(airport => (
                                <tr key={airport.id} onDoubleClick={() => setEditingAirport(airport)} className="hover:bg-slate-50 cursor-pointer">
                                    <td className="p-3"><input type="checkbox" checked={selectedIds.has(airport.id)} onChange={() => handleSelect(airport.id)} /></td>
                                    <td className="p-3">{airport.name}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${airport.type === 'Askeri' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{airport.type}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {selectedIds.size > 0 &&
                <button onClick={handleDeleteSelected} className="mt-4 py-2 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">Seçilenleri Sil</button>
                }
            </div>
            <Modal isOpen={!!editingAirport} onClose={() => setEditingAirport(null)} title="Hava Limanı Düzenle">
                {editingAirport && (
                    <div className="space-y-4">
                        <input type="text" name="name" value={editingAirport.name} onChange={handleEditInputChange} className="w-full p-2 border rounded" placeholder="Hava Limanı Adı" />
                        <select
                            name="type"
                            value={editingAirport.type}
                            onChange={handleEditInputChange}
                            className="w-full p-2 border border-slate-300 rounded-md bg-white"
                        >
                            <option value="Sivil">Sivil</option>
                            <option value="Askeri">Askeri</option>
                        </select>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setEditingAirport(null)} className="py-2 px-5 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300">İptal</button>
                            <button onClick={handleUpdateAirport} className="py-2 px-5 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700">Kaydet</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
