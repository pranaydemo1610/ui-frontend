import { Cog } from 'lucide-react';
import { searchByChassisNumber } from '@/services/vahanApi';
import { VahanSearchScreen } from '@/components/road/VahanSearchScreen';

const CHASSIS_REGEX = /^[^\s]{5,24}$/;

export function ChassisNumberSearch() {
  return (
    <VahanSearchScreen
      title="Vehicle Lookup by Chassis Number"
      subtitle="Retrieve vehicle registration details using Chassis Number."
      fieldName="chasisnumber"
      fieldLabel="Chassis Number"
      placeholder="Enter Chassis Number"
      icon={Cog}
      endpoint="/ulip/vahan/05"
      moduleId="VAHAN/05"
      regex={CHASSIS_REGEX}
      minLength={5}
      maxLength={24}
      apiCall={(value) => searchByChassisNumber({ chasisnumber: value })}
      example="MAT447230H3F13971"
      pdfTitle="Vehicle Lookup by Chassis Number"
    />
  );
}
