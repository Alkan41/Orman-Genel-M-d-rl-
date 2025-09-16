import React, { useState } from 'react';
import { Modal } from './Modal.js';
import { AutocompleteSelect } from './AutocompleteSelect.js';
import { AIRCRAFT_TYPES } from '../constants.js';
import type { Aircraft } from '../types.js';

interface AircraftDataManagementProps {
    aircraftData: Aircraft[];
    onUpdate: (data: Aircraft[]) => void;
    showMessage: (text: string, type: 'success' | 'error') => void;
}

export const AircraftDataManagement = ({ aircraftData, onUpdate, showMessage }: AircraftDataManagementProps) => {
    const [newAircraft, setNewAircraft] = useState({ aircraftType: '', tailNumber: '', company: '', callSign: '' });
    const [editingAircraft, setEditingAircraft] = useState<Aircraft | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { target: {name: string, value: string}}) => {
        const { name, value } = e.target;
        setNewAircraft(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAircraft = () => {
        if (!newAircraft.aircraftType || !newAircraft.tailNumber || !newAircraft.company || !newAircraft.callSign) {
            showMessage('Lütfen tüm alanları doldurun.', 'error');
            return;
        }
        const updatedList = [...aircraftData, { ...newAircraft, id: `ac-${Date.now()}`, tailNumber: newAircraft.tailNumber.toUpperCase() }];
        onUpdate(updatedList);
        showMessage('Hava aracı başarıyla eklendi.', 'success');
        setNewAircraft({ aircraftType: '', tailNumber: '', company: '', callSign: '' });
    };

    const handleUpdateAircraft = () => {
        if (!editingAircraft) return;
        const updatedList = aircraftData.map(a => (a.id === editingAircraft.id ? editingAircraft : a));
        onUpdate(updatedList);
        showMessage('Hava aracı güncellendi.', 'success');
        setEditingAircraft(null);
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) {
            showMessage('Lütfen silmek için en az bir kayıt seçin.', 'error');
            return;
        }
        const updatedList = aircraftData.filter(a => !selectedIds.has(a.id));
        onUpdate(updatedList);
        showMessage(`${selectedIds.size} kayıt silindi.`, 'success');
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
            setSelectedIds(new Set(aircraftData.map(a => a.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-black/5 rounded-lg border border-slate-200 space-y-4">
                <h3 className="text-lg font-semibold text-slate-700">Manuel Hava Aracı Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div className="lg:col-span-1">
                        <label className="font-semibold text-slate-600 mb-2 block text-sm">Hava Aracı Tipi:</label>
                        <AutocompleteSelect
                            options={AIRCRAFT_TYPES.map(type => ({ value: type, label: type }))}
                            value={newAircraft.aircraftType}
                            onChange={(value) => handleInputChange({ target: { name: 'aircraftType', value } })}
                            placeholder="Tip Seçin"
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="font-semibold text-slate-600 mb-2 block text-sm">Kuyruk Numarası:</label>
                        <input type="text" name="tailNumber" value={newAircraft.tailNumber} onChange={handleInputChange} placeholder="Kuyruk No" className="p-2 border rounded w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="font-semibold text-slate-600 mb-2 block text-sm">Firma Adı:</label>
                        <input type="text" name="company" value={newAircraft.company} onChange={handleInputChange} placeholder="Firma Adı" className="p-2 border rounded w-full" />
                    </div>
                    <div className="lg:col-span-1">
                        <label className="font-semibold text-slate-600 mb-2 block text-sm">Çağrı Kodu:</label>
                        <input type="text" name="callSign" value={newAircraft.callSign} onChange={handleInputChange} placeholder="Çağrı Kodu" className="p-2 border rounded w-full" />
                    </div>
                    <div className="lg:col-span-1">
                         <button onClick={handleAddAircraft} className="w-full py-2 px-5 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700">Ekle</button>
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Mevcut Hava Araçları</h3>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 w-10"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size === aircraftData.length && aircraftData.length > 0} /></th>
                                {['Kuyruk No', 'Firma', 'Tip', 'Çağrı Kodu'].map(h => <th key={h} className="p-3 text-left font-semibold text-slate-600">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {aircraftData.map(aircraft => (
                                <tr key={aircraft.id} onDoubleClick={() => setEditingAircraft(aircraft)} className="hover:bg-slate-50 cursor-pointer">
                                    <td className="p-3"><input type="checkbox" checked={selectedIds.has(aircraft.id)} onChange={() => handleSelect(aircraft.id)} /></td>
                                    <td className="p-3">{aircraft.tailNumber}</td>
                                    <td className="p-3">{aircraft.company}</td>
                                    <td className="p-3">{aircraft.aircraftType}</td>
                                    <td className="p-3">{aircraft.callSign}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {selectedIds.size > 0 &&
                <button onClick={handleDeleteSelected} className="mt-4 py-2 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">Seçilenleri Sil</button>
                }
            </div>
            <Modal isOpen={!!editingAircraft} onClose={() => setEditingAircraft(null)} title="Hava Aracı Düzenle">
                {editingAircraft && (
                    <div className="space-y-4">
                        <AutocompleteSelect
                            options={AIRCRAFT_TYPES.map(type => ({ value: type, label: type }))}
                            value={editingAircraft.aircraftType}
                            onChange={(value) => setEditingAircraft(p => p && { ...p, aircraftType: value })}
                            placeholder="Tip Seçin veya Arayın"
                            className="w-full p-2 border rounded"
                        />
                        <input type="text" value={editingAircraft.tailNumber} onChange={e => setEditingAircraft(p => p && { ...p, tailNumber: e.target.value.toUpperCase() })} className="w-full p-2 border rounded" placeholder="Kuyruk No" />
                        <input type="text" value={editingAircraft.company} onChange={e => setEditingAircraft(p => p && { ...p, company: e.target.value })} className="w-full p-2 border rounded" placeholder="Firma Adı" />
                        <input type="text" value={editingAircraft.callSign} onChange={e => setEditingAircraft(p => p && { ...p, callSign: e.target.value })} className="w-full p-2 border rounded" placeholder="Çağrı Kodu" />
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setEditingAircraft(null)} className="py-2 px-5 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300">İptal</button>
                            <button onClick={handleUpdateAircraft} className="py-2 px-5 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700">Kaydet</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
