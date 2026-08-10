// FOIS 01 - Freight Tracking
export interface FreightTrackingRequest {
  fnrnumber: string;
}

export interface FreightTrackingResponse {
  currentStatus: string;
  etaDstn: string;
  cmdt: string;
  fnrNo: string;
  stationFrom: string;
  stationTo: string;
  lastRepLocn: string;
  lgtd: string;
  lttd: string;
}

// FOIS 02 - Freight Calculator
export interface FreightCalcRequest {
  sttnfrom: string;
  sttnto: string;
  cmdt: string;
  wgontype: string;
}

export interface SurchargeDetail {
  charge: string;
  percentage: string;
  amount: string;
  description: string;
}

export interface FreightCalcResponse {
  distance: string;
  eta: string;
  route: string;
  rakeSize: string;
  basicFreight: string;
  loadingFreight: string;
  gst: string;
  otherCharges: string;
  finalFreight: string;
  viaDesc: string[];
  surchargeDetails: SurchargeDetail[];
  routeType?: string;
  developmentCharge?: string;
  originTerminalCharge?: string;
  destinationTerminalCharge?: string;
  dynamicPricing?: string;
}

// FOIS 04 - Parcel Tracking
export interface ParcelTrackingRequest {
  lngpwbltno: string;
}

export interface ParcelConsignor {
  name: string;
  address: string;
}

export interface ParcelConsignee {
  name: string;
  address: string;
}

export interface ParcelJourney {
  originStation: string;
  destinationStation: string;
}

export interface ParcelItem {
  description: string;
  weight: string;
  totalItems: string;
}

export interface ParcelTrackingResponse {
  parcelNumber: string;
  bookingDate: string;
  status: string;
  deliveryDate: string;
  consignor: ParcelConsignor;
  consignee: ParcelConsignee;
  journey: ParcelJourney;
  item: ParcelItem;
  currentStep: string;
}

// Request history
export interface RequestHistoryEntry {
  id: string;
  timestamp: string;
  module: string;
  endpoint: string;
  method: string;
  params: Record<string, string>;
  status: 'success' | 'error' | 'loading';
  latencyMs?: number;
}

export type TransportMode = 'rail' | 'water' | 'air' | 'road' | 'human-identity';
export type RailModule = 'fois';
export type FoisScreen = '01' | '02' | '04';

export type HumanIdentityModule = 'aadhaar' | 'pan' | 'digilocker' | 'sarathi';
export type SarathiScreen = '01' | '02';

export type RoadModule = 'vahan' | 'echallan' | 'fastag' | 'ewaybill';
export type VahanScreen = '04' | '05' | '06';
export type EchallanScreen = '01';
export type FastagScreen = '01' | '02';
export type EwaybillScreen = '01';

// ECHALLAN/01 - Vehicle Challan Search
export interface EchallanRequest {
  vehicleNumber: string;
}

export interface EchallanOffence {
  act: string;
  name: string;
}

export interface EchallanRecord {
  challan_no: string;
  challan_date_time: string;
  challan_place: string;
  rto_distric_name: string;
  fine_imposed: string;
  challan_status: string;
  remark: string;
  department?: string;
  court_status?: string;
  receipt_no?: string;
  offence_details?: EchallanOffence[];
}

export interface EchallanVehicleInfo {
  owner_name: string;
  vehicle_number: string;
  state_code: string;
  department: string;
  driver_name: string;
}

export interface EchallanResponse {
  owner_name: string;
  vehicle_number: string;
  state_code: string;
  department: string;
  driver_name: string;
  pending_data: EchallanRecord[];
  disposed_data: EchallanRecord[];
  code?: string;
  message?: string;
}

// VAHAN/04 - Vehicle Number Search
export interface VahanVehicleNumberRequest {
  vehiclenumber: string;
}

// VAHAN/05 - Chassis Number Search
export interface VahanChassisNumberRequest {
  chasisnumber: string;
}

// VAHAN/06 - Engine Number Search
export interface VahanEngineNumberRequest {
  enginenumber: string;
}

export type VahanSearchType = 'vehiclenumber' | 'chasisnumber' | 'enginenumber';

