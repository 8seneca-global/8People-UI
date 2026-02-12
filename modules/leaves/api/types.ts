export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}


interface ApiEmployee {
    id: string,
    userId: string,
    code: string,
    fullName: string,
    firstName: string,
    lastName: string,
    personalEmail: string,
    companyEmail: string,
    phone: string,
    positionId: string,
    jobClassificationId: string,
    organizationalUnitId: string,
    costCenter: string,
    lineManagerId: string,
    matrixManagerId: string,
    status: string,
    startDate: string,
    endDate: string,
    fte: string,
    onboardingEmailSent: boolean,
    onboardingAccountActivated: boolean,
    onboardingProfileCompleted: boolean,
    createdAt: string,
    updatedAt: string,
    deletedAt: string
}

export interface LeaveType {
    id: string;
    name: string;
    description: string;
    defaultDays: number;
    carryForward: boolean;
    maxCarryForwardDays: number;
    color: string;
}

interface Approver {
    approverId: string;
    employee: ApiEmployee;
    status: string;
    comment?: string;
    respondedAt?: string;
}

export interface LeaveRequest {
    id: string,
    employeeId: string,
    leaveTypeId: string,
    startDate: string,
    endDate: string,
    totalDays: number,
    timeOfDay: string,
    reason: string,
    status: string,
    createdAt: string,
    updatedAt: string,
    employee: ApiEmployee,
    leaveType: LeaveType,
    approvers: Approver[],
    notes: string
}

export interface LeaveRequestInput {
    durationType: string,
    leaveTypeId: string,
    startDate: string,
    endDate: string,
    timeOfDay: string,
    status: string,
    reason?: string
}

interface YearLeaveBalance {
    year: number,
    unused: number,
    used: number,
    pending: number,
    carryForward: number,
    available: number,
    balance: number,
    totalEntitlement: number
}

export interface LeaveBalance {
    id: string,
    employeeId: string,
    leaveTypeId: string,
    totalEntitlement: number,
    used: number,
    pending: number,
    carryForward: number,
    available: number,
    prevYear: YearLeaveBalance | null,
    currentYear: YearLeaveBalance | null,
    employee: ApiEmployee,
    leaveType: LeaveType
}
