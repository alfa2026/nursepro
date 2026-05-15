'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import {
  Network, ChevronDown, ChevronRight, Users, ArrowLeft,
  ZoomIn, ZoomOut, Maximize2, Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useFirestoreCollection } from '@/hooks/use-firestore'
import { COLLECTIONS } from '@/types'

// ─── Org Chart Data ────────────────────────────────────
interface ChartNode {
  id: string
  name: string
  nameAr: string
  title: string
  titleAr: string
  department: string
  level: string
  avatar?: string
  children: ChartNode[]
  staffCount: number
}

const ORG_CHART: ChartNode = {
  id: 'ceo',
  name: 'Dr. Abdullah Al-Rashid',
  nameAr: 'د. عبدالله الراشد',
  title: 'Hospital Director',
  titleAr: 'المدير العام',
  department: 'Executive',
  level: 'executive',
  staffCount: 250,
  children: [
    {
      id: 'med-dir',
      name: 'Dr. Khalid Ibrahim',
      nameAr: 'د. خالد إبراهيم',
      title: 'Medical Director',
      titleAr: 'المدير الطبي',
      department: 'Medical',
      level: 'director',
      staffCount: 120,
      children: [
        {
          id: 'icu-mgr',
          name: 'Sara Ahmed',
          nameAr: 'سارة أحمد',
          title: 'ICU Head Nurse',
          titleAr: 'رئيسة تمريض العناية',
          department: 'ICU',
          level: 'manager',
          staffCount: 25,
          children: [
            { id: 'icu-sup-a', name: 'Huda Mohammed', nameAr: 'هدى محمد', title: 'Team A Supervisor', titleAr: 'مشرفة الفريق أ', department: 'ICU', level: 'supervisor', staffCount: 8, children: [] },
            { id: 'icu-sup-b', name: 'Mona Khaled', nameAr: 'منى خالد', title: 'Team B Supervisor', titleAr: 'مشرفة الفريق ب', department: 'ICU', level: 'supervisor', staffCount: 8, children: [] },
          ],
        },
        {
          id: 'er-mgr',
          name: 'Fatima Hassan',
          nameAr: 'فاطمة حسن',
          title: 'ER Department Head',
          titleAr: 'رئيسة قسم الطوارئ',
          department: 'Emergency',
          level: 'manager',
          staffCount: 30,
          children: [
            { id: 'er-sup', name: 'Rana Ahmed', nameAr: 'رنا أحمد', title: 'Triage Supervisor', titleAr: 'مشرفة الفرز', department: 'Emergency', level: 'supervisor', staffCount: 10, children: [] },
          ],
        },
        {
          id: 'surgery-mgr',
          name: 'Dr. Mohammed Ali',
          nameAr: 'د. محمد علي',
          title: 'Surgery Chief',
          titleAr: 'رئيس الجراحة',
          department: 'Surgery',
          level: 'manager',
          staffCount: 20,
          children: [],
        },
        {
          id: 'lab-mgr',
          name: 'Noura Said',
          nameAr: 'نورة سعيد',
          title: 'Lab Manager',
          titleAr: 'مديرة المختبر',
          department: 'Laboratory',
          level: 'manager',
          staffCount: 15,
          children: [],
        },
      ],
    },
    {
      id: 'admin-dir',
      name: 'Ahmed Mohammed',
      nameAr: 'أحمد محمد',
      title: 'Administrative Director',
      titleAr: 'المدير الإداري',
      department: 'Administration',
      level: 'director',
      staffCount: 45,
      children: [
        {
          id: 'hr-mgr',
          name: 'Amal Khaled',
          nameAr: 'أمل خالد',
          title: 'HR Manager',
          titleAr: 'مديرة الموارد البشرية',
          department: 'HR',
          level: 'manager',
          staffCount: 12,
          children: [
            { id: 'hr-recruit', name: 'Dina Ali', nameAr: 'دينا علي', title: 'Recruitment Lead', titleAr: 'مسؤولة التوظيف', department: 'HR', level: 'team_leader', staffCount: 4, children: [] },
            { id: 'hr-payroll', name: 'Sami Hassan', nameAr: 'سامي حسن', title: 'Payroll Lead', titleAr: 'مسؤول الرواتب', department: 'HR', level: 'team_leader', staffCount: 3, children: [] },
          ],
        },
        {
          id: 'finance-mgr',
          name: 'Yousef Ahmed',
          nameAr: 'يوسف أحمد',
          title: 'Finance Manager',
          titleAr: 'المدير المالي',
          department: 'Finance',
          level: 'manager',
          staffCount: 10,
          children: [],
        },
        {
          id: 'it-mgr',
          name: 'Hassan Ali',
          nameAr: 'حسن علي',
          title: 'IT Manager',
          titleAr: 'مدير تقنية المعلومات',
          department: 'IT',
          level: 'manager',
          staffCount: 8,
          children: [],
        },
      ],
    },
    {
      id: 'support-dir',
      name: 'Omar Hassan',
      nameAr: 'عمر حسن',
      title: 'Support Services Director',
      titleAr: 'مدير خدمات الدعم',
      department: 'Support',
      level: 'director',
      staffCount: 30,
      children: [
        { id: 'maint-mgr', name: 'Adel Mohammed', nameAr: 'عادل محمد', title: 'Maintenance Manager', titleAr: 'مدير الصيانة', department: 'Maintenance', level: 'manager', staffCount: 12, children: [] },
        { id: 'security-mgr', name: 'Sultan Hussein', nameAr: 'سلطان حسين', title: 'Security Manager', titleAr: 'مدير الأمن', department: 'Security', level: 'manager', staffCount: 15, children: [] },
      ],
    },
  ],
}

