'use client'

import { useMemo } from 'react'
import {
  Users,
  Bed,
  UserCheck,
  UserX,
  AlertTriangle,
  Activity,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

import { StatsCard } from '@/components/dashboard/stats-card'
import { useLang } from '@/contexts/lang-context'
import { ChartCard } from '@/components/dashboard/chart-card'
import { AlertCard } from '@/components/dashboard/alert-card'
import { Alert, Department, COLLECTIONS } from '@/types'
import { useFirestoreCollection } from '@/hooks/use-firestore'

// Fallback data when Firestore is empty or not configured
const FALLBACK_DEPARTMENTS: Department[] = [
  { id: 'icu3', name: 'ICU 3rd', nameAr: '\u0627\u0644\u0639\u0646\u0627\u064a\u0629 3', category: 'medical', code: 'ICU3', beds: 15, capacity: 15, currentOccupancy: 7, staffCount: 5, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'icu4', name: 'ICU 4th', nameAr: '\u0627\u0644\u0639\u0646\u0627\u064a\u0629 4', category: 'medical', code: 'ICU4', beds: 6, capacity: 6, currentOccupancy: 2, staffCount: 1, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'ccu', name: 'CCU', nameAr: '\u0627\u0644\u0642\u0644\u0628', category: 'medical', code: 'CCU', beds: 11, capacity: 11, currentOccupancy: 2, staffCount: 2, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'er', name: 'ER', nameAr: '\u0627\u0644\u0637\u0648\u0627\u0631\u0626', category: 'medical', code: 'ER', beds: 11, capacity: 11, currentOccupancy: 29, staffCount: 3, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'nicu', name: 'NICU', nameAr: '\u062d\u062f\u064a\u062b\u064a \u0627\u0644\u0648\u0644\u0627\u062f\u0629', category: 'medical', code: 'NICU', beds: 2, capacity: 2, currentOccupancy: 0, staffCount: 1, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'picu', name: 'PICU', nameAr: '\u0623\u0637\u0641\u0627\u0644 \u0627\u0644\u0639\u0646\u0627\u064a\u0629', category: 'medical', code: 'PICU', beds: 4, capacity: 4, currentOccupancy: 3, staffCount: 1, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'f8', name: '8th Floor', nameAr: '\u0627\u0644\u0637\u0627\u0628\u0642 8', category: 'medical', code: 'F8', beds: 17, capacity: 17, currentOccupancy: 2, staffCount: 1, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'f9', name: '9th Floor', nameAr: '\u0627\u0644\u0637\u0627\u0628\u0642 9', category: 'medical', code: 'F9', beds: 17, capacity: 17, currentOccupancy: 9, staffCount: 2, isActive: true, createdAt: '', updatedAt: '' },
  { id: 'f11', name: '11th Floor', nameAr: '\u0627\u0644\u0637\u0627\u0628\u0642 11', category: 'medical', code: 'F11', beds: 14, capacity: 14, currentOccupancy: 1, staffCount: 1, isActive: true, createdAt: '', updatedAt: '' },
]

const FALLBACK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'over_capacity',
    message: 'ER department is over capacity',
    messageAr: '\u0642\u0633\u0645 \u0627\u0644\u0637\u0648\u0627\u0631\u0626 \u062a\u062c\u0627\u0648\u0632 \u0627\u0644\u0633\u0639\u0629 \u0627\u0644\u0645\u062d\u062f\u062f\u0629 (29 \u0645\u0631\u064a\u0636 / 11 \u0633\u0631\u064a\u0631)',
    department: '\u0627\u0644\u0637\u0648\u0627\u0631\u0626',
    severity: 'critical',
    timestamp: '2024-01-15T10:30:00.000Z',
  },
  {
    id: '2',
    type: 'low_staff',
    message: 'Low nurse to patient ratio',
    messageAr: '\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0645\u0631\u0636\u064a\u0646 \u0644\u0644\u0645\u0631\u0636\u0649 \u0645\u0646\u062e\u0641\u0636\u0629 \u0641\u064a \u0642\u0633\u0645 \u0627\u0644\u0637\u0627\u0628\u0642 9',
    department: '\u0627\u0644\u0637\u0627\u0628\u0642 9',
    severity: 'warning',
    timestamp: '2024-01-15T09:30:00.000Z',
  },
  {
    id: '3',
    type: 'isolation',
    message: 'New isolation case registered',
    messageAr: '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u062d\u0627\u0644\u0629 \u0639\u0632\u0644 \u062c\u062f\u064a\u062f\u0629 - CONTACT isolation',
    department: 'ICU 3rd',
    severity: 'warning',
    timestamp: '2024-01-15T08:30:00.000Z',
  },
]

const staffDistribution = [
  { name: '\u0645\u0645\u0631\u0636\u064a\u0646', value: 30, color: 'hsl(var(--chart-1))' },
  { name: '\u0643\u0628\u0627\u0631 \u0627\u0644\u0645\u0645\u0631\u0636\u064a\u0646', value: 10, color: 'hsl(var(--chart-2))' },
  { name: '\u0645\u0634\u0631\u0641\u064a\u0646', value: 5, color: 'hsl(var(--chart-3))' },
]

