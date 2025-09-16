import React, { useState, useEffect, useMemo } from 'react';
import type { Personnel, Aircraft, Tanker, Airport, FuelRecord, PersonnelApprovalRequest } from '../types.js';
import { AutocompleteSelect } from './AutocompleteSelect.js';
import { generateRecordNumber } from '../constants.js';

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full p-3 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-ogm-green-500" />
);
const SelectField = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full p-3 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-ogm-green-500 bg-white" />
);

interface FuelEntryFormProps {
    personnelList: Personnel[];
    aircraftData: Aircraft[];
    tankerData: Tanker[];
    airportList: Airport[];
    onAddRecord: (record: any) => Promise<void>;
    onAddPersonnelRequest: (request: any) => Promise<void>;
    showMessage: (text: string, type: 'success' | 'error') => void;
}

export const FuelEntryForm = ({ personnelList, aircraftData, tankerData, airportList, onAddRecord, onAddPersonnelRequest, showMessage }: FuelEntryFormProps) => {
    const [entryType, setEntryType] = useState('personnel');

    const defaultFormData = {
        date: new Date().toISOString().split('T')[0],
        receiptNumber: '',
        fuelAmount: '',
        kayitNumarasi: '',
        personnelId: '',
        personnelName: '',
        jobTitle: '',
        locationType: '',
        location: '',
        tailNumber: '',
        cardNumber: '',
        tankerPlate: '',
        airport: '',
        receivingTankerPlate: '',
        fillingTankerPlate: '',
    };

    const [isManualPersonnelEntry, setIsManualPersonnelEntry] = useState(false);
    const [manualPersonnel, setManualPersonnel] = useState({ name: '', job: '' });
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(defaultFormData);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setCurrentStep(1);
        setFormData(defaultFormData);
        setIsManualPersonnelEntry(false);
        setManualPersonnel({ name: '', job: '' });
    }, [entryType]);

    const selectedAirport = useMemo(() => {
        if (entryType === 'personnel' && formData.locationType === 'Hava Limanı/Alanı' && formData.location) {
            return airportList.find(a => a.name === formData.location);
        }
        return null;
    }, [formData.location, formData.locationType, airportList, entryType]);

    const isMilitaryLocation = selectedAirport?.type === 'Askeri';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleManualPersonnelChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setManualPersonnel(prev => ({ ...prev, [name]: value }));
    }

    const handleGenericSelect = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePersonnelChange = (selectedValue: string) => {
        const selectedPersonnel = personnelList.find(p => p.id === selectedValue);
        if (selectedPersonnel) {
            setFormData(prev => ({
                ...prev,
                personnelId: selectedPersonnel.id,
                personnelName: selectedPersonnel.name,
                jobTitle: selectedPersonnel.job
            }));
        } else {
            setFormData(prev => ({ ...prev, personnelId: '', personnelName: '', jobTitle: '' }));
        }
    };

    const isStepValid = (step: number) => {
        switch (entryType) {
            case 'personnel':
                switch (step) {
                    case 1:
                        if (isManualPersonnelEntry) {
                            return formData.date && manualPersonnel.name && manualPersonnel.job;
                        }
                        return formData.date && formData.personnelId;
                    case 2: return formData.locationType && formData.location;
                    case 3: return isMilitaryLocation ? formData.cardNumber : true;
                    case 4: return !!(formData.receiptNumber && (!isManualPersonnelEntry && formData.jobTitle !== 'Pilot' || isManualPersonnelEntry && manualPersonnel.job !== 'Pilot' || formData.tailNumber));
                    case 5: return parseFloat(formData.fuelAmount) > 0;
                    default: return true;
                }
            case 'tankerDolum':
                switch (step) {
                    case 1: return formData.date && formData.tankerPlate;
                    case 2: return !!formData.airport;
                    case 3: return !!formData.receiptNumber;
                    case 4: return parseFloat(formData.fuelAmount) > 0;
                    default: return true;
                }
            case 'tankerTransfer':
                switch (step) {
                    case 1: return formData.date && formData.receivingTankerPlate;
                    case 2: return !!formData.fillingTankerPlate;
                    case 3: return !!formData.receiptNumber;
                    case 4: return parseFloat(formData.fuelAmount) > 0;
                    default: return true;
                }
            default: return false;
        }
    };

    const nextStep = () => {
        if (isStepValid(currentStep)) {
            let next = currentStep + 1;
            if (entryType === 'personnel' && currentStep === 2 && !isMilitaryLocation) {
                next++;
            }
            setCurrentStep(next);
        }
    };

    const prevStep = () => {
        let prev = currentStep - 1;
        if (entryType === 'personnel' && currentStep === 4 && !isMilitaryLocation) {
            prev--;
        }
        setCurrentStep(prev);
    };

    const handleSubmit = async () => {
        const maxSteps = entryType === 'personnel' ? 5 : 4;
        if (!isStepValid(maxSteps)) return;
        setIsSubmitting(true);

        let recordToSave: Partial<FuelRecord> = {};
        let redirectUrl = '';
        const kayitNumarasi = generateRecordNumber();

        if (entryType === 'personnel') {
            let formattedReceiptNumber = formData.receiptNumber;
            const finalJobTitle = isManualPersonnelEntry ? manualPersonnel.job : formData.jobTitle;

            if (finalJobTitle === 'Şoför') {
                formattedReceiptNumber = `ATIK / ${formData.receiptNumber}`;
            } else {
                if (formData.locationType === 'Tanker') {
                    const tanker = tankerData.find(t => t.plate === formData.location);
                    if (tanker) {
                        formattedReceiptNumber = `${tanker.company} / ${formData.receiptNumber}`;
                    }
                } else if (selectedAirport) {
                    if (selectedAirport.name.includes('Selçuk-Efes')) {
                        formattedReceiptNumber = `THK / ${formData.receiptNumber}`;
                    } else if (selectedAirport.name.includes('Zonguldak')) {
                         formattedReceiptNumber = `ZON-AIR / ${formData.receiptNumber}`;
                    } else if (selectedAirport.type === 'Askeri') {
                        formattedReceiptNumber = `2025 / ${formData.receiptNumber}`;
                    } else {
                        formattedReceiptNumber = `AN / ${formData.receiptNumber}`;
                    }
                }
            }

            const selectedAircraft = aircraftData.find(a => a.tailNumber === formData.tailNumber);
            const companyName = selectedAircraft?.company?.toLowerCase().trim() || '';
            const ogmCompanies = ['ogm', 'orman'];

            if (ogmCompanies.some(ogmComp => companyName.includes(ogmComp))) {
                redirectUrl = "https://bulut.ogm.gov.tr/MAKBUZ01";
            } else {
                redirectUrl = "https://bulut.ogm.gov.tr/MAKBUZ02";
            }

            let finalPersonnelData = {
                personnelName: formData.personnelName,
                jobTitle: formData.jobTitle
            };

            if(isManualPersonnelEntry) {
                finalPersonnelData = {
                    personnelName: manualPersonnel.name,
                    jobTitle: manualPersonnel.job
                };
                await onAddPersonnelRequest({
                    name: manualPersonnel.name,
                    job: manualPersonnel.job,
                });
            }

            recordToSave = {
                ...formData,
                ...finalPersonnelData,
                fuelAmount: parseFloat(formData.fuelAmount) || 0,
                kayitNumarasi,
                receiptNumber: formattedReceiptNumber,
                recordType: 'personnel',
            };
            if (!isMilitaryLocation) delete recordToSave.cardNumber;

        } else if (entryType === 'tankerDolum' || entryType === 'tankerTransfer') {
             redirectUrl = "https://bulut.ogm.gov.tr/MAKBUZ03";
             if (entryType === 'tankerDolum') {
                recordToSave = {
                    date: formData.date,
                    receiptNumber: formData.receiptNumber,
                    fuelAmount: parseFloat(formData.fuelAmount) || 0,
                    tankerPlate: formData.tankerPlate,
                    location: formData.airport,
                    locationType: "Tanker Dolum",
                    personnelName: 'Tanker Dolum',
                    recordType: 'tankerDolum',
                    kayitNumarasi,
                };
             } else { // tankerTransfer
                recordToSave = {
                    date: formData.date,
                    receiptNumber: formData.receiptNumber,
                    fuelAmount: parseFloat(formData.fuelAmount) || 0,
                    receivingTankerPlate: formData.receivingTankerPlate,
                    fillingTankerPlate: formData.fillingTankerPlate,
                    location: `${formData.fillingTankerPlate} -> ${formData.receivingTankerPlate}`,
                    locationType: "Tanker Transfer",
                    personnelName: 'Tanker Transfer',
                    recordType: 'tankerTransfer',
                    kayitNumarasi,
                };
             }
        }

        try {
            await onAddRecord(recordToSave);
            showMessage('Makbuz yükleme adımına yönlendiriliyorsunuz...', 'success');

            const rootEl = document.getElementById('root');
            if (rootEl) {
                rootEl.style.transition = 'opacity 0.5s ease-out';
                rootEl.style.opacity = '0';
            }

            setTimeout(() => {
                window.location.href = redirectUrl;
                setFormData(defaultFormData);
                setCurrentStep(1);
                setIsSubmitting(false);
            }, 1500);
        } catch (error) {
            console.error("Failed to submit record:", error);
            showMessage('Kayıt gönderilemedi. Lütfen tekrar deneyin.', 'error');
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if(entryType === 'personnel'){
            setFormData(prev => ({ ...prev, location: '' }));
        }
    }, [formData.locationType, entryType]);

    const renderPersonnelSteps = () => {
        switch (currentStep) {
            case 1:
                return <div className="space-y-4">
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Tarih:</label>
                        <InputField type="date" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Adı Soyadı:</label>
                        {!isManualPersonnelEntry ?
                            <AutocompleteSelect
                                options={personnelList.map(p => ({ value: p.id, label: p.name }))}
                                value={formData.personnelId}
                                onChange={handlePersonnelChange}
                                placeholder="Personel Seçiniz veya Arayınız"
                            /> :
                            <div className="space-y-2">
                                <InputField
                                    type="text"
                                    name="name"
                                    value={manualPersonnel.name}
                                    onChange={handleManualPersonnelChange}
                                    placeholder="Ad Soyad Giriniz (BÜYÜK HARFLERLE)"
                                    pattern="[A-ZÇĞİÖŞÜ ]*"
                                    title="Lütfen sadece büyük harf kullanın."
                                    className="w-full p-3 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-ogm-green-500 uppercase"
                                />
                                <SelectField name="job" value={manualPersonnel.job} onChange={handleManualPersonnelChange}>
                                    <option value="" disabled>Meslek Seçiniz</option>
                                    <option value="Pilot">Pilot</option>
                                    <option value="Uçuş Teknisyeni">Uçuş Teknisyeni</option>
                                    <option value="Şoför">Şoför</option>
                                </SelectField>
                            </div>
                        }
                    </div>
                     <div className="flex items-center gap-2 mt-2">
                        <input type="checkbox" id="manual-entry" checked={isManualPersonnelEntry} onChange={(e) => setIsManualPersonnelEntry(e.target.checked)} />
                        <label htmlFor="manual-entry" className="text-sm text-slate-600 cursor-pointer">Listede adım yok</label>
                    </div>
                    {formData.jobTitle && !isManualPersonnelEntry && <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Mesleği:</label>
                        <InputField type="text" name="jobTitle" value={formData.jobTitle} readOnly className="w-full p-3 border border-slate-300 rounded-lg text-slate-700 bg-slate-100" />
                    </div>}
                </div>;
            case 2:
                return <div className="space-y-4">
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">İkmal Tipi:</label>
                         <SelectField name="locationType" value={formData.locationType} onChange={handleChange} required>
                            <option value="" disabled>İkmal Tipi Seçiniz</option>
                            <option value="Tanker">Tanker</option>
                            <option value="Hava Limanı/Alanı">Hava Limanı/Alanı</option>
                        </SelectField>
                    </div>
                    {formData.locationType === 'Tanker' && <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Konum (Tanker Plakası):</label>
                        <AutocompleteSelect
                            options={tankerData.map(t => ({ value: t.plate, label: t.plate }))}
                            value={formData.location}
                            onChange={(value) => handleGenericSelect('location', value)}
                            placeholder="Tanker Plakası Seçiniz veya Arayınız"
                        />
                    </div>}
                    {formData.locationType === 'Hava Limanı/Alanı' && <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Konum (Hava Limanı/Alanı):</label>
                        <AutocompleteSelect
                            options={airportList.map(airport => ({ value: airport.name, label: airport.name }))}
                            value={formData.location}
                            onChange={(value) => handleGenericSelect('location', value)}
                            placeholder="Havalimanı Seçiniz veya Arayınız"
                        />
                    </div>}
                </div>;
            case 3:
                if (!isMilitaryLocation) return null;
                return <div className="space-y-4">
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Kart Numarası:</label>
                        <InputField type="text" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="Kart Numarası Giriniz" required />
                    </div>
                </div>;
            case 4:
                return <div className="space-y-4">
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Makbuz Numarası:</label>
                        <InputField type="text" name="receiptNumber" value={formData.receiptNumber} onChange={handleChange} placeholder="Örn: 123456789" required />
                    </div>
                    {((!isManualPersonnelEntry && formData.jobTitle === 'Pilot') || (isManualPersonnelEntry && manualPersonnel.job === 'Pilot')) && <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Hava Aracı Kuyruk Numarası:</label>
                        <AutocompleteSelect
                            options={aircraftData.map(a => ({ value: a.tailNumber, label: a.tailNumber }))}
                            value={formData.tailNumber}
                            onChange={(value) => handleGenericSelect('tailNumber', value)}
                            placeholder="Kuyruk No Seçiniz veya Arayınız"
                        />
                    </div>}
                </div>;
            case 5:
                return <div className="space-y-4">
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Alınan Yakıt Miktarı (lt):</label>
                        <InputField type="number" name="fuelAmount" value={formData.fuelAmount} onChange={e => setFormData(prev => ({ ...prev, fuelAmount: e.target.value }))} step="0.01" min="0" placeholder="Örn: 500.75" required />
                    </div>
                </div>;
            default: return null;
        }
    };

    const renderTankerDolumSteps = () => {
        switch (currentStep) {
            case 1:
                return <div className="space-y-4">
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Tarih:</label>
                        <InputField type="date" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Tanker Plakası:</label>
                        <AutocompleteSelect
                            options={tankerData.map(t => ({ value: t.plate, label: t.plate }))}
                            value={formData.tankerPlate}
                            onChange={(value) => handleGenericSelect('tankerPlate', value)}
                            placeholder="Tanker Plakası Seçiniz veya Arayınız"
                        />
                    </div>
                </div>;
            case 2:
                return <div className="space-y-4">
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Hava Limanı:</label>
                        <AutocompleteSelect
                            options={airportList.map(a => ({ value: a.name, label: a.name }))}
                            value={formData.airport}
                            onChange={(value) => handleGenericSelect('airport', value)}
                            placeholder="Havalimanı Seçiniz veya Arayınız"
                        />
                    </div>
                </div>;
            case 3:
                return <div className="space-y-4">
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Makbuz Numarası:</label>
                        <InputField type="text" name="receiptNumber" value={formData.receiptNumber} onChange={handleChange} placeholder="Örn: 123456789" required />
                    </div>
                </div>;
            case 4:
                return <div className="space-y-4">
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Alınan Yakıt Miktarı (lt):</label>
                        <InputField type="number" name="fuelAmount" value={formData.fuelAmount} onChange={e => setFormData(prev => ({ ...prev, fuelAmount: e.target.value }))} step="0.01" min="0" placeholder="Örn: 500.75" required />
                    </div>
                </div>;
            default: return null;
        }
    };

    const renderTankerTransferSteps = () => {
        switch (currentStep) {
            case 1:
                return <div className="space-y-4">
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Tarih:</label>
                        <InputField type="date" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Alan Tanker Plakası:</label>
                        <AutocompleteSelect
                            options={tankerData.map(t => ({ value: t.plate, label: t.plate }))}
                            value={formData.receivingTankerPlate}
                            onChange={(value) => handleGenericSelect('receivingTankerPlate', value)}
                            placeholder="Alan Tanker Plakasını Seçiniz"
                        />
                    </div>
                </div>;
            case 2:
                return <div className="space-y-4">
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Dolum Yapan Tanker Plakası:</label>
                        <AutocompleteSelect
                            options={tankerData.map(t => ({ value: t.plate, label: t.plate }))}
                            value={formData.fillingTankerPlate}
                            onChange={(value) => handleGenericSelect('fillingTankerPlate', value)}
                            placeholder="Dolum Yapan Tanker Plakasını Seçiniz"
                        />
                    </div>
                </div>;
            case 3:
                return <div className="space-y-4">
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Makbuz Numarası:</label>
                        <InputField type="text" name="receiptNumber" value={formData.receiptNumber} onChange={handleChange} placeholder="Örn: 123456789" required />
                    </div>
                </div>;
            case 4:
                return <div className="space-y-4">
                    <div className="form-group">
                        <label className="font-semibold text-slate-600 mb-2 block">Transfer Edilen Yakıt Miktarı (lt):</label>
                        <InputField type="number" name="fuelAmount" value={formData.fuelAmount} onChange={e => setFormData(prev => ({ ...prev, fuelAmount: e.target.value }))} step="0.01" min="0" placeholder="Örn: 500.75" required />
                    </div>
                </div>;
            default: return null;
        }
    };

    const renderStep = () => {
        switch (entryType) {
            case 'personnel': return renderPersonnelSteps();
            case 'tankerDolum': return renderTankerDolumSteps();
            case 'tankerTransfer': return renderTankerTransferSteps();
            default: return null;
        }
    };

    const maxSteps = entryType === 'personnel' ? 5 : 4;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-700">Yakıt Girişi</h2>
            <div className="flex justify-center gap-2 sm:gap-4 p-2 bg-black/10 rounded-lg">
                {[
                    { id: 'personnel', label: 'Hava Aracı İkmal' },
                    { id: 'tankerDolum', label: 'Tanker Dolum' },
                    { id: 'tankerTransfer', label: 'Tanker Transfer' }
                ].map(type =>
                    <button
                        key={type.id}
                        onClick={() => setEntryType(type.id)}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all ${entryType === type.id ? 'bg-ogm-green-600 text-white shadow' : 'bg-stone-200 text-stone-800 hover:bg-stone-300 shadow-sm'}`}
                    >
                        {type.label}
                    </button>
                )}
            </div>
            <form onSubmit={e => e.preventDefault()}>
                {renderStep()}
                <div className="flex justify-between gap-4 mt-6">
                    {currentStep > 1 && (
                        <button type="button" onClick={prevStep} className="flex-1 py-3 px-6 bg-stone-200 text-stone-800 rounded-lg font-semibold hover:bg-stone-300 transition-colors shadow-sm">Geri</button>
                    )}
                    {currentStep < maxSteps ? (
                        <button type="button" onClick={nextStep} disabled={!isStepValid(currentStep)} className="flex-1 py-3 px-6 bg-slate-300 text-slate-800 rounded-lg font-semibold hover:bg-slate-400 transition-colors disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed">İleri</button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={isSubmitting || !isStepValid(currentStep)} className="flex-1 py-3 px-6 bg-slate-300 text-slate-800 rounded-lg font-semibold hover:bg-slate-400 transition-colors disabled:bg-slate-200 disabled:text-slate-500">
                            {isSubmitting ? 'Yönlendiriliyor...' : 'Kaydet ve Yönlendir'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};