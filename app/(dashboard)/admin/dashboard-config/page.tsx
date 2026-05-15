'use client'

import * as React from 'react'
import { useState } from 'react'
import {
  LayoutDashboard, Plus, Edit, Trash2, Eye, EyeOff, GripVertical,
  BarChart3, PieChart, Activity, Users, Calendar, Clock,
  Bell, TrendingUp, Bed, Building2, Save, RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useFirestoreCollection } from '@/hooks/use-firestore'
import { COLLECTIONS } from '@/types'

// ─── Types ─────────────────────────────────────────────
interface DashboardWidget {
  id: string
  name: string
  nameAr: string
  type: 'stat_card' | 'chart' | 'table' | 'activity_feed' | 'calendar' | 'alert'
  size: 'small' | 'medium' | 'large' | 'full'
  icon: string
  isVisible: boolean
  order: number
  visibleToRoles: string[]
  visibleToDepartments: string[]
  refreshInterval: number
}

// ─── Demo Widgets ──────────────────────────────────────
const INITIAL_WIDGETS: DashboardWidget[] = [
  { id: 'w1', name: 'Total Staff', nameAr: 'إجمالي الموظفين', type: 'stat_card', size: 'small', icon: 'users', isVisible: true, order: 1, visibleToRoles: ['super_admin', 'hospital_admin', 'hr_manager'], visibleToDepartments: ['all'], refreshInterval: 60 },
  { id: 'w2', name: 'Active Shifts', nameAr: 'المناوبات النشطة', type: 'stat_card', size: 'small', icon: 'clock', isVisible: true, order: 2, visibleToRoles: ['super_admin', 'hospital_admin', 'dept_manager', 'head_nurse'], visibleToDepartments: ['all'], refreshInterval: 30 },
  { id: 'w3', name: 'Bed Occupancy', nameAr: 'إشغال الأسرة', type: 'stat_card', size: 'small', icon: 'bed', isVisible: true, order: 3, visibleToRoles: ['super_admin', 'hospital_admin', 'dept_manager'], visibleToDepartments: ['medical'], refreshInterval: 30 },
  { id: 'w4', name: 'Pending Approvals', nameAr: 'الطلبات المعلقة', type: 'stat_card', size: 'small', icon: 'bell', isVisible: true, order: 4, visibleToRoles: ['super_admin', 'hospital_admin', 'hr_manager', 'dept_manager'], visibleToDepartments: ['all'], refreshInterval: 15 },
  { id: 'w5', name: 'Weekly Shift Chart', nameAr: 'مخطط المناوبات الأسبوعي', type: 'chart', size: 'large', icon: 'bar_chart', isVisible: true, order: 5, visibleToRoles: ['super_admin', 'hospital_admin', 'dept_manager', 'head_nurse'], visibleToDepartments: ['all'], refreshInterval: 300 },
  { id: 'w6', name: 'Department Analytics', nameAr: 'تحليلات الأقسام', type: 'chart', size: 'medium', icon: 'pie_chart', isVisible: true, order: 6, visibleToRoles: ['super_admin', 'hospital_admin'], visibleToDepartments: ['all'], refreshInterval: 300 },
  { id: 'w7', name: 'Attendance Summary', nameAr: 'ملخص الحضور', type: 'chart', size: 'medium', icon: 'trending', isVisible: true, order: 7, visibleToRoles: ['super_admin', 'hospital_admin', 'hr_manager', 'dept_manager'], visibleToDepartments: ['all'], refreshInterval: 120 },
  { id: 'w8', name: 'Recent Activity', nameAr: 'آخر النشاطات', type: 'activity_feed', size: 'medium', icon: 'activity', isVisible: true, order: 8, visibleToRoles: ['super_admin', 'hospital_admin'], visibleToDepartments: ['all'], refreshInterval: 30 },
  { id: 'w9', name: 'Upcoming Shifts', nameAr: 'المناوبات القادمة', type: 'calendar', size: 'medium', icon: 'calendar', isVisible: true, order: 9, visibleToRoles: ['super_admin', 'hospital_admin', 'dept_manager', 'head_nurse', 'nurse'], visibleToDepartments: ['all'], refreshInterval: 60 },
  { id: 'w10', name: 'Critical Alerts', nameAr: 'التنبيهات الحرجة', type: 'alert', size: 'full', icon: 'bell', isVisible: true, order: 10, visibleToRoles: ['super_admin', 'hospital_admin'], visibleToDepartments: ['all'], refreshInterval: 10 },
  { id: 'w11', name: 'ICU Status', nameAr: 'حالة العناية المركزة', type: 'stat_card', size: 'small', icon: 'bed', isVisible: true, order: 11, visibleToRoles: ['super_admin', 'hospital_admin', 'dept_manager'], visibleToDepartments: ['icu'], refreshInterval: 15 },
  { id: 'w12', name: 'Leave Calendar', nameAr: 'تقويم الإجازات', type: 'calendar', size: 'large', icon: 'calendar', isVisible: false, order: 12, visibleToRoles: ['super_admin', 'hr_manager'], visibleToDepartments: ['all'], refreshInterval: 300 },
]

