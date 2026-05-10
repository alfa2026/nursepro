'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import {
  GitBranch, Plus, Edit, Trash2, Play, Pause, ArrowLeft,
  CheckCircle2, XCircle, Clock, AlertTriangle, ChevronDown,
  ChevronRight, ArrowDown, User, Shield, Search, MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useFirestoreCollection } from '@/hooks/use-firestore'
import { COLLECTIONS } from '@/types'

// ─── Types ─────────────────────────────────────────────
interface WorkflowStep {
  id: string
  order: number
  name: string
  nameAr: string
  approverType: 'direct_supervisor' | 'department_manager' | 'specific_role' | 'hierarchy_level'
  approverLabel: string
  requiredApprovals: number
  autoApproveAfterDays?: number
  escalateAfterDays?: number
}

interface Workflow {
  id: string
  name: string
  nameAr: string
  type: string
  description: string
  descriptionAr: string
  isActive: boolean
  steps: WorkflowStep[]
  instanceCount: number
  createdAt: string
}

interface WorkflowInstance {
  id: string
  workflowName: string
  workflowNameAr: string
  type: string
  requesterName: string
  requesterDepartment: string
  currentStep: number
  totalSteps: number
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'escalated'
  createdAt: string
  data: Record<string, string>
}

// ─── Demo Data ─────────────────────────────────────────
const WORKFLOWS: Workflow[] = [
  {
    id: 'wf-leave',
    name: 'Leave Request Approval',
    nameAr: 'اعتماد طلب الإجازة',
    type: 'leave_request',
    description: 'Multi-level approval for leave requests',
    descriptionAr: 'اعتماد متعدد المستويات لطلبات الإجازة',
    isActive: true,
    instanceCount: 45,
    createdAt: '2024-01-15',
    steps: [
      { id: 's1', order: 1, name: 'Direct Supervisor', nameAr: 'المشرف المباشر', approverType: 'direct_supervisor', approverLabel: 'المشرف المباشر', requiredApprovals: 1, escalateAfterDays: 2 },
      { id: 's2', order: 2, name: 'Department Manager', nameAr: 'مدير القسم', approverType: 'department_manager', approverLabel: 'مدير القسم', requiredApprovals: 1, escalateAfterDays: 3 },
      { id: 's3', order: 3, name: 'HR Approval', nameAr: 'اعتماد الموارد البشرية', approverType: 'specific_role', approverLabel: 'الموارد البشرية', requiredApprovals: 1, autoApproveAfterDays: 5 },
    ],
  },
  {
    id: 'wf-overtime',
    name: 'Overtime Approval',
    nameAr: 'اعتماد العمل الإضافي',
    type: 'overtime_approval',
    description: 'Approval chain for overtime requests',
    descriptionAr: 'سلسلة اعتماد طلبات العمل الإضافي',
    isActive: true,
    instanceCount: 28,
    createdAt: '2024-02-01',
    steps: [
      { id: 's1', order: 1, name: 'Shift Supervisor', nameAr: 'مشرف المناوبة', approverType: 'direct_supervisor', approverLabel: 'مشرف المناوبة', requiredApprovals: 1, escalateAfterDays: 1 },
      { id: 's2', order: 2, name: 'Department Head', nameAr: 'رئيس القسم', approverType: 'department_manager', approverLabel: 'رئيس القسم', requiredApprovals: 1 },
    ],
  },
  {
    id: 'wf-onboard',
    name: 'Employee Onboarding',
    nameAr: 'تأهيل موظف جديد',
    type: 'employee_onboarding',
    description: 'New employee onboarding approval workflow',
    descriptionAr: 'سير عمل اعتماد تأهيل الموظفين الجدد',
    isActive: true,
    instanceCount: 12,
    createdAt: '2024-01-20',
    steps: [
      { id: 's1', order: 1, name: 'HR Review', nameAr: 'مراجعة الموارد البشرية', approverType: 'specific_role', approverLabel: 'الموارد البشرية', requiredApprovals: 1 },
      { id: 's2', order: 2, name: 'Department Manager', nameAr: 'مدير القسم', approverType: 'department_manager', approverLabel: 'مدير القسم', requiredApprovals: 1 },
      { id: 's3', order: 3, name: 'IT Setup', nameAr: 'إعداد تقنية المعلومات', approverType: 'specific_role', approverLabel: 'تقنية المعلومات', requiredApprovals: 1 },
      { id: 's4', order: 4, name: 'Final Approval', nameAr: 'الاعتماد النهائي', approverType: 'hierarchy_level', approverLabel: 'المدير العام', requiredApprovals: 1 },
    ],
  },
  {
    id: 'wf-financial',
    name: 'Financial Approval',
    nameAr: 'الاعتماد المالي',
    type: 'financial_approval',
    description: 'Financial request approval chain',
    descriptionAr: 'سلسلة اعتماد الطلبات المالية',
    isActive: true,
    instanceCount: 8,
    createdAt: '2024-03-01',
    steps: [
      { id: 's1', order: 1, name: 'Department Manager', nameAr: 'مدير القسم', approverType: 'department_manager', approverLabel: 'مدير القسم', requiredApprovals: 1 },
      { id: 's2', order: 2, name: 'Finance Review', nameAr: 'مراجعة المالية', approverType: 'specific_role', approverLabel: 'المالية', requiredApprovals: 1 },
      { id: 's3', order: 3, name: 'CFO Approval', nameAr: 'اعتماد المدير المالي', approverType: 'hierarchy_level', approverLabel: 'المدير المالي', requiredApprovals: 1 },
    ],
  },
  {
    id: 'wf-shift',
    name: 'Shift Swap Request',
    nameAr: 'طلب تبديل المناوبة',
    type: 'shift_swap',
    description: 'Shift swap approval between nurses',
    descriptionAr: 'اعتماد تبديل المناوبات بين الممرضين',
    isActive: false,
    instanceCount: 20,
    createdAt: '2024-02-15',
    steps: [
      { id: 's1', order: 1, name: 'Head Nurse', nameAr: 'رئيسة التمريض', approverType: 'direct_supervisor', approverLabel: 'رئيسة التمريض', requiredApprovals: 1 },
    ],
  },
]

