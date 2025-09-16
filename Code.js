// =================================================================
//                 YAKIT TAKİP SİSTEMİ - ARKA UÇ KODU
//                           SÜRÜM: 1.4.0
// =================================================================
// UYARI: Bu dosya bir Google Apps Script projesidir ve ES6 modüllerini ('import'/'export') desteklemez.
// =================================================================


// --- YAPILANDIRMA ---
// !!! ÇOK ÖNEMLİ !!!
// Google E-Tablonuzun kimliğini (ID) buraya yapıştırın.
const SPREADSHEET_ID = "1Ah1_LSohAkyh-04WD35LWjVvVGrSQR2lPe66FkLpEk4"; 

// --- SAYFA ADLARI (Google E-Tablonuzdaki ve Excel'deki adlarla eşleşmelidir) ---
const SHEET_NAMES = {
  FUEL_RECORDS: "Yakıt Kayıtları verisi",
  AIRCRAFTS: "Hava Aracı Verisi",
  TANKERS: "Tanker Verisi",
  PERSONNEL: "Personel Verisi",
  AIRPORTS: "Hava Limanı Verisi",
  ADMINS: "Yöneticiler",
  APPROVAL_REQUESTS: "Onay Talepleri",
  PERSONNEL_APPROVAL_REQUESTS: "Personel Onay Talepleri"
};

// --- WEB APP GİRİŞ NOKTASI ---

/**
 * Handles POST requests from the frontend application.
 * This is the main entry point for all data operations.
 */
function doPost(e) {
  // Concurrency lock to prevent race conditions from multiple simultaneous requests.
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // Wait up to 30 seconds for the lock.

  try {
    // Validate request
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Sunucuya geçersiz bir istek gönderildi. İstek gövdesi boş.');
    }
    
    // Check SPREADSHEET_ID configuration
    if (SPREADSHEET_ID === "YOUR_SPREADSHEET_ID_HERE" || !SPREADSHEET_ID) {
      throw new Error("Yapılandırma Hatası: Lütfen Google Apps Script (Code.js) dosyasındaki 'SPREADSHEET_ID' değişkenini güncelleyin.");
    }

    const request = JSON.parse(e.postData.contents);
    const { action, payload } = request;

    // Action Handler Map
    const ACTION_HANDLERS = {
      'onGetAdminPanelData': handleGetAdminPanelData,
      'onGetApprovalRequests': () => ({ data: getSheetDataAsObject(SHEET_NAMES.APPROVAL_REQUESTS, true) }),
      'onGetPersonnelApprovalRequests': () => ({ data: getSheetDataAsObject(SHEET_NAMES.PERSONNEL_APPROVAL_REQUESTS) }),
      'onAddRecord': handleAddRecord,
      'onAddPersonnelRequest': handleAddPersonnelRequest,
      'onAddApprovalRequest': handleAddApprovalRequest,
      'onBulkUpdate': handleBulkUpdate,
      'onApproveRequest': handleApproveRequest,
      'onRejectRequest': (p) => handleRejectRequest(p.requestId),
      'onApprovePersonnelRequest': (p) => handleApprovePersonnelRequest(p.requestId),
      'onRejectPersonnelRequest': (p) => handleRejectPersonnelRequest(p.requestId),
    };

    const handler = ACTION_HANDLERS[action];
    
    if (handler) {
      const result = handler(payload);
      return createJsonResponse({ status: 'success', success: true, ...result });
    } else {
      throw new Error(`Bilinmeyen eylem (Unknown action): ${action}`);
    }

  } catch (error) {
    Logger.log(`doPost Hatası: ${error.toString()} \nStack: ${error.stack}`);
    let friendlyMessage = `Beklenmedik bir sunucu hatası oluştu: ${error.message}`;
    if (error.message && error.message.toLowerCase().includes('openbyid')) {
      friendlyMessage = `E-Tablo Açılamadı: Belirtilen SPREADSHEET_ID ile E-Tablo'ya erişilemiyor. Lütfen Code.js dosyasını ve E-Tablo izinlerinizi kontrol edin.`;
    }
    return createJsonResponse({ status: 'error', message: friendlyMessage, success: false });
  } finally {
    lock.releaseLock();
  }
}

// --- ANA İŞLEM FONKSİYONLARI ---

function handleGetAdminPanelData() {
  return {
    data: {
      fuelRecords: getSheetDataAsObject(SHEET_NAMES.FUEL_RECORDS),
      aircrafts: getSheetDataAsObject(SHEET_NAMES.AIRCRAFTS),
      tankers: getSheetDataAsObject(SHEET_NAMES.TANKERS),
      personnel: getSheetDataAsObject(SHEET_NAMES.PERSONNEL),
      admins: getSheetDataAsObject(SHEET_NAMES.ADMINS),
      airports: getSheetDataAsObject(SHEET_NAMES.AIRPORTS)
    }
  };
}