export interface VahanVehicleResponse {
  vehiclenumber: string;
  registrationNumber: string;
  registrationStatus: string;
  registrationDate: string;
  purchaseDate: string;
  ownerName: string;
  ownerCategory: string;
  permanentAddress: string;
  presentAddress: string;
  manufacturer: string;
  model: string;
  vehicleClass: string;
  vehicleCategory: string;
  bodyType: string;
  fuelType: string;
  color: string;
  chassisNumber: string;
  engineNumber: string;
  cubicCapacity: string;
  numberOfCylinders: string;
  wheelBase: string;
  unladenWeight: string;
  grossVehicleWeight: string;
  seatingCapacity: string;
  registeredAt: string;
  registrationValidTill: string;
  fitnessValidTill: string;
  taxValidTill: string;
  insuranceCompany: string;
  insurancePolicyNumber: string;
  insuranceValidTill: string;
  pucDetails: string;
  bharatStageNorm: string;
  financeCompany: string;
  blacklistStatus: string;
  ownerHistory: string;
  message?: string;
}

// SARATHI/01 - Driving License Verification
export interface SarathiVerificationRequest {
  dlnumber: string;
  dob: string;
}

export interface SarathiDrivingClass {
  class: string;
  type: string;
}

export interface SarathiObjection {
  date: string;
  description: string;
  status: string;
}

export interface SarathiVerificationResponse {
  dlnumber: string;
  fullName: string;
  dob: string;
  licenseStatus: string;
  licenseType: string;
  issuingAuthority: string;
  currentStatus: string;
  drivingClasses: SarathiDrivingClass[];
  hazardousGoodsEndorsement: string;
  badgeInformation: string;
  objections: SarathiObjection[];
  dataSource: string;
  lastUpdated: string;
  verificationStatus: 'verified' | 'failed';
  message?: string;
}

// SARATHI/02 - Driving License Details
export interface SarathiVehicleClass {
  cov: string;
  covDescription: string;
  covType: string;
}

export interface SarathiDetailsResponse {
  dlnumber: string;
  fullName: string;
  licenseStatus: 'Active' | 'Expired' | 'Suspended';
  nonTransportValidity: string;
  transportValidity: string;
  vehicleClasses: SarathiVehicleClass[];
  issuingAuthority: string;
  message?: string;
}

// FASTAG/01 - FASTag Transaction History
export interface FastagTransaction {
  readerReadTime: string;
  seqNo: string;
  laneDirection: string;
  tollPlazaGeocode: string;
  tollPlazaName: string;
  vehicleType: string;
  vehicleRegNo: string;
}

export interface FastagTransactionHistoryRequest {
  vehiclenumber: string;
}

export interface FastagTransactionHistoryResponse {
  vehiclenumber: string;
  vehicleClass: string;
  fastagStatus: string;
  tagId: string;
  tid: string;
  transactions: FastagTransaction[];
  result?: string;
  code?: string;
  message?: string;
  errCode?: string;
}

// FASTAG/02 - FASTag Vehicle & Tag Details
export interface FastagDetailsRequest {
  vehiclenumber: string;
  tagid: string;
}

export interface FastagTag {
  tagId: string;
  tid: string;
  tagStatus: string;
  issueDate: string;
  bankId: string;
  excCode: string;
  vehicleClass?: string;
  commercialVehicle?: string;
  regNumber?: string;
}

export interface FastagDetailsResponse {
  regNumber: string;
  vehicleClass: string;
  commercialVehicle: string;
  tags: FastagTag[];
  result?: string;
  code?: string;
  message?: string;
  errCode?: string;
}

// EWAYBILL/01 - E-Way Bill Details
export interface EwaybillRequest {
  ewbNo: string;
}

export interface EwaybillVehicle {
  vehicleNumber: string;
  enteredDate: string;
  transMode: string;
}

export interface EwaybillResponse {
  ewbNo: string;
  status: string;
  ewayBillDate: string;
  validUpto: string;
  fromPincode: string;
  toPincode: string;
  hsnCode: string;
  vehicles: EwaybillVehicle[];
  errorCodes?: string;
  message?: string;
  code?: string;
}
