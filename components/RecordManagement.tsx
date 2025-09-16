import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AutocompleteSelect } from './AutocompleteSelect.js';
import { formatDisplayDate, formatDisplayDateOnly } from '../constants.js';
import type { FuelRecord, Aircraft, Tanker, Airport } from '../types.js';
import { arialNormal } from './fonts/arial.js';

interface RecordManagementProps {
    fuelRecords: FuelRecord[];
    onUpdateFuelRecords: (data: FuelRecord[]) => void;
    aircraftData: Aircraft[];
    tankerData: Tanker[];
    airportList: Airport[];
    showMessage: (text: string, type: 'success' | 'error') => void;
}

export const RecordManagement = ({ fuelRecords, onUpdateFuelRecords, aircraftData, tankerData, airportList, showMessage }: RecordManagementProps) => {
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        tailNumber: '',
        aircraftType: '',
        company: '',
        receiptNumber: '',
        tankerPlate: '',
        airport: ''
    });
    const [displayedRecords, setDisplayedRecords] = useState<FuelRecord[]>([]);
    const [editingRecord, setEditingRecord] = useState<FuelRecord | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const filterOptions = useMemo(() => {
        const tailNumbers = [...new Set(fuelRecords.map(r => r.tailNumber).filter(Boolean))].sort();
        const aircraftTypes = [...new Set(aircraftData.map(a => a.aircraftType))].sort();
        const companies = [...new Set([...aircraftData.map(a => a.company), ...tankerData.map(t => t.company)].filter(Boolean))].sort();
        const tankerPlates = [...new Set(tankerData.map(t => t.plate))].sort();
        const airports = [...new Set(airportList.map(a => a.name))].sort();
        return { tailNumbers, aircraftTypes, companies, tankerPlates, airports };
    }, [fuelRecords, aircraftData, tankerData, airportList]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement> | {target: {name: string, value: string}}) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const runFilter = () => {
        const aircraftInfoMap = new Map(aircraftData.map(a => [a.tailNumber, { type: a.aircraftType, company: a.company }]));
        return fuelRecords.filter(record => {
            if (filters.startDate && record.date < filters.startDate) return false;
            if (filters.endDate && record.date > filters.endDate) return false;
            if (filters.tailNumber && record.tailNumber !== filters.tailNumber) return false;
            if (filters.receiptNumber && !(record.receiptNumber || '').includes(filters.receiptNumber)) return false;

            const recordTankerPlate = record.tankerPlate || record.receivingTankerPlate || record.fillingTankerPlate;
            if (filters.tankerPlate && record.location !== filters.tankerPlate && recordTankerPlate !== filters.tankerPlate) return false;
            
            if (filters.airport && record.location !== filters.airport) return false;

            const aircraftInfo = record.tailNumber ? aircraftInfoMap.get(record.tailNumber) : null;
            if (filters.aircraftType && (!aircraftInfo || aircraftInfo.type !== filters.aircraftType)) return false;
            if (filters.company && (!aircraftInfo || aircraftInfo.company !== filters.company)) return false;

            return true;
        });
    }

    const handleSearch = () => {
        const filtered = runFilter();
        if (filtered.length === 0) {
            showMessage('Filtrelerle eşleşen veri bulunamadı.', 'error');
        }
        setDisplayedRecords(filtered);
        setSelectedIds(new Set());
    };

    const handleDeleteSelected = () => {
        if (selectedIds.size === 0) {
            showMessage('Lütfen silmek için en az bir kayıt seçin.', 'error');
            return;
        }
        const updatedList = fuelRecords.filter(rec => !selectedIds.has(rec.id));
        onUpdateFuelRecords(updatedList);
        setDisplayedRecords(prev => prev.filter(rec => !selectedIds.has(rec.id)));
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
            setSelectedIds(new Set(displayedRecords.map(r => r.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const getReceiptLink = (record: FuelRecord) => {
        if (record.recordType === 'tankerDolum' || record.recordType === 'tankerTransfer') {
            return "https://bulut.ogm.gov.tr/TANKERYAKITT1";
        }
        if (record.recordType === 'personnel' && record.tailNumber) {
            const aircraft = aircraftData.find(a => a.tailNumber === record.tailNumber);
            if (!aircraft) return null;
            const companyName = aircraft.company?.toLowerCase().trim() || '';
            const ogmCompanies = ['ogm', 'orman'];
            if (ogmCompanies.some(ogmComp => companyName.includes(ogmComp))) {
                return "https://bulut.ogm.gov.tr/OGMMAKBUZ";
            } else {
                return "https://bulut.ogm.gov.tr/KIRALIKYAKIT1";
            }
        }
        return null;
    };

    const handleExport = (format: 'xlsx' | 'pdf') => {
        if (displayedRecords.length === 0) {
            showMessage('Lütfen önce veri aratın.', 'error');
            return;
        }
        const headers = ['Kayıt No', 'Tarih', 'Personel Adı', 'Mesleği', 'İkmal Tipi', 'Konum', 'Makbuz Numarası', 'Kuyruk No', 'Kart No', 'Yakıt (lt)'];
        const data = displayedRecords.map(record => [
            formatDisplayDate(record.kayitNumarasi),
            formatDisplayDateOnly(record.date),
            record.personnelName || '--',
            record.jobTitle || '-',
            record.locationType || '--',
            record.location || '--',
            record.receiptNumber || '--',
            record.tailNumber || '-',
            record.cardNumber || '-',
            record.fuelAmount ? record.fuelAmount.toFixed(2) : '0.00'
        ]);

        if (format === 'xlsx') {
            const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Yakıt Kayıtları');
            XLSX.writeFile(workbook, 'yakit_kayitlari_raporu.xlsx');
        } else if (format === 'pdf') {
            const doc = new jsPDF();
            
            // Embed Arial font for Turkish character support
            (doc as any).addFileToVFS('Arial.ttf', arialNormal);
            (doc as any).addFont('Arial.ttf', 'Arial', 'normal');
            doc.setFont('Arial');

            const pageWidth = doc.internal.pageSize.getWidth();
            doc.setFontSize(16);
            doc.text('ORMAN GENEL MÜDÜRLÜĞÜ', pageWidth / 2, 15, { align: 'center' });
            doc.setFontSize(14);
            doc.text('HAVACILIK DAİRESİ', pageWidth / 2, 22, { align: 'center' });
            doc.setFontSize(12);
            doc.text('YAKIT TAKİP SİSTEMİ', pageWidth / 2, 29, { align: 'center' });

            (doc as any).autoTable({
                startY: 35,
                head: [headers],
                body: data,
                theme: 'grid',
                styles: {
                    font: 'Arial',
                    fontStyle: 'normal',
                },
                headStyles: {
                    fillColor: [58, 106, 81], // ogm-green-700
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                },
            });
            doc.save('yakit_kayitlari_raporu.pdf');
        }
        showMessage(`Rapor ${format.toUpperCase()} olarak başarıyla oluşturuldu.`, 'success');
    };


    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-700">Makbuz Yönetimi</h2>
            <div className="p-6 bg-black/5 rounded-lg border border-slate-200 space-y-4">
                <h3 className="text-lg font-semibold text-slate-700">Filtreleme Seçenekleri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md" />
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md" />
                    <input type="text" name="receiptNumber" value={filters.receiptNumber} onChange={handleFilterChange} className="w-full p-2 border border-slate-300 rounded-md" placeholder="Makbuz No Girin" />
                    <AutocompleteSelect options={filterOptions.tankerPlates.map(p => ({ value: p, label: p }))} value={filters.tankerPlate} onChange={(v) => handleFilterChange({target:{name:'tankerPlate',value:v}})} placeholder="Plaka Filtrele" className="w-full p-2 border border-slate-300 rounded-md" />
                    <AutocompleteSelect options={filterOptions.airports.map(a => ({ value: a, label: a }))} value={filters.airport} onChange={(v) => handleFilterChange({target:{name:'airport',value:v}})} placeholder="Hava Limanı Filtrele" className="w-full p-2 border border-slate-300 rounded-md" />
                    <AutocompleteSelect options={filterOptions.tailNumbers.map(tn => ({ value: tn, label: tn }))} value={filters.tailNumber} onChange={(v) => handleFilterChange({target:{name:'tailNumber',value:v}})} placeholder="Kuyruk No Filtrele" className="w-full p-2 border border-slate-300 rounded-md" />
                    <AutocompleteSelect options={filterOptions.aircraftTypes.map(t => ({ value: t, label: t }))} value={filters.aircraftType} onChange={(v) => handleFilterChange({target:{name:'aircraftType',value:v}})} placeholder="Tip Filtrele" className="w-full p-2 border border-slate-300 rounded-md" />
                    <AutocompleteSelect options={filterOptions.companies.map(c => ({ value: c, label: c }))} value={filters.company} onChange={(v) => handleFilterChange({target:{name:'company',value:v}})} placeholder="Firma Filtrele" className="w-full p-2 border border-slate-300 rounded-md" />
                </div>
                <div className="pt-4">
                     <button onClick={handleSearch} className="py-2 px-5 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700 transition-colors">Ara</button>
                </div>
            </div>
             <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-semibold text-slate-700">Sonuçlar</h3>
                    {displayedRecords.length > 0 && <div className="flex gap-2">
                        <button onClick={() => handleExport('xlsx')} title="Excel Olarak İndir" className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                        <button onClick={() => handleExport('pdf')} title="PDF Olarak İndir" className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        </button>
                    </div>}
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="p-3 w-10"><input type="checkbox" onChange={handleSelectAll} checked={selectedIds.size === displayedRecords.length && displayedRecords.length > 0} /></th>
                                {['Kayıt No', 'Tarih', 'Personel', 'Meslek', 'Konum', 'Makbuz Numarası', 'Kuyruk No', 'Kart No', 'Yakıt (lt)', 'Makbuz Linki'].map(header => (
                                    <th key={header} className="p-3 text-left font-semibold text-slate-600">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {displayedRecords.length > 0 ? displayedRecords.map(record => (
                                <tr key={record.id} onDoubleClick={() => setEditingRecord(record)} className="hover:bg-slate-50 cursor-pointer">
                                    <td className="p-3"><input type="checkbox" checked={selectedIds.has(record.id)} onChange={() => handleSelect(record.id)} /></td>
                                    <td className="p-3">{formatDisplayDate(record.kayitNumarasi)}</td>
                                    <td className="p-3">{formatDisplayDateOnly(record.date)}</td>
                                    <td className="p-3">{record.personnelName || '--'}</td>
                                    <td className="p-3">{record.jobTitle || '-'}</td>
                                    <td className="p-3">{record.location || '--'}</td>
                                    <td className="p-3">{record.receiptNumber || '--'}</td>
                                    <td className="p-3">{record.tailNumber || '-'}</td>
                                    <td className="p-3">{record.cardNumber || '-'}</td>
                                    <td className="p-3">{record.fuelAmount.toFixed(2)}</td>
                                    <td className="p-3">
                                        {(() => {
                                            const link = getReceiptLink(record);
                                            return link ? <a href={link} target="_blank" rel="noopener noreferrer" className="text-ogm-green-600 hover:text-ogm-green-800 hover:underline font-semibold">Klasöre Git</a> : '-';
                                        })()}
                                    </td>
                                </tr>
                            )) : <tr><td colSpan={11} className="text-center p-6 text-slate-500">Arama yapmak için filtreleri kullanın.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {selectedIds.size > 0 &&
                <button onClick={handleDeleteSelected} className="mt-4 py-2 px-4 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600">Seçilenleri Sil</button>
                }
            </div>
        </div>
    );
};