function handleAddRecord(payload) {
  appendObjectToSheet(SHEET_NAMES.FUEL_RECORDS, payload);
  return { message: "Kayıt başarıyla eklendi." };
}

function handleAddPersonnelRequest(payload) {
  appendObjectToSheet(SHEET_NAMES.PERSONNEL_APPROVAL_REQUESTS, payload);
  return { message: "Personel talebi başarıyla eklendi." };
}

function handleAddApprovalRequest(payload) {
  const requestCopy = { ...payload };
  // JSON data must be stringified to be stored in a sheet cell.
  requestCopy.originalRecord = JSON.stringify(requestCopy.originalRecord);
  requestCopy.requestedChanges = JSON.stringify(requestCopy.requestedChanges);
  appendObjectToSheet(SHEET_NAMES.APPROVAL_REQUESTS, requestCopy);
  return { message: "Onay talebi başarıyla eklendi." };
}

function handleBulkUpdate(payload) {
  if (payload.aircraftData) writeDataToObject(SHEET_NAMES.AIRCRAFTS, payload.aircraftData);
  if (payload.tankerData) writeDataToObject(SHEET_NAMES.TANKERS, payload.tankerData);
  if (payload.personnelList) writeDataToObject(SHEET_NAMES.PERSONNEL, payload.personnelList);
  if (payload.airportList) writeDataToObject(SHEET_NAMES.AIRPORTS, payload.airportList);
  if (payload.admins) writeDataToObject(SHEET_NAMES.ADMINS, payload.admins);
  if (payload.fuelRecords) writeDataToObject(SHEET_NAMES.FUEL_RECORDS, payload.fuelRecords);
  return { message: "Toplu güncelleme başarılı." };
}

function handleApproveRequest(payload) {
  const { requestId, originalRecord, updatedRecord } = payload;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const approvalSheet = ss.getSheetByName(SHEET_NAMES.APPROVAL_REQUESTS);
  const fuelRecordsSheet = ss.getSheetByName(SHEET_NAMES.FUEL_RECORDS);

  if (!approvalSheet) throw new Error("Onay talepleri sayfası bulunamadı: " + SHEET_NAMES.APPROVAL_REQUESTS);
  if (!fuelRecordsSheet) throw new Error("Yakıt kayıtları sayfası bulunamadı: " + SHEET_NAMES.FUEL_RECORDS);

  const approvalRow = findRowByProperty(approvalSheet, 'id', requestId);
  if (!approvalRow) {
     return {
        success: false,
        message: "Talep zaten işlenmiş veya bulunamadı. Veriler yenileniyor.",
        data: {
            fuelRecords: getSheetDataAsObject(SHEET_NAMES.FUEL_RECORDS),
            approvalRequests: getSheetDataAsObject(SHEET_NAMES.APPROVAL_REQUESTS, true)
        }
    };
  }
  
  const recordRow = findFuelRecordRow(fuelRecordsSheet, originalRecord);
  if (!recordRow) {
    approvalSheet.deleteRow(approvalRow.rowIndex);
    throw new Error(`Güncellenecek orijinal yakıt kaydı bulunamadı. Talep iptal edildi.`);
  }

  const finalRecordData = { ...recordRow.data, ...updatedRecord };
  const headers = getHeaders(fuelRecordsSheet);
  const newRowData = headers.map(header => finalRecordData[header] !== undefined ? finalRecordData[header] : '');
  fuelRecordsSheet.getRange(recordRow.rowIndex, 1, 1, newRowData.length).setValues([newRowData]);
  approvalSheet.deleteRow(approvalRow.rowIndex);

  return {
    message: "Talep onaylandı ve kayıt başarıyla güncellendi.",
    data: {
      fuelRecords: getSheetDataAsObject(SHEET_NAMES.FUEL_RECORDS),
      approvalRequests: getSheetDataAsObject(SHEET_NAMES.APPROVAL_REQUESTS, true)
    }
  };
}

function handleRejectRequest(requestId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.APPROVAL_REQUESTS);
  if (!sheet) throw new Error("Onay talepleri sayfası bulunamadı.");
  const rowToDelete = findRowByProperty(sheet, 'id', requestId);
  if (rowToDelete) {
    sheet.deleteRow(rowToDelete.rowIndex);
  }
  return {
    message: "Talep reddedildi.",
    data: {
      fuelRecords: getSheetDataAsObject(SHEET_NAMES.FUEL_RECORDS),
      approvalRequests: getSheetDataAsObject(SHEET_NAMES.APPROVAL_REQUESTS, true)
    }
  };
}