const LEVEL_COLORS: Record<string, string> = {
  executive: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30',
  director: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
  manager: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
  supervisor: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30',
  team_leader: 'border-slate-400 bg-slate-50 dark:bg-slate-800/30',
}

const LEVEL_BADGES: Record<string, string> = {
  executive: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  director: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  manager: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  supervisor: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  team_leader: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}

// ─── Chart Node Component ──────────────────────────────
function OrgChartNodeComponent({
  node,
  zoom,
}: {
  node: ChartNode
  zoom: number
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        className={cn(
          'relative border-2 rounded-xl p-3 shadow-sm transition-all hover:shadow-md cursor-pointer min-w-[180px] max-w-[220px]',
          LEVEL_COLORS[node.level] || 'border-gray-300 bg-gray-50'
        )}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        style={{ transform: `scale(${zoom})` }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs font-bold bg-white dark:bg-gray-800">
              {node.nameAr.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-xs truncate">{node.nameAr}</p>
            <p className="text-[10px] text-muted-foreground truncate">{node.name}</p>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-center">{node.titleAr}</p>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn('text-[9px] px-1', LEVEL_BADGES[node.level])}>
              {node.department}
            </Badge>
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <Users className="h-3 w-3" />{node.staffCount}
            </span>
          </div>
        </div>
        {hasChildren && (
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-background border rounded-full p-0.5">
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <>
          {/* Connector line */}
          <div className="w-px h-6 bg-border" />
          {/* Horizontal line */}
          {node.children.length > 1 && (
            <div className="relative w-full flex justify-center">
              <div
                className="absolute top-0 h-px bg-border"
                style={{
                  width: `${Math.min(node.children.length * 220, 880)}px`,
                  maxWidth: '100%',
                }}
              />
            </div>
          )}
          {/* Children nodes */}
          <div className="flex gap-4 mt-0 pt-6 flex-wrap justify-center">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-4 bg-border -mt-6" />
                <OrgChartNodeComponent node={child} zoom={zoom} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────
export default function OrgChartPage() {
  const [zoom, setZoom] = useState(1)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Network className="h-6 w-6 text-primary" />
            المخطط التنظيمي
          </h1>
          <p className="text-muted-foreground text-sm">الهيكل الإداري للمستشفى</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/organization"><ArrowLeft className="h-4 w-4 ml-1" />إدارة الهيكل</Link>
          </Button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setZoom(1)}>
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { level: 'executive', label: 'تنفيذي' },
          { level: 'director', label: 'مدير' },
          { level: 'manager', label: 'رئيس قسم' },
          { level: 'supervisor', label: 'مشرف' },
          { level: 'team_leader', label: 'قائد فريق' },
        ].map((item) => (
          <div key={item.level} className="flex items-center gap-1.5">
            <div className={cn('h-3 w-6 rounded border-2', LEVEL_COLORS[item.level])} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <Card className="overflow-x-auto">
        <CardContent className="pt-8 pb-8 min-w-[800px] flex justify-center">
          <OrgChartNodeComponent node={ORG_CHART} zoom={zoom} />
        </CardContent>
      </Card>
    </div>
  )
}
