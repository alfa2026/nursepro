'use client'

import * as React from 'react'
import {
  Settings, Bell, Shield, Database, Palette, Globe, Save, Users,
  Clock, Calendar, ToggleLeft, Lock, Mail, Monitor, Sliders, Building2,
  Smartphone, Volume2, AlertTriangle, Eye, Key, RefreshCw, HardDrive,
  Zap, Layers, Timer, UserCog, Fingerprint, Wifi,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { toast } from 'sonner'
import { useFirestoreCollection } from '@/hooks/use-firestore'
import { COLLECTIONS } from '@/types'

interface SettingsCategory {
  id: string
  label: string
  icon: React.ElementType
  description: string
}

const categories: SettingsCategory[] = [
  { id: 'general', label: 'الإعدادات العامة', icon: Settings, description: 'معلومات المستشفى والهوية' },
  { id: 'security', label: 'الأمان', icon: Shield, description: 'كلمات المرور والجلسات' },
  { id: 'authentication', label: 'المصادقة', icon: Key, description: 'طرق تسجيل الدخول' },
  { id: 'notifications', label: 'الإشعارات', icon: Bell, description: 'التنبيهات والإشعارات' },
  { id: 'attendance', label: 'الحضور', icon: Clock, description: 'قواعد الحضور والانصراف' },
  { id: 'scheduling', label: 'الجدولة', icon: Calendar, description: 'إعدادات المناوبات' },
  { id: 'users', label: 'المستخدمون', icon: Users, description: 'الأدوار والصلاحيات' },
  { id: 'appearance', label: 'المظهر', icon: Palette, description: 'الثيم والألوان' },
  { id: 'backup', label: 'النسخ والنظام', icon: Database, description: 'النسخ الاحتياطي والصيانة' },
  { id: 'features', label: 'الوحدات', icon: ToggleLeft, description: 'تفعيل/تعطيل الوحدات' },
]

export default function SettingsPage() {
  const [hasChanges, setHasChanges] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('general')

  // General Settings
  const [general, setGeneral] = React.useState({
    hospitalName: '\u0645\u0633\u062a\u0634\u0641\u0649 \u0627\u0644\u0645\u0645\u0644\u0643\u0629',
    hospitalNameEn: 'Kingdom Hospital',
    logo: '',
    contactEmail: 'info@hospital.com',
    contactPhone: '920012345',
    address: '\u0627\u0644\u0631\u064a\u0627\u0636\u060c \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629',
    addressEn: 'Riyadh, Saudi Arabia',
    language: 'ar',
    timezone: 'Asia/Riyadh',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '12h' as '12h' | '24h',
  })

  // Security Settings
  const [security, setSecurity] = React.useState({
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumber: true,
    passwordRequireSpecial: true,
    sessionTimeoutMinutes: 30,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    mfaEnabled: false,
    mfaRequired: false,
    ipWhitelist: '',
    forcePasswordChangeOnFirst: true,
  })

  // Authentication Settings
  const [auth, setAuth] = React.useState({
    googleLoginEnabled: true,
    employeeCodeLoginEnabled: true,
    emailLoginEnabled: true,
    requireApprovalForNewUsers: true,
    autoGenerateEmployeeCodes: true,
    employeeCodePrefix: 'EMP',
    allowRememberMe: true,
    passwordResetEnabled: true,
    passwordResetExpiry: 24,
  })

  // Notification Settings
  const [notifications, setNotifications] = React.useState({
    emailEnabled: true,
    pushEnabled: true,
    soundEnabled: true,
    shiftReminders: true,
    shiftReminderMinutesBefore: 30,
    leaveApprovalNotify: true,
    attendanceAlerts: true,
    emergencyAlerts: true,
    lowStaffAlerts: true,
    overCapacityAlerts: true,
    reportReminders: true,
    maintenanceAlerts: true,
  })

  // Attendance Settings
  const [attendance, setAttendance] = React.useState({
    lateToleranceMinutes: 10,
    overtimeThresholdMinutes: 30,
    autoCheckoutEnabled: false,
    autoCheckoutTime: '23:59',
    weekendDays: [5, 6],
    workingHoursPerDay: 8,
    requireCheckInLocation: false,
    qrCheckInEnabled: true,
    biometricEnabled: false,
    roundingRule: '15min',
  })

  // Scheduling Settings
  const [scheduling, setScheduling] = React.useState({
    defaultShiftDuration: 8,
    minRestBetweenShifts: 12,
    maxConsecutiveShifts: 6,
    allowShiftSwap: true,
    requireApprovalForSwap: true,
    conflictDetection: true,
    autoScheduleEnabled: false,
    morningShiftStart: '07:00',
    morningShiftEnd: '15:00',
    eveningShiftStart: '15:00',
    eveningShiftEnd: '23:00',
    nightShiftStart: '23:00',
    nightShiftEnd: '07:00',
    minStaffPerShift: 3,
  })

  // User & Role Settings
  const [userSettings, setUserSettings] = React.useState({
    defaultRole: 'nurse',
    requireDepartmentAssignment: true,
    allowMultipleDepartments: false,
    defaultPasswordExpiry: 90,
    inactiveAccountDays: 30,
    autoSuspendInactive: false,
  })

  // Appearance Settings
  const [appearance, setAppearance] = React.useState({
    defaultTheme: 'system' as 'light' | 'dark' | 'system',
    primaryColor: '#2563eb',
    accentColor: '#10b981',
    sidebarCollapsed: false,
    compactMode: false,
    animationsEnabled: true,
    rtlDirection: true,
  })

  // Backup Settings
  const [backup, setBackup] = React.useState({
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    includeAuditLogs: true,
    includeAttachments: false,
    lastBackup: '2024-01-15T08:00:00Z',
    storageUsed: '2.4 GB',
    maxStorage: '10 GB',
  })

  // Feature Toggles
  const [features, setFeatures] = React.useState({
    dashboardEnabled: true,
    usersEnabled: true,
    rolesEnabled: true,
    departmentsEnabled: true,
    attendanceEnabled: true,
    schedulingEnabled: true,
    reportsEnabled: true,
    notificationsEnabled: true,
    messagesEnabled: true,
    auditLogsEnabled: true,
    leaveEnabled: true,
    payrollEnabled: true,
    inventoryEnabled: true,
    equipmentEnabled: true,
    trainingEnabled: true,
    qualityEnabled: true,
    incidentsEnabled: true,
    emergencyEnabled: true,
    betaFeaturesEnabled: false,
    maintenanceMode: false,
  })

  const markChanged = () => setHasChanges(true)

  const handleSave = () => {
    // In production, save to Firestore
    toast.success('\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0628\u0646\u062c\u0627\u062d')
    setHasChanges(false)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6" />
            \u0645\u0631\u0643\u0632 \u0627\u0644\u0625\u0639\u062f\u0627\u062f\u0627\u062a
          </h1>
          <p className="text-muted-foreground">\u0625\u062f\u0627\u0631\u0629 \u062c\u0645\u064a\u0639 \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0646\u0638\u0627\u0645 \u0645\u0646 \u0645\u0643\u0627\u0646 \u0648\u0627\u062d\u062f</p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 ml-2" />
            \u062d\u0641\u0638 \u062c\u0645\u064a\u0639 \u0627\u0644\u062a\u063a\u064a\u064a\u0631\u0627\u062a
          </Button>
        )}
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 h-auto gap-1 p-1">
          {categories.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="flex flex-col items-center gap-1 py-2 px-1 text-xs">
              <cat.icon className="h-4 w-4" />
              <span className="truncate max-w-full">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 1. General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> \u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u0634\u0641\u0649</CardTitle>
              <CardDescription>\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0624\u0633\u0633\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u0634\u0641\u0649 (\u0639\u0631\u0628\u064a)</Label>
                <Input value={general.hospitalName} onChange={(e) => { setGeneral(p => ({...p, hospitalName: e.target.value})); markChanged() }} />
              </div>
              <div className="space-y-2">
                <Label>\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062a\u0634\u0641\u0649 (English)</Label>
                <Input value={general.hospitalNameEn} onChange={(e) => { setGeneral(p => ({...p, hospitalNameEn: e.target.value})); markChanged() }} />
              </div>
              <div className="space-y-2">
                <Label>\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a</Label>
                <Input type="email" value={general.contactEmail} onChange={(e) => { setGeneral(p => ({...p, contactEmail: e.target.value})); markChanged() }} />
              </div>
              <div className="space-y-2">
                <Label>\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641</Label>
                <Input type="tel" value={general.contactPhone} onChange={(e) => { setGeneral(p => ({...p, contactPhone: e.target.value})); markChanged() }} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>\u0627\u0644\u0639\u0646\u0648\u0627\u0646 (\u0639\u0631\u0628\u064a)</Label>
                <Textarea value={general.address} onChange={(e) => { setGeneral(p => ({...p, address: e.target.value})); markChanged() }} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> \u0627\u0644\u0644\u063a\u0629 \u0648\u0627\u0644\u0645\u0646\u0637\u0642\u0629</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label>\u0627\u0644\u0644\u063a\u0629</Label>
                <Select value={general.language} onValueChange={(v) => { setGeneral(p => ({...p, language: v})); markChanged() }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">\u0627\u0644\u0639\u0631\u0628\u064a\u0629</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0632\u0645\u0646\u064a\u0629</Label>
                <Select value={general.timezone} onValueChange={(v) => { setGeneral(p => ({...p, timezone: v})); markChanged() }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Riyadh">\u0627\u0644\u0631\u064a\u0627\u0636 (UTC+3)</SelectItem>
                    <SelectItem value="Asia/Dubai">\u062f\u0628\u064a (UTC+4)</SelectItem>
                    <SelectItem value="Africa/Cairo">\u0627\u0644\u0642\u0627\u0647\u0631\u0629 (UTC+2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>\u062a\u0646\u0633\u064a\u0642 \u0627\u0644\u062a\u0627\u0631\u064a\u062e</Label>
                <Select value={general.dateFormat} onValueChange={(v) => { setGeneral(p => ({...p, dateFormat: v})); markChanged() }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                    <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                    <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>\u062a\u0646\u0633\u064a\u0642 \u0627\u0644\u0648\u0642\u062a</Label>
                <Select value={general.timeFormat} onValueChange={(v) => { setGeneral(p => ({...p, timeFormat: v as '12h' | '24h'})); markChanged() }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12 \u0633\u0627\u0639\u0629 (AM/PM)</SelectItem>
                    <SelectItem value="24h">24 \u0633\u0627\u0639\u0629</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> \u0633\u064a\u0627\u0633\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</CardTitle>
              <CardDescription>\u062a\u062d\u0643\u0645 \u0641\u064a \u0645\u062a\u0637\u0644\u0628\u0627\u062a \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>\u0627\u0644\u062d\u062f \u0627\u0644\u0623\u062f\u0646\u0649 \u0644\u0637\u0648\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</Label>
                  <div className="flex items-center gap-4">
                    <Slider value={[security.passwordMinLength]} onValueChange={([v]) => { setSecurity(p => ({...p, passwordMinLength: v})); markChanged() }} min={6} max={20} step={1} className="flex-1" />
                    <Badge variant="secondary" className="min-w-[3rem] justify-center">{security.passwordMinLength}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>\u0645\u062d\u0627\u0648\u0644\u0627\u062a \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0627\u0644\u0645\u0633\u0645\u0648\u062d\u0629</Label>
                  <div className="flex items-center gap-4">
                    <Slider value={[security.maxLoginAttempts]} onValueChange={([v]) => { setSecurity(p => ({...p, maxLoginAttempts: v})); markChanged() }} min={3} max={10} step={1} className="flex-1" />
                    <Badge variant="secondary" className="min-w-[3rem] justify-center">{security.maxLoginAttempts}</Badge>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>\u062d\u0631\u0641 \u0643\u0628\u064a\u0631 \u0645\u0637\u0644\u0648\u0628</Label>
                  <Switch checked={security.passwordRequireUppercase} onCheckedChange={(c) => { setSecurity(p => ({...p, passwordRequireUppercase: c})); markChanged() }} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>\u0631\u0642\u0645 \u0645\u0637\u0644\u0648\u0628</Label>
                  <Switch checked={security.passwordRequireNumber} onCheckedChange={(c) => { setSecurity(p => ({...p, passwordRequireNumber: c})); markChanged() }} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>\u0631\u0645\u0632 \u062e\u0627\u0635 \u0645\u0637\u0644\u0648\u0628</Label>
                  <Switch checked={security.passwordRequireSpecial} onCheckedChange={(c) => { setSecurity(p => ({...p, passwordRequireSpecial: c})); markChanged() }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Timer className="h-5 w-5" /> \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u062c\u0644\u0633\u0627\u062a</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>\u0645\u0647\u0644\u0629 \u0627\u0646\u062a\u0647\u0627\u0621 \u0627\u0644\u062c\u0644\u0633\u0629 (\u062f\u0642\u064a\u0642\u0629)</Label>
                <Select value={String(security.sessionTimeoutMinutes)} onValueChange={(v) => { setSecurity(p => ({...p, sessionTimeoutMinutes: Number(v)})); markChanged() }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 \u062f\u0642\u064a\u0642\u0629</SelectItem>
                    <SelectItem value="30">30 \u062f\u0642\u064a\u0642\u0629</SelectItem>
                    <SelectItem value="60">\u0633\u0627\u0639\u0629</SelectItem>
                    <SelectItem value="120">\u0633\u0627\u0639\u062a\u0627\u0646</SelectItem>
                    <SelectItem value="480">8 \u0633\u0627\u0639\u0627\u062a</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>\u0645\u062f\u0629 \u0627\u0644\u0625\u063a\u0644\u0627\u0642 (\u062f\u0642\u064a\u0642\u0629)</Label>
                <Select value={String(security.lockoutDurationMinutes)} onValueChange={(v) => { setSecurity(p => ({...p, lockoutDurationMinutes: Number(v)})); markChanged() }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 \u062f\u0642\u0627\u0626\u0642</SelectItem>
                    <SelectItem value="15">15 \u062f\u0642\u064a\u0642\u0629</SelectItem>
                    <SelectItem value="30">30 \u062f\u0642\u064a\u0642\u0629</SelectItem>
                    <SelectItem value="60">\u0633\u0627\u0639\u0629</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border md:col-span-2">
                <div>
                  <Label>\u0627\u0644\u062a\u062d\u0642\u0642 \u0628\u062e\u0637\u0648\u062a\u064a\u0646 (MFA)</Label>
                  <p className="text-xs text-muted-foreground">\u0637\u0644\u0628 \u0631\u0645\u0632 \u0625\u0636\u0627\u0641\u064a \u0639\u0646\u062f \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644</p>
                </div>
                <Switch checked={security.mfaEnabled} onCheckedChange={(c) => { setSecurity(p => ({...p, mfaEnabled: c})); markChanged() }} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border md:col-span-2">
                <div>
                  <Label>\u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0639\u0646\u062f \u0623\u0648\u0644 \u062f\u062e\u0648\u0644</Label>
                  <p className="text-xs text-muted-foreground">\u0625\u0644\u0632\u0627\u0645 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0628\u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u0645\u0624\u0642\u062a\u0629</p>
                </div>
                <Switch checked={security.forcePasswordChangeOnFirst} onCheckedChange={(c) => { setSecurity(p => ({...p, forcePasswordChangeOnFirst: c})); markChanged() }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Authentication Settings */}
        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Fingerprint className="h-5 w-5" /> \u0637\u0631\u0642 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644</CardTitle>
              <CardDescription>\u062a\u062d\u0643\u0645 \u0641\u064a \u0637\u0631\u0642 \u0627\u0644\u0645\u0635\u0627\u062f\u0642\u0629 \u0627\u0644\u0645\u062a\u0627\u062d\u0629</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0627\u0644\u0628\u0631\u064a\u062f</Label>
                    <p className="text-xs text-muted-foreground">\u0627\u0644\u0633\u0645\u0627\u062d \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0628\u0631\u064a\u062f \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</p>
                  </div>
                </div>
                <Switch checked={auth.emailLoginEnabled} onCheckedChange={(c) => { setAuth(p => ({...p, emailLoginEnabled: c})); markChanged() }} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0631\u0642\u0645 \u0627\u0644\u0645\u0648\u0638\u0641</Label>
                    <p className="text-xs text-muted-foreground">\u0627\u0644\u0633\u0645\u0627\u062d \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0631\u0642\u0645 \u0627\u0644\u0645\u0648\u0638\u0641 \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</p>
                  </div>
                </div>
                <Switch checked={auth.employeeCodeLoginEnabled} onCheckedChange={(c) => { setAuth(p => ({...p, employeeCodeLoginEnabled: c})); markChanged() }} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label>\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628 Google</Label>
                    <p className="text-xs text-muted-foreground">\u0627\u0644\u0633\u0645\u0627\u062d \u0628\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0639\u0628\u0631 \u062d\u0633\u0627\u0628 Google</p>
                  </div>
                </div>
                <Switch checked={auth.googleLoginEnabled} onCheckedChange={(c) => { setAuth(p => ({...p, googleLoginEnabled: c})); markChanged() }} />
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>\u0645\u0648\u0627\u0641\u0642\u0629 \u0627\u0644\u0625\u062f\u0627\u0631\u0629 \u0644\u0644\u062d\u0633\u0627\u0628\u0627\u062a \u0627\u0644\u062c\u062f\u064a\u062f\u0629</Label>
                  <Switch checked={auth.requireApprovalForNewUsers} onCheckedChange={(c) => { setAuth(p => ({...p, requireApprovalForNewUsers: c})); markChanged() }} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>\u062a\u0648\u0644\u064a\u062f \u0631\u0642\u0645 \u0627\u0644\u0645\u0648\u0638\u0641 \u062a\u0644\u0642\u0627\u0626\u064a\u0627\u064b</Label>
                  <Switch checked={auth.autoGenerateEmployeeCodes} onCheckedChange={(c) => { setAuth(p => ({...p, autoGenerateEmployeeCodes: c})); markChanged() }} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>\u0628\u0627\u062f\u0626\u0629 \u0631\u0642\u0645 \u0627\u0644\u0645\u0648\u0638\u0641</Label>
                <Input value={auth.employeeCodePrefix} onChange={(e) => { setAuth(p => ({...p, employeeCodePrefix: e.target.value})); markChanged() }} className="max-w-[200px]" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> \u0642\u0646\u0648\u0627\u062a \u0627\u0644\u0625\u0634\u0639\u0627\u0631</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label>\u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a</Label>
                  </div>
                  <Switch checked={notifications.emailEnabled} onCheckedChange={(c) => { setNotifications(p => ({...p, emailEnabled: c})); markChanged() }} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <Label>\u0625\u0634\u0639\u0627\u0631\u0627\u062a \u0641\u0648\u0631\u064a\u0629</Label>
                  </div>
                  <Switch checked={notifications.pushEnabled} onCheckedChange={(c) => { setNotifications(p => ({...p, pushEnabled: c})); markChanged() }} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    <Label>\u0635\u0648\u062a \u0627\u0644\u0625\u0634\u0639\u0627\u0631</Label>
                  </div>
                  <Switch checked={notifications.soundEnabled} onCheckedChange={(c) => { setNotifications(p => ({...p, soundEnabled: c})); markChanged() }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> \u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0627\u0644\u0646\u0638\u0627\u0645</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'shiftReminders', label: '\u062a\u0630\u0643\u064a\u0631 \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0627\u062a' },
                { key: 'leaveApprovalNotify', label: '\u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0625\u062c\u0627\u0632\u0627\u062a' },
                { key: 'attendanceAlerts', label: '\u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0627\u0644\u062d\u0636\u0648\u0631' },
                { key: 'emergencyAlerts', label: '\u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0627\u0644\u0637\u0648\u0627\u0631\u0626' },
                { key: 'lowStaffAlerts', label: '\u062a\u0646\u0628\u064a\u0647 \u0646\u0642\u0635 \u0627\u0644\u0643\u0627\u062f\u0631' },
                { key: 'overCapacityAlerts', label: '\u062a\u0646\u0628\u064a\u0647 \u062a\u062c\u0627\u0648\u0632 \u0627\u0644\u0633\u0639\u0629' },
                { key: 'reportReminders', label: '\u062a\u0630\u0643\u064a\u0631 \u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631' },
                { key: 'maintenanceAlerts', label: '\u062a\u0646\u0628\u064a\u0647\u0627\u062a \u0627\u0644\u0635\u064a\u0627\u0646\u0629' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>{label}</Label>
                  <Switch checked={notifications[key as keyof typeof notifications] as boolean} onCheckedChange={(c) => { setNotifications(p => ({...p, [key]: c})); markChanged() }} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Attendance Settings */}
        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> \u0642\u0648\u0627\u0639\u062f \u0627\u0644\u062d\u0636\u0648\u0631</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>\u0633\u0645\u0627\u062d\u064a\u0629 \u0627\u0644\u062a\u0623\u062e\u064a\u0631 (\u062f\u0642\u064a\u0642\u0629)</Label>
                <div className="flex items-center gap-4">
                  <Slider value={[attendance.lateToleranceMinutes]} onValueChange={([v]) => { setAttendance(p => ({...p, lateToleranceMinutes: v})); markChanged() }} min={0} max={30} step={5} className="flex-1" />
                  <Badge variant="secondary" className="min-w-[3rem] justify-center">{attendance.lateToleranceMinutes}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>\u062d\u062f \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0625\u0636\u0627\u0641\u064a (\u062f\u0642\u064a\u0642\u0629)</Label>
                <div className="flex items-center gap-4">
                  <Slider value={[attendance.overtimeThresholdMinutes]} onValueChange={([v]) => { setAttendance(p => ({...p, overtimeThresholdMinutes: v})); markChanged() }} min={15} max={120} step={15} className="flex-1" />
                  <Badge variant="secondary" className="min-w-[3rem] justify-center">{attendance.overtimeThresholdMinutes}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Label>\u0633\u0627\u0639\u0627\u062a \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u064a\u0648\u0645\u064a\u0629</Label>
                <Select value={String(attendance.workingHoursPerDay)} onValueChange={(v) => { setAttendance(p => ({...p, workingHoursPerDay: Number(v)})); markChanged() }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 \u0633\u0627\u0639\u0627\u062a</SelectItem>
                    <SelectItem value="8">8 \u0633\u0627\u0639\u0627\u062a</SelectItem>
                    <SelectItem value="10">10 \u0633\u0627\u0639\u0627\u062a</SelectItem>
                    <SelectItem value="12">12 \u0633\u0627\u0639\u0629</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>\u0642\u0627\u0639\u062f\u0629 \u0627\u0644\u062a\u0642\u0631\u064a\u0628</Label>
                <Select value={attendance.roundingRule} onValueChange={(v) => { setAttendance(p => ({...p, roundingRule: v})); markChanged() }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">\u0628\u062f\u0648\u0646 \u062a\u0642\u0631\u064a\u0628</SelectItem>
                    <SelectItem value="5min">5 \u062f\u0642\u0627\u0626\u0642</SelectItem>
                    <SelectItem value="15min">15 \u062f\u0642\u064a\u0642\u0629</SelectItem>
                    <SelectItem value="30min">30 \u062f\u0642\u064a\u0642\u0629</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>\u0637\u0631\u0642 \u0627\u0644\u062a\u0633\u062c\u064a\u0644</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label>\u062a\u0633\u062c\u064a\u0644 \u0628\u0640 QR</Label>
                <Switch checked={attendance.qrCheckInEnabled} onCheckedChange={(c) => { setAttendance(p => ({...p, qrCheckInEnabled: c})); markChanged() }} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label>\u0628\u0635\u0645\u0629 \u0627\u0644\u0625\u0635\u0628\u0639</Label>
                <Switch checked={attendance.biometricEnabled} onCheckedChange={(c) => { setAttendance(p => ({...p, biometricEnabled: c})); markChanged() }} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label>\u062e\u0631\u0648\u062c \u062a\u0644\u0642\u0627\u0626\u064a</Label>
                <Switch checked={attendance.autoCheckoutEnabled} onCheckedChange={(c) => { setAttendance(p => ({...p, autoCheckoutEnabled: c})); markChanged() }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Scheduling Settings */}
        <TabsContent value="scheduling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0627\u062a</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>\u0628\u062f\u0627\u064a\u0629 \u0627\u0644\u0635\u0628\u0627\u062d\u064a\u0629</Label>
                  <Input type="time" value={scheduling.morningShiftStart} onChange={(e) => { setScheduling(p => ({...p, morningShiftStart: e.target.value})); markChanged() }} />
                </div>
                <div className="space-y-2">
                  <Label>\u0628\u062f\u0627\u064a\u0629 \u0627\u0644\u0645\u0633\u0627\u0626\u064a\u0629</Label>
                  <Input type="time" value={scheduling.eveningShiftStart} onChange={(e) => { setScheduling(p => ({...p, eveningShiftStart: e.target.value})); markChanged() }} />
                </div>
                <div className="space-y-2">
                  <Label>\u0628\u062f\u0627\u064a\u0629 \u0627\u0644\u0644\u064a\u0644\u064a\u0629</Label>
                  <Input type="time" value={scheduling.nightShiftStart} onChange={(e) => { setScheduling(p => ({...p, nightShiftStart: e.target.value})); markChanged() }} />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>\u0645\u062f\u0629 \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0629 (\u0633\u0627\u0639\u0629)</Label>
                  <Select value={String(scheduling.defaultShiftDuration)} onValueChange={(v) => { setScheduling(p => ({...p, defaultShiftDuration: Number(v)})); markChanged() }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 \u0633\u0627\u0639\u0627\u062a</SelectItem>
                      <SelectItem value="8">8 \u0633\u0627\u0639\u0627\u062a</SelectItem>
                      <SelectItem value="10">10 \u0633\u0627\u0639\u0627\u062a</SelectItem>
                      <SelectItem value="12">12 \u0633\u0627\u0639\u0629</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>\u0627\u0644\u062d\u062f \u0627\u0644\u0623\u062f\u0646\u0649 \u0644\u0644\u0631\u0627\u062d\u0629 \u0628\u064a\u0646 \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0627\u062a (\u0633\u0627\u0639\u0629)</Label>
                  <div className="flex items-center gap-4">
                    <Slider value={[scheduling.minRestBetweenShifts]} onValueChange={([v]) => { setScheduling(p => ({...p, minRestBetweenShifts: v})); markChanged() }} min={8} max={24} step={2} className="flex-1" />
                    <Badge variant="secondary" className="min-w-[3rem] justify-center">{scheduling.minRestBetweenShifts}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>\u0623\u0642\u0635\u0649 \u0645\u0646\u0627\u0648\u0628\u0627\u062a \u0645\u062a\u062a\u0627\u0644\u064a\u0629</Label>
                  <div className="flex items-center gap-4">
                    <Slider value={[scheduling.maxConsecutiveShifts]} onValueChange={([v]) => { setScheduling(p => ({...p, maxConsecutiveShifts: v})); markChanged() }} min={3} max={10} step={1} className="flex-1" />
                    <Badge variant="secondary" className="min-w-[3rem] justify-center">{scheduling.maxConsecutiveShifts}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>\u0623\u0642\u0644 \u0639\u062f\u062f \u0645\u0648\u0638\u0641\u064a\u0646 \u0644\u0644\u0645\u0646\u0627\u0648\u0628\u0629</Label>
                  <div className="flex items-center gap-4">
                    <Slider value={[scheduling.minStaffPerShift]} onValueChange={([v]) => { setScheduling(p => ({...p, minStaffPerShift: v})); markChanged() }} min={1} max={20} step={1} className="flex-1" />
                    <Badge variant="secondary" className="min-w-[3rem] justify-center">{scheduling.minStaffPerShift}</Badge>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>\u0627\u0644\u0633\u0645\u0627\u062d \u0628\u062a\u0628\u0627\u062f\u0644 \u0627\u0644\u0645\u0646\u0627\u0648\u0628\u0627\u062a</Label>
                  <Switch checked={scheduling.allowShiftSwap} onCheckedChange={(c) => { setScheduling(p => ({...p, allowShiftSwap: c})); markChanged() }} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u062a\u0628\u0627\u062f\u0644</Label>
                  <Switch checked={scheduling.requireApprovalForSwap} onCheckedChange={(c) => { setScheduling(p => ({...p, requireApprovalForSwap: c})); markChanged() }} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>\u0643\u0634\u0641 \u0627\u0644\u062a\u0639\u0627\u0631\u0636\u0627\u062a</Label>
                  <Switch checked={scheduling.conflictDetection} onCheckedChange={(c) => { setScheduling(p => ({...p, conflictDetection: c})); markChanged() }} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>\u0627\u0644\u062c\u062f\u0648\u0644\u0629 \u0627\u0644\u062a\u0644\u0642\u0627\u0626\u064a\u0629</Label>
                  <Switch checked={scheduling.autoScheduleEnabled} onCheckedChange={(c) => { setScheduling(p => ({...p, autoScheduleEnabled: c})); markChanged() }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 7. User & Role Settings */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCog className="h-5 w-5" /> \u0625\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>\u0627\u0644\u062f\u0648\u0631 \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a \u0644\u0644\u0645\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u062c\u062f\u064a\u062f</Label>
                <Select value={userSettings.defaultRole} onValueChange={(v) => { setUserSettings(p => ({...p, defaultRole: v})); markChanged() }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nurse">\u0645\u0645\u0631\u0636/\u0629</SelectItem>
                    <SelectItem value="doctor">\u0637\u0628\u064a\u0628/\u0629</SelectItem>
                    <SelectItem value="receptionist">\u0627\u0633\u062a\u0642\u0628\u0627\u0644</SelectItem>
                    <SelectItem value="security_staff">\u0623\u0645\u0646</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>\u0635\u0644\u0627\u062d\u064a\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 (\u064a\u0648\u0645)</Label>
                <Select value={String(userSettings.defaultPasswordExpiry)} onValueChange={(v) => { setUserSettings(p => ({...p, defaultPasswordExpiry: Number(v)})); markChanged() }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 \u064a\u0648\u0645</SelectItem>
                    <SelectItem value="60">60 \u064a\u0648\u0645</SelectItem>
                    <SelectItem value="90">90 \u064a\u0648\u0645</SelectItem>
                    <SelectItem value="180">180 \u064a\u0648\u0645</SelectItem>
                    <SelectItem value="0">\u0628\u062f\u0648\u0646 \u0627\u0646\u062a\u0647\u0627\u0621</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>\u0625\u0644\u0632\u0627\u0645 \u062a\u0639\u064a\u064a\u0646 \u0627\u0644\u0642\u0633\u0645</Label>
                  <p className="text-xs text-muted-foreground">\u064a\u062c\u0628 \u062a\u0639\u064a\u064a\u0646 \u0642\u0633\u0645 \u0644\u0643\u0644 \u0645\u0648\u0638\u0641</p>
                </div>
                <Switch checked={userSettings.requireDepartmentAssignment} onCheckedChange={(c) => { setUserSettings(p => ({...p, requireDepartmentAssignment: c})); markChanged() }} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <Label>\u062a\u0639\u0644\u064a\u0642 \u0627\u0644\u062d\u0633\u0627\u0628\u0627\u062a \u063a\u064a\u0631 \u0627\u0644\u0646\u0634\u0637\u0629</Label>
                  <p className="text-xs text-muted-foreground">\u062a\u0639\u0644\u064a\u0642 \u062a\u0644\u0642\u0627\u0626\u064a \u0628\u0639\u062f {userSettings.inactiveAccountDays} \u064a\u0648\u0645</p>
                </div>
                <Switch checked={userSettings.autoSuspendInactive} onCheckedChange={(c) => { setUserSettings(p => ({...p, autoSuspendInactive: c})); markChanged() }} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 8. Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> \u0627\u0644\u0645\u0638\u0647\u0631 \u0648\u0627\u0644\u0623\u0644\u0648\u0627\u0646</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>\u0627\u0644\u0633\u0645\u0629 \u0627\u0644\u0627\u0641\u062a\u0631\u0627\u0636\u064a\u0629</Label>
                <Select value={appearance.defaultTheme} onValueChange={(v) => { setAppearance(p => ({...p, defaultTheme: v as 'light' | 'dark' | 'system'})); markChanged() }}>
                  <SelectTrigger className="max-w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">\u0641\u0627\u062a\u062d</SelectItem>
                    <SelectItem value="dark">\u062f\u0627\u0643\u0646</SelectItem>
                    <SelectItem value="system">\u062a\u0644\u0642\u0627\u0626\u064a (\u062d\u0633\u0628 \u0627\u0644\u0646\u0638\u0627\u0645)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u0631\u0626\u064a\u0633\u064a</Label>
                  <div className="flex items-center gap-2">
                    <Input type="color" value={appearance.primaryColor} onChange={(e) => { setAppearance(p => ({...p, primaryColor: e.target.value})); markChanged() }} className="w-12 h-10 p-1" />
                    <Input value={appearance.primaryColor} onChange={(e) => { setAppearance(p => ({...p, primaryColor: e.target.value})); markChanged() }} className="flex-1" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u062b\u0627\u0646\u0648\u064a</Label>
                  <div className="flex items-center gap-2">
                    <Input type="color" value={appearance.accentColor} onChange={(e) => { setAppearance(p => ({...p, accentColor: e.target.value})); markChanged() }} className="w-12 h-10 p-1" />
                    <Input value={appearance.accentColor} onChange={(e) => { setAppearance(p => ({...p, accentColor: e.target.value})); markChanged() }} className="flex-1" />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>\u0627\u062a\u062c\u0627\u0647 RTL</Label>
                  <Switch checked={appearance.rtlDirection} onCheckedChange={(c) => { setAppearance(p => ({...p, rtlDirection: c})); markChanged() }} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0645\u0636\u063a\u0648\u0637</Label>
                  <Switch checked={appearance.compactMode} onCheckedChange={(c) => { setAppearance(p => ({...p, compactMode: c})); markChanged() }} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>\u0627\u0644\u062a\u0623\u062b\u064a\u0631\u0627\u062a \u0627\u0644\u062d\u0631\u0643\u064a\u0629</Label>
                  <Switch checked={appearance.animationsEnabled} onCheckedChange={(c) => { setAppearance(p => ({...p, animationsEnabled: c})); markChanged() }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 9. Backup & System Settings */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HardDrive className="h-5 w-5" /> \u0627\u0644\u0646\u0633\u062e \u0627\u0644\u0627\u062d\u062a\u064a\u0627\u0637\u064a</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">\u0622\u062e\u0631 \u0646\u0633\u062e\u0629</p>
                  <p className="text-lg font-semibold mt-1">{new Date(backup.lastBackup).toLocaleDateString('ar-SA')}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">\u0627\u0644\u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u0629</p>
                  <p className="text-lg font-semibold mt-1">{backup.storageUsed}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">\u0627\u0644\u062d\u062f \u0627\u0644\u0623\u0642\u0635\u0649</p>
                  <p className="text-lg font-semibold mt-1">{backup.maxStorage}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label>\u0646\u0633\u062e \u0627\u062d\u062a\u064a\u0627\u0637\u064a \u062a\u0644\u0642\u0627\u0626\u064a</Label>
                  <Switch checked={backup.autoBackupEnabled} onCheckedChange={(c) => { setBackup(p => ({...p, autoBackupEnabled: c})); markChanged() }} />
                </div>
                <div className="space-y-2">
                  <Label>\u062a\u0643\u0631\u0627\u0631 \u0627\u0644\u0646\u0633\u062e</Label>
                  <Select value={backup.backupFrequency} onValueChange={(v) => { setBackup(p => ({...p, backupFrequency: v})); markChanged() }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">\u0643\u0644 \u0633\u0627\u0639\u0629</SelectItem>
                      <SelectItem value="daily">\u064a\u0648\u0645\u064a\u0627\u064b</SelectItem>
                      <SelectItem value="weekly">\u0623\u0633\u0628\u0648\u0639\u064a\u0627\u064b</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline"><RefreshCw className="h-4 w-4 ml-2" />\u0646\u0633\u062e \u0627\u062d\u062a\u064a\u0627\u0637\u064a \u0627\u0644\u0622\u0646</Button>
                <Button variant="outline"><Database className="h-4 w-4 ml-2" />\u0627\u0633\u062a\u0639\u0627\u062f\u0629</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 10. Feature Management */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5" /> \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0648\u062d\u062f\u0627\u062a</CardTitle>
              <CardDescription>\u062a\u0641\u0639\u064a\u0644 \u0623\u0648 \u062a\u0639\u0637\u064a\u0644 \u0648\u062d\u062f\u0627\u062a \u0627\u0644\u0646\u0638\u0627\u0645</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'dashboardEnabled', label: '\u0644\u0648\u062d\u0629 \u0627\u0644\u062a\u062d\u0643\u0645', icon: Monitor },
                  { key: 'usersEnabled', label: '\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646', icon: Users },
                  { key: 'rolesEnabled', label: '\u0627\u0644\u0635\u0644\u0627\u062d\u064a\u0627\u062a', icon: Shield },
                  { key: 'departmentsEnabled', label: '\u0627\u0644\u0623\u0642\u0633\u0627\u0645', icon: Building2 },
                  { key: 'attendanceEnabled', label: '\u0627\u0644\u062d\u0636\u0648\u0631', icon: Clock },
                  { key: 'schedulingEnabled', label: '\u0627\u0644\u062c\u062f\u0648\u0644\u0629', icon: Calendar },
                  { key: 'reportsEnabled', label: '\u0627\u0644\u062a\u0642\u0627\u0631\u064a\u0631', icon: Sliders },
                  { key: 'notificationsEnabled', label: '\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062a', icon: Bell },
                  { key: 'messagesEnabled', label: '\u0627\u0644\u0631\u0633\u0627\u0626\u0644', icon: Mail },
                  { key: 'leaveEnabled', label: '\u0627\u0644\u0625\u062c\u0627\u0632\u0627\u062a', icon: Calendar },
                  { key: 'payrollEnabled', label: '\u0627\u0644\u0631\u0648\u0627\u062a\u0628', icon: Zap },
                  { key: 'inventoryEnabled', label: '\u0627\u0644\u0645\u062e\u0632\u0648\u0646', icon: Database },
                  { key: 'equipmentEnabled', label: '\u0627\u0644\u0645\u0639\u062f\u0627\u062a', icon: Sliders },
                  { key: 'trainingEnabled', label: '\u0627\u0644\u062a\u062f\u0631\u064a\u0628', icon: Eye },
                  { key: 'qualityEnabled', label: '\u0627\u0644\u062c\u0648\u062f\u0629', icon: Zap },
                  { key: 'incidentsEnabled', label: '\u0627\u0644\u062d\u0648\u0627\u062f\u062b', icon: AlertTriangle },
                  { key: 'emergencyEnabled', label: '\u0627\u0644\u0637\u0648\u0627\u0631\u0626', icon: Zap },
                  { key: 'auditLogsEnabled', label: '\u0633\u062c\u0644 \u0627\u0644\u0639\u0645\u0644\u064a\u0627\u062a', icon: Eye },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Label className="cursor-pointer">{label}</Label>
                    </div>
                    <Switch checked={features[key as keyof typeof features] as boolean} onCheckedChange={(c) => { setFeatures(p => ({...p, [key]: c})); markChanged() }} />
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
                  <div>
                    <Label>\u0627\u0644\u0645\u064a\u0632\u0627\u062a \u0627\u0644\u062a\u062c\u0631\u064a\u0628\u064a\u0629 (Beta)</Label>
                    <p className="text-xs text-muted-foreground">\u062a\u0641\u0639\u064a\u0644 \u0627\u0644\u0645\u064a\u0632\u0627\u062a \u0642\u064a\u062f \u0627\u0644\u062a\u0637\u0648\u064a\u0631</p>
                  </div>
                  <Switch checked={features.betaFeaturesEnabled} onCheckedChange={(c) => { setFeatures(p => ({...p, betaFeaturesEnabled: c})); markChanged() }} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                  <div>
                    <Label>\u0648\u0636\u0639 \u0627\u0644\u0635\u064a\u0627\u0646\u0629</Label>
                    <p className="text-xs text-muted-foreground">\u062a\u0639\u0637\u064a\u0644 \u0627\u0644\u0648\u0635\u0648\u0644 \u0644\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646</p>
                  </div>
                  <Switch checked={features.maintenanceMode} onCheckedChange={(c) => { setFeatures(p => ({...p, maintenanceMode: c})); markChanged() }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
