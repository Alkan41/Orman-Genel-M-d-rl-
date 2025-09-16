import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { AdminLogin } from './AdminLogin.js';
import { AircraftDataManagement } from './AircraftDataManagement.js';
import { TankerDataManagement } from './TankerDataManagement.js';
import { AirportDataManagement } from './AirportDataManagement.js';
import { PersonnelDataManagement } from './PersonnelDataManagement.js';
import { UserManagement } from './UserManagement.js';
import { ApprovalRequestsComponent } from './ApprovalRequests.js';
import { RecordManagement } from './RecordManagement.js';
import { TankerTakip } from './TankerTakip.js';
import { FileUpload } from './FileUpload.js';
import { parseSheetDate, generateRecordNumber } from '../constants.js';
import type { User, Aircraft, Tanker, Airport, Personnel, ApprovalRequest, PersonnelApprovalRequest, FuelRecord } from '../types.js';

interface AdminPanelProps {
    aircraftData: Aircraft[];
    updateAircraftData: (data: Aircraft[]) => void;
    tankerData: Tanker[];
    updateTankerData: (data: Tanker[]) => void;
    airportList: Airport[];
    updateAirportList: (data: Airport[]) => void;
    personnelList: Personnel[];
    updatePersonnelList: (data: Personnel[]) => void;
    approvalRequests: ApprovalRequest[];
    personnelApprovalRequests: PersonnelApprovalRequest[];
    fuelRecords: FuelRecord[];
    updateFuelRecords: (data: FuelRecord[]) => void;
    showMessage: (text: string, type: 'success' | 'error') => void;
    adminCredentials: User[];
    addAdminUser: (user: User) => void;
    deleteAdminUser: (userId: string) => void;
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    handleEditApproval: (request: ApprovalRequest, approved: boolean) => Promise<void>;
    handlePersonnelApproval: (requestId: string, approved: boolean) => Promise<void>;
    onBulkUpdate: (updates: any) => Promise<void>;
}

