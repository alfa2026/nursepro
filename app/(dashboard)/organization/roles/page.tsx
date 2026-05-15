'use client'

import * as React from 'react'
import { useState } from 'react'
import {
  Shield, Plus, Edit, Trash2, Copy, Search, MoreHorizontal,
  CheckCircle2, XCircle, Users, Lock, Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useFirestoreCollection } from '@/hooks/use-firestore'
import { COLLECTIONS } from '@/types'

// ─── Types ─────────────────────────────────────────────
interface DynamicRole {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  hierarchyLevel: string
  departmentScope: 'global' | 'department' | 'team'
  departmentId?: string
  departmentName?: string
  isActive: boolean
  isSystem: boolean
  usersCount: number
  permissionsCount: number
  createdAt: string
  color: string
}

// ─── Demo Data ─────────────────────────────────────────
const INITIAL_ROLES: DynamicRole[] = [
  { id: '1', name: 'Super Admin', nameAr: 'مدير النظام', description: 'Full system access', descriptionAr: 'وصول كامل للنظام', hierarchyLevel: 'executive', departmentScope: 'global', isActive: true, isSystem: true, usersCount: 2, permissionsCount: 85, createdAt: '2024-01-01', color: '#7c3aed' },
  { id: '2', name: 'Hospital Admin', nameAr: 'مدير المستشفى', description: 'Hospital-wide management', descriptionAr: 'إدارة المستشفى بالكامل', hierarchyLevel: 'director', departmentScope: 'global', isActive: true, isSystem: true, usersCount: 3, permissionsCount: 78, createdAt: '2024-01-01', color: '#2563eb' },
  { id: '3', name: 'HR Manager', nameAr: 'مدير الموارد البشرية', description: 'Human resources management', descriptionAr: 'إدارة الموارد البشرية', hierarchyLevel: 'manager', departmentScope: 'global', isActive: true, isSystem: true, usersCount: 4, permissionsCount: 52, createdAt: '2024-01-01', color: '#059669' },
  { id: '4', name: 'Department Manager', nameAr: 'مدير قسم', description: 'Department-scoped management', descriptionAr: 'إدارة على مستوى القسم', hierarchyLevel: 'manager', departmentScope: 'department', isActive: true, isSystem: true, usersCount: 8, permissionsCount: 45, createdAt: '2024-01-01', color: '#d97706' },
  { id: '5', name: 'Head Nurse', nameAr: 'رئيسة التمريض', description: 'Nursing department head', descriptionAr: 'رئيسة قسم التمريض', hierarchyLevel: 'manager', departmentScope: 'department', departmentId: 'nursing', departmentName: 'التمريض', isActive: true, isSystem: false, usersCount: 5, permissionsCount: 38, createdAt: '2024-01-15', color: '#ec4899' },
  { id: '6', name: 'ICU Shift Supervisor', nameAr: 'مشرف مناوبة العناية', description: 'ICU shift management', descriptionAr: 'إدارة مناوبات العناية المركزة', hierarchyLevel: 'supervisor', departmentScope: 'team', departmentId: 'icu', departmentName: 'العناية المركزة', isActive: true, isSystem: false, usersCount: 6, permissionsCount: 28, createdAt: '2024-02-01', color: '#0891b2' },
  { id: '7', name: 'Staff Nurse', nameAr: 'ممرض/ة', description: 'Standard nursing staff', descriptionAr: 'طاقم التمريض العام', hierarchyLevel: 'staff', departmentScope: 'team', isActive: true, isSystem: true, usersCount: 45, permissionsCount: 15, createdAt: '2024-01-01', color: '#6366f1' },
  { id: '8', name: 'Receptionist', nameAr: 'موظف استقبال', description: 'Reception desk staff', descriptionAr: 'موظفو الاستقبال', hierarchyLevel: 'staff', departmentScope: 'department', departmentId: 'reception', departmentName: 'الاستقبال', isActive: true, isSystem: false, usersCount: 8, permissionsCount: 12, createdAt: '2024-02-10', color: '#f59e0b' },
  { id: '9', name: 'Financial Audit Manager', nameAr: 'مدير المراجعة المالية', description: 'Financial audit oversight', descriptionAr: 'الإشراف على المراجعة المالية', hierarchyLevel: 'manager', departmentScope: 'department', departmentId: 'finance', departmentName: 'المالية', isActive: true, isSystem: false, usersCount: 2, permissionsCount: 32, createdAt: '2024-03-01', color: '#84cc16' },
  { id: '10', name: 'Emergency Lead', nameAr: 'قائد الطوارئ', description: 'Emergency department operations', descriptionAr: 'عمليات قسم الطوارئ', hierarchyLevel: 'supervisor', departmentScope: 'department', departmentId: 'emergency', departmentName: 'الطوارئ', isActive: true, isSystem: false, usersCount: 4, permissionsCount: 35, createdAt: '2024-02-20', color: '#ef4444' },
]

