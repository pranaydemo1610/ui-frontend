import { motion } from 'framer-motion';
import {
  Car,
  User,
  Cog,
  FileText,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Hash,
  Gauge,
  Weight,
  Users,
  Fuel,
  Palette,
  Building2,
  Banknote,
  Ban,
  History,
  BadgeCheck,
  Clock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Timeline } from '@/components/ui/Timeline';
import { ActionBar } from '@/components/ui/ActionBar';
import type { VahanVehicleResponse } from '@/types';

function isExpired(dateStr: string): boolean {
  if (!dateStr || dateStr === '-') return false;
  return new Date(dateStr) < new Date();
}

function isExpiringSoon(dateStr: string): boolean {
  if (!dateStr || dateStr === '-') return false;
  const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 90;
}

function statusBadge(status: string) {
  const s = status.toUpperCase();
  if (s === 'ACTIVE' || s === 'YES' || s === 'VALID') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300 border border-accent-200 dark:border-accent-800 px-3 py-1 text-xs font-semibold">
        <CheckCircle2 className="h-3.5 w-3.5" /> {status}
      </span>
    );
  }
  if (s.includes('EXPIR') || s.includes('SOON')) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 text-warning-700 dark:bg-warning-950/50 dark:text-warning-300 border border-warning-200 dark:border-warning-800 px-3 py-1 text-xs font-semibold">
        <AlertTriangle className="h-3.5 w-3.5" /> {status}
      </span>
    );
  }
  if (s === 'EXPIRED' || s === 'NO' || s === 'BLACKLISTED' || s.includes('SUSPEND')) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-error-50 text-error-700 dark:bg-error-950/50 dark:text-error-300 border border-error-200 dark:border-error-800 px-3 py-1 text-xs font-semibold">
        <XCircle className="h-3.5 w-3.5" /> {status}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 px-3 py-1 text-xs font-semibold">
      {status}
    </span>
  );
}

function expiryBadge(dateStr: string) {
  if (!dateStr || dateStr === '-') return <span className="text-sm text-neutral-400">—</span>;
  if (isExpired(dateStr)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-error-50 text-error-700 dark:bg-error-950/50 dark:text-error-300 border border-error-200 dark:border-error-800 px-2.5 py-0.5 text-xs font-semibold">
        <XCircle className="h-3 w-3" /> Expired
      </span>
    );
  }
  if (isExpiringSoon(dateStr)) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-50 text-warning-700 dark:bg-warning-950/50 dark:text-warning-300 border border-warning-200 dark:border-warning-800 px-2.5 py-0.5 text-xs font-semibold">
        <AlertTriangle className="h-3 w-3" /> Expiring Soon
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-50 text-accent-700 dark:bg-accent-950/50 dark:text-accent-300 border border-accent-200 dark:border-accent-800 px-2.5 py-0.5 text-xs font-semibold">
      <CheckCircle2 className="h-3 w-3" /> Active
    </span>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  icon?: LucideIcon;
}

function DetailItem({ label, value, icon: Icon }: DetailItemProps) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1 text-xs text-neutral-400">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </p>
      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{value || '—'}</p>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  children: React.ReactNode;
  delay?: number;
}

function SectionCard({ title, subtitle, icon: Icon, children, delay = 0 }: SectionCardProps) {
  return (
    <Card delay={delay}>
      <CardHeader title={title} subtitle={subtitle} icon={<Icon className="h-5 w-5" />} />
      <div className="grid grid-cols-2 gap-4 p-5 lg:grid-cols-3">{children}</div>
    </Card>
  );
}

interface VehicleDetailsDashboardProps {
  data: VahanVehicleResponse;
  onRetry: () => void;
  pdfTitle: string;
}