const ROLES_LIST = [
  { id: 'super_admin', label: 'مدير النظام' },
  { id: 'hospital_admin', label: 'مدير المستشفى' },
  { id: 'hr_manager', label: 'مدير الموارد البشرية' },
  { id: 'dept_manager', label: 'مدير قسم' },
  { id: 'head_nurse', label: 'رئيسة التمريض' },
  { id: 'nurse', label: 'ممرض/ة' },
  { id: 'doctor', label: 'طبيب' },
  { id: 'receptionist', label: 'استقبال' },
  { id: 'accountant', label: 'محاسب' },
]

const WIDGET_TYPE_LABELS: Record<string, string> = {
  stat_card: 'بطاقة إحصائية', chart: 'مخطط بياني',
  table: 'جدول', activity_feed: 'تغذية نشاطات',
  calendar: 'تقويم', alert: 'تنبيهات',
}

const SIZE_LABELS: Record<string, string> = { small: 'صغير', medium: 'متوسط', large: 'كبير', full: 'كامل العرض' }

export default function DashboardConfigPage() {
  const [widgets, setWidgets] = useState(INITIAL_WIDGETS)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editWidget, setEditWidget] = useState<DashboardWidget | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [form, setForm] = useState({
    nameAr: '', type: 'stat_card' as DashboardWidget['type'],
    size: 'small' as DashboardWidget['size'],
    refreshInterval: 60, visibleToRoles: [] as string[],
  })

  const toggleVisibility = (id: string) => {
    setWidgets((prev) => prev.map((w) => w.id === id ? { ...w, isVisible: !w.isVisible } : w))
    setHasChanges(true)
  }

  const openEdit = (widget: DashboardWidget) => {
    setEditWidget(widget)
    setForm({
      nameAr: widget.nameAr, type: widget.type, size: widget.size,
      refreshInterval: widget.refreshInterval, visibleToRoles: [...widget.visibleToRoles],
    })
    setDialogOpen(true)
  }

  const openAdd = () => {
    setEditWidget(null)
    setForm({ nameAr: '', type: 'stat_card', size: 'small', refreshInterval: 60, visibleToRoles: [] })
    setDialogOpen(true)
  }

  const toggleRoleInForm = (roleId: string) => {
    setForm((prev) => ({
      ...prev,
      visibleToRoles: prev.visibleToRoles.includes(roleId)
        ? prev.visibleToRoles.filter((r) => r !== roleId)
        : [...prev.visibleToRoles, roleId]
    }))
  }

  const handleSave = () => {
    if (!form.nameAr) { toast.error('اسم العنصر مطلوب'); return }
    if (editWidget) {
      setWidgets((prev) => prev.map((w) => w.id === editWidget.id ? { ...w, ...form } : w))
      toast.success('تم تحديث العنصر')
    } else {
      setWidgets((prev) => [...prev, {
        id: Date.now().toString(), name: form.nameAr, ...form, icon: 'activity',
        isVisible: true, order: prev.length + 1, visibleToDepartments: ['all'],
      }])
      toast.success('تم إضافة العنصر')
    }
    setDialogOpen(false)
    setHasChanges(true)
  }

  const deleteWidget = (id: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id))
    setHasChanges(true)
    toast.success('تم حذف العنصر')
  }

  const saveAll = () => {
    toast.success('تم حفظ إعدادات لوحة التحكم')
    setHasChanges(false)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            إعدادات لوحة التحكم
          </h1>
          <p className="text-muted-foreground text-sm">تخصيص عناصر لوحة التحكم حسب الأدوار والأقسام</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={() => { setWidgets(INITIAL_WIDGETS); setHasChanges(false) }}>
              <RotateCcw className="h-4 w-4 ml-1" />تراجع
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={openAdd}><Plus className="h-4 w-4 ml-1" />عنصر جديد</Button>
          <Button size="sm" onClick={saveAll} disabled={!hasChanges}><Save className="h-4 w-4 ml-1" />حفظ</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { val: widgets.length, label: 'إجمالي العناصر' },
          { val: widgets.filter((w) => w.isVisible).length, label: 'مرئي' },
          { val: widgets.filter((w) => !w.isVisible).length, label: 'مخفي' },
          { val: new Set(widgets.flatMap((w) => w.visibleToRoles)).size, label: 'أدوار مستهدفة' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 text-center">
              <p className="text-2xl font-bold text-primary">{s.val}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {widgets.map((widget) => (
          <Card key={widget.id} className={cn('transition-all', !widget.isVisible && 'opacity-50 border-dashed')}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    {widget.type === 'stat_card' && <BarChart3 className="h-4 w-4 text-primary" />}
                    {widget.type === 'chart' && <PieChart className="h-4 w-4 text-primary" />}
                    {widget.type === 'activity_feed' && <Activity className="h-4 w-4 text-primary" />}
                    {widget.type === 'calendar' && <Calendar className="h-4 w-4 text-primary" />}
                    {widget.type === 'alert' && <Bell className="h-4 w-4 text-primary" />}
                    {widget.type === 'table' && <Users className="h-4 w-4 text-primary" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{widget.nameAr}</h3>
                    <p className="text-[10px] text-muted-foreground">{WIDGET_TYPE_LABELS[widget.type]} • {SIZE_LABELS[widget.size]}</p>
                  </div>
                </div>
                <Switch checked={widget.isVisible} onCheckedChange={() => toggleVisibility(widget.id)} />
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {widget.visibleToRoles.slice(0, 3).map((roleId) => {
                  const role = ROLES_LIST.find((r) => r.id === roleId)
                  return <Badge key={roleId} variant="outline" className="text-[9px]">{role?.label || roleId}</Badge>
                })}
                {widget.visibleToRoles.length > 3 && <Badge variant="secondary" className="text-[9px]">+{widget.visibleToRoles.length - 3}</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => openEdit(widget)}>
                  <Edit className="h-3 w-3 ml-1" />تعديل
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => deleteWidget(widget.id)}>
                  <Trash2 className="h-3 w-3 ml-1" />حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editWidget ? 'تعديل العنصر' : 'إضافة عنصر جديد'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">الاسم *</Label>
              <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">النوع</Label>
                <Select value={form.type} onValueChange={(v: DashboardWidget['type']) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(WIDGET_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">الحجم</Label>
                <Select value={form.size} onValueChange={(v: DashboardWidget['size']) => setForm({ ...form, size: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(SIZE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">تحديث كل (ثانية)</Label>
              <Input type="number" value={form.refreshInterval} onChange={(e) => setForm({ ...form, refreshInterval: +e.target.value })} />
            </div>
            <Separator />
            <Label className="text-xs font-semibold">مرئي لهذه الأدوار:</Label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES_LIST.map((role) => (
                <div key={role.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={form.visibleToRoles.includes(role.id)}
                    onCheckedChange={() => toggleRoleInForm(role.id)}
                  />
                  <span className="text-xs">{role.label}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editWidget ? 'حفظ' : 'إضافة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