const SCOPE_LABELS: Record<string, string> = { global: 'كامل النظام', department: 'القسم', team: 'الفريق' }
const LEVEL_LABELS: Record<string, string> = {
  executive: 'تنفيذي', director: 'مدير', manager: 'رئيس قسم',
  supervisor: 'مشرف', team_leader: 'قائد فريق', senior: 'أقدم', staff: 'موظف',
}

export default function DynamicRolesPage() {
  const [roles, setRoles] = useState(INITIAL_ROLES)
  const [search, setSearch] = useState('')
  const [scopeFilter, setScopeFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editRole, setEditRole] = useState<DynamicRole | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', nameAr: '', descriptionAr: '', hierarchyLevel: 'staff',
    departmentScope: 'department' as 'global' | 'department' | 'team',
    departmentName: '', color: '#2563eb',
  })

  const filtered = roles.filter((r) => {
    const matchSearch = r.nameAr.includes(search) || r.name.toLowerCase().includes(search.toLowerCase())
    const matchScope = scopeFilter === 'all' || r.departmentScope === scopeFilter
    return matchSearch && matchScope
  })

  const openAdd = () => {
    setEditRole(null)
    setForm({ name: '', nameAr: '', descriptionAr: '', hierarchyLevel: 'staff', departmentScope: 'department', departmentName: '', color: '#2563eb' })
    setDialogOpen(true)
  }

  const openEdit = (role: DynamicRole) => {
    setEditRole(role)
    setForm({ name: role.name, nameAr: role.nameAr, descriptionAr: role.descriptionAr, hierarchyLevel: role.hierarchyLevel, departmentScope: role.departmentScope, departmentName: role.departmentName || '', color: role.color })
    setDialogOpen(true)
  }

  const cloneRole = (role: DynamicRole) => {
    const cloned: DynamicRole = {
      ...role,
      id: Date.now().toString(),
      name: role.name + ' (Copy)',
      nameAr: role.nameAr + ' (نسخة)',
      isSystem: false,
      usersCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    setRoles((prev) => [...prev, cloned])
    toast.success('تم نسخ الدور بنجاح')
  }

  const handleSave = () => {
    if (!form.nameAr) { toast.error('اسم الدور مطلوب'); return }
    if (editRole) {
      setRoles((prev) => prev.map((r) => r.id === editRole.id ? { ...r, ...form, description: form.name, departmentName: form.departmentName } : r))
      toast.success('تم تحديث الدور')
    } else {
      setRoles((prev) => [...prev, {
        id: Date.now().toString(), ...form, description: form.name,
        departmentId: '', departmentName: form.departmentName,
        isActive: true, isSystem: false, usersCount: 0, permissionsCount: 0,
        createdAt: new Date().toISOString().slice(0, 10),
      }])
      toast.success('تم إنشاء الدور')
    }
    setDialogOpen(false)
  }

  const toggleActive = (id: string) => {
    setRoles((prev) => prev.map((r) => r.id === id ? { ...r, isActive: !r.isActive } : r))
  }

  const handleDelete = () => {
    if (!deleteId) return
    setRoles((prev) => prev.filter((r) => r.id !== deleteId))
    toast.success('تم حذف الدور')
    setDeleteId(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            إدارة الأدوار الديناميكية
          </h1>
          <p className="text-muted-foreground text-sm">إنشاء وتعديل أدوار مخصصة غير محدودة مع نطاق قسمي ومستوى إداري</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 ml-1" />دور جديد</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { val: roles.length, label: 'إجمالي الأدوار', color: 'text-primary' },
          { val: roles.filter((r) => r.isActive).length, label: 'نشط', color: 'text-green-600' },
          { val: roles.filter((r) => r.departmentScope === 'global').length, label: 'عام', color: 'text-blue-600' },
          { val: roles.reduce((a, r) => a + r.usersCount, 0), label: 'إجمالي المستخدمين', color: 'text-amber-600' },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 text-center">
              <p className={cn('text-2xl font-bold', s.color)}>{s.val}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
        </div>
        <Select value={scopeFilter} onValueChange={setScopeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="النطاق" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع النطاقات</SelectItem>
            <SelectItem value="global">عام</SelectItem>
            <SelectItem value="department">قسم</SelectItem>
            <SelectItem value="team">فريق</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((role) => (
          <Card key={role.id} className={cn('hover:shadow-md transition-shadow', !role.isActive && 'opacity-60')}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: role.color + '20' }}>
                    <Shield className="h-4 w-4" style={{ color: role.color }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{role.nameAr}</h3>
                    <p className="text-xs text-muted-foreground">{role.name}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(role)}><Edit className="h-4 w-4 ml-2" />تعديل</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => cloneRole(role)}><Copy className="h-4 w-4 ml-2" />نسخ</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleActive(role.id)}>
                      {role.isActive ? <><XCircle className="h-4 w-4 ml-2" />تعطيل</> : <><CheckCircle2 className="h-4 w-4 ml-2" />تفعيل</>}
                    </DropdownMenuItem>
                    {!role.isSystem && (
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(role.id)}>
                        <Trash2 className="h-4 w-4 ml-2" />حذف
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{role.descriptionAr}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge variant="outline" className="text-[10px]">{LEVEL_LABELS[role.hierarchyLevel] || role.hierarchyLevel}</Badge>
                <Badge variant="outline" className="text-[10px]">{SCOPE_LABELS[role.departmentScope]}</Badge>
                {role.departmentName && <Badge variant="secondary" className="text-[10px]">{role.departmentName}</Badge>}
                {role.isSystem && <Badge className="text-[10px] bg-purple-100 text-purple-700">نظامي</Badge>}
              </div>
              <Separator className="mb-3" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{role.usersCount} مستخدم</span>
                <span className="flex items-center gap-1"><Lock className="h-3 w-3" />{role.permissionsCount} صلاحية</span>
                <Badge variant={role.isActive ? 'default' : 'secondary'} className="text-[9px]">
                  {role.isActive ? 'نشط' : 'معطل'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editRole ? 'تعديل الدور' : 'إنشاء دور جديد'}</DialogTitle>
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
              <Label className="text-xs">الوصف</Label>
              <Input value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">المستوى الإداري</Label>
                <Select value={form.hierarchyLevel} onValueChange={(v) => setForm({ ...form, hierarchyLevel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEVEL_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">النطاق</Label>
                <Select value={form.departmentScope} onValueChange={(v: 'global' | 'department' | 'team') => setForm({ ...form, departmentScope: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">كامل النظام</SelectItem>
                    <SelectItem value="department">القسم فقط</SelectItem>
                    <SelectItem value="team">الفريق فقط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.departmentScope !== 'global' && (
              <div className="space-y-1">
                <Label className="text-xs">القسم المحدد (اختياري)</Label>
                <Input value={form.departmentName} onChange={(e) => setForm({ ...form, departmentName: e.target.value })} placeholder="اترك فارغاً للتطبيق على أي قسم" />
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">لون الدور</Label>
              <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>{editRole ? 'حفظ' : 'إنشاء'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف الدور</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف هذا الدور نهائياً وفصل جميع المستخدمين المرتبطين. هل أنت متأكد؟</AlertDialogDescription>
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
