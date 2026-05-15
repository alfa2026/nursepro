'use client'

import * as React from 'react'
import { History, Filter, Download, Clock, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTable, Column } from '@/components/ui/data-table'
import { useFirestoreCollection } from '@/hooks/use-firestore'
import { COLLECTIONS } from '@/types'

// Demo data - will be replaced with Firebase
const auditLogs = [
  {
    id: '1',
    userId: '1',
    userName: 'أحمد محمد',
    action: 'create_report',
    details: 'إنشاء تقرير الشفت الصباحي',
    timestamp: '2024-01-15T10:30:00Z',
    ipAddress: '192.168.1.100',
  },
  {
    id: '2',
    userId: '2',
    userName: 'سارة علي',
    action: 'approve_report',
    details: 'اعتماد تقرير الشفت الليلي',
    timestamp: '2024-01-15T09:15:00Z',
    ipAddress: '192.168.1.101',
  },
  {
    id: '3',
    userId: '1',
    userName: 'أحمد محمد',
    action: 'add_staff',
    details: 'إضافة موظف جديد: خالد عبدالله',
    timestamp: '2024-01-15T08:45:00Z',
    ipAddress: '192.168.1.100',
  },
  {
    id: '4',
    userId: '3',
    userName: 'محمد حسن',
    action: 'edit_patient',
    details: 'تعديل بيانات مريض: زكريا عبدالسلام',
    timestamp: '2024-01-14T22:30:00Z',
    ipAddress: '192.168.1.102',
  },
  {
    id: '5',
    userId: '1',
    userName: 'أحمد محمد',
    action: 'change_permissions',
    details: 'تعديل صلاحيات دور المشرف',
    timestamp: '2024-01-14T16:00:00Z',
    ipAddress: '192.168.1.100',
  },
  {
    id: '6',
    userId: '2',
    userName: 'سارة علي',
    action: 'delete_absence',
    details: 'حذف سجل غياب: فاطمة أحمد',
    timestamp: '2024-01-14T14:20:00Z',
    ipAddress: '192.168.1.101',
  },
  {
    id: '7',
    userId: '4',
    userName: 'فاطمة أحمد',
    action: 'login',
    details: 'تسجيل دخول للنظام',
    timestamp: '2024-01-14T12:00:00Z',
    ipAddress: '192.168.1.103',
  },
  {
    id: '8',
    userId: '1',
    userName: 'أحمد محمد',
    action: 'export_data',
    details: 'تصدير تقرير الإحصائيات الشهرية',
    timestamp: '2024-01-14T10:30:00Z',
    ipAddress: '192.168.1.100',
  },
]

type AuditLog = (typeof auditLogs)[0]

const actionConfig: Record<string, { label: string; color: string }> = {
  create_report: { label: 'إنشاء تقرير', color: 'bg-success/10 text-success border-success/20' },
  approve_report: { label: 'اعتماد تقرير', color: 'bg-primary/10 text-primary border-primary/20' },
  add_staff: { label: 'إضافة موظف', color: 'bg-success/10 text-success border-success/20' },
  edit_patient: { label: 'تعديل مريض', color: 'bg-warning/10 text-warning border-warning/20' },
  change_permissions: { label: 'تغيير صلاحيات', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  delete_absence: { label: 'حذف غياب', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  login: { label: 'تسجيل دخول', color: 'bg-muted text-muted-foreground' },
  export_data: { label: 'تصدير بيانات', color: 'bg-primary/10 text-primary border-primary/20' },
}

export default function AuditLogsPage() {
  const { data: firestoreLogs, loading: firestoreLogsLoading, add: addToAuditLog, update: updateAuditLogDoc, remove: removeAuditLogDoc } = useFirestoreCollection(
    COLLECTIONS.AUDIT_LOGS,
    [],
    []
  )

  const [dateFilter, setDateFilter] = React.useState('')
  const [actionFilter, setActionFilter] = React.useState<string>('all')
  const [userFilter, setUserFilter] = React.useState<string>('all')

  const filteredLogs = React.useMemo(() => {
    return auditLogs.filter((log) => {
      if (dateFilter && !log.timestamp.startsWith(dateFilter)) return false
      if (actionFilter !== 'all' && log.action !== actionFilter) return false
      if (userFilter !== 'all' && log.userId !== userFilter) return false
      return true
    })
  }, [dateFilter, actionFilter, userFilter])

  const uniqueUsers = React.useMemo(() => {
    const users = new Map<string, string>()
    auditLogs.forEach((log) => users.set(log.userId, log.userName))
    return Array.from(users.entries())
  }, [])

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'الوقت',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">
              {new Date(row.timestamp).toLocaleDateString('ar-EG')}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(row.timestamp).toLocaleTimeString('ar-EG')}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'userName',
      header: 'المستخدم',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {row.userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.userName}</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'العملية',
      cell: (row) => {
        const config = actionConfig[row.action] || {
          label: row.action,
          color: 'bg-muted text-muted-foreground',
        }
        return (
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      key: 'details',
      header: 'التفاصيل',
    },
    {
      key: 'ipAddress',
      header: 'عنوان IP',
      cell: (row) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">{row.ipAddress}</code>
      ),
    },
  ]

  const handleExport = () => {
    // Will export logs
    console.log('Exporting logs...')
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">سجل العمليات</h1>
          <p className="text-muted-foreground">تتبع جميع العمليات في النظام</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 ml-2" />
          تصدير السجل
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{auditLogs.length}</p>
            <p className="text-sm text-muted-foreground">إجمالي العمليات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {auditLogs.filter((l) => l.timestamp.startsWith('2024-01-15')).length}
            </p>
            <p className="text-sm text-muted-foreground">عمليات اليوم</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">{uniqueUsers.length}</p>
            <p className="text-sm text-muted-foreground">مستخدمين نشطين</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">
              {auditLogs.filter((l) => l.action === 'login').length}
            </p>
            <p className="text-sm text-muted-foreground">تسجيلات دخول</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            تصفية السجل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">التاريخ</label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">العملية</label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العمليات</SelectItem>
                  <SelectItem value="create_report">إنشاء تقرير</SelectItem>
                  <SelectItem value="approve_report">اعتماد تقرير</SelectItem>
                  <SelectItem value="add_staff">إضافة موظف</SelectItem>
                  <SelectItem value="edit_patient">تعديل مريض</SelectItem>
                  <SelectItem value="login">تسجيل دخول</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">المستخدم</label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستخدمين</SelectItem>
                  {uniqueUsers.map(([id, name]) => (
                    <SelectItem key={id} value={id}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setDateFilter('')
                  setActionFilter('all')
                  setUserFilter('all')
                }}
              >
                مسح الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={filteredLogs}
            searchKey="details"
            searchPlaceholder="البحث في التفاصيل..."
            emptyMessage="لا توجد عمليات مطابقة للفلاتر"
          />
        </CardContent>
      </Card>
    </div>
  )
}
