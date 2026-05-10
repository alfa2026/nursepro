'use client'

import * as React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import {
  Users, UserCog, ArrowLeft, Plus, Edit, Trash2, Search,
  Shield, Building2, ChevronRight, Crown, Star, User,
  MoreHorizontal, ArrowUpDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useFirestoreCollection } from '@/hooks/use-firestore'
import { COLLECTIONS } from '@/types'

// ─── Types ─────────────────────────────────────────────
interface EmployeePosition {
  id: string
  userId: string
  userName: string
  userNameAr: string
  jobTitle: string
  jobTitleAr: string
  hierarchyLevel: string
  orgUnit: string
  orgUnitAr: string
  directSupervisor: string
  directSupervisorAr: string
  departmentManager: string
  departmentManagerAr: string
  approvalAuthority: number
  isActive: boolean
}

// ─── Demo Data ─────────────────────────────────────────
const POSITIONS: EmployeePosition[] = [
  { id: '1', userId: 'u1', userName: 'Dr. Abdullah Al-Rashid', userNameAr: 'د. عبدالله الراشد', jobTitle: 'Hospital Director', jobTitleAr: 'المدير العام', hierarchyLevel: 'executive', orgUnit: 'Executive', orgUnitAr: 'الإدارة التنفيذية', directSupervisor: '-', directSupervisorAr: '-', departmentManager: '-', departmentManagerAr: '-', approvalAuthority: 10, isActive: true },
  { id: '2', userId: 'u2', userName: 'Dr. Khalid Ibrahim', userNameAr: 'د. خالد إبراهيم', jobTitle: 'Medical Director', jobTitleAr: 'المدير الطبي', hierarchyLevel: 'director', orgUnit: 'Medical Division', orgUnitAr: 'القسم الطبي', directSupervisor: 'Dr. Abdullah Al-Rashid', directSupervisorAr: 'د. عبدالله الراشد', departmentManager: 'Dr. Abdullah Al-Rashid', departmentManagerAr: 'د. عبدالله الراشد', approvalAuthority: 9, isActive: true },
  { id: '3', userId: 'u3', userName: 'Ahmed Mohammed', userNameAr: 'أحمد محمد', jobTitle: 'Administrative Director', jobTitleAr: 'المدير الإداري', hierarchyLevel: 'director', orgUnit: 'Administration', orgUnitAr: 'الإدارة', directSupervisor: 'Dr. Abdullah Al-Rashid', directSupervisorAr: 'د. عبدالله الراشد', departmentManager: 'Dr. Abdullah Al-Rashid', departmentManagerAr: 'د. عبدالله الراشد', approvalAuthority: 9, isActive: true },
  { id: '4', userId: 'u4', userName: 'Sara Ahmed', userNameAr: 'سارة أحمد', jobTitle: 'ICU Head Nurse', jobTitleAr: 'رئيسة تمريض العناية', hierarchyLevel: 'manager', orgUnit: 'ICU', orgUnitAr: 'العناية المركزة', directSupervisor: 'Dr. Khalid Ibrahim', directSupervisorAr: 'د. خالد إبراهيم', departmentManager: 'Dr. Khalid Ibrahim', departmentManagerAr: 'د. خالد إبراهيم', approvalAuthority: 7, isActive: true },
  { id: '5', userId: 'u5', userName: 'Fatima Hassan', userNameAr: 'فاطمة حسن', jobTitle: 'ER Department Head', jobTitleAr: 'رئيسة قسم الطوارئ', hierarchyLevel: 'manager', orgUnit: 'Emergency', orgUnitAr: 'الطوارئ', directSupervisor: 'Dr. Khalid Ibrahim', directSupervisorAr: 'د. خالد إبراهيم', departmentManager: 'Dr. Khalid Ibrahim', departmentManagerAr: 'د. خالد إبراهيم', approvalAuthority: 7, isActive: true },
  { id: '6', userId: 'u6', userName: 'Amal Khaled', userNameAr: 'أمل خالد', jobTitle: 'HR Manager', jobTitleAr: 'مديرة الموارد البشرية', hierarchyLevel: 'manager', orgUnit: 'HR', orgUnitAr: 'الموارد البشرية', directSupervisor: 'Ahmed Mohammed', directSupervisorAr: 'أحمد محمد', departmentManager: 'Ahmed Mohammed', departmentManagerAr: 'أحمد محمد', approvalAuthority: 7, isActive: true },
  { id: '7', userId: 'u7', userName: 'Huda Mohammed', userNameAr: 'هدى محمد', jobTitle: 'Team A Supervisor', jobTitleAr: 'مشرفة الفريق أ', hierarchyLevel: 'supervisor', orgUnit: 'ICU Team A', orgUnitAr: 'فريق العناية أ', directSupervisor: 'Sara Ahmed', directSupervisorAr: 'سارة أحمد', departmentManager: 'Sara Ahmed', departmentManagerAr: 'سارة أحمد', approvalAuthority: 5, isActive: true },
  { id: '8', userId: 'u8', userName: 'Mona Khaled', userNameAr: 'منى خالد', jobTitle: 'Team B Supervisor', jobTitleAr: 'مشرفة الفريق ب', hierarchyLevel: 'supervisor', orgUnit: 'ICU Team B', orgUnitAr: 'فريق العناية ب', directSupervisor: 'Sara Ahmed', directSupervisorAr: 'سارة أحمد', departmentManager: 'Sara Ahmed', departmentManagerAr: 'سارة أحمد', approvalAuthority: 5, isActive: true },
  { id: '9', userId: 'u9', userName: 'Dina Ali', userNameAr: 'دينا علي', jobTitle: 'Recruitment Lead', jobTitleAr: 'مسؤولة التوظيف', hierarchyLevel: 'team_leader', orgUnit: 'Recruitment', orgUnitAr: 'التوظيف', directSupervisor: 'Amal Khaled', directSupervisorAr: 'أمل خالد', departmentManager: 'Amal Khaled', departmentManagerAr: 'أمل خالد', approvalAuthority: 4, isActive: true },
  { id: '10', userId: 'u10', userName: 'Layla Ahmed', userNameAr: 'ليلى أحمد', jobTitle: 'Senior Nurse', jobTitleAr: 'ممرضة أولى', hierarchyLevel: 'senior', orgUnit: 'ICU Team A', orgUnitAr: 'فريق العناية أ', directSupervisor: 'Huda Mohammed', directSupervisorAr: 'هدى محمد', departmentManager: 'Sara Ahmed', departmentManagerAr: 'سارة أحمد', approvalAuthority: 2, isActive: true },
  { id: '11', userId: 'u11', userName: 'Noor Hassan', userNameAr: 'نور حسن', jobTitle: 'Staff Nurse', jobTitleAr: 'ممرضة', hierarchyLevel: 'staff', orgUnit: 'ICU Team A', orgUnitAr: 'فريق العناية أ', directSupervisor: 'Huda Mohammed', directSupervisorAr: 'هدى محمد', departmentManager: 'Sara Ahmed', departmentManagerAr: 'سارة أحمد', approvalAuthority: 1, isActive: true },
  { id: '12', userId: 'u12', userName: 'Reem Saeed', userNameAr: 'ريم سعيد', jobTitle: 'Intern', jobTitleAr: 'متدربة', hierarchyLevel: 'intern', orgUnit: 'ICU Team B', orgUnitAr: 'فريق العناية ب', directSupervisor: 'Mona Khaled', directSupervisorAr: 'منى خالد', departmentManager: 'Sara Ahmed', departmentManagerAr: 'سارة أحمد', approvalAuthority: 0, isActive: true },
]

