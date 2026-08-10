import type {
  FreightTrackingResponse,
  FreightCalcRequest,
  FreightCalcResponse,
  ParcelTrackingResponse,
  SarathiVerificationRequest,
  SarathiVerificationResponse,
  SarathiDetailsResponse,
  VahanVehicleResponse,
  EchallanResponse,
  EwaybillRequest,
  EwaybillResponse,
  FastagTransactionHistoryRequest,
  FastagTransactionHistoryResponse,
  FastagDetailsRequest,
  FastagDetailsResponse,
} from '@/types';

// FOIS/01 - Freight Tracking
export function mockFreightTracking(fnrnumber: string): FreightTrackingResponse {
  return {
    currentStatus: 'Loaded & In Transit',
    etaDstn: '2026-08-14 18:00',
    cmdt: 'Coal',
    fnrNo: fnrnumber,
    stationFrom: 'Bilaspur (BSP)',
    stationTo: 'Howrah (HWH)',
    lastRepLocn: 'Nagpur (NGP)',
    lgtd: '79.088860',
    lttd: '21.146633',
  };
}

// FOIS/02 - Freight Calculator
export function mockFreightCalc(req: FreightCalcRequest): FreightCalcResponse {
  return {
    distance: '875 km',
    eta: '2 days 4 hours',
    route: `${req.sttnfrom} → ${req.sttnto}`,
    rakeSize: '58 BOXN',
    basicFreight: '452300',
    loadingFreight: '12500',
    gst: '84138',
    otherCharges: '6200',
    finalFreight: '555138',
    viaDesc: [req.sttnfrom, 'Nagpur (NGP)', 'Raipur (RPR)', req.sttnto],
    surchargeDetails: [
      { charge: 'Busy Season Charge', percentage: '15%', amount: '67845', description: 'Applied during peak season' },
      { charge: 'Development Charge', percentage: '5%', amount: '22615', description: 'Infrastructure development' },
      { charge: 'Terminal Charge', percentage: '3%', amount: '13569', description: 'Origin terminal handling' },
    ],
    routeType: 'Shortest',
    developmentCharge: '22615',
    originTerminalCharge: '13569',
    destinationTerminalCharge: '13569',
    dynamicPricing: 'Active',
  };
}

// FOIS/04 - Parcel Tracking
export function mockParcelTracking(parcelNumber: string): ParcelTrackingResponse {
  return {
    parcelNumber,
    bookingDate: '2026-08-08 10:30',
    status: 'In Transit',
    deliveryDate: '2026-08-12 16:00',
    consignor: {
      name: 'Sharma Enterprises',
      address: 'Shop 14, Commercial Street, Bilaspur, Chhattisgarh - 495001',
    },
    consignee: {
      name: 'Gupta Traders',
      address: '45 Industrial Area, Howrah, West Bengal - 711106',
    },
    journey: {
      originStation: 'Bilaspur (BSP)',
      destinationStation: 'Howrah (HWH)',
    },
    item: {
      description: 'Engineering Goods',
      weight: '250 kg',
      totalItems: '12',
    },
    currentStep: 'In Transit',
  };
}

// SARATHI/01 - Driving License Verification
export function mockSarathiVerification(req: SarathiVerificationRequest): SarathiVerificationResponse {
  return {
    dlnumber: req.dlnumber,
    fullName: 'Rajesh Kumar Sharma',
    dob: req.dob,
    licenseStatus: 'Active',
    licenseType: 'Permanent',
    issuingAuthority: 'RTO Bilaspur, Chhattisgarh',
    currentStatus: 'Active',
    drivingClasses: [
      { class: 'LMV', type: 'Non-Transport' },
      { class: 'MCWG', type: 'Non-Transport' },
      { class: 'TRANS', type: 'Transport' },
    ],
    hazardousGoodsEndorsement: 'No',
    badgeInformation: 'Not Applicable',
    objections: [],
    dataSource: 'National SARATHI Register',
    lastUpdated: '2026-08-09 00:30:15',
    verificationStatus: 'verified',
  };
}

