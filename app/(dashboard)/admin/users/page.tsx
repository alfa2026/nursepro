'use client'

import * as React from 'react'
import {
  Plus, MoreHorizontal, Edit, Trash2, Shield, UserCog,
  CheckCircle2, XCircle, Clock, Users, UserCheck, UserX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DataTable, Column } from '@/components/ui/data-table'
import { toast } from 'sonner'
import { useLang } from '@/contexts/lang-context'
import { useAuth } from '@/contexts/auth-context'
import {
  getPendingUsers, updatePendingUser,
  type PendingUser, type UserRole,
} from '@/lib/pending-users'
import { useFirestoreCollection } from '@/hooks/use-firestore'
import { COLLECTIONS } from '@/types'

/* ─── Static demo users ─── */
const STATIC_USERS = [
  { id: '1', nameAr: 'أحمد محمد',   name: 'Ahmed Mohammed',  email: 'ahmed@hospital.com',   role: 'admin'      as UserRole, status: 'active'   as const, department: 'الإدارة',          createdAt: '2023-06-15', lastLogin: '2024-01-15T10:30:00Z' },
  { id: '2', nameAr: 'سارة أحمد',   name: 'Sara Ahmed',      email: 'sara@hospital.com',    role: 'head_nurse' as UserRole, status: 'active'   as const, department: 'العناية المركزة',   createdAt: '2023-08-20', lastLogin: '2024-01-15T09:15:00Z' },
  { id: '3', nameAr: 'محمد علي',    name: 'Mohammed Ali',    email: 'mali@hospital.com',    role: 'supervisor' as UserRole, status: 'active'   as const, department: 'الطوارئ',           createdAt: '2023-09-10', lastLogin: '2024-01-14T22:45:00Z' },
  { id: '4', nameAr: 'فاطمة حسن',   name: 'Fatima Hassan',   email: 'fhassan@hospital.com', role: 'staff'      as UserRole, status: 'inactive' as const, department: 'الباطنية',          createdAt: '2023-11-01', lastLogin: '2024-01-10T14:20:00Z' },
  { id: '5', nameAr: 'خالد عبدالله', name: 'Khaled Abdullah', email: 'khaled@hospital.com',  role: 'staff'      as UserRole, status: 'active'   as const, department: 'الجراحة',           createdAt: '2023-12-15', lastLogin: '2024-01-15T08:00:00Z' },
]

const DEPARTMENTS = ['الإدارة','العناية المركزة','الطوارئ','الباطنية','الجراحة','الأطفال','النساء والولادة','العظام']

