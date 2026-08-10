import { Hash } from 'lucide-react';
import { searchByVehicleNumber } from '@/services/vahanApi';
import { VahanSearchScreen } from '@/components/road/VahanSearchScreen';

const VEHICLE_REGEX = /^[A-Z0-9]{5,11}$/;

export function VehicleNumberSearch() {
  return (
    <VahanSearchScreen
      title="Vehicle Registration Details"
      subtitle="Search vehicle registration information using Vehicle Number."
      fieldName="vehiclenumber"
      fieldLabel="Vehicle Number"
      placeholder="Enter Vehicle Number"
      icon={Hash}
      endpoint="/ulip/vahan/04"
      moduleId="VAHAN/04"
      regex={VEHICLE_REGEX}
      minLength={5}
      maxLength={11}
      apiCall={(value) => searchByVehicleNumber({ vehiclenumber: value })}
      example="UP32KH0320"
      pdfTitle="Vehicle Registration Details"
    />
  );
}