export function VehicleDetailsDashboard({ data, onRetry, pdfTitle }: VehicleDetailsDashboardProps) {
  const pdfSections: { label: string; value: string }[][] = [
    [
      { label: 'Registration Number', value: data.registrationNumber },
      { label: 'Registration Status', value: data.registrationStatus },
      { label: 'Registration Date', value: data.registrationDate },
      { label: 'Purchase Date', value: data.purchaseDate },
    ],
    [
      { label: 'Owner Name', value: data.ownerName },
      { label: 'Owner Category', value: data.ownerCategory },
      { label: 'Permanent Address', value: data.permanentAddress },
      { label: 'Present Address', value: data.presentAddress },
    ],
    [
      { label: 'Manufacturer', value: data.manufacturer },
      { label: 'Model', value: data.model },
      { label: 'Vehicle Class', value: data.vehicleClass },
      { label: 'Vehicle Category', value: data.vehicleCategory },
      { label: 'Body Type', value: data.bodyType },
      { label: 'Fuel Type', value: data.fuelType },
      { label: 'Color', value: data.color },
    ],
    [
      { label: 'Chassis Number', value: data.chassisNumber },
      { label: 'Engine Number', value: data.engineNumber },
      { label: 'Cubic Capacity', value: data.cubicCapacity },
      { label: 'Cylinders', value: data.numberOfCylinders },
      { label: 'Wheel Base', value: data.wheelBase },
      { label: 'Unladen Weight', value: data.unladenWeight },
      { label: 'Gross Vehicle Weight', value: data.grossVehicleWeight },
      { label: 'Seating Capacity', value: data.seatingCapacity },
    ],
    [
      { label: 'Registered At', value: data.registeredAt },
      { label: 'Registration Valid Till', value: data.registrationValidTill },
      { label: 'Fitness Valid Till', value: data.fitnessValidTill },
      { label: 'Tax Valid Till', value: data.taxValidTill },
      { label: 'Insurance Company', value: data.insuranceCompany },
      { label: 'Insurance Policy', value: data.insurancePolicyNumber },
      { label: 'Insurance Valid Till', value: data.insuranceValidTill },
      { label: 'PUC Details', value: data.pucDetails },
    ],
    [
      { label: 'Bharat Stage Norm', value: data.bharatStageNorm },
      { label: 'Finance Company', value: data.financeCompany },
      { label: 'Blacklist Status', value: data.blacklistStatus },
      { label: 'Owner History', value: data.ownerHistory },
    ],
  ];

  const excelRows: (string | number)[][] = [
    ['Field', 'Value'],
    ['Registration Number', data.registrationNumber],
    ['Registration Status', data.registrationStatus],
    ['Registration Date', data.registrationDate],
    ['Purchase Date', data.purchaseDate],
    ['Owner Name', data.ownerName],
    ['Owner Category', data.ownerCategory],
    ['Permanent Address', data.permanentAddress],
    ['Present Address', data.presentAddress],
    ['Manufacturer', data.manufacturer],
    ['Model', data.model],
    ['Vehicle Class', data.vehicleClass],
    ['Vehicle Category', data.vehicleCategory],
    ['Body Type', data.bodyType],
    ['Fuel Type', data.fuelType],
    ['Color', data.color],
    ['Chassis Number', data.chassisNumber],
    ['Engine Number', data.engineNumber],
    ['Cubic Capacity', data.cubicCapacity],
    ['Number of Cylinders', data.numberOfCylinders],
    ['Wheel Base', data.wheelBase],
    ['Unladen Weight', data.unladenWeight],
    ['Gross Vehicle Weight', data.grossVehicleWeight],
    ['Seating Capacity', data.seatingCapacity],
    ['Registered At', data.registeredAt],
    ['Registration Valid Till', data.registrationValidTill],
    ['Fitness Valid Till', data.fitnessValidTill],
    ['Tax Valid Till', data.taxValidTill],
    ['Insurance Company', data.insuranceCompany],
    ['Insurance Policy Number', data.insurancePolicyNumber],
    ['Insurance Valid Till', data.insuranceValidTill],
    ['PUC Details', data.pucDetails],
    ['Bharat Stage Norm', data.bharatStageNorm],
    ['Finance Company', data.financeCompany],
    ['Blacklist Status', data.blacklistStatus],
    ['Owner History', data.ownerHistory],
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
        <ActionBar
          data={data}
          pdfTitle={pdfTitle}
          pdfSections={pdfSections}
          excelSheets={[{ name: 'Vehicle Details', rows: excelRows }]}
        />
      </div>

      {/* Vehicle summary KPI */}
      <Card delay={0.05}>
        <CardHeader title="Vehicle Summary" subtitle="Registration overview" icon={<Car className="h-5 w-5" />} />
        <div className="grid grid-cols-2 gap-4 p-5 lg:grid-cols-4">
          <DetailItem label="Registration Number" value={data.registrationNumber} icon={Hash} />
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              Registration Status
            </p>
            {statusBadge(data.registrationStatus)}
          </div>
          <DetailItem label="Registration Date" value={data.registrationDate} icon={Calendar} />
          <DetailItem label="Purchase Date" value={data.purchaseDate} icon={Calendar} />
        </div>
      </Card>

      {/* Owner Information */}
      <SectionCard title="Owner Information" subtitle="Registered owner details" icon={User} delay={0.1}>
        <DetailItem label="Owner Name" value={data.ownerName} icon={User} />
        <DetailItem label="Owner Category" value={data.ownerCategory} icon={BadgeCheck} />
        <div className="col-span-2 lg:col-span-1">
          <DetailItem label="Permanent Address" value={data.permanentAddress} icon={Building2} />
        </div>
        <div className="col-span-2 lg:col-span-2">
          <DetailItem label="Present Address" value={data.presentAddress} icon={Building2} />
        </div>
      </SectionCard>

      {/* Vehicle Information */}
      <SectionCard title="Vehicle Information" subtitle="Make and model details" icon={Car} delay={0.15}>
        <DetailItem label="Manufacturer" value={data.manufacturer} icon={Building2} />
        <DetailItem label="Model" value={data.model} icon={Car} />
        <DetailItem label="Vehicle Class" value={data.vehicleClass} icon={Car} />
        <DetailItem label="Vehicle Category" value={data.vehicleCategory} icon={BadgeCheck} />
        <DetailItem label="Body Type" value={data.bodyType} icon={Car} />
        <DetailItem label="Fuel Type" value={data.fuelType} icon={Fuel} />
        <DetailItem label="Color" value={data.color} icon={Palette} />
      </SectionCard>

      {/* Technical Specifications */}
      <SectionCard title="Technical Specifications" subtitle="Engine and dimensions" icon={Cog} delay={0.2}>
        <DetailItem label="Chassis Number (Masked)" value={data.chassisNumber} icon={Hash} />
        <DetailItem label="Engine Number (Masked)" value={data.engineNumber} icon={Hash} />
        <DetailItem label="Cubic Capacity" value={data.cubicCapacity} icon={Gauge} />
        <DetailItem label="Number of Cylinders" value={data.numberOfCylinders} icon={Cog} />
        <DetailItem label="Wheel Base" value={data.wheelBase} icon={Cog} />
        <DetailItem label="Unladen Weight" value={data.unladenWeight} icon={Weight} />
        <DetailItem label="Gross Vehicle Weight" value={data.grossVehicleWeight} icon={Weight} />
        <DetailItem label="Seating Capacity" value={data.seatingCapacity} icon={Users} />
      </SectionCard>

      {/* Registration Details */}
      <Card delay={0.25}>
        <CardHeader title="Registration Details" subtitle="Validity and insurance information" icon={<FileText className="h-5 w-5" />} />
        <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
          <div className="space-y-4">
            <DetailItem label="Registered At" value={data.registeredAt} icon={Building2} />
            <div>
              <p className="mb-1 flex items-center gap-1 text-xs text-neutral-400">
                <Calendar className="h-3.5 w-3.5" />
                Registration Valid Till
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{data.registrationValidTill || '—'}</p>
                {expiryBadge(data.registrationValidTill)}
              </div>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1 text-xs text-neutral-400">
                <Calendar className="h-3.5 w-3.5" />
                Fitness Valid Till
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{data.fitnessValidTill || '—'}</p>
                {expiryBadge(data.fitnessValidTill)}
              </div>
            </div>
            <div>
              <p className="mb-1 flex items-center gap-1 text-xs text-neutral-400">
                <Calendar className="h-3.5 w-3.5" />
                Tax Valid Till
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{data.taxValidTill || '—'}</p>
                {expiryBadge(data.taxValidTill)}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <DetailItem label="Insurance Company" value={data.insuranceCompany} icon={ShieldCheck} />
            <DetailItem label="Insurance Policy Number" value={data.insurancePolicyNumber} icon={FileText} />
            <div>
              <p className="mb-1 flex items-center gap-1 text-xs text-neutral-400">
                <Clock className="h-3.5 w-3.5" />
                Insurance Valid Till
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{data.insuranceValidTill || '—'}</p>
                {expiryBadge(data.insuranceValidTill)}
              </div>
            </div>
            <DetailItem label="PUC Details" value={data.pucDetails} icon={BadgeCheck} />
          </div>
        </div>
      </Card>

      {/* Additional Details */}
      <SectionCard title="Additional Details" subtitle="Compliance and history" icon={ShieldCheck} delay={0.3}>
        <DetailItem label="Bharat Stage Norm" value={data.bharatStageNorm} icon={BadgeCheck} />
        <DetailItem label="Finance Company" value={data.financeCompany} icon={Banknote} />
        <div>
          <p className="mb-1 flex items-center gap-1 text-xs text-neutral-400">
            <Ban className="h-3.5 w-3.5" />
            Blacklist Status
          </p>
          {statusBadge(data.blacklistStatus)}
        </div>
        <DetailItem label="Owner History" value={data.ownerHistory} icon={History} />
      </SectionCard>

      {/* Verification timeline */}
      <Card delay={0.35}>
        <CardHeader title="Verification Timeline" subtitle="Process flow" icon={<CheckCircle2 className="h-5 w-5" />} />
        <div className="p-6">
          <Timeline
            steps={[
              { label: 'Request Submitted', description: 'Search query sent to VAHAN', status: 'completed' },
              { label: 'Database Lookup', description: 'National Register (VAHAN) queried', status: 'completed' },
              { label: 'Vehicle Found', description: 'Registration details retrieved', status: 'completed' },
            ]}
          />
        </div>
      </Card>
    </motion.div>
  );
}
