'use client'

import {
  createDocument,
  createDocumentWithId,
  getDocument,
  getDocuments,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  batchUpdate,
  where,
  orderBy,
  limit,
} from './firebase-services'
import { ORG_COLLECTIONS } from '@/types/organization'
import type {
  OrgUnit,
  EmployeePosition,
  DynamicRole,
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowInstanceStep,
  ModuleDefinition,
} from '@/types/organization'

// ============================================
// Org Unit Operations
// ============================================

export async function createOrgUnit(data: Omit<OrgUnit, 'id'>): Promise<string> {
  return createDocument(ORG_COLLECTIONS.ORG_UNITS, data)
}

export async function getOrgUnit(id: string): Promise<OrgUnit | null> {
  return getDocument<OrgUnit>(ORG_COLLECTIONS.ORG_UNITS, id)
}

export async function getOrgUnits(parentId?: string | null): Promise<OrgUnit[]> {
  const constraints = parentId !== undefined
    ? [where('parentId', '==', parentId), orderBy('name')]
    : [orderBy('level'), orderBy('name')]
  return getDocuments<OrgUnit>(ORG_COLLECTIONS.ORG_UNITS, constraints)
}

export async function updateOrgUnit(id: string, data: Partial<OrgUnit>): Promise<void> {
  return updateDocument(ORG_COLLECTIONS.ORG_UNITS, id, data)
}

export async function deleteOrgUnit(id: string): Promise<void> {
  return deleteDocument(ORG_COLLECTIONS.ORG_UNITS, id)
}

export function subscribeToOrgUnits(
  callback: (units: OrgUnit[]) => void
) {
  return subscribeToCollection<OrgUnit>(
    ORG_COLLECTIONS.ORG_UNITS,
    [orderBy('level'), orderBy('name')],
    callback
  )
}

// ============================================
// Position Operations
// ============================================

export async function createPosition(data: Omit<EmployeePosition, 'id'>): Promise<string> {
  return createDocument(ORG_COLLECTIONS.POSITIONS, data)
}

export async function getPositionByUser(userId: string): Promise<EmployeePosition | null> {
  const positions = await getDocuments<EmployeePosition>(ORG_COLLECTIONS.POSITIONS, [
    where('userId', '==', userId),
    where('isActive', '==', true),
    limit(1),
  ])
  return positions[0] || null
}

export async function getPositionsByOrgUnit(orgUnitId: string): Promise<EmployeePosition[]> {
  return getDocuments<EmployeePosition>(ORG_COLLECTIONS.POSITIONS, [
    where('orgUnitId', '==', orgUnitId),
    where('isActive', '==', true),
  ])
}

export async function getSubordinates(supervisorId: string): Promise<EmployeePosition[]> {
  return getDocuments<EmployeePosition>(ORG_COLLECTIONS.POSITIONS, [
    where('directSupervisorId', '==', supervisorId),
    where('isActive', '==', true),
  ])
}

export async function updatePosition(id: string, data: Partial<EmployeePosition>): Promise<void> {
  return updateDocument(ORG_COLLECTIONS.POSITIONS, id, data)
}

// ============================================
// Dynamic Role Operations
// ============================================

export async function createDynamicRole(data: Omit<DynamicRole, 'id'>): Promise<string> {
  return createDocument(ORG_COLLECTIONS.DYNAMIC_ROLES, data)
}

export async function getDynamicRoles(): Promise<DynamicRole[]> {
  return getDocuments<DynamicRole>(ORG_COLLECTIONS.DYNAMIC_ROLES, [orderBy('hierarchyLevel')])
}

export async function getDynamicRole(id: string): Promise<DynamicRole | null> {
  return getDocument<DynamicRole>(ORG_COLLECTIONS.DYNAMIC_ROLES, id)
}

export async function updateDynamicRole(id: string, data: Partial<DynamicRole>): Promise<void> {
  return updateDocument(ORG_COLLECTIONS.DYNAMIC_ROLES, id, data)
}

export async function deleteDynamicRole(id: string): Promise<void> {
  return deleteDocument(ORG_COLLECTIONS.DYNAMIC_ROLES, id)
}

export function subscribeToDynamicRoles(callback: (roles: DynamicRole[]) => void) {
  return subscribeToCollection<DynamicRole>(
    ORG_COLLECTIONS.DYNAMIC_ROLES,
    [orderBy('name')],
    callback
  )
}

// ============================================
// Workflow Operations
// ============================================

export async function createWorkflow(data: Omit<WorkflowDefinition, 'id'>): Promise<string> {
  return createDocument(ORG_COLLECTIONS.WORKFLOWS, data)
}

export async function getWorkflows(): Promise<WorkflowDefinition[]> {
  return getDocuments<WorkflowDefinition>(ORG_COLLECTIONS.WORKFLOWS, [orderBy('name')])
}

