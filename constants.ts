// Fix: Import Airport type to strongly type the airport list constant.
import type { Airport } from './types.js';

export const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzKktc_Ih2H0buQMBrfN2wZdV5Ys1pnDLwF2j-hJtU0y0Tx6TcfwLOb-1mYE1mPwla_Bw/exec";

export const VIEW_FUEL_ENTRY = 'fuelEntry';
export const VIEW_SEARCH_RECORDS = 'searchResults';
export const VIEW_ADMIN_PANEL = 'adminPanel';

export const FIELD_TRANSLATIONS: { [key: string]: string } = {
    // General
    id: 'ID',
    date: 'Tarih',
    kayitNumarasi: 'Kayıt No',
    recordType: 'Kayıt Tipi',
    receiptNumber: 'Makbuz Numarası',
    fuelAmount: 'Yakıt Miktarı (lt)',
    locationType: 'İkmal Tipi',
    location: 'Konum / İkmal Yeri',

    // Personnel Specific
    personnelId: 'Personel ID',
    personnelName: 'Personel Adı',
    jobTitle: 'Mesleği',
    tailNumber: 'Kuyruk Numarası',
    cardNumber: 'Kart Numarası',

    // Tanker Specific
    tankerPlate: 'Tanker Plakası',
    airport: 'Hava Limanı',
    receivingTankerPlate: 'Yakıtı Alan Tanker',
    fillingTankerPlate: 'Yakıtı Veren Tanker',

    // Request Specific
    requesterName: 'Talep Eden',
    timestamp: 'Talep Zamanı',
    originalRecord: 'Orijinal Kayıt',
    requestedChanges: 'Talep Edilen Değişiklikler',
};

export const RECORD_TYPE_TRANSLATIONS: { [key: string]: string } = {
    personnel: 'Hava Aracı İkmal',
    tankerDolum: 'Tanker Dolum',
    tankerTransfer: 'Tanker Transfer'
};


