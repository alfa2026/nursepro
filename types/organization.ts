// ============================================
// PRO Nurse Enterprise - Organization & Hierarchy Types
// ============================================

// ============================================
// Organizational Unit (Department/Sub-Department/Team)
// ============================================

export type OrgUnitType = 'department' | 'sub_department' | 'team' | 'division' | 'section'

export interface OrgUnit {
  id: string
  name: string
  nameAr: string
  type: OrgUnitType
  parentId: string | null
  managerId?: string
  managerName?: string
  code: string
  category: 'medical' | 'administrative' | 'support' | 'executive'
  level: number
  path: string[] // breadcrumb of parent IDs
  staffCount: number
  isActive: boolean
  color?: string
  icon?: string
  description?: string
  descriptionAr?: string
  settings?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

// ============================================
// Employee Hierarchy & Position
// ============================================

export type HierarchyLevel =
  | 'executive'
  | 'director'
  | 'manager'
  | 'supervisor'
  | 'team_leader'
  | 'senior'
  | 'staff'
  | 'junior'
  | 'intern'
  | string

export interface EmployeePosition {
  id: string
  userId: string
  userName: string
  jobTitle: string
  jobTitleAr: string
  hierarchyLevel: HierarchyLevel
  orgUnitId: string
  orgUnitName: string
  directSupervisorId?: string
  directSupervisorName?: string
  departmentManagerId?: string
  departmentManagerName?: string
  reportingManagerId?: string
  reportingManagerName?: string
  approvalAuthority: number // 0-10, higher = more authority
  canApprove: string[] // list of approval types
  isActive: boolean
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

// ============================================
// Dynamic Role (Enhanced)
// ============================================

export interface DynamicRole {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  hierarchyLevel: HierarchyLevel
  departmentScope: 'global' | 'department' | 'team'
  allowedDepartments?: string[]
  permissions: DynamicPermission[]
  dashboardWidgets: string[]
  sidebarModules: string[]
  workflowPermissions: string[]
  approvalAuthority: number
  isActive: boolean
  isSystem: boolean
  color?: string
  icon?: string
  userCount: number
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface DynamicPermission {
  module: string
  actions: PermissionAction[]
  departmentRestriction?: 'own' | 'all' | string[]
  fieldRestrictions?: Record<string, 'read' | 'write' | 'hidden'>
}

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'export'
  | 'import'
  | 'manage'
  | 'assign'
  | 'schedule'
  | 'analytics'
  | 'configure'

// ============================================
// Approval Workflow
// ============================================

export type WorkflowType =
  | 'leave_request'
  | 'schedule_approval'
  | 'attendance_correction'
  | 'employee_onboarding'
  | 'department_request'
  | 'financial_approval'
  | 'equipment_request'
  | 'training_request'
  | 'overtime_approval'
  | 'shift_swap'
  | 'report_approval'
  | string

export type WorkflowStepType = 'approval' | 'notification' | 'auto_action' | 'condition'

export interface WorkflowDefinition {
  id: string
  name: string
  nameAr: string
  type: WorkflowType
  description: string
  descriptionAr: string
  isActive: boolean
  steps: WorkflowStep[]
  triggerConditions?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface WorkflowStep {
  id: string
  order: number
  name: string
  nameAr: string
  type: WorkflowStepType
  approverType: 'direct_supervisor' | 'department_manager' | 'specific_role' | 'specific_user' | 'hierarchy_level'
  approverId?: string
  approverRoleId?: string
  approverLevel?: HierarchyLevel
  requiredApprovals: number
  autoApproveAfterDays?: number
  escalateAfterDays?: number
  escalateTo?: string
  conditions?: Record<string, unknown>
  notifyOnComplete?: string[]
}

export interface WorkflowInstance {
  id: string
  workflowId: string
  workflowName: string
  type: WorkflowType
  requesterId: string
  requesterName: string
  requesterDepartment: string
  currentStep: number
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'cancelled' | 'escalated'
  data: Record<string, unknown>
  steps: WorkflowInstanceStep[]
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface WorkflowInstanceStep {
  stepId: string
  stepName: string
  status: 'pending' | 'approved' | 'rejected' | 'skipped' | 'escalated'
  assignedTo: string
  assignedToName: string
  actionAt?: string
  comment?: string
  actionBy?: string
  actionByName?: string
}

// ============================================
// Org Chart Node
// ============================================

export interface OrgChartNode {
  id: string
  name: string
  nameAr: string
  jobTitle: string
  jobTitleAr: string
  department: string
  avatar?: string
  level: HierarchyLevel
  children: OrgChartNode[]
  subordinateCount: number
  isExpanded?: boolean
}

// ============================================
// Feature Module Registration
// ============================================

export interface ModuleDefinition {
  id: string
  name: string
  nameAr: string
  icon: string
  path: string
  category: 'core' | 'medical' | 'administrative' | 'analytics' | 'system'
  requiredPermission: string
  isEnabled: boolean
  isBeta: boolean
  order: number
  parentModule?: string
  subModules?: string[]
  description?: string
  descriptionAr?: string
}

// ============================================
// Dashboard Widget Definition
// ============================================

export interface DashboardWidget {
  id: string
  name: string
  nameAr: string
  type: 'stat_card' | 'chart' | 'table' | 'feed' | 'calendar' | 'custom'
  category: string
  requiredPermission: string
  requiredRole?: string[]
  requiredDepartment?: string[]
  size: 'small' | 'medium' | 'large' | 'full'
  order: number
  isEnabled: boolean
  config?: Record<string, unknown>
}

// ============================================
// Collections
// ============================================

export const ORG_COLLECTIONS = {
  ORG_UNITS: 'orgUnits',
  POSITIONS: 'positions',
  DYNAMIC_ROLES: 'dynamicRoles',
  WORKFLOWS: 'workflows',
  WORKFLOW_INSTANCES: 'workflowInstances',
  MODULES: 'modules',
  WIDGETS: 'widgets',
} as const