const ROLE_LABELS: Record<UserRole, { ar: string; en: string; color: string }> = {
  admin:      { ar: 'مدير النظام',   en: 'System Admin',  color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400' },
  head_nurse: { ar: 'رئيس التمريض', en: 'Head Nurse',     color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400' },
  supervisor: { ar: 'مشرف',         en: 'Supervisor',     color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400' },
  staff:      { ar: 'موظف',         en: 'Staff',          color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400' },
}

/* ─── Approve dialog ─── */
function ApproveDialog({
  entry,
  isAr,
  onDone,
}: {
  entry: PendingUser | null
  isAr: boolean
  onDone: () => void
}) {
  const { user: currentUser } = useAuth()
  const [role, setRole] = React.useState<UserRole>('staff')
  const [dept, setDept] = React.useState('الإدارة')
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => { if (entry) setOpen(true) }, [entry])

  const approve = () => {
    if (!entry) return
    updatePendingUser(entry.id, {
      status: 'approved',
      role,
      department: dept,
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser?.nameAr || 'Admin',
    })
    toast.success(isAr ? `تمت الموافقة على ${entry.name}` : `${entry.name} approved`)
    setOpen(false)
    onDone()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isAr ? 'الموافقة على الطلب وتحديد الصلاحية' : 'Approve Request & Assign Role'}</DialogTitle>
          <DialogDescription>
            {isAr ? 'حدد الدور والقسم للمستخدم الجديد' : 'Set the role and department for the new user'}
          </DialogDescription>
        </DialogHeader>
        {entry && (
          <div className="space-y-4 py-2">
            {/* User info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                {entry.photoURL && <AvatarImage src={entry.photoURL} />}
                <AvatarFallback className="bg-teal-100 text-teal-700 font-bold">
                  {entry.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{entry.name}</p>
                <p className="text-xs text-muted-foreground">{entry.email}</p>
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label>{isAr ? 'الدور / الصلاحية' : 'Role / Permission'}</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-red-500" />
                      {isAr ? 'مدير النظام' : 'System Admin'}
                    </span>
                  </SelectItem>
                  <SelectItem value="head_nurse">
                    <span className="flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-blue-500" />
                      {isAr ? 'رئيس التمريض' : 'Head Nurse'}
                    </span>
                  </SelectItem>
                  <SelectItem value="supervisor">
                    <span className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-amber-500" />
                      {isAr ? 'مشرف' : 'Supervisor'}
                    </span>
                  </SelectItem>
                  <SelectItem value="staff">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      {isAr ? 'موظف' : 'Staff'}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label>{isAr ? 'القسم' : 'Department'}</Label>
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role description */}
            <div className={`p-3 rounded-lg border text-sm ${ROLE_LABELS[role].color}`}>
              {role === 'admin'      && (isAr ? 'صلاحية كاملة على جميع أقسام النظام' : 'Full access to all system modules')}
              {role === 'head_nurse' && (isAr ? 'إدارة الكادر والأقسام وإنشاء التقارير' : 'Manage staff, departments, and reports')}
              {role === 'supervisor' && (isAr ? 'الإشراف على الشيفت وإنشاء تقارير محدودة' : 'Shift supervision and limited reporting')}
              {role === 'staff'      && (isAr ? 'وصول للوحة التحكم ومهام الموظف فقط' : 'Dashboard access and staff tasks only')}
            </div>
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={approve} className="bg-green-600 hover:bg-green-700 gap-2">
            <CheckCircle2 className="h-4 w-4" />
            {isAr ? 'موافقة وتفعيل' : 'Approve & Activate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ═══════════════════════════════════════════════════════════ */
export default function UsersPage() {
  const { data: firestoreUsers, loading: firestoreUsersLoading, add: addToUser, update: updateUserDoc, remove: removeUserDoc } = useFirestoreCollection(
    COLLECTIONS.USERS,
    [],
    []
  )

  const { lang } = useLang()
  const { user: currentUser } = useAuth()
  const isAr = lang === 'ar'

  const [staticUsers, setStaticUsers] = React.useState(STATIC_USERS)
  const [pendingList, setPendingList] = React.useState<PendingUser[]>([])
  const [roleFilter, setRoleFilter] = React.useState('all')
  const [isAddOpen, setIsAddOpen] = React.useState(false)
  const [rejectTarget, setRejectTarget] = React.useState<PendingUser | null>(null)
  const [approveTarget, setApproveTarget] = React.useState<PendingUser | null>(null)
  const [editTarget, setEditTarget] = React.useState<(typeof STATIC_USERS)[0] | null>(null)
  const [editRole, setEditRole] = React.useState<UserRole>('staff')
  const [editDept, setEditDept] = React.useState('')
  const [newUser, setNewUser] = React.useState({ name: '', nameAr: '', email: '', role: 'staff' as UserRole, department: 'الإدارة' })

  /* Refresh pending list */
  const refreshPending = React.useCallback(() => {
    setPendingList(getPendingUsers().filter((u) => u.status === 'pending'))
  }, [])

  React.useEffect(() => {
    refreshPending()
    const interval = setInterval(refreshPending, 5000)
    return () => clearInterval(interval)
  }, [refreshPending])

  /* Reject */
  const rejectUser = (entry: PendingUser) => {
    updatePendingUser(entry.id, {
      status: 'rejected',
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser?.nameAr || 'Admin',
    })
    toast.error(isAr ? `تم رفض ${entry.name}` : `${entry.name} rejected`)
    refreshPending()
    setRejectTarget(null)
  }

  /* Add new user */
  const addUser = () => {
    if (!newUser.name || !newUser.email) {
      toast.error(isAr ? 'أدخل الاسم والبريد الإلكتروني' : 'Enter name and email')
      return
    }
    const u = { ...newUser, nameAr: newUser.nameAr || newUser.name, id: Date.now().toString(), status: 'active' as const, createdAt: new Date().toISOString().split('T')[0], lastLogin: new Date().toISOString() }
    setStaticUsers((prev) => [...prev, u])
    setIsAddOpen(false)
    setNewUser({ name: '', nameAr: '', email: '', role: 'staff', department: 'الإدارة' })
    toast.success(isAr ? 'تمت إضافة المستخدم' : 'User added')
  }

  /* Edit role */
  const saveEditRole = () => {
    if (!editTarget) return
    setStaticUsers((prev) => prev.map((u) => u.id === editTarget.id ? { ...u, role: editRole, department: editDept || u.department } : u))
    toast.success(isAr ? 'تم تعديل الصلاحية' : 'Role updated')
    setEditTarget(null)
  }

  /* Toggle active */
  const toggleStatus = (id: string) => {
    setStaticUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u))
  }

  const filteredUsers = staticUsers.filter((u) => roleFilter === 'all' || u.role === roleFilter)

  /* Columns for approved users table */
  type StaticUser = (typeof STATIC_USERS)[0]
  const userColumns: Column<StaticUser>[] = [
    {
      key: 'name',
      header: isAr ? 'المستخدم' : 'User',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {row.nameAr.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">{row.nameAr}</p>
            <p className="text-xs text-muted-foreground">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: isAr ? 'الدور' : 'Role',
      cell: (row) => (
        <Badge variant="outline" className={ROLE_LABELS[row.role].color}>
          {isAr ? ROLE_LABELS[row.role].ar : ROLE_LABELS[row.role].en}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: isAr ? 'القسم' : 'Department',
      cell: (row) => <span className="text-sm text-muted-foreground">{row.department}</span>,
    },
    {
      key: 'status',
      header: isAr ? 'الحالة' : 'Status',
      cell: (row) => (
        <Badge variant="outline" className={row.status === 'active' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400' : 'bg-slate-100 text-slate-500'}>
          {row.status === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطّل' : 'Inactive')}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: isAr ? 'الإجراءات' : 'Actions',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setEditTarget(row); setEditRole(row.role); setEditDept(row.department) }}>
              <Shield className="h-4 w-4 ml-2" />
              {isAr ? 'تغيير الصلاحية' : 'Change Role'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleStatus(row.id)}>
              {row.status === 'active'
                ? <><UserX className="h-4 w-4 ml-2" />{isAr ? 'تعطيل الحساب' : 'Deactivate'}</>
                : <><UserCheck className="h-4 w-4 ml-2" />{isAr ? 'تفعيل الحساب' : 'Activate'}</>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setStaticUsers((prev) => prev.filter((u) => u.id !== row.id))}
            >
              <Trash2 className="h-4 w-4 ml-2" />
              {isAr ? 'حذف' : 'Delete'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{isAr ? 'إدارة المستخدمين' : 'User Management'}</h1>
          <p className="text-muted-foreground text-sm">{isAr ? 'إدارة حسابات وصلاحيات مستخدمي النظام' : 'Manage system user accounts and permissions'}</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {isAr ? 'إضافة مستخدم' : 'Add User'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{isAr ? 'إضافة مستخدم جديد' : 'Add New User'}</DialogTitle>
              <DialogDescription>{isAr ? 'أدخل بيانات المستخدم الجديد' : 'Enter the new user details'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{isAr ? 'الاسم (عربي)' : 'Name (Arabic)'}</Label>
                  <Input value={newUser.nameAr} onChange={(e) => setNewUser({ ...newUser, nameAr: e.target.value })} placeholder="أحمد محمد" />
                </div>
                <div className="space-y-2">
                  <Label>{isAr ? 'الاسم (إنجليزي)' : 'Name (English)'}</Label>
                  <Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} placeholder="Ahmed Mohammed" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? 'البريد الإلكتروني' : 'Email'}</Label>
                <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="user@hospital.com" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>{isAr ? 'الدور' : 'Role'}</Label>
                <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v as UserRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                      <SelectItem key={r} value={r}>{isAr ? ROLE_LABELS[r].ar : ROLE_LABELS[r].en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{isAr ? 'القسم' : 'Department'}</Label>
                <Select value={newUser.department} onValueChange={(v) => setNewUser({ ...newUser, department: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
              <Button onClick={addUser}>{isAr ? 'إضافة' : 'Add'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: isAr ? 'إجمالي المستخدمين' : 'Total Users',  val: staticUsers.length,                                    icon: UserCog,   bg: 'bg-primary/10',     ic: 'text-primary' },
          { label: isAr ? 'نشط' : 'Active',                      val: staticUsers.filter((u) => u.status === 'active').length, icon: UserCheck, bg: 'bg-green-100 dark:bg-green-950', ic: 'text-green-600' },
          { label: isAr ? 'بانتظار الموافقة' : 'Pending',        val: pendingList.length,                                    icon: Clock,     bg: 'bg-amber-100 dark:bg-amber-950', ic: 'text-amber-600' },
          { label: isAr ? 'مدراء' : 'Admins',                    val: staticUsers.filter((u) => u.role === 'admin').length,   icon: Shield,    bg: 'bg-red-100 dark:bg-red-950',     ic: 'text-red-600' },
        ].map(({ label, val, icon: Icon, bg, ic }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${ic}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{val}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList className="mb-2">
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            {isAr ? 'المستخدمون' : 'Users'}
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{staticUsers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="h-4 w-4" />
            {isAr ? 'طلبات الموافقة' : 'Approval Requests'}
            {pendingList.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs animate-pulse">{pendingList.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Users Tab ── */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex gap-3 mb-4">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder={isAr ? 'جميع الأدوار' : 'All roles'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isAr ? 'جميع الأدوار' : 'All roles'}</SelectItem>
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                      <SelectItem key={r} value={r}>{isAr ? ROLE_LABELS[r].ar : ROLE_LABELS[r].en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setRoleFilter('all')}>
                  {isAr ? 'مسح' : 'Reset'}
                </Button>
              </div>
              <DataTable
                columns={userColumns}
                data={filteredUsers}
                searchKey="nameAr"
                searchPlaceholder={isAr ? 'بحث بالاسم...' : 'Search by name...'}
                emptyMessage={isAr ? 'لا يوجد مستخدمون' : 'No users found'}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Pending Tab ── */}
        <TabsContent value="pending" className="space-y-4">
          {pendingList.length === 0 ? (
            <Card>
              <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <p className="font-semibold">{isAr ? 'لا توجد طلبات معلقة' : 'No pending requests'}</p>
                <p className="text-sm text-muted-foreground">
                  {isAr ? 'سيظهر هنا أي مستخدم سجّل دخولاً عبر Google وينتظر موافقتك' : 'Google sign-in requests awaiting your approval will appear here'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingList.map((entry) => (
                <Card key={entry.id} className="border-amber-200 dark:border-amber-800 shadow-sm">
                  <CardContent className="py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* User info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-11 w-11 shrink-0">
                          {entry.photoURL && <img src={entry.photoURL} alt="" className="rounded-full" />}
                          <AvatarFallback className="bg-teal-100 text-teal-700 font-bold text-base">
                            {entry.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{entry.name}</p>
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 text-[10px] gap-1">
                              <Clock className="h-3 w-3" />
                              {isAr ? 'بانتظار الموافقة' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{entry.email}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isAr ? 'طلب في:' : 'Requested:'} {new Date(entry.requestedAt).toLocaleString(isAr ? 'ar-EG' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 gap-1.5"
                          onClick={() => setApproveTarget(entry)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {isAr ? 'موافقة' : 'Approve'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950 gap-1.5"
                          onClick={() => setRejectTarget(entry)}
                        >
                          <XCircle className="h-4 w-4" />
                          {isAr ? 'رفض' : 'Reject'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Approve dialog ── */}
      <ApproveDialog
        entry={approveTarget}
        isAr={isAr}
        onDone={() => { setApproveTarget(null); refreshPending() }}
      />

      {/* ── Reject confirm ── */}
      <AlertDialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isAr ? 'رفض الطلب' : 'Reject Request'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAr
                ? `هل أنت متأكد من رفض طلب ${rejectTarget?.name}؟ لن يتمكن من الدخول للنظام.`
                : `Are you sure you want to reject ${rejectTarget?.name}? They will not be able to access the system.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isAr ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => rejectTarget && rejectUser(rejectTarget)}
            >
              {isAr ? 'رفض' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Edit role dialog ── */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{isAr ? 'تغيير الصلاحية' : 'Change Role'}</DialogTitle>
            <DialogDescription>{editTarget?.nameAr} — {editTarget?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{isAr ? 'الدور الجديد' : 'New Role'}</Label>
              <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                    <SelectItem key={r} value={r}>{isAr ? ROLE_LABELS[r].ar : ROLE_LABELS[r].en}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isAr ? 'القسم' : 'Department'}</Label>
              <Select value={editDept} onValueChange={setEditDept}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>{isAr ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={saveEditRole}>{isAr ? 'حفظ' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
