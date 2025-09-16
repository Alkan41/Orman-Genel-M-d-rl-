import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';

import { Header } from './components/Header.js';
import { Tabs } from './components/Tabs.js';
import { MessageBox } from './components/MessageBox.js';
import { FuelEntryForm } from './components/FuelEntryForm.js';
import { SearchRecords } from './components/SearchRecords.js';
import { AdminPanel } from './components/AdminPanel.js';
import { LoadingSpinner } from './components/LoadingSpinner.js';
import { CriticalErrorDisplay } from './components/CriticalErrorDisplay.js';
import { BackgroundSlideshow } from './components/BackgroundSlideshow.js';

import { SCRIPT_URL, VIEW_FUEL_ENTRY, VIEW_SEARCH_RECORDS, VIEW_ADMIN_PANEL, INITIAL_PERSONNEL_LIST, INITIAL_AIRPORT_LIST, generateRecordNumber, parseSheetDate } from './constants.js';
import type { View, Message, User, FuelRecord, Aircraft, Tanker, Airport, ApprovalRequest, PersonnelApprovalRequest, Personnel } from './types.js';

const normalizeSheetRecord = (rec: any, allPersonnel: Personnel[]): FuelRecord | null => {
    const recordType = rec['Kayıt Tipi'];
    if (!recordType) return null;

    const normalized: Partial<FuelRecord> = {
        id: `sheet-${rec['Makbuz Numarası'] || ''}-${Math.random()}`,
        kayitNumarasi: rec['Kayıt No'] || generateRecordNumber(), // Fallback for older data
        date: parseSheetDate(rec['Tarih']),
        receiptNumber: rec['Makbuz Numarası'],
        fuelAmount: parseFloat(String(rec['Yakıt Miktarı (lt)'] || '0').replace(',', '.')) || 0,
    };
    
    if (!normalized.date) return null; // Skip records with unparseable dates

    if (recordType === 'Hava Aracı İkmal') {
        normalized.recordType = 'personnel';
        normalized.tailNumber = rec['Kuyruk Numarası'];
        normalized.personnelName = rec['Personel Adı'];
        normalized.jobTitle = rec['Mesleği'];
        normalized.cardNumber = rec['Kart Numarası'];
        normalized.locationType = rec['İkmal Tipi'];
        normalized.location = rec['İkmal Konumu'];
    } else if (recordType === 'Tanker Dolum') {
        normalized.recordType = 'tankerDolum';
        normalized.personnelName = 'Tanker Dolum';
        normalized.locationType = 'Tanker Dolum';
        normalized.tankerPlate = rec['Dolum Yapılan Tanker Plakası'];
        normalized.location = rec['Dolum Yapılan Hava Limanı'];
    } else if (recordType === 'Tanker Transfer') {
        normalized.recordType = 'tankerTransfer';
        normalized.personnelName = 'Tanker Transfer';
        normalized.locationType = 'Tanker Transfer';
        normalized.receivingTankerPlate = rec['Yakıtı Alan Tanker Plakası'];
        normalized.fillingTankerPlate = rec['Yakıtı Veren Tanker Plakası'];
        normalized.location = `${rec['Yakıtı Veren Tanker Plakası'] || ''} -> ${rec['Yakıtı Alan Tanker Plakası'] || ''}`;
    } else {
        return null;
    }

    if (normalized.personnelName && allPersonnel) {
        const p = allPersonnel.find(person => person.name === normalized.personnelName);
        if(p) normalized.personnelId = p.id;
    }
    
    return normalized as FuelRecord;
};

const deNormalizeRecord = (record: Partial<FuelRecord>): any => {
    const denormalized: { [key: string]: any } = {
        'Tarih': record.date || '',
        'Kayıt Tipi': '',
        'Makbuz Numarası': record.receiptNumber || '',
        'Yakıt Miktarı (lt)': record.fuelAmount || 0,
        'Kuyruk Numarası': '',
        'Personel Adı': '',
        'Mesleği': '',
        'Kart Numarası': '',
        'İkmal Tipi': '',
        'İkmal Konumu': '',
        'Dolum Yapılan Tanker Plakası': '',
        'Dolum Yapılan Hava Limanı': '',
        'Yakıtı Alan Tanker Plakası': '',
        'Yakıtı Veren Tanker Plakası': '',
    };
    
    denormalized['Kayıt No'] = record.kayitNumarasi || '';

    if (record.recordType === 'personnel') {
        denormalized['Kayıt Tipi'] = 'Hava Aracı İkmal';
        denormalized['Kuyruk Numarası'] = record.tailNumber || '';
        denormalized['Personel Adı'] = record.personnelName || '';
        denormalized['Mesleği'] = record.jobTitle || '';
        denormalized['Kart Numarası'] = record.cardNumber || '';
        denormalized['İkmal Tipi'] = record.locationType || '';
        denormalized['İkmal Konumu'] = record.location || '';
    } else if (record.recordType === 'tankerDolum') {
        denormalized['Kayıt Tipi'] = 'Tanker Dolum';
        denormalized['Dolum Yapılan Tanker Plakası'] = record.tankerPlate || '';
        denormalized['Dolum Yapılan Hava Limanı'] = record.location || '';
    } else if (record.recordType === 'tankerTransfer') {
        denormalized['Kayıt Tipi'] = 'Tanker Transfer';
        denormalized['Yakıtı Alan Tanker Plakası'] = record.receivingTankerPlate || '';
        denormalized['Yakıtı Veren Tanker Plakası'] = record.fillingTankerPlate || '';
    }

    return denormalized;
};