// SARATHI/02 - Driving License Details
export function mockSarathiDetails(dlnumber: string): SarathiDetailsResponse {
  return {
    dlnumber,
    fullName: 'Rajesh Kumar Sharma',
    licenseStatus: 'Active',
    nonTransportValidity: '2030-06-15',
    transportValidity: '2028-06-15',
    vehicleClasses: [
      { cov: 'LMV', covDescription: 'Light Motor Vehicle', covType: 'Non-Transport' },
      { cov: 'MCWG', covDescription: 'Motor Cycle With Gear', covType: 'Non-Transport' },
      { cov: 'HGVP', covDescription: 'Heavy Goods Vehicle Passenger', covType: 'Transport' },
    ],
    issuingAuthority: 'RTO Bilaspur, Chhattisgarh',
  };
}

// VAHAN/04, /05, /06 - Vehicle Details
export function mockVahanVehicle(searchValue: string): VahanVehicleResponse {
  return {
    vehiclenumber: searchValue,
    registrationNumber: searchValue,
    registrationStatus: 'ACTIVE',
    registrationDate: '2021-03-15',
    purchaseDate: '2021-03-10',
    ownerName: 'Suresh Patel',
    ownerCategory: 'Individual',
    permanentAddress: '12 MG Road, Civil Lines, Raipur, Chhattisgarh - 492001',
    presentAddress: '12 MG Road, Civil Lines, Raipur, Chhattisgarh - 492001',
    manufacturer: 'TATA MOTORS LIMITED',
    model: 'NEXON XZ+',
    vehicleClass: 'LMV',
    vehicleCategory: 'M1',
    bodyType: 'SALOON',
    fuelType: 'PETROL',
    color: 'WHITE',
    chassisNumber: 'MAT447230H3F13971',
    engineNumber: 'GC74B44246',
    cubicCapacity: '1199',
    numberOfCylinders: '3',
    wheelBase: '2498',
    unladenWeight: '1320',
    grossVehicleWeight: '1695',
    seatingCapacity: '5',
    registeredAt: 'RTO Raipur, Chhattisgarh',
    registrationValidTill: '2036-03-14',
    fitnessValidTill: '2036-03-14',
    taxValidTill: '2036-03-14',
    insuranceCompany: 'HDFC ERGO GENERAL INSURANCE',
    insurancePolicyNumber: 'HDFC2024156789',
    insuranceValidTill: '2027-03-14',
    pucDetails: 'Valid till 2027-03-15',
    bharatStageNorm: 'BS VI',
    financeCompany: 'Not Applicable',
    blacklistStatus: 'NO',
    ownerHistory: '1',
  };
}

// ECHALLAN/01 - Vehicle Challan Search
export function mockEchallan(vehicleNumber: string): EchallanResponse {
  return {
    owner_name: 'Suresh Patel',
    vehicle_number: vehicleNumber,
    state_code: 'CG',
    department: 'Traffic Police',
    driver_name: 'Suresh Patel',
    pending_data: [
      {
        challan_no: 'CG012025004567',
        challan_date_time: '2026-07-22 14:35',
        challan_place: 'MG Road Junction, Raipur',
        rto_distric_name: 'Raipur',
        fine_imposed: '500',
        challan_status: 'Pending',
        remark: 'Overspeeding',
        department: 'Traffic Police',
        court_status: 'Pending in Court',
        offence_details: [
          { act: 'MV Act 183', name: 'Exceeding Speed Limit' },
        ],
      },
      {
        challan_no: 'CG012025004891',
        challan_date_time: '2026-06-15 11:20',
        challan_place: 'Station Road, Raipur',
        rto_distric_name: 'Raipur',
        fine_imposed: '1000',
        challan_status: 'Pending',
        remark: 'No Parking',
        department: 'Traffic Police',
        court_status: 'Not Sent to Court',
        offence_details: [
          { act: 'MV Act 177', name: 'Parking in No Parking Zone' },
        ],
      },
    ],
    disposed_data: [
      {
        challan_no: 'CG012024003123',
        challan_date_time: '2026-03-08 09:45',
        challan_place: 'Civil Lines, Raipur',
        rto_distric_name: 'Raipur',
        fine_imposed: '500',
        challan_status: 'Disposed',
        remark: 'Wrong Side Driving',
        department: 'Traffic Police',
        receipt_no: 'RCP20260308456',
        offence_details: [
          { act: 'MV Act 119', name: 'Driving on Wrong Side' },
        ],
      },
    ],
  };
}

