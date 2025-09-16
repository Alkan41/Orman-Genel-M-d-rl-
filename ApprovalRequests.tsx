import React, { useState } from 'react';
import { Modal } from './Modal.js';
import { FIELD_TRANSLATIONS, RECORD_TYPE_TRANSLATIONS, formatDisplayDate, formatDisplayDateOnly } from '../constants.js';
import type { ApprovalRequest, PersonnelApprovalRequest, FuelRecord } from '../types.js';

interface ApprovalRequestsComponentProps {
    approvalRequests: ApprovalRequest[];
    personnelApprovalRequests: PersonnelApprovalRequest[];
    onHandleEditApproval: (request: ApprovalRequest, approved: boolean) => Promise<void>;
    onHandlePersonnelApproval: (requestId: string, approved: boolean) => Promise<void>;
    showMessage: (text: string, type: 'success' | 'error') => void;
}

export const ApprovalRequestsComponent = ({ approvalRequests, personnelApprovalRequests, onHandleEditApproval, onHandlePersonnelApproval }: ApprovalRequestsComponentProps) => {
    const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
    const [selectedPersonnelRequest, setSelectedPersonnelRequest] = useState<PersonnelApprovalRequest | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleApprove = async () => {
        if (!selectedRequest || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onHandleEditApproval(selectedRequest, true);
            setSelectedRequest(null);
        } catch (error) {
            console.error("Approval failed, keeping modal open.", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onHandleEditApproval(selectedRequest, false);
            setSelectedRequest(null);
        } catch (error) {
            console.error("Rejection failed, keeping modal open.", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePersonnelApprove = async () => {
        if (!selectedPersonnelRequest || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onHandlePersonnelApproval(selectedPersonnelRequest.id, true);
            setSelectedPersonnelRequest(null);
        } catch (error) {
            console.error("Personnel approval failed, keeping modal open.", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePersonnelReject = async () => {
        if (!selectedPersonnelRequest || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onHandlePersonnelApproval(selectedPersonnelRequest.id, false);
            setSelectedPersonnelRequest(null);
        } catch (error) {
            console.error("Personnel rejection failed, keeping modal open.", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderChanges = (original: FuelRecord, changes: Partial<FuelRecord>) => {
        return (
            <div className="grid grid-cols-1 gap-y-2 text-sm">
                {Object.keys(changes).map(key => {
                    const typedKey = key as keyof FuelRecord;
                    const translatedKey = FIELD_TRANSLATIONS[key] || key;
                    const originalValue = key === 'date' && original.date ? formatDisplayDateOnly(original.date) : String(original[typedKey] ?? '-');
                    const changedValue = key === 'date' && changes.date ? formatDisplayDateOnly(changes.date) : String(changes[typedKey] ?? '-');
                    return (
                        <div key={key} className="grid grid-cols-[auto,1fr] gap-x-2 items-center">
                            <div className="text-slate-500 font-semibold">{translatedKey}:</div>
                            <div className="flex items-center gap-2">
                                <span className="line-through text-red-500">{originalValue}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                                <span className="text-green-600 font-semibold">{changedValue}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderOriginalRecord = (record: FuelRecord) => {
        return (
            <div className="grid grid-cols-[max-content,1fr] gap-x-4 gap-y-1 text-sm">
                {record.kayitNumarasi && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.kayitNumarasi}:</span><span className="text-slate-800">{formatDisplayDate(record.kayitNumarasi)}</span></>
                )}
                {record.date && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.date}:</span><span className="text-slate-800">{formatDisplayDateOnly(record.date)}</span></>
                )}
                {record.recordType && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.recordType}:</span><span className="text-slate-800">{RECORD_TYPE_TRANSLATIONS[record.recordType] || record.recordType}</span></>
                )}
                {record.personnelName && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.personnelName}:</span><span className="text-slate-800">{record.personnelName}</span></>
                )}
                {record.jobTitle && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.jobTitle}:</span><span className="text-slate-800">{record.jobTitle}</span></>
                )}
                {record.receiptNumber && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.receiptNumber}:</span><span className="text-slate-800">{record.receiptNumber}</span></>
                )}
                {record.fuelAmount != null && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.fuelAmount}:</span><span className="text-slate-800">{record.fuelAmount}</span></>
                )}
                {record.locationType && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.locationType}:</span><span className="text-slate-800">{record.locationType}</span></>
                )}
                {record.location && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.location}:</span><span className="text-slate-800">{record.location}</span></>
                )}
                {record.tailNumber && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.tailNumber}:</span><span className="text-slate-800">{record.tailNumber}</span></>
                )}
                {record.cardNumber && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.cardNumber}:</span><span className="text-slate-800">{record.cardNumber}</span></>
                )}
                {record.tankerPlate && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.tankerPlate}:</span><span className="text-slate-800">{record.tankerPlate}</span></>
                )}
                {record.receivingTankerPlate && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.receivingTankerPlate}:</span><span className="text-slate-800">{record.receivingTankerPlate}</span></>
                )}
                {record.fillingTankerPlate && (
                    <><span className="font-semibold text-slate-500">{FIELD_TRANSLATIONS.fillingTankerPlate}:</span><span className="text-slate-800">{record.fillingTankerPlate}</span></>
                )}
            </div>
        );
    };
    
    const editRequestHeaders = ['kayitNumarasi', 'date', 'personnelName', 'location', 'requesterName'];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Bekleyen Düzeltme Talepleri</h2>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                {editRequestHeaders.map(key => (
                                    <th key={key} className="p-3 text-left font-semibold text-slate-600">{FIELD_TRANSLATIONS[key] || key}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {approvalRequests.length > 0 ? (
                                approvalRequests.map(req => (
                                    <tr key={req.id} onClick={() => setSelectedRequest(req)} className="hover:bg-slate-50 cursor-pointer">
                                        <td className="p-3">{formatDisplayDate(req.originalRecord.kayitNumarasi)}</td>
                                        <td className="p-3">{formatDisplayDateOnly(req.originalRecord.date)}</td>
                                        <td className="p-3">{req.originalRecord.personnelName}</td>
                                        <td className="p-3">{req.originalRecord.location}</td>
                                        <td className="p-3">{req.requesterName}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={editRequestHeaders.length} className="text-center p-6 text-slate-500">Bekleyen düzeltme talebi bulunmamaktadır.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
             <div>
                <h2 className="text-xl font-semibold text-slate-700 mb-4">Yeni Personel Kayıt Talepleri</h2>
                 <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="min-w-full bg-white text-sm">
                        <thead className="bg-slate-100">
                            <tr>
                                {['Ad Soyad', 'Meslek', 'Talep Tarihi'].map(header => (
                                    <th key={header} className="p-3 text-left font-semibold text-slate-600">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {personnelApprovalRequests.length > 0 ? (
                                personnelApprovalRequests.map(req => (
                                    <tr key={req.id} onClick={() => setSelectedPersonnelRequest(req)} className="hover:bg-slate-50 cursor-pointer">
                                        <td className="p-3">{req.name}</td>
                                        <td className="p-3">{req.job}</td>
                                        <td className="p-3">{new Date(req.timestamp).toLocaleString('tr-TR')}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center p-6 text-slate-500">Bekleyen personel kayıt talebi bulunmamaktadır.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal
                isOpen={!!selectedRequest}
                onClose={() => setSelectedRequest(null)}
                title={`Talep Detayları`}
            >
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="p-3 bg-slate-50 rounded-md border">
                            <h4 className="font-bold text-slate-600 mb-2 border-b pb-2">Orijinal Kayıt Bilgileri</h4>
                             {renderOriginalRecord(selectedRequest.originalRecord)}
                        </div>
                        <div className="p-3 bg-slate-50 rounded-md border">
                            <h4 className="font-bold text-slate-600 mb-2 border-b pb-2">Talep Edilen Değişiklikler</h4>
                            {renderChanges(selectedRequest.originalRecord, selectedRequest.requestedChanges)}
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={handleReject} disabled={isSubmitting} className="py-2 px-5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:bg-slate-400">{isSubmitting ? 'İşleniyor...' : "Reddet"}</button>
                            <button onClick={handleApprove} disabled={isSubmitting} className="py-2 px-5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:bg-slate-400">{isSubmitting ? 'İşleniyor...' : "Onayla"}</button>
                        </div>
                    </div>
                )}
            </Modal>
            <Modal isOpen={!!selectedPersonnelRequest} onClose={() => setSelectedPersonnelRequest(null)} title="Yeni Personel Onay Talebi">
                {selectedPersonnelRequest && (
                    <div className="space-y-4">
                         <div className="p-3 bg-slate-50 rounded-md border space-y-2 text-sm">
                            <div><strong className="text-slate-600">Ad Soyad: </strong>{selectedPersonnelRequest.name}</div>
                            <div><strong className="text-slate-600">Meslek: </strong>{selectedPersonnelRequest.job}</div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={handlePersonnelReject} disabled={isSubmitting} className="py-2 px-5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 disabled:bg-slate-400">{isSubmitting ? 'İşleniyor...' : "Reddet"}</button>
                            <button onClick={handlePersonnelApprove} disabled={isSubmitting} className="py-2 px-5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:bg-slate-400">{isSubmitting ? 'İşleniyor...' : "Onayla"}</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};