export const App = () => {
    const [activeView, setActiveView] = useState<View>(VIEW_FUEL_ENTRY);
    const [message, setMessage] = useState<Message | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [criticalError, setCriticalError] = useState<string | null>(null);

    const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
    const [aircraftData, setAircraftData] = useState<Aircraft[]>([]);
    const [tankerData, setTankerData] = useState<Tanker[]>([]);
    const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
    const [personnelApprovalRequests, setPersonnelApprovalRequests] = useState<PersonnelApprovalRequest[]>([]);
    const [personnelList, setPersonnelList] = useState<Personnel[]>(INITIAL_PERSONNEL_LIST);
    const [adminCredentials, setAdminCredentials] = useState<User[]>([{ id: 'user-0', name: 'OGM Admin', username: 'ogm', password: '1839' }]);
    const [airportList, setAirportList] = useState<Airport[]>(INITIAL_AIRPORT_LIST);

    const showMessage = (text: string, type: 'success' | 'error') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000);
    };

    const postData = async (action: string, payload: any) => {
        setIsProcessing(true);
        try {
            const requestBody = { action, payload };
            const res = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(requestBody)
            });

            const responseText = await res.text();

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', responseText);
                throw new Error(`Sunucudan geçersiz veya boş bir yanıt alındı. HTTP Durumu: ${res.status}`);
            }

            if (result.status !== 'success' && result.success !== true) {
                 if (result.success === false && (action.includes('ApproveRequest') || action.includes('RejectRequest'))) {
                     showMessage(result.message || 'İşlem tamamlanamadı ama veri yenilendi.', 'error');
                     return result;
                 }
                 throw new Error(result.message || 'Komut dosyası tarafında bilinmeyen bir hata oluştu.');
            }
            return result;

        } catch (error: any) {
            console.error(`"postData" hatası (eylem: "${action}"):`, error);
            if (error.message && (error.message.includes('SPREADSHEET_ID') || error.message.includes('E-Tablo Açılamadı'))) {
                 // Do not show a toast for this critical error; the main useEffect will handle it.
            } else if (error.message.includes('Failed to fetch')) {
                 showMessage('Ağ Hatası: Sunucuya ulaşılamadı. Lütfen internet bağlantınızı kontrol edin.', 'error');
            } else {
                showMessage(`İşlem Başarısız: ${error.message}`, 'error');
            }
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                setCriticalError(null);
                const [panelDataResult, approvalRequestsResult, personnelApprovalRequestsResult] = await Promise.all([
                    postData('onGetAdminPanelData', null),
                    postData('onGetApprovalRequests', null),
                    postData('onGetPersonnelApprovalRequests', null)
                ]);

                const panelData = panelDataResult.data;
                const personnelData = panelData.personnel && panelData.personnel.length > 0 ? panelData.personnel : INITIAL_PERSONNEL_LIST;

                const normalizedFuelRecords = (panelData.fuelRecords || []).map((rec: any) => normalizeSheetRecord(rec, personnelData)).filter(Boolean);

                setFuelRecords(normalizedFuelRecords);
                setAircraftData(panelData.aircrafts || []);
                setTankerData(panelData.tankers || []);
                setPersonnelList(personnelData);
                setAdminCredentials(panelData.admins && panelData.admins.length > 0 ? panelData.admins : [{ id: 'user-0', name: 'OGM Admin', username: 'ogm', password: '1839' }]);
                
                const typedAirports = (panelData.airports as any[] || [])
                    .filter((a): a is Airport => a && typeof a.id === 'string' && typeof a.name === 'string' && (a.type === 'Sivil' || a.type === 'Askeri'));
                setAirportList(typedAirports.length > 0 ? typedAirports : INITIAL_AIRPORT_LIST);

                setApprovalRequests(approvalRequestsResult.data || []);
                setPersonnelApprovalRequests(personnelApprovalRequestsResult.data || []);

            } catch (error: any) {
                console.error("Failed to fetch initial data:", error);
                if (error.message && (error.message.includes('SPREADSHEET_ID') || error.message.includes('E-Tablo Açılamadı'))) {
                    setCriticalError(
                        "Uygulama Başlatılamadı: Arka Uç Yapılandırma Hatası\n\n" +
                        "Google E-Tablosu'na bağlanılamıyor. Lütfen aşağıdaki adımları kontrol edin:\n\n" +
                        "1. Google Apps Script projenizdeki `Code.js` dosyasını açın.\n\n" +
                        "2. `SPREADSHEET_ID` değişkeninin doğru E-Tablo kimliği ile ayarlandığından emin olun. (Kimlik, E-Tablo URL'sinde `/d/` ve `/edit` arasındaki kısımdır.)\n\n" +
                        "3. Komut dosyasını dağıtan Google hesabının, ilgili E-Tablo dosyası üzerinde 'Düzenleyici' (Editor) yetkisine sahip olduğundan emin olun.\n\n" +
                        "Bu değişiklikleri yaptıktan sonra, Apps Script projenizi yeniden dağıtmayı unutmayın (Deploy > Manage deployments > Düzenle Simgesi > Version: New version)."
                    );
                } else {
                     setCriticalError(
                        "Uygulama Başlatılamadı: Arka Uç Sunucusuna Bağlanılamadı\n\n" +
                        "Genel bir ağ hatası oluştu. Lütfen aşağıdaki adımları kontrol edin:\n\n" +
                        "1. İnternet bağlantınızın çalıştığından emin olun.\n\n" +
                        "2. Google Apps Script projenizin doğru bir şekilde dağıtıldığından (deployed) emin olun. (Deploy > Manage deployments > Web app URL'si aktif olmalı).\n\n" +
                        "3. Dağıtım ayarlarında 'Execute as' seçeneğinin 'Me' (siz) ve 'Who has access' seçeneğinin 'Anyone' (herkes) olarak ayarlandığını doğrulayın. Bu, uygulamanın komut dosyasına erişim izni olmasını sağlar.\n\n" +
                        "4. `constants.ts` dosyasındaki `SCRIPT_URL`'nin, dağıtımınızın URL'si ile eşleştiğini kontrol edin."
                    );
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddRecord = async (record: FuelRecord) => {
        const denormalizedRecord = deNormalizeRecord(record);
        await postData('onAddRecord', denormalizedRecord);
        setFuelRecords(prev => [...prev, record]);
    };
    
    const handleAddPersonnelRequest = async (request: { name: string; job: string; }) => {
        const requestWithTimestamp: PersonnelApprovalRequest = {
            id: `personnel-req-${Date.now()}`,
            name: request.name,
            job: request.job,
            timestamp: new Date().toISOString()
        };
        await postData('onAddPersonnelRequest', requestWithTimestamp);
        setPersonnelApprovalRequests(prev => [...prev, requestWithTimestamp]);
    }

    const handleAddApprovalRequest = async (request: ApprovalRequest) => {
        const payload = {
            ...request,
            originalRecord: JSON.stringify(request.originalRecord),
            requestedChanges: JSON.stringify(request.requestedChanges),
        };
        await postData('onAddApprovalRequest', payload);
        setApprovalRequests(prev => [...prev, request]);
    };
    
    const handleBulkUpdate = async (updates: any) => {
        const denormalizedUpdates: any = {};
        if (updates.aircraftData) denormalizedUpdates.aircraftData = updates.aircraftData;
        if (updates.tankerData) denormalizedUpdates.tankerData = updates.tankerData;
        if (updates.personnelList) denormalizedUpdates.personnelList = updates.personnelList;
        if (updates.airportList) denormalizedUpdates.airportList = updates.airportList;
        if (updates.admins) denormalizedUpdates.admins = updates.admins;
        if (updates.fuelRecords) {
            denormalizedUpdates.fuelRecords = updates.fuelRecords.map(deNormalizeRecord);
        }

        await postData('onBulkUpdate', denormalizedUpdates);
        
        if (updates.aircraftData) setAircraftData(updates.aircraftData);
        if (updates.tankerData) setTankerData(updates.tankerData);
        if (updates.personnelList) setPersonnelList(updates.personnelList);
        if (updates.airportList) setAirportList(updates.airportList);
        if (updates.admins) setAdminCredentials(updates.admins);
        if (updates.fuelRecords) setFuelRecords(updates.fuelRecords);
    };

    const handleEditApproval = async (request: ApprovalRequest, approved: boolean) => {
        const updatedRecord = { ...request.originalRecord, ...request.requestedChanges };
        const payload = {
            requestId: request.id,
            originalRecord: deNormalizeRecord(request.originalRecord),
            updatedRecord: deNormalizeRecord(updatedRecord)
        };
        const action = approved ? 'onApproveRequest' : 'onRejectRequest';

        const result = await postData(action, payload);
        
        setFuelRecords(result.data.fuelRecords.map((r: any) => normalizeSheetRecord(r, personnelList)).filter(Boolean));
        setApprovalRequests(result.data.approvalRequests);
        
        showMessage(`Talep ${approved ? 'onaylandı' : 'reddedildi'}.`, 'success');
    };

    const handlePersonnelApproval = async (requestId: string, approved: boolean) => {
        const payload = { requestId };
        const action = approved ? 'onApprovePersonnelRequest' : 'onRejectPersonnelRequest';
        const result = await postData(action, payload);
        setPersonnelList(result.data.personnelList);
        setPersonnelApprovalRequests(result.data.personnelApprovalRequests);
        showMessage(`Personel talebi ${approved ? 'onaylandı' : 'reddedildi'}.`, 'success');
    };

    const updateAircraftData = (data: Aircraft[]) => handleBulkUpdate({ aircraftData: data });
    const updateTankerData = (data: Tanker[]) => handleBulkUpdate({ tankerData: data });
    const updatePersonnelList = (data: Personnel[]) => handleBulkUpdate({ personnelList: data });
    const updateAirportList = (data: Airport[]) => handleBulkUpdate({ airportList: data });
    const addAdminUser = (user: User) => handleBulkUpdate({ admins: [...adminCredentials, user] });
    const deleteAdminUser = (userId: string) => handleBulkUpdate({ admins: adminCredentials.filter(u => u.id !== userId) });
    const updateFuelRecords = (data: FuelRecord[]) => handleBulkUpdate({ fuelRecords: data });

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-gray-100 flex justify-center items-center">
                <div className="text-center">
                    <LoadingSpinner isVisible={true} />
                    <p className="mt-4 text-lg text-slate-600 font-semibold">Veriler yükleniyor...</p>
                </div>
            </div>
        );
    }
    
    if (criticalError) {
        return <CriticalErrorDisplay message={criticalError} />;
    }

    return (
        <>
            <BackgroundSlideshow />
            <div className="min-h-screen py-4 sm:py-6 md:py-8">
                <div className="container mx-auto px-4">
                    <Header />
                    <div className="bg-white/70 backdrop-blur-md rounded-b-2xl shadow-xl p-6 sm:p-8 md:p-10">
                        <LoadingSpinner isVisible={isProcessing} />
                        {message && <MessageBox text={message.text} type={message.type} />}
                        <Tabs activeView={activeView} setActiveView={setActiveView} />
                        <main className="mt-8">
                            {activeView === VIEW_FUEL_ENTRY &&
                                <FuelEntryForm
                                    personnelList={personnelList}
                                    aircraftData={aircraftData}
                                    tankerData={tankerData}
                                    airportList={airportList}
                                    onAddRecord={handleAddRecord}
                                    onAddPersonnelRequest={handleAddPersonnelRequest}
                                    showMessage={showMessage}
                                />}
                            {activeView === VIEW_SEARCH_RECORDS &&
                                <SearchRecords
                                    fuelRecords={fuelRecords}
                                    personnelList={personnelList}
                                    aircraftData={aircraftData}
                                    tankerData={tankerData}
                                    airportList={airportList}
                                    onAddApprovalRequest={handleAddApprovalRequest}
                                    showMessage={showMessage}
                                />}
                            {activeView === VIEW_ADMIN_PANEL &&
                                <AdminPanel
                                    aircraftData={aircraftData}
                                    updateAircraftData={updateAircraftData}
                                    tankerData={tankerData}
                                    updateTankerData={updateTankerData}
                                    airportList={airportList}
                                    updateAirportList={updateAirportList}
                                    personnelList={personnelList}
                                    updatePersonnelList={updatePersonnelList}
                                    approvalRequests={approvalRequests}
                                    personnelApprovalRequests={personnelApprovalRequests}
                                    fuelRecords={fuelRecords}
                                    updateFuelRecords={updateFuelRecords}
                                    showMessage={showMessage}
                                    adminCredentials={adminCredentials}
                                    addAdminUser={addAdminUser}
                                    deleteAdminUser={deleteAdminUser}
                                    currentUser={currentUser}
                                    setCurrentUser={setCurrentUser}
                                    handleEditApproval={handleEditApproval}
                                    handlePersonnelApproval={handlePersonnelApproval}
                                    // Fix: Pass the correct 'handleBulkUpdate' function to the 'onBulkUpdate' prop.
                                    onBulkUpdate={handleBulkUpdate}
                                />}
                        </main>
                    </div>
                </div>
            </div>
        </>
    );
};