export async function getWorkflow(id: string): Promise<WorkflowDefinition | null> {
  return getDocument<WorkflowDefinition>(ORG_COLLECTIONS.WORKFLOWS, id)
}

export async function updateWorkflow(id: string, data: Partial<WorkflowDefinition>): Promise<void> {
  return updateDocument(ORG_COLLECTIONS.WORKFLOWS, id, data)
}

export async function deleteWorkflow(id: string): Promise<void> {
  return deleteDocument(ORG_COLLECTIONS.WORKFLOWS, id)
}

export function subscribeToWorkflows(callback: (workflows: WorkflowDefinition[]) => void) {
  return subscribeToCollection<WorkflowDefinition>(
    ORG_COLLECTIONS.WORKFLOWS,
    [orderBy('name')],
    callback
  )
}

// ============================================
// Workflow Instance Operations
// ============================================

export async function createWorkflowInstance(data: Omit<WorkflowInstance, 'id'>): Promise<string> {
  return createDocument(ORG_COLLECTIONS.WORKFLOW_INSTANCES, data)
}

export async function getWorkflowInstances(filters?: {
  requesterId?: string
  status?: string
  type?: string
}): Promise<WorkflowInstance[]> {
  const constraints = []
  if (filters?.requesterId) constraints.push(where('requesterId', '==', filters.requesterId))
  if (filters?.status) constraints.push(where('status', '==', filters.status))
  if (filters?.type) constraints.push(where('type', '==', filters.type))
  constraints.push(orderBy('createdAt', 'desc'))
  return getDocuments<WorkflowInstance>(ORG_COLLECTIONS.WORKFLOW_INSTANCES, constraints)
}

export async function getPendingApprovals(userId: string): Promise<WorkflowInstance[]> {
  return getDocuments<WorkflowInstance>(ORG_COLLECTIONS.WORKFLOW_INSTANCES, [
    where('status', 'in', ['pending', 'in_progress']),
    orderBy('createdAt', 'desc'),
  ])
}

export async function updateWorkflowInstance(id: string, data: Partial<WorkflowInstance>): Promise<void> {
  return updateDocument(ORG_COLLECTIONS.WORKFLOW_INSTANCES, id, data)
}

export async function approveWorkflowStep(
  instanceId: string,
  stepId: string,
  userId: string,
  userName: string,
  comment?: string
): Promise<void> {
  const instance = await getDocument<WorkflowInstance>(ORG_COLLECTIONS.WORKFLOW_INSTANCES, instanceId)
  if (!instance) throw new Error('Workflow instance not found')

  const updatedSteps = instance.steps.map((step: WorkflowInstanceStep) => {
    if (step.stepId === stepId) {
      return {
        ...step,
        status: 'approved' as const,
        actionAt: new Date().toISOString(),
        actionBy: userId,
        actionByName: userName,
        comment,
      }
    }
    return step
  })

  const nextStep = instance.currentStep + 1
  const isComplete = nextStep >= instance.steps.length

  await updateDocument(ORG_COLLECTIONS.WORKFLOW_INSTANCES, instanceId, {
    steps: updatedSteps,
    currentStep: isComplete ? instance.currentStep : nextStep,
    status: isComplete ? 'approved' : 'in_progress',
    completedAt: isComplete ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  })
}

export async function rejectWorkflowStep(
  instanceId: string,
  stepId: string,
  userId: string,
  userName: string,
  comment?: string
): Promise<void> {
  const instance = await getDocument<WorkflowInstance>(ORG_COLLECTIONS.WORKFLOW_INSTANCES, instanceId)
  if (!instance) throw new Error('Workflow instance not found')

  const updatedSteps = instance.steps.map((step: WorkflowInstanceStep) => {
    if (step.stepId === stepId) {
      return {
        ...step,
        status: 'rejected' as const,
        actionAt: new Date().toISOString(),
        actionBy: userId,
        actionByName: userName,
        comment,
      }
    }
    return step
  })

  await updateDocument(ORG_COLLECTIONS.WORKFLOW_INSTANCES, instanceId, {
    steps: updatedSteps,
    status: 'rejected',
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}

// ============================================
// Module Operations
// ============================================

export async function getModules(): Promise<ModuleDefinition[]> {
  return getDocuments<ModuleDefinition>(ORG_COLLECTIONS.MODULES, [orderBy('order')])
}

export async function updateModule(id: string, data: Partial<ModuleDefinition>): Promise<void> {
  return updateDocument(ORG_COLLECTIONS.MODULES, id, data)
}

export function subscribeToModules(callback: (modules: ModuleDefinition[]) => void) {
  return subscribeToCollection<ModuleDefinition>(
    ORG_COLLECTIONS.MODULES,
    [orderBy('order')],
    callback
  )
}