// EWAYBILL/01 - E-Way Bill Details
export function mockEwaybill(req: EwaybillRequest): EwaybillResponse {
  return {
    ewbNo: req.ewbNo,
    status: 'ACT',
    ewayBillDate: '2026-08-09 09:30:00',
    validUpto: '2026-08-11 23:59:00',
    fromPincode: '492001',
    toPincode: '110001',
    hsnCode: '8471',
    vehicles: [
      { vehicleNumber: 'CG04AB1234', enteredDate: '2026-08-09 09:35:00', transMode: '1' },
      { vehicleNumber: 'CG04AB5678', enteredDate: '2026-08-09 14:20:00', transMode: '1' },
    ],
  };
}

// FASTAG/01 - FASTag Transaction History
export function mockFastagTransactionHistory(req: FastagTransactionHistoryRequest): FastagTransactionHistoryResponse {
  return {
    vehiclenumber: req.vehiclenumber,
    vehicleClass: 'LMV',
    fastagStatus: 'A',
    tagId: '34161FA8203286140F4064E0',
    tid: 'E20000000000000000000000',
    transactions: [
      {
        readerReadTime: '2026-08-08 14:23:10',
        seqNo: 'TXN001',
        laneDirection: 'N',
        tollPlazaGeocode: '21.146633,79.088860',
        tollPlazaName: 'Raipur Toll Plaza',
        vehicleType: 'VC4',
        vehicleRegNo: req.vehiclenumber,
      },
      {
        readerReadTime: '2026-08-07 10:15:30',
        seqNo: 'TXN002',
        laneDirection: 'S',
        tollPlazaGeocode: '22.572646,88.363890',
        tollPlazaName: 'Kolkata Toll Plaza',
        vehicleType: 'VC4',
        vehicleRegNo: req.vehiclenumber,
      },
      {
        readerReadTime: '2026-08-06 18:45:00',
        seqNo: 'TXN003',
        laneDirection: 'E',
        tollPlazaGeocode: '19.0760,72.8777',
        tollPlazaName: 'Mumbai Toll Plaza',
        vehicleType: 'VC4',
        vehicleRegNo: req.vehiclenumber,
      },
    ],
  };
}

// FASTAG/02 - FASTag Vehicle & Tag Details
export function mockFastagDetails(req: FastagDetailsRequest): FastagDetailsResponse {
  const vn = req.vehiclenumber || 'CG04AB1234';
  return {
    regNumber: vn,
    vehicleClass: 'LMV',
    commercialVehicle: 'N',
    tags: [
      {
        tagId: '34161FA8203286140F4064E0',
        tid: 'E20000000000000000000000',
        tagStatus: 'A',
        issueDate: '2023-01-15',
        bankId: '34161',
        excCode: '00',
        vehicleClass: 'VC4',
        commercialVehicle: 'N',
        regNumber: vn,
      },
      {
        tagId: '34161FA8203286140F4064E1',
        tid: 'E20000000000000000000001',
        tagStatus: 'I',
        issueDate: '2022-06-20',
        bankId: '34161',
        excCode: '00',
        vehicleClass: 'VC4',
        commercialVehicle: 'N',
        regNumber: vn,
      },
    ],
  };
}
