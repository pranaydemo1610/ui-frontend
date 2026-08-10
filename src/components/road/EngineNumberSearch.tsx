import { Wrench } from 'lucide-react';
import { searchByEngineNumber } from '@/services/vahanApi';
import { VahanSearchScreen } from '@/components/road/VahanSearchScreen';

const ENGINE_REGEX = /^[^\s]{1,20}$/;

export function EngineNumberSearch() {
  return (
    <VahanSearchScreen
      title="Vehicle Lookup by Engine Number"
      subtitle="Retrieve vehicle registration details using Engine Number."
      fieldName="enginenumber"
      fieldLabel="Engine Number"
      placeholder="Enter Engine Number"
      icon={Wrench}
      endpoint="/ulip/vahan/06"
      moduleId="VAHAN/06"
      regex={ENGINE_REGEX}
      minLength={1}
      maxLength={20}
      apiCall={(value) => searchByEngineNumber({ enginenumber: value })}
      example="GC74B44246"
      pdfTitle="Vehicle Lookup by Engine Number"
    />
  );
}
