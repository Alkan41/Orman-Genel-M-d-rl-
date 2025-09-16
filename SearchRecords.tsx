import React, { useState, useMemo } from 'react';
import { Modal } from './Modal.js';
import { AutocompleteSelect } from './AutocompleteSelect.js';
import { formatDisplayDate, formatDisplayDateOnly } from '../constants.js';
import type { FuelRecord, Personnel, Aircraft, Tanker, Airport, ApprovalRequest } from '../types.js';

interface SearchRecordsProps {
    fuelRecords: FuelRecord[];
    personnelList: Personnel[];
    aircraftData: Aircraft[];
    tankerData: Tanker[];
    airportList: Airport[];
    onAddApprovalRequest: (request: ApprovalRequest) => void;
    showMessage: (text: string, type: 'success' | 'error') => void;
}

export const SearchRecords = ({ fuelRecords, personnelList, aircraftData, tankerData, airportList, onAddApprovalRequest, showMessage }: SearchRecordsProps) => {
    const [filters, setFilters] = useState({ startDate: '', endDate: '', personnelId: '', tailNumber: '', tankerPlate: '', kayitNumarasi: '' });
    const [displayedRecords, setDisplayedRecords] = useState<FuelRecord[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<FuelRecord | null>(null);
    const [editedFields, setEditedFields] = useState<Partial<FuelRecord>>({});

    const uniqueTailNumbers = useMemo(() => {
        if (!aircraftData) return [];
        return [...new Set(aircraftData.map(a => a.tailNumber))].sort();
    }, [aircraftData]);

    const uniqueTankerPlates = useMemo(() => {
        if (!tankerData) return [];
        return [...new Set(tankerData.map(t => t.plate))].sort();
    }, [tankerData]);

    const allLocations = useMemo(() => {
        if (!tankerData || !airportList) return [];
        const tankerPlates = tankerData.map(t => t.plate);
        const airportNames = airportList.map(a => a.name);
        return [...new Set([...airportNames, ...tankerPlates])].sort();
    }, [tankerData, airportList]);

    const handleSearch = () => {
        const results = fuelRecords.filter(record => {
            const matchesDate = (!filters.startDate || record.date >= filters.startDate) &&
                                (!filters.endDate || record.date <= filters.endDate);
            const matchesPersonnel = !filters.personnelId || record.personnelId === filters.personnelId;
            const matchesTailNumber = !filters.tailNumber || record.tailNumber === filters.tailNumber;
            const matchesTankerPlate = !filters.tankerPlate || (record.locationType === 'Tanker' && record.location === filters.tankerPlate) || (record.tankerPlate === filters.tankerPlate) || (record.receivingTankerPlate === filters.tankerPlate) || (record.fillingTankerPlate === filters.tankerPlate);
            const matchesKayitNumarasi = !filters.kayitNumarasi || (record.kayitNumarasi && String(record.kayitNumarasi).includes(filters.kayitNumarasi));
            return matchesDate && matchesPersonnel && matchesTailNumber && matchesTankerPlate && matchesKayitNumarasi;
        });
        setDisplayedRecords(results);
        setHasSearched(true);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleRowDoubleClick = (record: FuelRecord) => {
        setEditingRecord(record);
        setEditedFields(record);
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { name: string, value: any } }) => {
        const { name, value } = e.target;
        setEditedFields(prev => ({ ...prev, [name]: name === 'fuelAmount' ? parseFloat(value) || 0 : value }));
    };

    const handleEditRequestSubmit = () => {
        if (!editingRecord) return;
        const changes = Object.keys(editedFields).reduce((acc, key) => {
            const typedKey = key as keyof FuelRecord;
            if (String(editedFields[typedKey] ?? '') !== String(editingRecord[typedKey] ?? '')) {
                (acc as Record<string, any>)[typedKey] = editedFields[typedKey];
            }
            return acc;
        }, {} as Partial<FuelRecord>);

        if (Object.keys(changes).length === 0) {
            showMessage('Değişiklik yapılmadı.', 'error');
            return;
        }
        const newRequest: ApprovalRequest = {
            id: `edit-req-${Date.now()}`,
            originalRecord: editingRecord,
            requestedChanges: changes,
            requesterName: editingRecord.personnelName,
            timestamp: new Date().toISOString()
        };
        onAddApprovalRequest(newRequest);
        showMessage('Düzenleme talebiniz yönetici onayına gönderildi.', 'success');
        setIsEditModalOpen(false);
        setEditingRecord(null);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-700">Kayıtları Ara</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-black/5">
                <div>
                    <label className="font-semibold text-slate-600 mb-2 block text-sm">Başlangıç Tarihi:</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md" />
                </div>
                 <div>
                    <label className="font-semibold text-slate-600 mb-2 block text-sm">Bitiş Tarihi:</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md" />
                </div>
                <div>
                    <label className="font-semibold text-slate-600 mb-2 block text-sm">Personel:</label>
                    <AutocompleteSelect
                        options={personnelList.map(p => ({ value: p.id, label: p.name }))}
                        value={filters.personnelId}
                        onChange={(value) => setFilters(prev => ({ ...prev, personnelId: value }))}
                        placeholder="Personel Ara..."
                        className="w-full p-2 border border-slate-300 rounded-md text-base"
                    />
                </div>
                <div>
                    <label className="font-semibold text-slate-600 mb-2 block text-sm">Kuyruk Numarası:</label>
                    <AutocompleteSelect
                        options={uniqueTailNumbers.map(tn => ({ value: tn, label: tn }))}
                        value={filters.tailNumber}
                        onChange={(value) => setFilters(prev => ({ ...prev, tailNumber: value }))}
                        placeholder="Kuyruk No Ara..."
                        className="w-full p-2 border border-slate-300 rounded-md text-base"
                    />
                </div>
                <div>
                    <label className="font-semibold text-slate-600 mb-2 block text-sm">Tanker Plakası:</label>
                    <AutocompleteSelect
                        options={uniqueTankerPlates.map(plate => ({ value: plate, label: plate }))}
                        value={filters.tankerPlate}
                        onChange={(value) => setFilters(prev => ({ ...prev, tankerPlate: value }))}
                        placeholder="Plaka Ara..."
                        className="w-full p-2 border border-slate-300 rounded-md text-base"
                    />
                </div>
                 <div>
                    <label className="font-semibold text-slate-600 mb-2 block text-sm">Kayıt No:</label>
                    <input type="text" name="kayitNumarasi" value={filters.kayitNumarasi} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md" placeholder="Kayıt No Ara..." />
                </div>
            </div>
            <button onClick={handleSearch} className="w-full py-3 px-6 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700 transition-colors">Ara</button>
            <div className="search-results">
                <h3 className="text-xl font-semibold mb-2 text-slate-700">Sonuçlar</h3>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                {['Kayıt No', 'Tarih', 'Personel', 'Meslek', 'Konum', 'Makbuz Numarası', 'Kuyruk No', 'Kart No', 'Yakıt (lt)'].map(header => (
                                    <th key={header} className="p-3 text-left font-semibold text-slate-600">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {displayedRecords.length > 0 ? (
                                displayedRecords.map(record => (
                                    <tr key={record.id} onDoubleClick={() => handleRowDoubleClick(record)} className="hover:bg-slate-50 cursor-pointer">
                                        <td className="p-3">{formatDisplayDate(record.kayitNumarasi)}</td>
                                        <td className="p-3">{formatDisplayDateOnly(record.date)}</td>
                                        <td className="p-3">{record.personnelName || '--'}</td>
                                        <td className="p-3">{record.jobTitle || '-'}</td>
                                        <td className="p-3">{record.location || '--'}</td>
                                        <td className="p-3">{record.receiptNumber || '--'}</td>
                                        <td className="p-3">{record.tailNumber || '-'}</td>
                                        <td className="p-3">{record.cardNumber || '-'}</td>
                                        <td className="p-3">{record.fuelAmount ? record.fuelAmount.toFixed(2) : '0.00'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="text-center p-6 text-slate-500">
                                        {hasSearched ? "Kayıt bulunamadı." : "Arama yapmak için yukarıdaki filtreleri kullanın."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Kayıt Düzenleme Talebi Oluştur">
                {editingRecord && <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold text-slate-600 mb-1 block">Kayıt No:</label>
                            <input type="text" value={editedFields.kayitNumarasi || ''} readOnly className="w-full p-2 border border-slate-300 rounded-md bg-slate-100" />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-600 mb-1 block">Tarih:</label>
                            <input type="date" name="date" value={editedFields.date ? new Date(editedFields.date).toISOString().split('T')[0] : ''} onChange={handleEditChange} className="w-full p-2 border border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-600 mb-1 block">Yakıt Miktarı (lt):</label>
                            <input type="number" name="fuelAmount" value={editedFields.fuelAmount || ''} onChange={handleEditChange} className="w-full p-2 border border-slate-300 rounded-md" />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-600 mb-1 block">Makbuz Numarası:</label>
                            <input type="text" name="receiptNumber" value={editedFields.receiptNumber || ''} onChange={handleEditChange} className="w-full p-2 border border-slate-300 rounded-md" />
                        </div>
                        {editingRecord.recordType === 'personnel' && <>
                            <div>
                                <label className="font-semibold text-slate-600 mb-1 block">Konum:</label>
                                <AutocompleteSelect
                                    options={allLocations.map(loc => ({ value: loc, label: loc }))}
                                    value={editedFields.location || ''}
                                    onChange={(value) => handleEditChange({ target: { name: 'location', value } })}
                                    placeholder="Konum Seçiniz veya Arayınız"
                                    className="w-full p-2 border border-slate-300 rounded-md"
                                />
                            </div>
                            {editingRecord.cardNumber && <div>
                                <label className="font-semibold text-slate-600 mb-1 block">Kart Numarası:</label>
                                <input type="text" name="cardNumber" value={editedFields.cardNumber || ''} onChange={handleEditChange} className="w-full p-2 border border-slate-300 rounded-md" />
                            </div>}
                            {editingRecord.jobTitle === 'Pilot' && <div className="md:col-span-2">
                                <label className="font-semibold text-slate-600 mb-1 block">Kuyruk Numarası:</label>
                                <AutocompleteSelect
                                    options={aircraftData.map(a => ({ value: a.tailNumber, label: a.tailNumber }))}
                                    value={editedFields.tailNumber || ''}
                                    onChange={(value) => handleEditChange({ target: { name: 'tailNumber', value } })}
                                    placeholder="Kuyruk No Seçiniz veya Arayınız"
                                    className="w-full p-2 border border-slate-300 rounded-md"
                                />
                            </div>}
                        </>}
                        {editingRecord.recordType === 'tankerDolum' && <>
                            <div>
                                <label className="font-semibold text-slate-600 mb-1 block">Hava Limanı:</label>
                                <AutocompleteSelect
                                    options={airportList.map(a => ({ value: a.name, label: a.name }))}
                                    value={editedFields.location || ''}
                                    onChange={(value) => handleEditChange({ target: { name: 'location', value } })}
                                    placeholder="Hava Limanı Seçiniz"
                                    className="w-full p-2 border border-slate-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="font-semibold text-slate-600 mb-1 block">Tanker Plakası:</label>
                                <AutocompleteSelect
                                    options={tankerData.map(t => ({ value: t.plate, label: t.plate }))}
                                    value={editedFields.tankerPlate || ''}
                                    onChange={(value) => handleEditChange({ target: { name: 'tankerPlate', value } })}
                                    placeholder="Tanker Plakası Seçiniz"
                                    className="w-full p-2 border border-slate-300 rounded-md"
                                />
                            </div>
                        </>}
                        {editingRecord.recordType === 'tankerTransfer' && <>
                            <div>
                                <label className="font-semibold text-slate-600 mb-1 block">Veren Tanker Plakası:</label>
                                <AutocompleteSelect
                                    options={tankerData.map(t => ({ value: t.plate, label: t.plate }))}
                                    value={editedFields.fillingTankerPlate || ''}
                                    onChange={(value) => handleEditChange({ target: { name: 'fillingTankerPlate', value } })}
                                    placeholder="Veren Tankeri Seçiniz"
                                    className="w-full p-2 border border-slate-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="font-semibold text-slate-600 mb-1 block">Alan Tanker Plakası:</label>
                                <AutocompleteSelect
                                    options={tankerData.map(t => ({ value: t.plate, label: t.plate }))}
                                    value={editedFields.receivingTankerPlate || ''}
                                    onChange={(value) => handleEditChange({ target: { name: 'receivingTankerPlate', value } })}
                                    placeholder="Alan Tankeri Seçiniz"
                                    className="w-full p-2 border border-slate-300 rounded-md"
                                />
                            </div>
                        </>}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button onClick={() => setIsEditModalOpen(false)} className="py-2 px-5 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300">İptal</button>
                        <button onClick={handleEditRequestSubmit} className="py-2 px-5 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700">Talep Oluştur</button>
                    </div>
                </div>}
            </Modal>
        </div>
    );
};