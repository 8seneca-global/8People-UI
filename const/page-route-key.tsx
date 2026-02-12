export const PageRouteKey = {
  home: () => "/" as const,
  login: () => "/login" as const,
  dashboard: () => "/dashboard" as const,
  myProfile: () => "/my-profile" as const,
  notifications: () => "/notifications" as const,
  settings: () => "/settings" as const,
  attendance: {
    root: () => "/attendance" as const,
    records: () => "/attendance/records" as const,
    reports: () => "/attendance/reports" as const,
  },
  colleagues: () => "/colleagues" as const,
  employees: {
    root: () => "/employees" as const,
    transactions: () => "/employees/transactions" as const,
  },
  leave: {
    root: () => "/leave" as const,
    balances: () => "/leave/balances" as const,
    calendar: () => "/leave/calendar" as const,
    myRequests: () => "/leave/my-requests" as const,
    requests: () => "/leave/requests" as const,
  },
  onboarding: () => "/onboarding" as const,
  organization: {
    root: () => "/organization" as const,
    jobs: () => "/organization/jobs" as const,
    orgUnits: () => "/organization/org-units" as const,
    positions: () => "/organization/positions" as const,
  },
  recruitment: {
    candidates: () => "/recruitment/candidates" as const,
    interviews: () => "/recruitment/interviews" as const,
    jobs: () => "/recruitment/jobs" as const,
    pool: () => "/recruitment/pool" as const,
  },
};
