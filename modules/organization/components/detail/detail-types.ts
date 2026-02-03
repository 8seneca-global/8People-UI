import { OrgUnitDetail, OrgUnitNode } from "../../types";

export interface UnitDetailHeaderProps {
  name: string;
  isEditing: boolean;
  isPending: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onNameChange: (name: string) => void;
  actions?: React.ReactNode;
}

export interface ParentSelectionSectionProps {
  parent?: OrgUnitDetail["parent"];
  isEditing: boolean;
  parentId: string | null;
  allPossibleParents: any[];
  onParentChange: (id: string | null) => void;
}

export interface ManagementTableProps {
  manager?: OrgUnitDetail["manager"];
  isEditing: boolean;
  managerId: string | null;
  onManagerChange: (id: string) => void;
  onViewEmployee: (id: string) => void;
  onRemoveManager: () => void;
}

export interface IncumbentsTableProps {
  employees: any[];
  isEditing: boolean;
  isAddingEmployee: boolean;
  onAddEmployeeSelected: (id: string) => void;
  onRemovePendingEmployee: (id: string) => void;
  onRemoveEmployee: (id: string) => void;
  onViewEmployee: (id: string) => void;
  setIsAddingEmployee: (val: boolean) => void;
  getStatusBadge: (status: string, isPending?: boolean) => React.ReactNode;
}