const INSTANCES: WorkflowInstance[] = [
  { id: 'i1', workflowName: 'Leave Request Approval', workflowNameAr: 'اعتماد طلب الإجازة', type: 'leave_request', requesterName: 'نورة السالم', requesterDepartment: 'العناية المركزة', currentStep: 2, totalSteps: 3, status: 'in_progress', createdAt: '2024-03-14', data: { type: 'إجازة سنوية', days: '5 أيام' } },
  { id: 'i2', workflowName: 'Overtime Approval', workflowNameAr: 'اعتماد العمل الإضافي', type: 'overtime_approval', requesterName: 'أحمد محمد', requesterDepartment: 'الطوارئ', currentStep: 1, totalSteps: 2, status: 'pending', createdAt: '2024-03-15', data: { hours: '4 ساعات', date: '2024-03-16' } },
  { id: 'i3', workflowName: 'Employee Onboarding', workflowNameAr: 'تأهيل موظف جديد', type: 'employee_onboarding', requesterName: 'محمد علي', requesterDepartment: 'الموارد البشرية', currentStep: 3, totalSteps: 4, status: 'in_progress', createdAt: '2024-03-10', data: { employee: 'هدى سعيد', position: 'ممرضة' } },
  { id: 'i4', workflowName: 'Leave Request Approval', workflowNameAr: 'اعتماد طلب الإجازة', type: 'leave_request', requesterName: 'فاطمة حسن', requesterDepartment: 'الجراحة', currentStep: 3, totalSteps: 3, status: 'approved', createdAt: '2024-03-08', data: { type: 'إجازة مرضية', days: '3 أيام' } },
  { id: 'i5', workflowName: 'Financial Approval', workflowNameAr: 'الاعتماد المالي', type: 'financial_approval', requesterName: 'يوسف أحمد', requesterDepartment: 'المالية', currentStep: 1, totalSteps: 3, status: 'rejected', createdAt: '2024-03-12', data: { amount: '5000 ر.س', purpose: 'شراء أجهزة' } },
  { id: 'i6', workflowName: 'Overtime Approval', workflowNameAr: 'اعتماد العمل الإضافي', type: 'overtime_approval', requesterName: 'سارة أحمد', requesterDepartment: 'العناية المركزة', currentStep: 2, totalSteps: 2, status: 'approved', createdAt: '2024-03-13', data: { hours: '6 ساعات', date: '2024-03-14' } },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', icon: Clock },
  in_progress: { label: 'قيد المعالجة', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: Play },
  approved: { label: 'معتمد', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300', icon: CheckCircle2 },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', icon: XCircle },
  escalated: { label: 'مُصعَّد', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300', icon: AlertTriangle },
}

const TYPE_LABELS: Record<string, string> = {
  leave_request: 'طلب إجازة',
  overtime_approval: 'عمل إضافي',
  employee_onboarding: 'تأهيل موظف',
  financial_approval: 'اعتماد مالي',
  shift_swap: 'تبديل مناوبة',
  attendance_correction: 'تصحيح حضور',
  equipment_request: 'طلب معدات',
  training_request: 'طلب تدريب',
}

// ─── Main Component ────────────────────────────────────
export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState(WORKFLOWS)
  const [instances] = useState(INSTANCES)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('definitions')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWf, setSelectedWf] = useState<Workflow | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '', nameAr: '', type: 'leave_request', description: '', descriptionAr: '',
  })
  const [formSteps, setFormSteps] = useState<WorkflowStep[]>([])

  const filteredWorkflows = workflows.filter((w) =>
    w.nameAr.includes(search) || w.name.toLowerCase().includes(search.toLowerCase())
  )

  const filteredInstances = instances.filter((i) =>
    i.requesterName.includes(search) || i.workflowNameAr.includes(search)
  )

  const stats = {
    total: workflows.length,
    active: workflows.filter((w) => w.isActive).length,
    pending: instances.filter((i) => i.status === 'pending' || i.status === 'in_progress').length,
    completed: instances.filter((i) => i.status === 'approved' || i.status === 'rejected').length,
  }

  const openAdd = () => {
    setSelectedWf(null)
    setForm({ name: '', nameAr: '', type: 'leave_request', description: '', descriptionAr: '' })
    setFormSteps([{ id: '1', order: 1, name: '', nameAr: '', approverType: 'direct_supervisor', approverLabel: '', requiredApprovals: 1 }])
    setDialogOpen(true)
  }

  const openEdit = (wf: Workflow) => {
    setSelectedWf(wf)
    setForm({ name: wf.name, nameAr: wf.nameAr, type: wf.type, description: wf.description, descriptionAr: wf.descriptionAr })
    setFormSteps([...wf.steps])
    setDialogOpen(true)
  }

  const addStep = () => {
    setFormSteps((prev) => [...prev, { id: Date.now().toString(), order: prev.length + 1, name: '', nameAr: '', approverType: 'direct_supervisor', approverLabel: '', requiredApprovals: 1 }])
  }

  const removeStep = (id: string) => {
    setFormSteps((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })))
  }

  const updateStep = (id: string, field: string, value: string | number) => {
    setFormSteps((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleSave = () => {
    if (!form.name || !form.nameAr || formSteps.length === 0) {
      toast.error('جميع الحقول مطلوبة')
      return
    }
    if (selectedWf) {
      setWorkflows((prev) => prev.map((w) => w.id === selectedWf.id ? { ...w, ...form, steps: formSteps } : w))
      toast.success('تم تحديث سير العمل')
    } else {
      setWorkflows((prev) => [...prev, { ...form, id: Date.now().toString(), steps: formSteps, isActive: true, instanceCount: 0, createdAt: new Date().toISOString().slice(0, 10) }])
      toast.success('تم إنشاء سير العمل')
    }
    setDialogOpen(false)
  }

  const toggleActive = (id: string) => {
    setWorkflows((prev) => prev.map((w) => w.id === id ? { ...w, isActive: !w.isActive } : w))
    toast.success('تم تحديث الحالة')
  }

  const handleDelete = () => {
    if (!deleteId) return
    setWorkflows((prev) => prev.filter((w) => w.id !== deleteId))
    toast.success('تم حذف سير العمل')
    setDeleteId(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" />
            محرك سير العمل
          </h1>
          <p className="text-muted-foreground text-sm">إدارة سلاسل الاعتماد والموافقات الديناميكية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/organization"><ArrowLeft className="h-4 w-4 ml-1" />الهيكل التنظيمي</Link>
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 ml-1" />سير عمل جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { val: stats.total, label: 'إجمالي سير العمل', color: 'text-primary' },
          { val: stats.active, label: 'نشط', color: 'text-green-600' },
          { val: stats.pending, label: 'طلبات قيد المعالجة', color: 'text-amber-600' },
          { val: stats.completed, label: 'مكتمل', color: 'text-blue-600' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 text-center">
              <p className={cn('text-2xl font-bold', s.color)}>{s.val}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="definitions">تعريفات سير العمل ({workflows.length})</TabsTrigger>
          <TabsTrigger value="instances">الطلبات ({instances.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="definitions" className="space-y-4 mt-4">
          {filteredWorkflows.map((wf) => (
            <Card key={wf.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{wf.nameAr}</h3>
                      <Badge variant={wf.isActive ? 'default' : 'secondary'} className="text-[10px]">
                        {wf.isActive ? 'نشط' : 'معطل'}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {TYPE_LABELS[wf.type] || wf.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{wf.descriptionAr}</p>

                    {/* Steps visualization */}
                    <div className="flex flex-wrap items-center gap-1">
                      {wf.steps.map((step, i) => (
                        <React.Fragment key={step.id}>
                          <div className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2.5 py-1.5 border">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                              {step.order}
                            </div>
                            <span className="text-xs font-medium">{step.nameAr}</span>
                          </div>
                          {i < wf.steps.length - 1 && <ArrowDown className="h-3 w-3 text-muted-foreground rotate-[-90deg]" />}
                        </React.Fragment>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      {wf.instanceCount} طلب | أنشئ في {wf.createdAt}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(wf)}><Edit className="h-4 w-4 ml-2" />تعديل</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleActive(wf.id)}>
                        {wf.isActive ? <><Pause className="h-4 w-4 ml-2" />تعطيل</> : <><Play className="h-4 w-4 ml-2" />تفعيل</>}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(wf.id)}>
                        <Trash2 className="h-4 w-4 ml-2" />حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="instances" className="space-y-3 mt-4">
          {filteredInstances.map((inst) => {
            const cfg = STATUS_CONFIG[inst.status]
            const StatusIcon = cfg.icon
            return (
              <Card key={inst.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', cfg.color)}>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{inst.workflowNameAr}</span>
                          <Badge variant="outline" className="text-[10px]">{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {inst.requesterName} • {inst.requesterDepartment} • {inst.createdAt}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">الخطوة</p>
                      <p className="text-sm font-medium">{inst.currentStep}/{inst.totalSteps}</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        inst.status === 'approved' ? 'bg-green-500' :
                        inst.status === 'rejected' ? 'bg-red-500' : 'bg-primary'
                      )}
                      style={{ width: `${(inst.currentStep / inst.totalSteps) * 100}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedWf ? 'تعديل سير العمل' : 'إنشاء سير عمل جديد'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">الاسم (EN)</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">الاسم (AR) *</Label>
                <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">النوع</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الوصف (AR)</Label>
              <Input value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">خطوات سير العمل</Label>
              <Button variant="outline" size="sm" onClick={addStep}><Plus className="h-3 w-3 ml-1" />إضافة خطوة</Button>
            </div>

            {formSteps.map((step, idx) => (
              <Card key={step.id} className="border-dashed">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">{step.order}</div>
                    <span className="text-xs font-medium flex-1">خطوة {step.order}</span>
                    {formSteps.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeStep(step.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="اسم الخطوة"
                      className="text-xs h-8"
                      value={step.nameAr}
                      onChange={(e) => updateStep(step.id, 'nameAr', e.target.value)}
                    />
                    <Select value={step.approverType} onValueChange={(v) => updateStep(step.id, 'approverType', v)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct_supervisor">المشرف المباشر</SelectItem>
                        <SelectItem value="department_manager">مدير القسم</SelectItem>
                        <SelectItem value="specific_role">دور محدد</SelectItem>
                        <SelectItem value="hierarchy_level">مستوى إداري</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{selectedWf ? 'حفظ' : 'إنشاء'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف سير العمل</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف سير العمل هذا نهائياً. هل أنت متأكد؟</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