const NavButton = ({ label, children, badge, onClick, isActive }: { label:string, children: React.ReactNode, badge?: number, onClick: () => void, isActive: boolean }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center p-3 text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm relative ${
            isActive ? 'bg-ogm-green-800 text-white' : 'bg-ogm-green-600 text-ogm-green-100 hover:bg-ogm-green-700'
        }`}
    >
        {children}
        {label}
        {badge !== undefined && badge > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">{badge}</span>
        )}
    </button>
);

const UserInfo = ({ user }: { user: User | null }) => {
    if (!user || !user.loginTime) return null;

    return (
        <div className="mt-auto pt-4 border-t border-ogm-green-600 text-center text-white">
            <p className="text-sm font-semibold">{user.name}</p>
            <p className="text-xs">{`Giriş: ${user.loginTime.toLocaleTimeString('tr-TR')}`}</p>
        </div>
    );
};

export const AdminPanel = (props: AdminPanelProps) => {
    const [activeModule, setActiveModule] = useState('dataEntry');
    const [activeDataEntryView, setActiveDataEntryView] = useState('bulkUpload');

    const handleBulkFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const successMessages: string[] = [];
                const updates: any = {};

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    if (json.length < 2) return;

                    const normalizedSheetName = sheetName.trim().toLowerCase();

                    if (normalizedSheetName === 'hava aracı verisi') {
                        const newAircrafts = (json.slice(1) as any[][]).map((row, index) => {
                            if (row.length < 4 || !row[0] || !row[1] || !row[2] || !row[3]) return null;
                            return { id: `file-${Date.now()}-${index}`, tailNumber: String(row[0]).trim().toUpperCase(), company: String(row[1]).trim(), aircraftType: String(row[2]).trim(), callSign: String(row[3]).trim() };
                        }).filter(Boolean);
                        if (newAircrafts.length > 0) {
                            updates.aircraftData = [...props.aircraftData, ...newAircrafts];
                            successMessages.push(`${newAircrafts.length} hava aracı`);
                        }
                    } else if (normalizedSheetName === 'tanker verisi') {
                         const newTankers = (json.slice(1) as any[][]).map((row, index) => {
                            if (row.length < 4 || !row[0] || !row[1] || !row[2] || !row[3]) return null;
                            return { id: `file-tanker-${Date.now()}-${index}`, plate: String(row[0]).trim().toUpperCase(), region: String(row[1]).trim(), company: String(row[2]).trim(), capacity: parseFloat(row[3]) || 0 };
                        }).filter(Boolean);
                        if (newTankers.length > 0) {
                            updates.tankerData = [...props.tankerData, ...newTankers];
                            successMessages.push(`${newTankers.length} tanker`);
                        }
                    } else if (normalizedSheetName === 'personel verisi') {
                        const newPersonnelList = (json.slice(1) as any[][]).map((row, index) => {
                            if (row.length < 2 || !row[0] || !row[1]) return null;
                            const job = String(row[1]).trim();
                            if (!['Pilot', 'Şoför', 'Uçuş Teknisyeni'].includes(job)) return null;
                            return { id: `file-personnel-${Date.now()}-${index}`, name: String(row[0]).trim(), job: job };
                        }).filter(Boolean);
                        if (newPersonnelList.length > 0) {
                            updates.personnelList = [...props.personnelList, ...newPersonnelList];
                            successMessages.push(`${newPersonnelList.length} personel`);
                        }
                    } else if (normalizedSheetName === 'hava limanı verisi') {
                        const newAirports = (json.slice(1) as any[][]).map((row, index): Airport | null => {
                             if (row.length < 2 || !row[0] || !row[1]) return null;
                             const type = String(row[1]).trim();
                             if (type !== 'Sivil' && type !== 'Askeri') return null;
                             return { id: `file-airport-${Date.now()}-${index}`, name: String(row[0]).trim(), type };
                        }).filter((airport): airport is Airport => airport !== null);
                        if (newAirports.length > 0) {
                            updates.airportList = [...props.airportList, ...newAirports];
                            successMessages.push(`${newAirports.length} hava limanı`);
                        }
                    } else if (normalizedSheetName === 'yakıt kayıtları verisi') {
                        const headerRow = (json[0] as string[]).map(h => String(h || '').trim());
                        const colMap = {
                            tarih: headerRow.indexOf('Tarih'),
                            kayitTipi: headerRow.indexOf('Kayıt Tipi'),
                            makbuzNo: headerRow.indexOf('Makbuz Numarası'),
                            yakitMiktari: headerRow.indexOf('Yakıt Miktarı (lt)'),
                            kuyrukNo: headerRow.indexOf('Kuyruk Numarası'),
                            personelAdi: headerRow.indexOf('Personel Adı'),
                            meslegi: headerRow.indexOf('Mesleği'),
                            kartNo: headerRow.indexOf('Kart Numarası'),
                            ikmalTipi: headerRow.indexOf('İkmal Tipi'),
                            ikmalKonumu: headerRow.indexOf('İkmal Konumu'),
                            dolumYapilanTanker: headerRow.indexOf('Dolum Yapılan Tanker Plakası'),
                            dolumYapilanHavaLimani: headerRow.indexOf('Dolum Yapılan Hava Limanı'),
                            yakitiAlanTanker: headerRow.indexOf('Yakıtı Alan Tanker Plakası'),
                            yakitiVerenTanker: headerRow.indexOf('Yakıtı Veren Tanker Plakası'),
                        };

                        if (colMap.tarih === -1 || colMap.kayitTipi === -1 || colMap.makbuzNo === -1 || colMap.yakitMiktari === -1) {
                            props.showMessage('Yakıt kayıtları sayfasında zorunlu sütunlar eksik.', 'error');
                            return;
                        }
                        
                        const newFuelRecords = (json.slice(1) as any[][]).map((row, index) => {
                            try {
                                if (!row || row.length === 0) return null;
                                const recordTypeStr = String(row[colMap.kayitTipi] || '').trim();
                                if (!['Hava Aracı İkmal', 'Tanker Dolum', 'Tanker Transfer'].includes(recordTypeStr)) return null;
                                const dateStr = parseSheetDate(row[colMap.tarih]);
                                if (!dateStr) return null;
                                const baseRecord: Partial<FuelRecord> = {
                                    id: `file-fuel-${Date.now()}-${index}`,
                                    kayitNumarasi: generateRecordNumber(),
                                    date: dateStr,
                                    receiptNumber: String(row[colMap.makbuzNo] || '').trim(),
                                    fuelAmount: parseFloat(String(row[colMap.yakitMiktari] || '0').replace(',', '.')) || 0,
                                };
                                if (recordTypeStr === 'Hava Aracı İkmal') {
                                    const personnelName = String(row[colMap.personelAdi] || '').trim();
                                    const personnel = props.personnelList.find(p => p.name === personnelName);
                                    return { ...baseRecord, recordType: 'personnel', personnelName, personnelId: personnel?.id, jobTitle: String(row[colMap.meslegi] || '').trim(), locationType: String(row[colMap.ikmalTipi] || '').trim(), location: String(row[colMap.ikmalKonumu] || '').trim(), tailNumber: String(row[colMap.kuyrukNo] || '').trim(), cardNumber: String(row[colMap.kartNo] || '').trim() };
                                } else if (recordTypeStr === 'Tanker Dolum') {
                                    return { ...baseRecord, recordType: 'tankerDolum', locationType: "Tanker Dolum", personnelName: 'Tanker Dolum', tankerPlate: String(row[colMap.dolumYapilanTanker] || '').trim(), location: String(row[colMap.dolumYapilanHavaLimani] || '').trim() };
                                } else if (recordTypeStr === 'Tanker Transfer') {
                                    const veren = String(row[colMap.yakitiVerenTanker] || '').trim();
                                    const alan = String(row[colMap.yakitiAlanTanker] || '').trim();
                                    return { ...baseRecord, recordType: 'tankerTransfer', locationType: "Tanker Transfer", personnelName: 'Tanker Transfer', receivingTankerPlate: alan, fillingTankerPlate: veren, location: `${veren} -> ${alan}` };
                                }
                                return null;
                            } catch(e) { console.error('Error parsing fuel record row:', row, e); return null; }
                        }).filter(Boolean);

                        if (newFuelRecords.length > 0) {
                            updates.fuelRecords = [...props.fuelRecords, ...newFuelRecords];
                            successMessages.push(`${newFuelRecords.length} yakıt kaydı`);
                        }
                    }
                });

                if (Object.keys(updates).length > 0) {
                    props.onBulkUpdate(updates);
                    props.showMessage(`${successMessages.join(', ')} başarıyla yüklendi.`, 'success');
                } else {
                    props.showMessage('Excel dosyasında geçerli veri içeren sayfa bulunamadı.', 'error');
                }
            } catch (error) {
                props.showMessage('Dosya ayrıştırılamadı. Lütfen dosyayı kontrol edin.', 'error');
                console.error("Bulk file parsing error:", error);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const DataEntryModule = () => {
        const subNav = [
            { id: 'bulkUpload', label: 'Toplu Veri Yükle'},
            { id: 'aircraft', label: 'Hava Aracı Verisi'},
            { id: 'airport', label: 'Hava Limanı Verisi'},
            { id: 'tanker', label: 'Tanker Verisi'},
            { id: 'personnel', label: 'Personel Verisi'},
        ];
        return <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-700">Veri Ekle Modülü</h2>
            <div className="flex flex-wrap gap-2 p-2 bg-black/10 rounded-lg">
                {subNav.map(item => <button
                    key={item.id}
                    onClick={() => setActiveDataEntryView(item.id)}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-semibold transition-all min-w-[120px] ${activeDataEntryView === item.id ? 'bg-ogm-green-600 text-white shadow' : 'bg-white/60 text-ogm-green-900 hover:bg-white/80'}`}
                >{item.label}</button>)}
            </div>
            <div className="mt-4">
                 {activeDataEntryView === 'bulkUpload' && <div className="p-6 bg-black/5 rounded-lg border border-slate-200 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700">Excel Dosyası Yükle</h3>
                     <div className="text-sm text-slate-600 space-y-2">
                        <p>Lütfen içinde 'hava aracı verisi', 'tanker verisi', 'personel verisi', 'hava limanı verisi' ve 'yakıt kayıtları verisi' adında sayfalar bulunan tek bir Excel dosyası yükleyin.</p>
                        <p><strong>Önemli:</strong> 'yakıt kayıtları verisi' sayfası aşağıdaki 14 sütunu içermelidir (sırası önemli değildir):</p>
                        <ul className="list-disc list-inside text-xs pl-4 grid grid-cols-2 gap-x-4">
                            {['Tarih', 'Kayıt Tipi', 'Makbuz Numarası', 'Yakıt Miktarı (lt)', 'Kuyruk Numarası', 'Personel Adı', 'Mesleği', 'Kart Numarası', 'İkmal Tipi', 'İkmal Konumu', 'Dolum Yapılan Tanker Plakası', 'Dolum Yapılan Hava Limanı', 'Yakıtı Alan Tanker Plakası', 'Yakıtı Veren Tanker Plakası'].map(col => <li key={col}>{col}</li>)}
                        </ul>
                        <p className="mt-2">Her kayıt tipi için sadece ilgili sütunları doldurunuz, diğerlerini boş bırakınız.</p>
                    </div>
                    <div className="mt-4"><FileUpload onFileUpload={handleBulkFileUpload} /></div>
                 </div>}
                 {activeDataEntryView === 'aircraft' && <AircraftDataManagement aircraftData={props.aircraftData} onUpdate={props.updateAircraftData} showMessage={props.showMessage} />}
                 {activeDataEntryView === 'airport' && <AirportDataManagement airportList={props.airportList} onUpdate={props.updateAirportList} showMessage={props.showMessage} />}
                 {activeDataEntryView === 'tanker' && <TankerDataManagement tankerData={props.tankerData} onUpdate={props.updateTankerData} showMessage={props.showMessage} />}
                 {activeDataEntryView === 'personnel' && <PersonnelDataManagement personnelList={props.personnelList} onUpdate={props.updatePersonnelList} showMessage={props.showMessage} />}
            </div>
        </div>
    };

    if (!props.currentUser) {
        return <AdminLogin onLoginSuccess={props.setCurrentUser} showMessage={props.showMessage} adminCredentials={props.adminCredentials} />;
    }

    return (
        <div className="flex flex-col md:flex-row gap-6">
            <aside className="w-full md:w-56 bg-ogm-green-700 shadow-lg p-4 rounded-lg flex flex-col">
                <nav className="space-y-3 flex-grow">
                     <NavButton label="Veri Ekle" onClick={() => setActiveModule('dataEntry')} isActive={activeModule === 'dataEntry'}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </NavButton>
                    <NavButton label="Makbuz Yönetimi" onClick={() => setActiveModule('receipts')} isActive={activeModule === 'receipts'}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </NavButton>
                    <NavButton label="Tanker Takip" onClick={() => setActiveModule('tankerTracking')} isActive={activeModule === 'tankerTracking'}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </NavButton>
                    <NavButton label="Talep Onay" badge={props.approvalRequests.length + props.personnelApprovalRequests.length} onClick={() => setActiveModule('approval')} isActive={activeModule === 'approval'}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </NavButton>
                     <NavButton label="Ayarlar" onClick={() => setActiveModule('settings')} isActive={activeModule === 'settings'}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </NavButton>
                </nav>
                <UserInfo user={props.currentUser} />
            </aside>
            <main className="flex-1">
                {activeModule === 'dataEntry' && <DataEntryModule />}
                {activeModule === 'receipts' && <RecordManagement fuelRecords={props.fuelRecords} onUpdateFuelRecords={props.updateFuelRecords} aircraftData={props.aircraftData} tankerData={props.tankerData} airportList={props.airportList} showMessage={props.showMessage} />}
                {activeModule === 'tankerTracking' && <TankerTakip tankerData={props.tankerData} fuelRecords={props.fuelRecords} showMessage={props.showMessage} />}
                {activeModule === 'approval' && <ApprovalRequestsComponent approvalRequests={props.approvalRequests} personnelApprovalRequests={props.personnelApprovalRequests} onHandleEditApproval={props.handleEditApproval} onHandlePersonnelApproval={props.handlePersonnelApproval} showMessage={props.showMessage} />}
                {activeModule === 'settings' && <UserManagement adminCredentials={props.adminCredentials} onAddUser={props.addAdminUser} onDeleteUser={props.deleteAdminUser} showMessage={props.showMessage} />}
            </main>
        </div>
    );
};