import React, { useState } from 'react';
import { AutocompleteSelect } from './AutocompleteSelect.js';
import type { Tanker, FuelRecord } from '../types.js';

interface TankerTakipProps {
    tankerData: Tanker[];
    fuelRecords: FuelRecord[];
    showMessage: (text: string, type: 'success' | 'error') => void;
}

interface Report {
    plate: string;
    capacity: number;
    totalIn: number;
    totalOut: number;
    remaining: number;
    percentage: number;
}

export const TankerTakip = ({ tankerData, fuelRecords, showMessage }: TankerTakipProps) => {
    const [selectedPlate, setSelectedPlate] = useState('');
    const [report, setReport] = useState<Report | null>(null);

    const handleSearch = () => {
        if (!selectedPlate) {
            showMessage('Lütfen bir tanker plakası seçin.', 'error');
            return;
        }
        const selectedTanker = tankerData.find(t => t.plate === selectedPlate);
        if (!selectedTanker) {
            showMessage('Tanker bulunamadı.', 'error');
            setReport(null);
            return;
        }

        let totalIn = 0;
        let totalOut = 0;

        fuelRecords.forEach(record => {
            if (record.recordType === 'tankerDolum' && record.tankerPlate === selectedPlate) {
                totalIn += record.fuelAmount;
            }
            if (record.recordType === 'tankerTransfer' && record.receivingTankerPlate === selectedPlate) {
                totalIn += record.fuelAmount;
            }
            if (record.recordType === 'personnel' && record.locationType === 'Tanker' && record.location === selectedPlate) {
                totalOut += record.fuelAmount;
            }
            if (record.recordType === 'tankerTransfer' && record.fillingTankerPlate === selectedPlate) {
                totalOut += record.fuelAmount;
            }
        });

        const remaining = totalIn - totalOut;
        const capacity = selectedTanker.capacity || 0;
        const percentage = capacity > 0 ? (remaining / capacity) * 100 : 0;

        setReport({
            plate: selectedTanker.plate,
            capacity: capacity,
            totalIn,
            totalOut,
            remaining,
            percentage: Math.max(0, Math.min(100, percentage))
        });
    };

    const getBarColorClass = (percentage: number) => {
        if (percentage < 25) return 'bg-red-600';
        if (percentage < 60) return 'bg-yellow-500';
        return 'bg-ogm-green-600';
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-700">Tanker Takip</h2>
            <div className="p-6 bg-black/5 rounded-lg border border-slate-200 space-y-4">
                 <div className="flex items-end gap-4">
                    <div className="flex-grow">
                        <label className="font-semibold text-slate-600 mb-2 block text-sm">Tanker Plakası:</label>
                        <AutocompleteSelect
                            options={tankerData.map(t => ({ value: t.plate, label: t.plate }))}
                            value={selectedPlate}
                            onChange={(value) => setSelectedPlate(value)}
                            placeholder="Plaka Ara..."
                            className="w-full p-2 border border-slate-300 rounded-md text-base"
                        />
                    </div>
                    <button onClick={handleSearch} className="py-2 px-5 bg-ogm-green-600 text-white rounded-lg font-semibold hover:bg-ogm-green-700 transition-colors">Ara</button>
                </div>
            </div>
            {report && <div className="p-6 bg-white rounded-lg border border-slate-200 space-y-4">
                <h3 className="text-lg font-bold text-slate-800">{report.plate} Durum Raporu</h3>
                <div className="space-y-2">
                    <p className="text-slate-600"><strong>Kapasite: </strong>{report.capacity.toLocaleString('tr-TR')} lt</p>
                    <p className="text-green-600"><strong>Toplam Giren Yakıt: </strong>{report.totalIn.toLocaleString('tr-TR')} lt</p>
                    <p className="text-red-600"><strong>Toplam Çıkan Yakıt: </strong>{report.totalOut.toLocaleString('tr-TR')} lt</p>
                    <p className="text-ogm-green-700 font-bold"><strong>Mevcut Yakıt: </strong>{report.remaining.toLocaleString('tr-TR')} lt</p>
                </div>
                <div className="pt-4">
                    <label className="font-semibold text-slate-600 mb-2 block text-sm">Doluluk Oranı</label>
                    <div className="w-full bg-slate-200 rounded-full h-8">
                        <div
                            className={`h-8 rounded-full text-white font-bold text-sm flex items-center justify-center transition-all duration-500 ${getBarColorClass(report.percentage)}`}
                            style={{ width: `${report.percentage}%` }}
                        >
                           {report.percentage > 10 && `${report.percentage.toFixed(1)}%`}
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    );
};