import {
  LayoutDashboard,
  FileText,
  Users,
  Building2,
  BarChart3,
  Settings,
  ClipboardList,
  Calendar,
  UserCog,
  Shield,
  History,
  Bed,
  AlertTriangle,
  UserCheck,
  Siren,
  ArrowLeftRight,
  FileWarning,
  Wrench,
  Package,
  Activity,
  GraduationCap,
  HeartPulse,
  ListTodo,
  MessageSquare,
  Phone,
  Clock,
  Award,
  Gauge,
  CalendarDays,
  Megaphone,
  BookOpen,
  Star,
  DollarSign,
  TableProperties,
  Contact,
  Archive,
  GitPullRequestArrow,
  Bell,
  UtensilsCrossed,
  UserX,
  ClipboardCheck,
  type LucideIcon,
} from 'lucide-react'
import { RolePermissions } from '@/types'

export interface NavItem {
  title: string
  titleAr: string
  href: string
  icon: LucideIcon
  permission?: keyof RolePermissions
  children?: NavItem[]
}

export interface NavGroup {
  title: string
  titleAr: string
  items: NavItem[]
}

export const navigationConfig: NavGroup[] = [
  {
    title: 'Overview',
    titleAr: 'نظرة عامة',
    items: [
      {
        title: 'Dashboard',
        titleAr: 'لوحة التحكم',
        href: '/dashboard',
        icon: LayoutDashboard,
        permission: 'canViewDashboard',
      },
      {
        title: 'Staff Portal',
        titleAr: 'بوابة الموظف',
        href: '/staff-portal',
        icon: UserCheck,
        permission: 'canViewDashboard',
      },
    ],
  },
  {
    title: 'HR Management',
    titleAr: 'الموارد البشرية',
    items: [
      {
        title: 'Employees',
        titleAr: 'الموظفون',
        href: '/employees',
        icon: Users,
        permission: 'canViewDashboard',
      },
      {
        title: 'Roster',
        titleAr: 'الروستر / المناوبات',
        href: '/roster',
        icon: TableProperties,
        permission: 'canViewDashboard',
      },
      {
        title: 'Payroll',
        titleAr: 'كشف الرواتب',
        href: '/payroll',
        icon: DollarSign,
        permission: 'canManageStaff',
      },
      {
        title: 'Vacations',
        titleAr: 'الإجازات',
        href: '/vacations',
        icon: CalendarDays,
        permission: 'canViewDashboard',
      },
      {
        title: 'Attendance',
        titleAr: 'الحضور والغياب',
        href: '/staff/attendance',
        icon: UserCheck,
        permission: 'canManageStaff',
      },
      {
        title: 'Overtime',
        titleAr: 'العمل الإضافي',
        href: '/staff/overtime',
        icon: Clock,
        permission: 'canManageStaff',
      },
      {
        title: 'Appraisals',
        titleAr: 'تقييم الأداء',
        href: '/appraisals',
        icon: Star,
        permission: 'canManageStaff',
      },
      {
        title: 'Monthly Roster',
        titleAr: 'الروستر الشهري',
        href: '/monthly-roster',
        icon: TableProperties,
        permission: 'canViewDashboard',
      },
      {
        title: 'Preferences',
        titleAr: 'رغبات الشيفت',
        href: '/preferences',
        icon: ClipboardCheck,
        permission: 'canViewDashboard',
      },
      {
        title: 'Leave & Absence',
        titleAr: 'الإجازات والغياب',
        href: '/leave-absence',
        icon: CalendarDays,
        permission: 'canViewDashboard',
      },
      {
        title: 'Absence Report',
        titleAr: 'تقرير الغياب',
        href: '/absence',
        icon: UserX,
        permission: 'canManageStaff',
      },
      {
        title: 'Meals',
        titleAr: 'إدارة الوجبات',
        href: '/meals',
        icon: UtensilsCrossed,
        permission: 'canViewDashboard',
      },
    ],
  },
  {
    title: 'Departments & Patients',
    titleAr: 'الأقسام والمرضى',
    items: [
      {
        title: 'Departments',
        titleAr: 'الأقسام',
        href: '/departments',
        icon: Building2,
        permission: 'canViewDashboard',
      },
      {
        title: 'Bed Management',
        titleAr: 'إدارة الأسرة',
        href: '/departments/beds',
        icon: Bed,
        permission: 'canManageDepartments',
      },
      {
        title: 'Isolation Cases',
        titleAr: 'حالات العزل',
        href: '/departments/isolation',
        icon: AlertTriangle,
        permission: 'canViewDashboard',
      },
    ],
  },
  {
    title: 'Emergency',
    titleAr: 'الطوارئ',
    items: [
      {
        title: 'Emergency Codes',
        titleAr: 'أكواد الطوارئ',
        href: '/emergency',
        icon: Siren,
        permission: 'canViewDashboard',
      },
      {
        title: 'Quick Response',
        titleAr: 'الاستجابة السريعة',
        href: '/emergency/response',
        icon: Phone,
        permission: 'canViewDashboard',
      },
    ],
  },
  {
    title: 'Patient Care',
    titleAr: 'رعاية المرضى',
    items: [
      {
        title: 'Handover (SBAR)',
        titleAr: 'تسليم المناوبة',
        href: '/handover',
        icon: ArrowLeftRight,
        permission: 'canViewDashboard',
      },
      {
        title: 'Early Warning Score',
        titleAr: 'نظام الإنذار المبكر',
        href: '/ews',
        icon: Gauge,
        permission: 'canViewDashboard',
      },
      {
        title: 'Vital Signs',
        titleAr: 'العلامات الحيوية',
        href: '/vitals',
        icon: HeartPulse,
        permission: 'canViewDashboard',
      },
      {
        title: 'Tasks',
        titleAr: 'المهام',
        href: '/tasks',
        icon: ListTodo,
        permission: 'canViewDashboard',
      },
    ],
  },
  {
    title: 'Safety & Quality',
    titleAr: 'السلامة والجودة',
    items: [
      {
        title: 'Incident Reports',
        titleAr: 'تقارير الحوادث',
        href: '/incidents',
        icon: FileWarning,
        permission: 'canViewDashboard',
      },
      {
        title: 'Quality Indicators',
        titleAr: 'مؤشرات الجودة',
        href: '/quality',
        icon: Activity,
        permission: 'canViewAnalytics',
      },
    ],
  },
  {
    title: 'Communication',
    titleAr: 'التواصل والمعلومات',
    items: [
      {
        title: 'Announcements',
        titleAr: 'الإعلانات',
        href: '/announcements',
        icon: Megaphone,
        permission: 'canViewDashboard',
      },
      {
        title: 'Messages',
        titleAr: 'الرسائل',
        href: '/messages',
        icon: MessageSquare,
        permission: 'canViewDashboard',
      },
      {
        title: 'Policies',
        titleAr: 'السياسات والإجراءات',
        href: '/policies',
        icon: BookOpen,
        permission: 'canViewDashboard',
      },
      {
        title: 'Contact Hub',
        titleAr: 'دليل الاتصالات',
        href: '/contact',
        icon: Contact,
        permission: 'canViewDashboard',
      },
      {
        title: 'Notifications',
        titleAr: 'الإشعارات',
        href: '/notifications',
        icon: Bell,
        permission: 'canViewDashboard',
      },
    ],
  },
  {
    title: 'Resources',
    titleAr: 'الموارد والتدريب',
    items: [
      {
        title: 'Training',
        titleAr: 'التدريب',
        href: '/training',
        icon: GraduationCap,
        permission: 'canViewDashboard',
      },
      {
        title: 'Equipment',
        titleAr: 'المعدات',
        href: '/equipment',
        icon: Wrench,
        permission: 'canManageDepartments',
      },
      {
        title: 'Inventory',
        titleAr: 'المخزون',
        href: '/inventory',
        icon: Package,
        permission: 'canManageDepartments',
      },
      {
        title: 'Maintenance',
        titleAr: 'طلبات الصيانة',
        href: '/maintenance',
        icon: Settings,
        permission: 'canViewDashboard',
      },
    ],
  },
  {
    title: 'Reports & Analytics',
    titleAr: 'التقارير والتحليلات',
    items: [
      {
        title: 'Create Report',
        titleAr: 'إنشاء تقرير',
        href: '/reports/create',
        icon: ClipboardList,
        permission: 'canCreateReports',
      },
      {
        title: 'Reports Archive',
        titleAr: 'أرشيف التقارير',
        href: '/reports',
        icon: FileText,
        permission: 'canViewDashboard',
      },
      {
        title: 'Analytics',
        titleAr: 'التحليلات',
        href: '/analytics',
        icon: BarChart3,
        permission: 'canViewAnalytics',
      },
    ],
  },
  {
    title: 'Workflows',
    titleAr: 'الطلبات والموافقات',
    items: [
      {
        title: 'Workflows & Approvals',
        titleAr: 'الطلبات والموافقات',
        href: '/workflows',
        icon: GitPullRequestArrow,
        permission: 'canViewDashboard',
      },
      {
        title: 'Archive',
        titleAr: 'الأرشيف',
        href: '/archive',
        icon: Archive,
        permission: 'canViewDashboard',
      },
    ],
  },
  {
    title: 'Administration',
    titleAr: 'الإدارة والنظام',
    items: [
      {
        title: 'User Management',
        titleAr: 'إدارة المستخدمين',
        href: '/admin/users',
        icon: UserCog,
        permission: 'canManageUsers',
      },
      {
        title: 'Roles & Permissions',
        titleAr: 'الصلاحيات',
        href: '/admin/roles',
        icon: Shield,
        permission: 'canManageRoles',
      },
      {
        title: 'Audit Logs',
        titleAr: 'سجل العمليات',
        href: '/admin/logs',
        icon: History,
        permission: 'canViewAuditLogs',
      },
      {
        title: 'Settings',
        titleAr: 'إعدادات النظام',
        href: '/admin/settings',
        icon: Settings,
        permission: 'canManageUsers',
      },
    ],
  },
]
