import React, { useState } from 'react';
import { Modal } from './Modal.js';
import { AutocompleteSelect } from './AutocompleteSelect.js';
import type { Personnel } from '../types.js';

interface PersonnelDataManagementProps {
    personnelList: Personnel[];
    onUpdate: (data: Personnel[]) => void;
    showMessage: (text: string, type: 'success' | 'error') => void;
}

export const PersonnelDataManagement = ({ personnelList, onUpdate, showMessage }: PersonnelDataManagementProps) => {
    const [newPersonnel, setNewPersonnel] = useState({ name: '', job: '' });
    const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | { target: {name: string, value: string}}) => {
        const { name, value } = e.target;
        setNewPersonnel(prev => ({ ...prev, [name]: value }));
    };

    const handleAddPersonnel = () => {
        if (!newPersonnel.name || !newPersonnel.job) {
            showMessage('Lütfen tüm alanları doldurun.', 'error');
            return;
        }
        const updatedList = [...personnelList, { ...newPersonnel, id: `p${Date.now()}` }];
        onUpdate(updatedList);
        showMessage('Personel başarıyla eklendi.', 'success');
        setNewPersonnel({ name: '', job: '' });
    };

    const handleUpdatePersonnel = () => {
        if (!editingPersonnel) return;
        const updatedList = personnelList.map(p => (p.id === editingPersonnel.id ? editingPersonnel : p));
        onUpdate(updatedList);
        showMessage('Personel güncellendi.', 'success');
        setEditingPersonnel(null);
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) {
            showMessage('Lütfen silmek için en az bir kayıt seçin.', 'error');
            return;
        }
        const updatedList = personnelList.filter(p => !selectedIds.has(p.id));
        onUpdate(updatedList);
        showMessage(`${selectedIds.size} personel kaydı silindi.`, 'success');
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
            setSelectedIds(new Set(personnelList.map(p => p.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-black/5 rounded-lg border border-slate-200 space-y-4">
                <h3 className="text-lg font-semibold text-slate-700">Manuel Personel Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" name="name" value={newPersonnel.name} onChange={handleInputChange} placeholder="Adı Soyadı" className="p-2 border rounded" />
                     <AutocompleteSelect
                        options={[{value: 'Pilot', label: 'Pilot'}, {value: 'Uçuş Teknisyeni', label: 'Uçuş Teknisyeni'}, {value: 'Şoför', label: 'Şoför'}]}
                        value={newPersonnel.job}
                        onChange={(value) => handleInputChange({ target: { name: 'job', value } })}
                        placeholder="Meslek Seçiniz"
                        className="p-2 border rounded"
                    />
                    <button onClick={handleAddPersonnel} className="py-2 px-5 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700">Ekle</button>
                </div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Mevcut Personeller</h3>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 w-10"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size === personnelList.length && personnelList.length > 0} /></th>
                                <th className="p-3 text-left font-semibold text-slate-600">Adı Soyadı</th>
                                <th className="p-3 text-left font-semibold text-slate-600">Mesleği</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {personnelList.map(person => (
                                <tr key={person.id} onDoubleClick={() => setEditingPersonnel(person)} className="hover:bg-slate-50 cursor-pointer">
                                    <td className="p-3"><input type="checkbox" checked={selectedIds.has(person.id)} onChange={() => handleSelect(person.id)} /></td>
                                    <td className="p-3">{person.name}</td>
                                    <td className="p-3">{person.job}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {selectedIds.size > 0 &&
                <button onClick={handleDeleteSelected} className="mt-4 py-2 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">Seçilenleri Sil</button>
                }
            </div>
            <Modal isOpen={!!editingPersonnel} onClose={() => setEditingPersonnel(null)} title="Personel Düzenle">
                {editingPersonnel && (
                    <div className="space-y-4">
                        <input type="text" value={editingPersonnel.name} onChange={e => setEditingPersonnel(p => p && { ...p, name: e.target.value })} className="w-full p-2 border rounded" placeholder="Adı Soyadı" />
                        <AutocompleteSelect
                            options={[{value: 'Pilot', label: 'Pilot'}, {value: 'Uçuş Teknisyeni', label: 'Uçuş Teknisyeni'}, {value: 'Şoför', label: 'Şoför'}]}
                            value={editingPersonnel.job}
                            onChange={(value) => setEditingPersonnel(p => p && {...p, job: value})}
                            placeholder="Meslek Seçiniz"
                            className="w-full p-2 border rounded"
                        />
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setEditingPersonnel(null)} className="py-2 px-5 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300">İptal</button>
                            <button onClick={handleUpdatePersonnel} className="py-2 px-5 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700">Kaydet</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