export const INITIAL_PERSONNEL_LIST = [
    { id: 'p1', name: 'Ahmet Yılmaz', job: 'Pilot' },
    { id: 'p2', name: 'Ayşe Kaya', job: 'Pilot' },
    { id: 'p3', name: 'Mehmet Demir', job: 'Şoför' },
    { id: 'p4', name: 'Fatma Öztürk', job: 'Şoför' },
];
export const AIRCRAFT_TYPES = [
    'MI-8', 'T-70', 'KA-32', 'CH-47', 'CH-47 ER', 'AT-802F', 'S-64',
    'AS350', 'AN-32P', 'AW119', 'AS-532', 'Be-200', 'Bell-429', 'Citation', 'B-360'
];
// Fix: Explicitly typed INITIAL_AIRPORT_LIST to match the Airport interface, ensuring its 'type' property is correctly validated against the allowed string literals.
export const INITIAL_AIRPORT_LIST: Airport[] = [
    { id: 'ada', name: 'Adana Şakirpaşa Havalimanı (ADA)', type: 'Sivil' },
    { id: 'adf', name: 'Adıyaman Havalimanı (ADF)', type: 'Sivil' },
    { id: 'aji', name: 'Ağrı Ahmed-i Hani Havalimanı (AJI)', type: 'Sivil' },
    { id: 'mzh', name: 'Amasya Merzifon Havalimanı (MZH)', type: 'Askeri' }, // Askeri/Sivil ortak
    { id: 'esb', name: 'Ankara Esenboğa Havalimanı (ESB)', type: 'Sivil' },
    { id: 'ank-ask-1', name: 'Ankara Mürted Hava Meydan Komutanlığı', type: 'Askeri' },
    { id: 'ayt', name: 'Antalya Havalimanı (AYT)', type: 'Sivil' },
    { id: 'edo', name: 'Balıkesir Koca Seyit Havalimanı (EDO)', type: 'Sivil' },
    { id: 'bzi', name: 'Balıkesir Merkez Havalimanı', type: 'Askeri' },
    { id: 'bal', name: 'Batman Havalimanı (BAL)', type: 'Askeri' }, // Askeri/Sivil ortak
    { id: 'bgg', name: 'Bingöl Havalimanı (BGG)', type: 'Sivil' },
    { id: 'yei', name: 'Bursa Yenişehir Havalimanı (YEI)', type: 'Sivil' },
    { id: 'ckz', name: 'Çanakkale Havalimanı (CKZ)', type: 'Sivil' },
    { id: 'dnz', name: 'Denizli Çardak Havalimanı (DNZ)', type: 'Sivil' },
    { id: 'diy', name: 'Diyarbakır Havalimanı (DIY)', type: 'Askeri' }, // Askeri/Sivil ortak
    { id: 'ezs', name: 'Elazığ Havalimanı (EZS)', type: 'Sivil' },
    { id: 'erc', name: 'Erzincan Yıldırım Akbulut Havalimanı (ERC)', type: 'Sivil' },
    { id: 'erz', name: 'Erzurum Havalimanı (ERZ)', type: 'Askeri' }, // Askeri/Sivil ortak
    { id: 'aoe', name: 'Eskişehir Hasan Polatkan Havalimanı (AOE)', type: 'Sivil' },
    { id: 'esk-ask-1', name: 'Eskişehir 1. Ana Jet Üs Komutanlığı', type: 'Askeri' },
    { id: 'gzt', name: 'Gaziantep Oğuzeli Havalimanı (GZT)', type: 'Sivil' },
    { id: 'hty', name: 'Hatay Havalimanı (HTY)', type: 'Sivil' },
    { id: 'ise', name: 'Isparta Süleyman Demirel Havalimanı (ISE)', type: 'Sivil' },
    { id: 'isl', name: 'İstanbul Atatürk Havalimanı (ISL)', type: 'Sivil' },
    { id: 'ist', name: 'İstanbul Havalimanı (IST)', type: 'Sivil' },
    { id: 'adb', name: 'İzmir Adnan Menderes Havalimanı (ADB)', type: 'Sivil' },
    { id: 'izm-ask-1', name: 'İzmir Çiğli 2. Ana Jet Üs Komutanlığı', type: 'Askeri' },
    { id: 'ltfb', name: 'İzmir Selçuk-Efes Havalimanı (LTFB)', type: 'Sivil' },
    { id: 'ksy', name: 'Kars Harakani Havalimanı (KSY)', type: 'Sivil' },
    { id: 'asr', name: 'Kayseri Erkilet Havalimanı (ASR)', type: 'Askeri' }, // Askeri/Sivil ortak
    { id: 'kya', name: 'Konya Havalimanı (KYA)', type: 'Askeri' }, // Askeri/Sivil ortak
    { id: 'mlx', name: 'Malatya Havalimanı (MLX)', type: 'Askeri' }, // Askeri/Sivil ortak
    { id: 'szf', name: 'Samsun Çarşamba Havalimanı (SZF)', type: 'Sivil' },
    { id: 'vas', name: 'Sivas Nuri Demirağ Havalimanı (VAS)', type: 'Sivil' },
    { id: 'tzx', name: 'Trabzon Havalimanı (TZX)', type: 'Sivil' },
    { id: 'van', name: 'Van Ferit Melen Havalimanı (VAN)', type: 'Sivil' },
    { id: 'onq', name: 'Zonguldak Çaycuma Havalimanı (ONQ)', type: 'Sivil' },
];

export const generateRecordNumber = () => {
    return 'ID-' + new Date().toISOString();
};

export const formatDisplayDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    const cleanDateString = String(dateString).startsWith('ID-') ? dateString.substring(3) : dateString;

    const date = new Date(cleanDateString);
    if (isNaN(date.getTime())) {
        return dateString;
    }
    return date.toLocaleString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(',', '');
};

export const formatDisplayDateOnly = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        const parts = String(dateString).split(' ')[0].split('.');
        if (parts.length === 3) {
            const recheckDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            if (!isNaN(recheckDate.getTime())) {
                return `${parts[0]}.${parts[1]}.${parts[2]}`;
            }
        }
        return dateString;
    }
    return date.toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export const parseSheetDate = (dateValue: any): string | null => {
    if (dateValue === null || dateValue === undefined) return null;

    if (typeof dateValue === 'number' && dateValue > 1) {
        const utcDate = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
        const localDate = new Date(utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000));
        return localDate.toISOString().split('T')[0];
    }

    const dateStr = String(dateValue);
    let date = new Date(dateStr);

    if (isNaN(date.getTime())) {
        const parts = dateStr.split(' ')[0].split(/[.\/-]/);
        if (parts.length === 3) {
            const [d, m, y] = parts;
            if (d.length === 4) {
                 date = new Date(`${d}-${m.padStart(2, '0')}-${y.padStart(2, '0')}`);
            } else {
                 date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
            }
        }
    }

    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
};