const HIERARCHY_LEVELS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  executive: { label: 'تنفيذي', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300', icon: Crown },
  director: { label: 'مدير', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', icon: Shield },
  manager: { label: 'رئيس قسم', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300', icon: UserCog },
  supervisor: { label: 'مشرف', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300', icon: Star },
  team_leader: { label: 'قائد فريق', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300', icon: Users },
  senior: { label: 'أقدم', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300', icon: User },
  staff: { label: 'موظف', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', icon: User },
  junior: { label: 'مبتدئ', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: User },
  intern: { label: 'متدرب', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300', icon: User },
}

export default function HierarchyPage() {
  const [positions, setPositions] = useState(POSITIONS)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editPos, setEditPos] = useState<EmployeePosition | null>(null)
  const [form, setForm] = useState({
    userNameAr: '', jobTitleAr: '', hierarchyLevel: 'staff',
    orgUnitAr: '', directSupervisorAr: '', approvalAuthority: 1,
  })

  const filtered = positions.filter((p) => {
    const matchSearch = p.userNameAr.includes(search) || p.jobTitleAr.includes(search) || p.orgUnitAr.includes(search)
    const matchLevel = levelFilter === 'all' || p.hierarchyLevel === levelFilter
    return matchSearch && matchLevel
  })

  const stats = Object.entries(HIERARCHY_LEVELS).map(([key, cfg]) => ({
    key,
    label: cfg.label,
    count: positions.filter((p) => p.hierarchyLevel === key).length,
    color: cfg.color,
  }))

  const openEdit = (pos: EmployeePosition) => {
    setEditPos(pos)
    setForm({
      userNameAr: pos.userNameAr,
      jobTitleAr: pos.jobTitleAr,
      hierarchyLevel: pos.hierarchyLevel,
      orgUnitAr: pos.orgUnitAr,
      directSupervisorAr: pos.directSupervisorAr,
      approvalAuthority: pos.approvalAuthority,
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!editPos) return
    setPositions((prev) => prev.map((p) => p.id === editPos.id ? { ...p, ...form } : p))
    toast.success('تم تحديث المنصب')
    setDialogOpen(false)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ArrowUpDown className="h-6 w-6 text-primary" />
            التسلسل الإداري
          </h1>
          <p className="text-muted-foreground text-sm">إدارة المناصب والمستويات الإدارية وسلاسل الإشراف</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/organization"><ArrowLeft className="h-4 w-4 ml-1" />الهيكل التنظيمي</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/organization/chart"><Building2 className="h-4 w-4 ml-1" />المخطط</Link>
          </Button>
        </div>
      </div>

      {/* Hierarchy Level Stats */}
      <div className="flex flex-wrap gap-2">
        {stats.filter((s) => s.count > 0).map((s) => (
          <Badge
            key={s.key}
            variant="outline"
            className={cn('cursor-pointer px-3 py-1.5', s.color, levelFilter === s.key && 'ring-2 ring-primary')}
            onClick={() => setLevelFilter(levelFilter === s.key ? 'all' : s.key)}
          >
            {s.label}: {s.count}
          </Badge>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="بحث بالاسم أو المنصب أو القسم..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-0 px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الموظف</TableHead>
                  <TableHead className="text-right">المنصب</TableHead>
                  <TableHead className="text-right">المستوى</TableHead>
                  <TableHead className="text-right">الوحدة</TableHead>
                  <TableHead className="text-right">المشرف المباشر</TableHead>
                  <TableHead className="text-right">صلاحية الاعتماد</TableHead>
                  <TableHead className="text-right w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((pos) => {
                  const levelCfg = HIERARCHY_LEVELS[pos.hierarchyLevel] || HIERARCHY_LEVELS.staff
                  const LevelIcon = levelCfg.icon
                  return (
                    <TableRow key={pos.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">{pos.userNameAr.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{pos.userNameAr}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{pos.jobTitleAr}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn('text-[10px]', levelCfg.color)}>
                          <LevelIcon className="h-3 w-3 ml-1" />
                          {levelCfg.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{pos.orgUnitAr}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{pos.directSupervisorAr}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div className="h-2 flex-1 max-w-[60px] bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pos.approvalAuthority * 10}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{pos.approvalAuthority}/10</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(pos)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل المنصب - {editPos?.userNameAr}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">المسمى الوظيفي</Label>
              <Input value={form.jobTitleAr} onChange={(e) => setForm({ ...form, jobTitleAr: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">المستوى الإداري</Label>
                <Select value={form.hierarchyLevel} onValueChange={(v) => setForm({ ...form, hierarchyLevel: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(HIERARCHY_LEVELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">صلاحية الاعتماد (0-10)</Label>
                <Input type="number" min={0} max={10} value={form.approvalAuthority} onChange={(e) => setForm({ ...form, approvalAuthority: +e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">الوحدة التنظيمية</Label>
              <Input value={form.orgUnitAr} onChange={(e) => setForm({ ...form, orgUnitAr: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">المشرف المباشر</Label>
              <Select value={form.directSupervisorAr} onValueChange={(v) => setForm({ ...form, directSupervisorAr: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">لا يوجد</SelectItem>
                  {positions.filter((p) => p.id !== editPos?.id).map((p) => (
                    <SelectItem key={p.id} value={p.userNameAr}>{p.userNameAr} - {p.jobTitleAr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
