'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import {
  Building2, Users, Network, GitBranch, Shield, Settings2,
  Plus, Edit, Trash2, ChevronRight, ChevronDown, FolderTree,
  UserCog, LayoutGrid, Search, MoreHorizontal,
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
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useFirestoreCollection } from '@/hooks/use-firestore'
import { COLLECTIONS } from '@/types'

// ─── Types ─────────────────────────────────────────────
interface OrgUnit {
  id: string
  name: string
  nameAr: string
  type: 'department' | 'sub_department' | 'team' | 'division' | 'section'
  parentId: string | null
  category: 'medical' | 'administrative' | 'support' | 'executive'
  level: number
  staffCount: number
  managerId?: string
  managerName?: string
  isActive: boolean
  color?: string
}

// ─── Demo Data ─────────────────────────────────────────
const INITIAL_UNITS: OrgUnit[] = [
  // Level 0 - Executive
  { id: 'exec', name: 'Executive Management', nameAr: 'الإدارة التنفيذية', type: 'division', parentId: null, category: 'executive', level: 0, staffCount: 5, managerName: 'د. عبدالله الراشد', isActive: true, color: '#7c3aed' },
  // Level 1 - Divisions
  { id: 'med', name: 'Medical Division', nameAr: 'القسم الطبي', type: 'division', parentId: 'exec', category: 'medical', level: 1, staffCount: 120, managerName: 'د. خالد إبراهيم', isActive: true, color: '#0891b2' },
  { id: 'admin', name: 'Administrative Division', nameAr: 'القسم الإداري', type: 'division', parentId: 'exec', category: 'administrative', level: 1, staffCount: 45, managerName: 'أحمد محمد', isActive: true, color: '#059669' },
  { id: 'support', name: 'Support Services', nameAr: 'خدمات الدعم', type: 'division', parentId: 'exec', category: 'support', level: 1, staffCount: 30, managerName: 'عمر حسن', isActive: true, color: '#d97706' },
  // Level 2 - Departments (Medical)
  { id: 'icu', name: 'ICU', nameAr: 'العناية المركزة', type: 'department', parentId: 'med', category: 'medical', level: 2, staffCount: 25, managerName: 'سارة أحمد', isActive: true, color: '#dc2626' },
  { id: 'er', name: 'Emergency', nameAr: 'الطوارئ', type: 'department', parentId: 'med', category: 'medical', level: 2, staffCount: 30, managerName: 'فاطمة حسن', isActive: true, color: '#ea580c' },
  { id: 'surgery', name: 'Surgery', nameAr: 'الجراحة', type: 'department', parentId: 'med', category: 'medical', level: 2, staffCount: 20, managerName: 'د. محمد علي', isActive: true, color: '#4f46e5' },
  { id: 'lab', name: 'Laboratory', nameAr: 'المختبر', type: 'department', parentId: 'med', category: 'medical', level: 2, staffCount: 15, managerName: 'نورة سعيد', isActive: true, color: '#7c3aed' },
  { id: 'pharmacy', name: 'Pharmacy', nameAr: 'الصيدلية', type: 'department', parentId: 'med', category: 'medical', level: 2, staffCount: 10, managerName: 'خالد عبدالله', isActive: true, color: '#0d9488' },
  { id: 'radiology', name: 'Radiology', nameAr: 'الأشعة', type: 'department', parentId: 'med', category: 'medical', level: 2, staffCount: 8, managerName: 'ليلى محمود', isActive: true, color: '#6366f1' },
  // Level 2 - Departments (Administrative)
  { id: 'hr', name: 'Human Resources', nameAr: 'الموارد البشرية', type: 'department', parentId: 'admin', category: 'administrative', level: 2, staffCount: 12, managerName: 'أمل خالد', isActive: true, color: '#2563eb' },
  { id: 'finance', name: 'Finance', nameAr: 'المالية', type: 'department', parentId: 'admin', category: 'administrative', level: 2, staffCount: 10, managerName: 'يوسف أحمد', isActive: true, color: '#16a34a' },
  { id: 'it', name: 'IT Department', nameAr: 'تقنية المعلومات', type: 'department', parentId: 'admin', category: 'administrative', level: 2, staffCount: 8, managerName: 'حسن علي', isActive: true, color: '#9333ea' },
  // Level 2 - Departments (Support)
  { id: 'maintenance', name: 'Maintenance', nameAr: 'الصيانة', type: 'department', parentId: 'support', category: 'support', level: 2, staffCount: 12, managerName: 'عادل محمد', isActive: true, color: '#ca8a04' },
  { id: 'security', name: 'Security', nameAr: 'الأمن', type: 'department', parentId: 'support', category: 'support', level: 2, staffCount: 15, managerName: 'سلطان حسين', isActive: true, color: '#64748b' },
  // Level 3 - Sub-Departments
  { id: 'icu-team-a', name: 'ICU Team A', nameAr: 'فريق العناية أ', type: 'team', parentId: 'icu', category: 'medical', level: 3, staffCount: 8, managerName: 'هدى محمد', isActive: true },
  { id: 'icu-team-b', name: 'ICU Team B', nameAr: 'فريق العناية ب', type: 'team', parentId: 'icu', category: 'medical', level: 3, staffCount: 8, managerName: 'منى خالد', isActive: true },
  { id: 'er-triage', name: 'ER Triage', nameAr: 'فرز الطوارئ', type: 'section', parentId: 'er', category: 'medical', level: 3, staffCount: 10, managerName: 'رنا أحمد', isActive: true },
  { id: 'hr-recruit', name: 'Recruitment', nameAr: 'التوظيف', type: 'team', parentId: 'hr', category: 'administrative', level: 3, staffCount: 4, managerName: 'دينا علي', isActive: true },
  { id: 'hr-payroll', name: 'Payroll', nameAr: 'الرواتب', type: 'team', parentId: 'hr', category: 'administrative', level: 3, staffCount: 3, managerName: 'سامي حسن', isActive: true },
]

const TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  division: { ar: 'قطاع', en: 'Division' },
  department: { ar: 'قسم', en: 'Department' },
  sub_department: { ar: 'قسم فرعي', en: 'Sub-Department' },
  team: { ar: 'فريق', en: 'Team' },
  section: { ar: 'وحدة', en: 'Section' },
}

const CATEGORY_COLORS: Record<string, string> = {
  executive: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400',
  medical: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400',
  administrative: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400',
  support: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400',
}

// ─── Tree Node Component ───────────────────────────────
function TreeNode({
  unit,
  units,
  expanded,
  toggleExpand,
  onEdit,
  onDelete,
}: {
  unit: OrgUnit
  units: OrgUnit[]
  expanded: Set<string>
  toggleExpand: (id: string) => void
  onEdit: (u: OrgUnit) => void
  onDelete: (id: string) => void
}) {
  const children = units.filter((u) => u.parentId === unit.id)
  const hasChildren = children.length > 0
  const isExpanded = expanded.has(unit.id)

  return (
    <div className="ml-4 border-l border-border/50 pl-4">
      <div className="flex items-center gap-2 py-1.5 group hover:bg-muted/50 rounded-md px-2 -ml-2">
        {hasChildren ? (
          <button onClick={() => toggleExpand(unit.id)} className="p-0.5 hover:bg-muted rounded">
            {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        ) : (
          <span className="w-4.5" />
        )}
        <div
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: unit.color || '#94a3b8' }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{unit.nameAr}</span>
            <span className="text-xs text-muted-foreground truncate hidden sm:inline">({unit.name})</span>
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', CATEGORY_COLORS[unit.category])}>
              {TYPE_LABELS[unit.type]?.ar || unit.type}
            </Badge>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {unit.managerName && <span>المدير: {unit.managerName}</span>}
            <span>{unit.staffCount} موظف</span>
          </div>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onEdit(unit)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => onDelete(unit.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      {isExpanded && hasChildren && (
        <div className="mt-0.5">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              unit={child}
              units={units}
              expanded={expanded}
              toggleExpand={toggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────
export default function OrganizationPage() {
  const [units, setUnits] = useState<OrgUnit[]>(INITIAL_UNITS)
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['exec', 'med', 'admin', 'support']))
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editUnit, setEditUnit] = useState<OrgUnit | null>(null)
  const [form, setForm] = useState({
    name: '', nameAr: '', type: 'department' as OrgUnit['type'],
    parentId: '' as string, category: 'medical' as OrgUnit['category'],
    managerName: '', color: '#3b82f6',
  })

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const expandAll = () => setExpanded(new Set(units.map((u) => u.id)))
  const collapseAll = () => setExpanded(new Set())

  const rootUnits = units.filter((u) => u.parentId === null)
  const filteredUnits = search
    ? units.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.nameAr.includes(search))
    : units

  const stats = {
    total: units.length,
    departments: units.filter((u) => u.type === 'department').length,
    teams: units.filter((u) => u.type === 'team').length,
    staff: units.reduce((s, u) => s + u.staffCount, 0),
  }

  const openAdd = (parentId?: string) => {
    setEditUnit(null)
    setForm({ name: '', nameAr: '', type: 'department', parentId: parentId || '', category: 'medical', managerName: '', color: '#3b82f6' })
    setDialogOpen(true)
  }

  const openEdit = (u: OrgUnit) => {
    setEditUnit(u)
    setForm({ name: u.name, nameAr: u.nameAr, type: u.type, parentId: u.parentId || '', category: u.category, managerName: u.managerName || '', color: u.color || '#3b82f6' })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!form.name || !form.nameAr) { toast.error('الاسم مطلوب'); return }
    if (editUnit) {
      setUnits((prev) => prev.map((u) => u.id === editUnit.id ? { ...u, ...form, parentId: form.parentId || null, level: form.parentId ? (units.find((p) => p.id === form.parentId)?.level || 0) + 1 : 0 } : u))
      toast.success('تم تحديث الوحدة التنظيمية')
    } else {
      const parentLevel = form.parentId ? (units.find((p) => p.id === form.parentId)?.level || 0) + 1 : 0
      const newUnit: OrgUnit = { ...form, id: Date.now().toString(), parentId: form.parentId || null, level: parentLevel, staffCount: 0, isActive: true }
      setUnits((prev) => [...prev, newUnit])
      toast.success('تمت إضافة الوحدة التنظيمية')
    }
    setDialogOpen(false)
  }

  const handleDelete = () => {
    if (!deleteId) return
    const children = units.filter((u) => u.parentId === deleteId)
    if (children.length > 0) {
      toast.error('لا يمكن حذف وحدة تحتوي على وحدات فرعية')
      setDeleteId(null)
      return
    }
    setUnits((prev) => prev.filter((u) => u.id !== deleteId))
    toast.success('تم حذف الوحدة التنظيمية')
    setDeleteId(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-primary" />
            الهيكل التنظيمي
          </h1>
          <p className="text-muted-foreground text-sm">إدارة الأقسام والفرق والوحدات التنظيمية</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/organization/chart"><Network className="h-4 w-4 ml-1" />عرض المخطط</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/organization/workflows"><GitBranch className="h-4 w-4 ml-1" />سير العمل</Link>
          </Button>
          <Button size="sm" onClick={() => openAdd()}>
            <Plus className="h-4 w-4 ml-1" />إضافة وحدة
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Building2, val: stats.total, label: 'الوحدات التنظيمية', color: 'bg-primary/10 text-primary' },
          { icon: FolderTree, val: stats.departments, label: 'الأقسام', color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400' },
          { icon: Users, val: stats.teams, label: 'الفرق', color: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400' },
          { icon: UserCog, val: stats.staff, label: 'إجمالي الموظفين', color: 'bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5">
              <div className="flex items-center gap-4">
                <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', s.color)}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.val}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
        </div>
        <div className="flex gap-1">
          <Button variant={viewMode === 'tree' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('tree')}>
            <FolderTree className="h-4 w-4 ml-1" />شجرة
          </Button>
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
            <LayoutGrid className="h-4 w-4 ml-1" />بطاقات
          </Button>
        </div>
        {viewMode === 'tree' && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={expandAll}>توسيع الكل</Button>
            <Button variant="ghost" size="sm" onClick={collapseAll}>طي الكل</Button>
          </div>
        )}
      </div>

      {/* Tree View */}
      {viewMode === 'tree' && (
        <Card>
          <CardContent className="pt-4">
            {rootUnits.map((unit) => (
              <TreeNode
                key={unit.id}
                unit={unit}
                units={units}
                expanded={expanded}
                toggleExpand={toggleExpand}
                onEdit={openEdit}
                onDelete={setDeleteId}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((unit) => (
            <Card key={unit.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: unit.color || '#94a3b8' }} />
                    <CardTitle className="text-sm">{unit.nameAr}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(unit)}><Edit className="h-4 w-4 ml-2" />تعديل</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openAdd(unit.id)}><Plus className="h-4 w-4 ml-2" />إضافة فرعي</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(unit.id)}><Trash2 className="h-4 w-4 ml-2" />حذف</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-2">{unit.name}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge variant="outline" className={cn('text-[10px]', CATEGORY_COLORS[unit.category])}>
                    {TYPE_LABELS[unit.type]?.ar}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">{unit.staffCount} موظف</Badge>
                </div>
                {unit.managerName && (
                  <p className="text-xs text-muted-foreground">المدير: {unit.managerName}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editUnit ? 'تعديل الوحدة التنظيمية' : 'إضافة وحدة تنظيمية جديدة'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">الاسم (EN) *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="ICU" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">الاسم (AR) *</Label>
                <Input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} placeholder="العناية المركزة" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">النوع</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as OrgUnit['type'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.ar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">التصنيف</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as OrgUnit['category'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical">طبي</SelectItem>
                    <SelectItem value="administrative">إداري</SelectItem>
                    <SelectItem value="support">دعم</SelectItem>
                    <SelectItem value="executive">تنفيذي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">تابع لـ (الوحدة الأم)</Label>
              <Select value={form.parentId} onValueChange={(v) => setForm({ ...form, parentId: v })}>
                <SelectTrigger><SelectValue placeholder="لا يوجد (مستوى أعلى)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">لا يوجد (مستوى أعلى)</SelectItem>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.nameAr} ({u.name})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">اسم المدير</Label>
                <Input value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })} placeholder="اسم المدير" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">اللون</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-9 w-12 rounded border cursor-pointer" />
                  <span className="text-xs text-muted-foreground">{form.color}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editUnit ? 'حفظ التعديلات' : 'إضافة'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف هذه الوحدة التنظيمية نهائياً. هل أنت متأكد؟</AlertDialogDescription>
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
