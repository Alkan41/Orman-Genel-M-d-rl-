export interface Airport {
  id: string;
  name: string;
  type: 'Sivil' | 'Askeri';
}

export interface Tanker {
  id: string;
  plate: string;
  region: string;
  company: string;
  capacity: number;
}

export interface Aircraft {
    id: string;
    aircraftType: string;
    tailNumber: string;
    company: string;
    callSign: string;
}

export interface FuelRecord {
  id: string;
  date: string;
  receiptNumber: string;
  fuelAmount: number;
  kayitNumarasi: string;
  recordType: 'personnel' | 'tankerDolum' | 'tankerTransfer';
  personnelId?: string;
  personnelName: string;
  jobTitle?: string;
  locationType: string;
  location: string;
  tailNumber?: string;
  cardNumber?: string;
  tankerPlate?: string;
  airport?: string;
  receivingTankerPlate?: string;
  fillingTankerPlate?: string;
}

export interface ApprovalRequest {
  id: string;
  originalRecord: FuelRecord;
  requestedChanges: Partial<FuelRecord>;
  requesterName: string;
  timestamp: string;
}

export interface Message {
  text: string;
  type: 'success' | 'error';
}

export type View = 'fuelEntry' | 'searchResults' | 'adminPanel';

export interface User {
  id: string;
  name: string;
  username: string;
  password: string | number;
  loginTime?: Date;
}

export interface PersonnelApprovalRequest {
  id: string;
  name: string;
  job: string;
  timestamp: string;
}

export interface Personnel {
    id: string;
    name: string;
    job: string;
}