export default function DashboardPage() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const { data: departments } = useFirestoreCollection<Department>(
    COLLECTIONS.DEPARTMENTS,
    [],
    FALLBACK_DEPARTMENTS
  )

  const departmentData = useMemo(() =>
    departments.filter(d => d.beds).map(d => ({
      name: d.name,
      nameAr: d.nameAr,
      patients: d.currentOccupancy ?? 0,
      beds: d.beds ?? 0,
      nurses: d.staffCount ?? 0,
    })),
    [departments]
  )

  const stats = useMemo(() => {
    const totalBeds = departments.reduce((sum, d) => sum + (d.beds ?? 0), 0)
    const totalPatients = departments.reduce((sum, d) => sum + (d.currentOccupancy ?? 0), 0)
    const totalStaff = departments.reduce((sum, d) => sum + (d.staffCount ?? 0), 0)
    return {
      totalBeds: totalBeds || 100,
      totalPatients: totalPatients || 57,
      occupancyRate: totalBeds ? Math.round((totalPatients / totalBeds) * 100) : 57,
      totalStaff: totalStaff || 45,
      absences: 3,
      isolationCases: 4,
    }
  }, [departments])

  const alerts: Alert[] = FALLBACK_ALERTS

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{isAr ? 'لوحة التحكم' : 'Dashboard'}</h1>
        <p className="text-muted-foreground">
          {isAr ? 'نظرة عامة على حالة المستشفى والإحصائيات' : 'Hospital status overview and statistics'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatsCard
          title={isAr ? 'إجمالي الأسرة' : 'Total Beds'}
          value={stats.totalBeds}
          icon={Bed}
          variant="default"
        />
        <StatsCard
          title={isAr ? 'إجمالي المرضى' : 'Total Patients'}
          value={stats.totalPatients}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title={isAr ? 'نسبة الإشغال' : 'Occupancy Rate'}
          value={`${stats.occupancyRate}%`}
          icon={Activity}
          variant="primary"
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title={isAr ? 'إجمالي الكادر' : 'Total Staff'}
          value={stats.totalStaff}
          icon={UserCheck}
          variant="success"
        />
        <StatsCard
          title={isAr ? 'الغياب' : 'Absences'}
          value={stats.absences}
          icon={UserX}
          variant="warning"
        />
        <StatsCard
          title={isAr ? 'حالات العزل' : 'Isolation Cases'}
          value={stats.isolationCases}
          icon={AlertTriangle}
          variant="destructive"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - Patients per Department */}
        <ChartCard
          title="المرضى حسب الأقسام"
          subtitle="توزيع المرضى على أقسام المستشفى"
          className="lg:col-span-2"
        >
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis
                  dataKey={isAr ? 'nameAr' : 'name'}
                  type="category"
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'patients' ? 'المرضى' : name === 'beds' ? 'الأسرة' : name,
                  ]}
                />
                <Legend
                  formatter={(value) =>
                    value === 'patients' ? 'المرضى' : value === 'beds' ? 'الأسرة' : value
                  }
                />
                <Bar dataKey="patients" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="beds" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Pie Chart - Staff Distribution */}
        <ChartCard title="توزيع الكادر التمريضي" subtitle="حسب المستوى الوظيفي">
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={staffDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {staffDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Alerts Panel */}
      <AlertCard alerts={alerts} />

      {/* Department Overview Table */}
      <ChartCard title="نظرة عامة على الأقسام" subtitle="حالة كل قسم في الوقت الحالي">
        <div className="overflow-x-auto mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right py-3 px-4 font-semibold text-sm">القسم</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">الأسرة</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">المرضى</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">الممرضين</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">الإشغال</th>
                <th className="text-right py-3 px-4 font-semibold text-sm">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {departmentData.map((dept) => {
                const occupancy = Math.round((dept.patients / dept.beds) * 100)
                const isOverCapacity = dept.patients > dept.beds
                const isHighOccupancy = occupancy >= 80

                return (
                  <tr key={dept.name} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{dept.nameAr}</td>
                    <td className="py-3 px-4">{dept.beds}</td>
                    <td className="py-3 px-4">{dept.patients}</td>
                    <td className="py-3 px-4">{dept.nurses}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className={`h-full rounded-full ${
                              isOverCapacity
                                ? 'bg-destructive'
                                : isHighOccupancy
                                ? 'bg-warning'
                                : 'bg-success'
                            }`}
                            style={{ width: `${Math.min(occupancy, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm">{occupancy}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isOverCapacity
                            ? 'bg-destructive/10 text-destructive'
                            : isHighOccupancy
                            ? 'bg-warning/10 text-warning'
                            : 'bg-success/10 text-success'
                        }`}
                      >
                        {isOverCapacity ? 'تجاوز السعة' : isHighOccupancy ? 'مرتفع' : 'طبيعي'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
