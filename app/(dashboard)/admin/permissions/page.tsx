'use client'

import * as React from 'react'
import { useState } from 'react'
import {
  Shield, Save, RotateCcw, Search, CheckCircle2, XCircle,
  Eye, Plus, Edit, Trash2, Copy, Lock, Unlock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useFirestoreCollection } from '@/hooks/use-firestore'
import { COLLECTIONS } from '@/types'

// ─── Permission Matrix Types ───────────────────────────
interface PermissionModule {
  id: string
  name: string
  nameAr: string
  icon: string
  actions: string[]
}

interface RolePermissionSet {
  roleId: string
  roleName: string
  roleNameAr: string
  hierarchyLevel: string
  departmentScope: 'global' | 'department' | 'team'
  isActive: boolean
  permissions: Record<string, Record<string, boolean>>
}

// ─── Permission Modules ────────────────────────────────
const MODULES: PermissionModule[] = [
  { id: 'dashboard', name: 'Dashboard', nameAr: 'لوحة التحكم', icon: '📊', actions: ['view', 'analytics', 'export'] },
  { id: 'users', name: 'Users', nameAr: 'المستخدمين', icon: '👥', actions: ['view', 'create', 'edit', 'delete', 'approve', 'assign'] },
  { id: 'roles', name: 'Roles', nameAr: 'الأدوار', icon: '🔐', actions: ['view', 'create', 'edit', 'delete', 'assign'] },
  { id: 'departments', name: 'Departments', nameAr: 'الأقسام', icon: '🏢', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
  { id: 'organization', name: 'Organization', nameAr: 'الهيكل التنظيمي', icon: '🏛️', actions: ['view', 'create', 'edit', 'delete', 'configure'] },
  { id: 'scheduling', name: 'Scheduling', nameAr: 'الجداول', icon: '📅', actions: ['view', 'create', 'edit', 'delete', 'approve', 'assign', 'schedule'] },
  { id: 'attendance', name: 'Attendance', nameAr: 'الحضور', icon: '⏰', actions: ['view', 'create', 'edit', 'approve', 'export'] },
  { id: 'leave', name: 'Leave', nameAr: 'الإجازات', icon: '🏖️', actions: ['view', 'create', 'edit', 'approve', 'reject', 'export'] },
  { id: 'reports', name: 'Reports', nameAr: 'التقارير', icon: '📋', actions: ['view', 'create', 'edit', 'approve', 'export'] },
  { id: 'notifications', name: 'Notifications', nameAr: 'الإشعارات', icon: '🔔', actions: ['view', 'create', 'manage'] },
  { id: 'messages', name: 'Messages', nameAr: 'الرسائل', icon: '💬', actions: ['view', 'create', 'delete'] },
  { id: 'audit_logs', name: 'Audit Logs', nameAr: 'سجل المراجعة', icon: '📝', actions: ['view', 'export'] },
  { id: 'settings', name: 'Settings', nameAr: 'الإعدادات', icon: '⚙️', actions: ['view', 'edit', 'configure'] },
  { id: 'workflows', name: 'Workflows', nameAr: 'سير العمل', icon: '🔄', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
  { id: 'payroll', name: 'Payroll', nameAr: 'الرواتب', icon: '💰', actions: ['view', 'create', 'edit', 'approve', 'export'] },
  { id: 'inventory', name: 'Inventory', nameAr: 'المخزون', icon: '📦', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
  { id: 'training', name: 'Training', nameAr: 'التدريب', icon: '🎓', actions: ['view', 'create', 'edit', 'assign'] },
  { id: 'incidents', name: 'Incidents', nameAr: 'الحوادث', icon: '⚠️', actions: ['view', 'create', 'edit', 'manage'] },
]

const ACTIONS_AR: Record<string, string> = {
  view: 'عرض', create: 'إنشاء', edit: 'تعديل', delete: 'حذف',
  approve: 'اعتماد', reject: 'رفض', export: 'تصدير', import: 'استيراد',
  manage: 'إدارة', assign: 'تعيين', schedule: 'جدولة', analytics: 'تحليلات',
  configure: 'تهيئة',
}

// ─── Demo Roles ────────────────────────────────────────
const INITIAL_ROLES: RolePermissionSet[] = [
  {
    roleId: 'super_admin', roleName: 'Super Admin', roleNameAr: 'مدير النظام',
    hierarchyLevel: 'executive', departmentScope: 'global', isActive: true,
    permissions: Object.fromEntries(MODULES.map((m) => [m.id, Object.fromEntries(m.actions.map((a) => [a, true]))]))
  },
  {
    roleId: 'hospital_admin', roleName: 'Hospital Admin', roleNameAr: 'مدير المستشفى',
    hierarchyLevel: 'director', departmentScope: 'global', isActive: true,
    permissions: Object.fromEntries(MODULES.map((m) => [m.id, Object.fromEntries(m.actions.map((a) => [a, a !== 'delete' || m.id !== 'users']))]))
  },
  {
    roleId: 'hr_manager', roleName: 'HR Manager', roleNameAr: 'مدير الموارد البشرية',
    hierarchyLevel: 'manager', departmentScope: 'global', isActive: true,
    permissions: {
      dashboard: { view: true, analytics: true, export: true },
      users: { view: true, create: true, edit: true, delete: false, approve: true, assign: true },
      roles: { view: true, create: false, edit: false, delete: false, assign: true },
      departments: { view: true, create: false, edit: false, delete: false, manage: false },
      organization: { view: true, create: false, edit: false, delete: false, configure: false },
      scheduling: { view: true, create: false, edit: false, delete: false, approve: true, assign: false, schedule: false },
      attendance: { view: true, create: true, edit: true, approve: true, export: true },
      leave: { view: true, create: true, edit: true, approve: true, reject: true, export: true },
      reports: { view: true, create: true, edit: true, approve: false, export: true },
      notifications: { view: true, create: true, manage: true },
      messages: { view: true, create: true, delete: false },
      audit_logs: { view: true, export: true },
      settings: { view: true, edit: false, configure: false },
      workflows: { view: true, create: false, edit: false, delete: false, approve: true },
      payroll: { view: true, create: true, edit: true, approve: false, export: true },
      inventory: { view: false, create: false, edit: false, delete: false, manage: false },
      training: { view: true, create: true, edit: true, assign: true },
      incidents: { view: true, create: false, edit: false, manage: false },
    }
  },
  {
    roleId: 'dept_manager', roleName: 'Department Manager', roleNameAr: 'مدير قسم',
    hierarchyLevel: 'manager', departmentScope: 'department', isActive: true,
    permissions: {
      dashboard: { view: true, analytics: true, export: true },
      users: { view: true, create: false, edit: false, delete: false, approve: false, assign: false },
      roles: { view: true, create: false, edit: false, delete: false, assign: false },
      departments: { view: true, create: false, edit: true, delete: false, manage: true },
      organization: { view: true, create: false, edit: false, delete: false, configure: false },
      scheduling: { view: true, create: true, edit: true, delete: false, approve: true, assign: true, schedule: true },
      attendance: { view: true, create: true, edit: true, approve: true, export: true },
      leave: { view: true, create: true, edit: false, approve: true, reject: true, export: true },
      reports: { view: true, create: true, edit: true, approve: true, export: true },
      notifications: { view: true, create: true, manage: false },
      messages: { view: true, create: true, delete: false },
      audit_logs: { view: true, export: false },
      settings: { view: true, edit: false, configure: false },
      workflows: { view: true, create: false, edit: false, delete: false, approve: true },
      payroll: { view: true, create: false, edit: false, approve: false, export: false },
      inventory: { view: true, create: true, edit: true, delete: false, manage: true },
      training: { view: true, create: false, edit: false, assign: true },
      incidents: { view: true, create: true, edit: true, manage: false },
    }
  },
  {
    roleId: 'nurse', roleName: 'Staff Nurse', roleNameAr: 'ممرض/ة',
    hierarchyLevel: 'staff', departmentScope: 'team', isActive: true,
    permissions: {
      dashboard: { view: true, analytics: false, export: false },
      users: { view: false, create: false, edit: false, delete: false, approve: false, assign: false },
      roles: { view: false, create: false, edit: false, delete: false, assign: false },
      departments: { view: true, create: false, edit: false, delete: false, manage: false },
      organization: { view: true, create: false, edit: false, delete: false, configure: false },
      scheduling: { view: true, create: false, edit: false, delete: false, approve: false, assign: false, schedule: false },
      attendance: { view: true, create: true, edit: false, approve: false, export: false },
      leave: { view: true, create: true, edit: true, approve: false, reject: false, export: false },
      reports: { view: true, create: true, edit: true, approve: false, export: false },
      notifications: { view: true, create: false, manage: false },
      messages: { view: true, create: true, delete: false },
      audit_logs: { view: false, export: false },
      settings: { view: false, edit: false, configure: false },
      workflows: { view: true, create: false, edit: false, delete: false, approve: false },
      payroll: { view: true, create: false, edit: false, approve: false, export: false },
      inventory: { view: false, create: false, edit: false, delete: false, manage: false },
      training: { view: true, create: false, edit: false, assign: false },
      incidents: { view: true, create: true, edit: false, manage: false },
    }
  },
]

export default function PermissionsPage() {
  const [roles, setRoles] = useState(INITIAL_ROLES)
  const [selectedRoleId, setSelectedRoleId] = useState(INITIAL_ROLES[0].roleId)
  const [search, setSearch] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  const selectedRole = roles.find((r) => r.roleId === selectedRoleId)!
  const filteredModules = MODULES.filter((m) => m.nameAr.includes(search) || m.name.toLowerCase().includes(search.toLowerCase()))

  const togglePermission = (moduleId: string, action: string) => {
    setRoles((prev) => prev.map((r) => {
      if (r.roleId !== selectedRoleId) return r
      const modulePerms = r.permissions[moduleId] || {}
      return { ...r, permissions: { ...r.permissions, [moduleId]: { ...modulePerms, [action]: !modulePerms[action] } } }
    }))
    setHasChanges(true)
  }

  const toggleModuleAll = (moduleId: string, checked: boolean) => {
    const module = MODULES.find((m) => m.id === moduleId)
    if (!module) return
    setRoles((prev) => prev.map((r) => {
      if (r.roleId !== selectedRoleId) return r
      return { ...r, permissions: { ...r.permissions, [moduleId]: Object.fromEntries(module.actions.map((a) => [a, checked])) } }
    }))
    setHasChanges(true)
  }

  const grantAll = () => {
    setRoles((prev) => prev.map((r) => {
      if (r.roleId !== selectedRoleId) return r
      return { ...r, permissions: Object.fromEntries(MODULES.map((m) => [m.id, Object.fromEntries(m.actions.map((a) => [a, true]))])) }
    }))
    setHasChanges(true)
  }

  const revokeAll = () => {
    setRoles((prev) => prev.map((r) => {
      if (r.roleId !== selectedRoleId) return r
      return { ...r, permissions: Object.fromEntries(MODULES.map((m) => [m.id, Object.fromEntries(m.actions.map((a) => [a, false]))])) }
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    toast.success('تم حفظ الصلاحيات بنجاح')
    setHasChanges(false)
  }

  const getModulePermCount = (moduleId: string) => {
    const perms = selectedRole.permissions[moduleId] || {}
    const granted = Object.values(perms).filter(Boolean).length
    const module = MODULES.find((m) => m.id === moduleId)
    return { granted, total: module?.actions.length || 0 }
  }

  const totalGranted = Object.entries(selectedRole.permissions).reduce((acc, [moduleId, perms]) => {
    return acc + Object.values(perms).filter(Boolean).length
  }, 0)
  const totalPerms = MODULES.reduce((acc, m) => acc + m.actions.length, 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            مصفوفة الصلاحيات
          </h1>
          <p className="text-muted-foreground text-sm">إدارة الصلاحيات الديناميكية لكل دور على مستوى الوحدات والإجراءات</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={() => { setRoles(INITIAL_ROLES); setHasChanges(false) }}>
              <RotateCcw className="h-4 w-4 ml-1" />تراجع
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 ml-1" />حفظ الصلاحيات
          </Button>
        </div>
      </div>

      {/* Role Selector */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <Button
                key={role.roleId}
                variant={selectedRoleId === role.roleId ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRoleId(role.roleId)}
                className="relative"
              >
                {role.roleNameAr}
                {role.departmentScope !== 'global' && (
                  <Badge variant="secondary" className="mr-1 text-[9px] px-1">
                    {role.departmentScope === 'department' ? 'قسم' : 'فريق'}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-sm">
            <span className="text-muted-foreground">النطاق: <strong>{selectedRole.departmentScope === 'global' ? 'كامل النظام' : selectedRole.departmentScope === 'department' ? 'القسم فقط' : 'الفريق فقط'}</strong></span>
            <span className="text-muted-foreground">المستوى: <strong>{selectedRole.hierarchyLevel}</strong></span>
            <span className="text-muted-foreground">الصلاحيات: <strong>{totalGranted}/{totalPerms}</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث في الوحدات..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
        </div>
        <Button variant="outline" size="sm" onClick={grantAll}><Unlock className="h-3.5 w-3.5 ml-1" />منح الكل</Button>
        <Button variant="outline" size="sm" onClick={revokeAll}><Lock className="h-3.5 w-3.5 ml-1" />سحب الكل</Button>
      </div>

      {/* Permission Matrix Table */}
      <Card>
        <CardContent className="pt-0 px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right min-w-[200px] sticky right-0 bg-background z-10">الوحدة</TableHead>
                  {['view', 'create', 'edit', 'delete', 'approve', 'reject', 'export', 'manage', 'assign', 'schedule', 'analytics', 'configure'].map((action) => (
                    <TableHead key={action} className="text-center min-w-[60px] text-xs px-1">
                      {ACTIONS_AR[action] || action}
                    </TableHead>
                  ))}
                  <TableHead className="text-center min-w-[60px]">الكل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModules.map((module) => {
                  const perms = selectedRole.permissions[module.id] || {}
                  const { granted, total } = getModulePermCount(module.id)
                  const allGranted = granted === total
                  return (
                    <TableRow key={module.id} className="hover:bg-muted/50">
                      <TableCell className="sticky right-0 bg-background z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{module.icon}</span>
                          <div>
                            <span className="font-medium text-sm">{module.nameAr}</span>
                            <span className="text-xs text-muted-foreground block">{granted}/{total}</span>
                          </div>
                        </div>
                      </TableCell>
                      {['view', 'create', 'edit', 'delete', 'approve', 'reject', 'export', 'manage', 'assign', 'schedule', 'analytics', 'configure'].map((action) => {
                        const hasAction = module.actions.includes(action)
                        const isGranted = perms[action] || false
                        return (
                          <TableCell key={action} className="text-center px-1">
                            {hasAction ? (
                              <Checkbox
                                checked={isGranted}
                                onCheckedChange={() => togglePermission(module.id, action)}
                                className="mx-auto"
                              />
                            ) : (
                              <span className="text-muted-foreground/30">—</span>
                            )}
                          </TableCell>
                        )
                      })}
                      <TableCell className="text-center">
                        <Switch
                          checked={allGranted}
                          onCheckedChange={(checked) => toggleModuleAll(module.id, checked)}
                          className="mx-auto"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-dashed">
        <CardContent className="pt-4">
          <h3 className="font-semibold text-sm mb-2">ملاحظات حول نظام الصلاحيات</h3>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>الأدوار ذات النطاق &quot;القسم فقط&quot; تقيد الوصول لبيانات القسم المحدد فقط</li>
            <li>الأدوار ذات النطاق &quot;الفريق فقط&quot; تقيد الوصول لبيانات الفريق المباشر</li>
            <li>تغييرات الصلاحيات تنعكس فوراً على القائمة الجانبية والمسارات</li>
            <li>يمكن إنشاء أدوار مخصصة غير محدودة من صفحة إدارة الأدوار</li>
            <li>الصلاحيات تدعم مستوى الحقول (إخفاء/قراءة/كتابة) في الإعدادات المتقدمة</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
