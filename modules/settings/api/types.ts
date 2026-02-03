
export interface NavigationModule {
  id: string;
  name: string;
  label: string;
  urlPath?: string;
  bePath?: string;
  icon?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
  children?: NavigationModule[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: RoleModulePermission[];
  userRoles: any[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleModulePermission {
  id: string;
  roleId: string;
  moduleId: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  module: {
    id: string;
    name: string;
    label: string;
  };
}

export interface Endpoint {
  method: string;
  path: string;
  group: string;
}