function handleApprovePersonnelRequest(requestId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const requestSheet = ss.getSheetByName(SHEET_NAMES.PERSONNEL_APPROVAL_REQUESTS);
  if (!requestSheet) throw new Error("Personel onay talepleri sayfası bulunamadı.");
  const requestRow = findRowByProperty(requestSheet, 'id', requestId);
  if (!requestRow) {
      return {
          message: "Personel talebi zaten işlenmiş.",
          data: {
              personnelList: getSheetDataAsObject(SHEET_NAMES.PERSONNEL),
              personnelApprovalRequests: getSheetDataAsObject(SHEET_NAMES.PERSONNEL_APPROVAL_REQUESTS)
          }
      }
  }

  const newPersonnel = {
    id: requestRow.data.id || `p${new Date().getTime()}`,
    name: requestRow.data.name,
    job: requestRow.data.job
  };

  appendObjectToSheet(SHEET_NAMES.PERSONNEL, newPersonnel);
  requestSheet.deleteRow(requestRow.rowIndex);

  return {
    message: "Personel onaylandı ve listeye eklendi.",
    data: {
      personnelList: getSheetDataAsObject(SHEET_NAMES.PERSONNEL),
      personnelApprovalRequests: getSheetDataAsObject(SHEET_NAMES.PERSONNEL_APPROVAL_REQUESTS)
    }
  };
}

function handleRejectPersonnelRequest(requestId) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAMES.PERSONNEL_APPROVAL_REQUESTS);
  if (!sheet) throw new Error("Personel onay talepleri sayfası bulunamadı.");
  const rowToDelete = findRowByProperty(sheet, 'id', requestId);
  if (rowToDelete) {
    sheet.deleteRow(rowToDelete.rowIndex);
  }
  return {
    message: "Personel talebi reddedildi.",
    data: {
      personnelList: getSheetDataAsObject(SHEET_NAMES.PERSONNEL),
      personnelApprovalRequests: getSheetDataAsObject(SHEET_NAMES.PERSONNEL_APPROVAL_REQUESTS)
    }
  };
}

// --- HELPER FUNCTIONS ---

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function getHeaders(sheet) {
  if (!sheet || sheet.getLastRow() === 0) return [];
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
}

function getSheetDataAsObject(sheetName, parseJson = false) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const headers = getHeaders(sheet);
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();

  return data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      if (parseJson && (header === 'originalRecord' || header === 'requestedChanges')) {
        try {
          value = JSON.parse(value);
        } catch (e) { /* Ignore parsing errors, keep as string */ }
      }
      obj[header] = value;
    });
    return obj;
  });
}

function writeDataToObject(sheetName, data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  sheet.clearContents();
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const rows = data.map(obj => headers.map(header => obj[header] !== undefined ? obj[header] : ''));
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}

function appendObjectToSheet(sheetName, obj) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  let headers = getHeaders(sheet);
  if (headers.length === 0) {
    headers = Object.keys(obj);
    sheet.appendRow(headers);
  }
  const row = headers.map(header => obj[header] !== undefined ? obj[header] : '');
  sheet.appendRow(row);
}

function findRowByProperty(sheet, propertyName, propertyValue) {
  const headers = getHeaders(sheet);
  const columnIndex = headers.indexOf(propertyName);
  if (columnIndex === -1) return null;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) { // Skip header
    if (String(data[i][columnIndex]) === String(propertyValue)) {
      return { rowIndex: i + 1, data: rowToObject(headers, data[i]) };
    }
  }
  return null;
}

function findFuelRecordRow(sheet, recordToFind) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return null;

  const headers = data[0].map(String);
  const kayitNoIndex = headers.indexOf('Kayıt No');
  const tarihIndex = headers.indexOf('Tarih');
  const makbuzNoIndex = headers.indexOf('Makbuz Numarası');
  const personelAdiIndex = headers.indexOf('Personel Adı');

  // Priority 1: Find by a permanent ID if it exists and is not a temp one.
  if (recordToFind['Kayıt No'] && !String(recordToFind['Kayıt No']).startsWith('ID-')) {
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][kayitNoIndex]) === String(recordToFind['Kayıt No'])) {
        return { rowIndex: i + 1, data: rowToObject(headers, data[i]) };
      }
    }
  }

  // Priority 2: Fallback for older records. Match by key fields.
  const recordToFindDateMs = parseSheetDate(recordToFind['Tarih']).getTime();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowDateMs = parseSheetDate(row[tarihIndex]).getTime();
    
    const dateMatches = (Math.abs(rowDateMs - recordToFindDateMs) < 86400000); // within a day
    const receiptMatches = (String(row[makbuzNoIndex]) === String(recordToFind['Makbuz Numarası']));
    const personnelMatches = (String(row[personelAdiIndex]) === String(recordToFind['Personel Adı']));

    if (dateMatches && receiptMatches && personnelMatches) {
      return { rowIndex: i + 1, data: rowToObject(headers, row) };
    }
  }
  return null; // Record not found
}

function rowToObject(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[header] = row[index];
  });
  return obj;
}

function parseSheetDate(dateValue) {
    if (!dateValue) return new Date(0); 
    if (dateValue instanceof Date) return dateValue;
    // For Google Sheet's numeric date format
    if (typeof dateValue === 'number' && dateValue > 25569) { // 25569 = 1970-01-01
        const utcDate = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
        return new Date(utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000));
    }
    // For ISO strings or other text formats
    return new Date(dateValue);
}
