'use client'

import * as React from 'react'
import {
  Shield, Check, X, Plus, Copy, Trash2, Save,
  ToggleLeft, Search, Users, ChevronDown, ChevronRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { useFirestoreCollection } from '@/hooks/use-firestore'
import { COLLECTIONS } from '@/types'

interface PermissionGroup {
  id: string
  labelAr: string
  permissions: { id: string; labelAr: string }[]
}

const PERMISSION_MODULES: PermissionGroup[] = [
  {
    id: 'dashboard', labelAr: '\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645',
    permissions: [
      { id: 'dashboard.view', labelAr: '\u0639\u0631\u0636' },
      { id: 'dashboard.analytics', labelAr: '\u0627\u0644\u062a\u062d\u0644\u064a\u0644\u0627\u062a' },
      { id: 'dashboard.export', labelAr: '\u062a\u0635\u062f\u064a\u0631' },
    ],
  },
  {
    id: 'users', labelAr: '\u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u0648\u0646',
    permissions: [
      { id: 'users.view', labelAr: '\u0639\u0631\u0636' },
      { id: 'users.create', labelAr: '\u0625\u0646\u0634\u0627\u0621' },
      { id: 'users.edit', labelAr: '\u062a\u0639\u062f\u064a\u0644' },
      { id: 'users.delete', labelAr: '\u062d\u0630\u0641' },
      { id: 'users.approve', labelAr: '\u0645\u0648\u0627\u0641\u0642\u0629' },
      { id: 'users.assign_role', labelAr: '\u062a\u0639\u064a\u064a\u0646 \u062f\u0648\u0631' },
    ],
  },
  {
    id: 'roles', labelAr: '\u0627\u0644\u0623\u062f\u0648\u0627\u0631',
    permissions: [
      { id: 'roles.view', labelAr: '\u0639\u0631\u0636' },
      { id: 'roles.create', labelAr: '\u0625\u0646\u0634\u0627\u0621' },
      { id: 'roles.edit', labelAr: '\u062a\u0639\u062f\u064a\u0644' },
      { id: 'roles.delete', labelAr: '\u062d\u0630\u0641' },
      { id: 'roles.manage', labelAr: '\u0625\u062f\u0627\u0631\u0629' },
    ],
  },
  {
    id: 'departments', labelAr: '\u0627\u0644\u0623\u0642\u0633\u0627\u0645',
    permissions: [
      { id: 'departments.view', labelAr: '\u0639\u0631\u0636' },
      { id: 'departments.create', labelAr: '\u0625\u0646\u0634\u0627\u0621' },
      { id: 'departments.edit', labelAr: '\u062a\u0639\u062f\u064a\u0644' },
      { id: 'departments.delete', labelAr: '\u062d\u0630\u0641' },
      { id: 'departments.manage', labelAr: '\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0638\u0641\u064a\u0646' },
    ],
  },
  {
    id: 'attendance', labelAr: '\u0627\u0644\u062d\u0636\u0648\u0631',
    permissions: [
      { id: 'attendance.view', labelAr: '\u0639\u0631\u0636' },
      { id: 'attendance.checkin', labelAr: '\u062a\u0633\u062c\u064a\u0644 \u062d\u0636\u0648\u0631' },
      { id: 'attendance.edit', labelAr: '\u062a\u0639\u062f\u064a\u0644' },
      { id: 'attendance.export', labelAr: '\u062a\u0635\u062f\u064a\u0631' },
      { id: 'attendance.manage', labelAr: '\u0625\u062f\u0627\u0631\u0629' },
    ],
  },
  {
    id: 'scheduling', labelAr: '\u0627\u0644\u062c\u062f\u0648\u0644\u0629',
    permissions: [
      { id: 'scheduling.view', labelAr: '\u0639\u0631\u0636' },
      { id: 'scheduling.create', labelAr: '\u0625\u0646\u0634\u0627\u0621' },
      { id: 'scheduling.edit', labelAr: '\u062a\u0639\u062f\u064a\u0644' },
      { id: 'scheduling.delete', labelAr: '\u062d\u0630\u0641' },
      { id: 'scheduling.assign', labelAr: '\u062a\u0639\u064a\u064a\u0646' },
      { id: 'scheduling.approve', labelAr: '\u0645\u0648\u0627\u0641\u0642\u0629' },
    ],
  },
  {
    id: 'reports', labelAr: '\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631',
    permissions: [
      { id: 'reports.view', labelAr: '\u0639\u0631\u0636' },
      { id: 'reports.create', labelAr: '\u0625\u0646\u0634\u0627\u0621' },
      { id: 'reports.approve', labelAr: '\u0627\u0639\u062a\u0645\u0627\u062f' },
      { id: 'reports.export', labelAr: '\u062a\u0635\u062f\u064a\u0631' },
    ],
  },
  {
    id: 'notifications', labelAr: '\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a',
    permissions: [
      { id: 'notifications.view', labelAr: '\u0639\u0631\u0636' },
      { id: 'notifications.send', labelAr: '\u0625\u0631\u0633\u0627\u0644' },
      { id: 'notifications.manage', labelAr: '\u0625\u062f\u0627\u0631\u0629' },
    ],
  },
  {
    id: 'messages', labelAr: '\u0627\u0644\u0631\u0633\u0627\u0626\u0644',
    permissions: [
      { id: 'messages.view', labelAr: '\u0639\u0631\u0636' },
      { id: 'messages.send', labelAr: '\u0625\u0631\u0633\u0627\u0644' },
      { id: 'messages.broadcast', labelAr: '\u0628\u062b \u0639\u0627\u0645' },
    ],
  },
  {
    id: 'settings', labelAr: '\u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a',
    permissions: [
      { id: 'settings.view', labelAr: '\u0639\u0631\u0636' },
      { id: 'settings.edit', labelAr: '\u062a\u0639\u062f\u064a\u0644' },
      { id: 'settings.manage', labelAr: '\u062a\u062d\u0643\u0645 \u0643\u0627\u0645\u0644' },
    ],
  },
  {
    id: 'audit', labelAr: '\u0633\u062c\u0644 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a',
    permissions: [
      { id: 'audit.view', labelAr: '\u0639\u0631\u0636' },
      { id: 'audit.export', labelAr: '\u062a\u0635\u062f\u064a\u0631' },
    ],
  },
  {
    id: 'leave', labelAr: '\u0627\u0644\u0625\u062c\u0627\u0632\u0627\u062a',
    permissions: [
      { id: 'leave.view', labelAr: '\u0639\u0631\u0636' },
      { id: 'leave.request', labelAr: '\u0637\u0644\u0628' },
      { id: 'leave.approve', labelAr: '\u0645\u0648\u0627\u0641\u0642\u0629' },
      { id: 'leave.manage', labelAr: '\u0625\u062f\u0627\u0631\u0629' },
    ],
  },
]

interface RoleData {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  permissions: string[]
  isActive: boolean
  isSystem: boolean
  userCount: number
}

const initialRoles: RoleData[] = [
  {
    id: 'super_admin', name: 'Super Admin', nameAr: '\u0645\u062f\u064a\u0631 \u0627\u0644\u0646\u0638\u0627\u0645',
    description: 'Full system access', descriptionAr: '\u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0643\u0627\u0645\u0644\u0629',
    permissions: PERMISSION_MODULES.flatMap(m => m.permissions.map(p => p.id)),
    isActive: true, isSystem: true, userCount: 1,
  },
  {
    id: 'hospital_admin', name: 'Hospital Admin', nameAr: '\u0645\u062f\u064a\u0631 \u0627\u0644\u0645\u0633\u062a\u0634\u0641\u0649',
    description: 'Hospital administration', descriptionAr: '\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062a\u0634\u0641\u0649',
    permissions: PERMISSION_MODULES.flatMap(m => m.permissions.map(p => p.id)).filter(p => !p.startsWith('settings.manage')),
    isActive: true, isSystem: true, userCount: 2,
  },
  {
    id: 'hr', name: 'HR Manager', nameAr: '\u0645\u062f\u064a\u0631 \u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0629',
    description: 'Human resources', descriptionAr: '\u0627\u0644\u0645\u0648\u0627\u0631\u062f \u0627\u0644\u0628\u0634\u0631\u064a\u0629',
    permissions: ['dashboard.view', 'users.view', 'users.create', 'users.edit', 'users.approve', 'attendance.view', 'attendance.manage', 'attendance.export', 'scheduling.view', 'reports.view', 'reports.create', 'reports.export', 'leave.view', 'leave.approve', 'leave.manage', 'audit.view'],
    isActive: true, isSystem: true, userCount: 3,
  },
  {
    id: 'head_nurse', name: 'Head Nurse', nameAr: '\u0631\u0626\u064a\u0633 \u0627\u0644\u062a\u0645\u0631\u064a\u0636',
    description: 'Nursing head', descriptionAr: '\u0631\u0626\u064a\u0633 \u0642\u0633\u0645 \u0627\u0644\u062a\u0645\u0631\u064a\u0636',
    permissions: ['dashboard.view', 'dashboard.analytics', 'users.view', 'departments.view', 'departments.manage', 'attendance.view', 'attendance.manage', 'scheduling.view', 'scheduling.create', 'scheduling.edit', 'scheduling.assign', 'scheduling.approve', 'reports.view', 'reports.create', 'reports.approve', 'leave.view', 'leave.approve', 'notifications.view', 'notifications.send'],
    isActive: true, isSystem: true, userCount: 5,
  },
  {
    id: 'nurse', name: 'Nurse', nameAr: '\u0645\u0645\u0631\u0636/\u0629',
    description: 'Staff nurse', descriptionAr: '\u0645\u0645\u0631\u0636 \u0639\u0627\u0645',
    permissions: ['dashboard.view', 'attendance.view', 'attendance.checkin', 'scheduling.view', 'reports.view', 'reports.create', 'leave.view', 'leave.request', 'notifications.view', 'messages.view', 'messages.send'],
    isActive: true, isSystem: true, userCount: 42,
  },
  {
    id: 'doctor', name: 'Doctor', nameAr: '\u0637\u0628\u064a\u0628',
    description: 'Medical doctor', descriptionAr: '\u0637\u0628\u064a\u0628',
    permissions: ['dashboard.view', 'dashboard.analytics', 'departments.view', 'attendance.view', 'attendance.checkin', 'scheduling.view', 'reports.view', 'reports.create', 'leave.view', 'leave.request', 'notifications.view', 'messages.view', 'messages.send'],
    isActive: true, isSystem: true, userCount: 15,
  },
  {
    id: 'receptionist', name: 'Receptionist', nameAr: '\u0627\u0633\u062a\u0642\u0628\u0627\u0644',
    description: 'Front desk', descriptionAr: '\u0645\u0648\u0638\u0641 \u0627\u0633\u062a\u0642\u0628\u0627\u0644',
    permissions: ['dashboard.view', 'attendance.view', 'attendance.checkin', 'scheduling.view', 'notifications.view', 'messages.view', 'messages.send'],
    isActive: true, isSystem: false, userCount: 8,
  },
]

export default function RolesPage() {
  const { data: firestoreRoles, loading: firestoreRolesLoading, add: addToRole, update: updateRoleDoc, remove: removeRoleDoc } = useFirestoreCollection(
    COLLECTIONS.ROLES,
    [],
    []
  )

  const [roles, setRoles] = React.useState<RoleData[]>(initialRoles)
  const [selectedRole, setSelectedRole] = React.useState<RoleData | null>(null)
  const [showCreateDialog, setShowCreateDialog] = React.useState(false)
  const [showMatrixView, setShowMatrixView] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [expandedModules, setExpandedModules] = React.useState<string[]>([])
  const [hasChanges, setHasChanges] = React.useState(false)
  const [newRole, setNewRole] = React.useState({ name: '', nameAr: '', description: '', descriptionAr: '' })

  const filteredRoles = roles.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.nameAr.includes(searchQuery)
  )

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => prev.includes(moduleId) ? prev.filter(m => m !== moduleId) : [...prev, moduleId])
  }

  const togglePermission = (roleId: string, permissionId: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r
      const has = r.permissions.includes(permissionId)
      return { ...r, permissions: has ? r.permissions.filter(p => p !== permissionId) : [...r.permissions, permissionId] }
    }))
    setSelectedRole(prev => {
      if (!prev || prev.id !== roleId) return prev
      const has = prev.permissions.includes(permissionId)
      return { ...prev, permissions: has ? prev.permissions.filter(p => p !== permissionId) : [...prev.permissions, permissionId] }
    })
    setHasChanges(true)
  }

  const toggleModuleAll = (roleId: string, moduleId: string) => {
    const module = PERMISSION_MODULES.find(m => m.id === moduleId)
    if (!module) return
    const role = roles.find(r => r.id === roleId)
    if (!role) return
    const ids = module.permissions.map(p => p.id)
    const hasAll = ids.every(p => role.permissions.includes(p))

    setRoles(prev => prev.map(r => {
      if (r.id !== roleId) return r
      if (hasAll) return { ...r, permissions: r.permissions.filter(p => !ids.includes(p)) }
      return { ...r, permissions: Array.from(new Set([...r.permissions, ...ids])) }
    }))
    setSelectedRole(prev => {
      if (!prev || prev.id !== roleId) return prev
      if (hasAll) return { ...prev, permissions: prev.permissions.filter(p => !ids.includes(p)) }
      return { ...prev, permissions: Array.from(new Set([...prev.permissions, ...ids])) }
    })
    setHasChanges(true)
  }

  const handleCreateRole = () => {
    if (!newRole.name || !newRole.nameAr) { toast.error('\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0627\u0633\u0645 \u0627\u0644\u062f\u0648\u0631'); return }
    const role: RoleData = {
      id: newRole.name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
      name: newRole.name, nameAr: newRole.nameAr,
      description: newRole.description, descriptionAr: newRole.descriptionAr,
      permissions: ['dashboard.view'], isActive: true, isSystem: false, userCount: 0,
    }
    setRoles(prev => [...prev, role])
    setNewRole({ name: '', nameAr: '', description: '', descriptionAr: '' })
    setShowCreateDialog(false)
    toast.success('\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062f\u0648\u0631 \u0628\u0646\u062c\u0627\u062d')
  }

  const handleCloneRole = (role: RoleData) => {
    const cloned: RoleData = { ...role, id: `${role.id}_copy_${Date.now()}`, name: `${role.name} (Copy)`, nameAr: `${role.nameAr} (\u0646\u0633\u062e\u0629)`, isSystem: false, userCount: 0 }
    setRoles(prev => [...prev, cloned])
    toast.success('\u062a\u0645 \u0646\u0633\u062e \u0627\u0644\u062f\u0648\u0631')
  }

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId)
    if (role?.isSystem) { toast.error('\u0644\u0627 \u064a\u0645\u0643\u0646 \u062d\u0630\u0641 \u062f\u0648\u0631 \u0646\u0638\u0627\u0645\u064a'); return }
    setRoles(prev => prev.filter(r => r.id !== roleId))
    if (selectedRole?.id === roleId) setSelectedRole(null)
    toast.success('\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u062f\u0648\u0631')
  }

  const handleToggleActive = (roleId: string) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, isActive: !r.isActive } : r))
    setHasChanges(true)
  }

  const handleSave = () => { toast.success('\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a'); setHasChanges(false) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6" />\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0623\u062f\u0648\u0627\u0631 \u0648\u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0627\u062a
          </h1>
          <p className="text-muted-foreground">\u0625\u0646\u0634\u0627\u0621 \u0648\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0623\u062f\u0648\u0627\u0631 \u0648\u062a\u062e\u0635\u064a\u0635 \u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0627\u062a</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && <Button onClick={handleSave}><Save className="h-4 w-4 ml-2" />\u062d\u0641\u0638</Button>}
          <Button variant="outline" onClick={() => setShowMatrixView(!showMatrixView)}>
            {showMatrixView ? '\u0639\u0631\u0636 \u0627\u0644\u0628\u0637\u0627\u0642\u0627\u062a' : '\u0639\u0631\u0636 \u0627\u0644\u0645\u0635\u0641\u0648\u0641\u0629'}
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}><Plus className="h-4 w-4 ml-2" />\u062f\u0648\u0631 \u062c\u062f\u064a\u062f</Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="\u0628\u062d\u062b \u0639\u0646 \u062f\u0648\u0631..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-10" />
      </div>

      {showMatrixView ? (
        <Card>
          <CardHeader>
            <CardTitle>\u0645\u0635\u0641\u0648\u0641\u0629 \u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0627\u062a</CardTitle>
            <CardDescription>\u0645\u0642\u0627\u0631\u0646\u0629 \u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0627\u062a \u0628\u064a\u0646 \u0627\u0644\u0623\u062f\u0648\u0627\u0631</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky right-0 bg-background min-w-[180px]">\u0627\u0644\u0648\u062d\u062f\u0629</TableHead>
                    {filteredRoles.map(role => (
                      <TableHead key={role.id} className="text-center min-w-[90px]">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs">{role.nameAr}</span>
                          <Badge variant={role.isActive ? 'default' : 'secondary'} className="text-[10px]">{role.userCount}</Badge>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {PERMISSION_MODULES.map(module => (
                    <React.Fragment key={module.id}>
                      <TableRow className="bg-muted/30 font-semibold">
                        <TableCell className="sticky right-0 bg-muted/30">{module.labelAr}</TableCell>
                        {filteredRoles.map(role => {
                          const ids = module.permissions.map(p => p.id)
                          const hasAll = ids.every(p => role.permissions.includes(p))
                          const hasSome = ids.some(p => role.permissions.includes(p))
                          return (
                            <TableCell key={role.id} className="text-center">
                              <button onClick={() => toggleModuleAll(role.id, module.id)} disabled={role.id === 'super_admin'} className="mx-auto">
                                {hasAll ? <div className="flex h-6 w-6 mx-auto items-center justify-center rounded bg-primary/10"><Check className="h-4 w-4 text-primary" /></div>
                                  : hasSome ? <div className="flex h-6 w-6 mx-auto items-center justify-center rounded bg-amber-100 dark:bg-amber-900/30"><Check className="h-4 w-4 text-amber-600" /></div>
                                  : <div className="flex h-6 w-6 mx-auto items-center justify-center rounded bg-muted"><X className="h-4 w-4 text-muted-foreground" /></div>}
                              </button>
                            </TableCell>
                          )
                        })}
                      </TableRow>
                      {module.permissions.map(perm => (
                        <TableRow key={perm.id}>
                          <TableCell className="sticky right-0 bg-background pr-8 text-sm text-muted-foreground">{perm.labelAr}</TableCell>
                          {filteredRoles.map(role => (
                            <TableCell key={role.id} className="text-center">
                              <button onClick={() => togglePermission(role.id, perm.id)} disabled={role.id === 'super_admin'} className="mx-auto">
                                {role.permissions.includes(perm.id)
                                  ? <div className="flex h-5 w-5 mx-auto items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"><Check className="h-3 w-3 text-green-600" /></div>
                                  : <div className="flex h-5 w-5 mx-auto items-center justify-center rounded-full bg-muted"><X className="h-3 w-3 text-muted-foreground" /></div>}
                              </button>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            {filteredRoles.map(role => (
              <Card key={role.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedRole?.id === role.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedRole(role)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${role.isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                        <Shield className={`h-5 w-5 ${role.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="font-semibold">{role.nameAr}</p>
                        <p className="text-xs text-muted-foreground">{role.descriptionAr}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => e.stopPropagation()}><ChevronDown className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCloneRole(role)}><Copy className="h-4 w-4 ml-2" />\u0646\u0633\u062e</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(role.id)}><ToggleLeft className="h-4 w-4 ml-2" />{role.isActive ? '\u062a\u0639\u0637\u064a\u0644' : '\u062a\u0641\u0639\u064a\u0644'}</DropdownMenuItem>
                        {!role.isSystem && <DropdownMenuItem onClick={() => handleDeleteRole(role.id)} className="text-destructive"><Trash2 className="h-4 w-4 ml-2" />\u062d\u0630\u0641</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge variant={role.isActive ? 'default' : 'secondary'}>{role.isActive ? '\u0646\u0634\u0637' : '\u0645\u0639\u0637\u0644'}</Badge>
                    {role.isSystem && <Badge variant="outline">\u0646\u0638\u0627\u0645\u064a</Badge>}
                    <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />{role.userCount}</Badge>
                    <Badge variant="outline">{role.permissions.length} \u0635\u0644\u0627\u062d\u064a\u0629</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-2">
            {selectedRole ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedRole.nameAr}</CardTitle>
                      <CardDescription>{selectedRole.descriptionAr} &bull; {selectedRole.permissions.length} \u0635\u0644\u0627\u062d\u064a\u0629</CardDescription>
                    </div>
                    <Badge variant={selectedRole.isActive ? 'default' : 'secondary'}>{selectedRole.isActive ? '\u0646\u0634\u0637' : '\u0645\u0639\u0637\u0644'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {PERMISSION_MODULES.map(module => {
                    const isExpanded = expandedModules.includes(module.id)
                    const ids = module.permissions.map(p => p.id)
                    const activeCount = ids.filter(p => selectedRole.permissions.includes(p)).length
                    const hasAll = activeCount === ids.length
                    return (
                      <div key={module.id} className="border rounded-lg">
                        <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50" onClick={() => toggleModuleExpand(module.id)}>
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <span className="font-medium">{module.labelAr}</span>
                            <Badge variant="outline" className="text-xs">{activeCount}/{ids.length}</Badge>
                          </div>
                          {selectedRole.id !== 'super_admin' && (
                            <Switch checked={hasAll} onCheckedChange={() => toggleModuleAll(selectedRole.id, module.id)} onClick={(e) => e.stopPropagation()} />
                          )}
                        </div>
                        {isExpanded && (
                          <div className="border-t p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {module.permissions.map(perm => (
                              <div key={perm.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/30">
                                <span className="text-sm">{perm.labelAr}</span>
                                <Switch checked={selectedRole.permissions.includes(perm.id)} onCheckedChange={() => togglePermission(selectedRole.id, perm.id)} disabled={selectedRole.id === 'super_admin'} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">\u0627\u062e\u062a\u0631 \u062f\u0648\u0631\u0627\u064b \u0644\u062a\u0639\u062f\u064a\u0644 \u0635\u0644\u0627\u062d\u064a\u0627\u062a\u0647</p>
                  <p className="text-sm text-muted-foreground mt-1">\u0627\u0646\u0642\u0631 \u0639\u0644\u0649 \u0623\u062d\u062f \u0627\u0644\u0623\u062f\u0648\u0627\u0631 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>\u0625\u0646\u0634\u0627\u0621 \u062f\u0648\u0631 \u062c\u062f\u064a\u062f</DialogTitle>
            <DialogDescription>\u0623\u0636\u0641 \u062f\u0648\u0631\u0627\u064b \u062c\u062f\u064a\u062f\u0627\u064b \u0648\u062e\u0635\u0635 \u0635\u0644\u0627\u062d\u064a\u0627\u062a\u0647</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name (English)</Label>
                <Input value={newRole.name} onChange={(e) => setNewRole(p => ({...p, name: e.target.value}))} placeholder="e.g. Lab Technician" />
              </div>
              <div className="space-y-2">
                <Label>\u0627\u0644\u0627\u0633\u0645 (\u0639\u0631\u0628\u064a)</Label>
                <Input value={newRole.nameAr} onChange={(e) => setNewRole(p => ({...p, nameAr: e.target.value}))} placeholder="\u0645\u062b\u0644: \u0641\u0646\u064a \u0645\u062e\u062a\u0628\u0631" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={newRole.description} onChange={(e) => setNewRole(p => ({...p, description: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label>\u0627\u0644\u0648\u0635\u0641 (\u0639\u0631\u0628\u064a)</Label>
              <Textarea value={newRole.descriptionAr} onChange={(e) => setNewRole(p => ({...p, descriptionAr: e.target.value}))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>\u0625\u0644\u063a\u0627\u0621</Button>
            <Button onClick={handleCreateRole}>\u0625\u0646\u0634\u0627\u0621</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
