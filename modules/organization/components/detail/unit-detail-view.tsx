"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/modules/core/components/ui/badge";
import { Button } from "@/modules/core/components/ui/button";
import { Input } from "@/modules/core/components/ui/input";
import { Label } from "@/modules/core/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/modules/core/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/modules/core/components/ui/dropdown-menu";
import {
  Trash2,
  AlertTriangle,
  Plus,
  MoreHorizontal,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import type { OrgUnitNode, OrgUnitDetail } from "../../types";
import {
  useGetOrgDetail,
  useUpdateOrgDetail,
  useGetOrgTree,
  useDeleteOrgUnit,
} from "../../api/queries";
import { AddUnitDialog } from "./add-unit-dialog";
import { useEmployees } from "@/modules/employees/api/queries";
import { employeesQueryKeys } from "@/modules/employees/api/query-keys";
import { organizationQueryKeys } from "../../api/query-keys";

// Sub-components
import { UnitDetailHeader } from "./unit-detail-header";
import { ParentSelectionSection } from "./parent-selection-section";
import { ManagementTable } from "./management-table";
import { IncumbentsTable } from "./incumbents-table";

interface UnitDetailViewProps {
  node: OrgUnitNode;
}

export function UnitDetailView({ node }: UnitDetailViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: detail, isLoading } = useGetOrgDetail(node.id);
  const { data: treeData } = useGetOrgTree();
  const { data: employeesData } = useEmployees();
  const updateMutation = useUpdateOrgDetail();

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    parentId: "" as string | null,
    managerId: "" as string | null,
  });

  const [pendingEmployees, setPendingEmployees] = useState<any[]>([]);
  const [pendingRemovals, setPendingRemovals] = useState<Set<string>>(
    new Set(),
  );
  const [addChildOpen, setAddChildOpen] = useState(false);

  useEffect(() => {
    if (detail) {
      setEditForm({
        name: detail.name,
        parentId: detail.parent?.id || null,
        managerId: detail.manager?.id || null,
      });
      setPendingEmployees([]);
      setPendingRemovals(new Set());
    }
  }, [detail, isEditing]);

  // Helper selectors
  const typedDetail = detail as OrgUnitDetail;
  const existingEmployees = typedDetail?.employees || [];
  const manager = typedDetail?.manager;
  const parent = typedDetail?.parent;

  // Merge existing and pending employees for display, filtering out removals
  const allDisplayEmployees = useMemo(() => {
    const combined = [...existingEmployees].filter(
      (e) => !pendingRemovals.has(e.id),
    );
    pendingEmployees.forEach((pe) => {
      if (!combined.find((e) => e.id === pe.id)) {
        combined.push({
          ...pe,
          status: pe.status || "new",
          isPending: true,
        });
      }
    });
    return combined;
  }, [existingEmployees, pendingEmployees, pendingRemovals]);

  const handleSave = async () => {
    try {
      // 1. Prepare batch update data
      await updateMutation.mutateAsync({
        id: node.id,
        data: {
          ...editForm,
          employeeIds: pendingEmployees.map((emp) => emp.id),
          removalIds: Array.from(pendingRemovals),
        },
      });

      // 2. Cache Invalidation and Success
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.orgUnits.byId(node.id),
      });
      queryClient.invalidateQueries({
        queryKey: employeesQueryKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: organizationQueryKeys.tree.all(),
      });

      setIsEditing(false);
      setPendingEmployees([]);
      setPendingRemovals(new Set());
      toast.success("Organizational unit updated successfully");
    } catch (error) {
      toast.error("Failed to update organizational unit");
    }
  };

  const handleAddEmployeeSelected = (employeeId: string) => {
    const employee = employeesData?.data?.find((e) => e.id === employeeId);
    if (employee) {
      if (
        existingEmployees.find(
          (e) => e.id === employeeId && !pendingRemovals.has(e.id),
        ) ||
        pendingEmployees.find((e) => e.id === employeeId)
      ) {
        toast.info("Employee is already assigned to this unit");
        return;
      }

      // If was marked for removal, unmark it
      if (pendingRemovals.has(employeeId)) {
        const next = new Set(pendingRemovals);
        next.delete(employeeId);
        setPendingRemovals(next);
      } else {
        setPendingEmployees([...pendingEmployees, employee]);
      }
      setIsAddingEmployee(false);
    }
  };

  const removePendingEmployee = (id: string) => {
    setPendingEmployees(pendingEmployees.filter((e) => e.id !== id));
  };

  const handleRemoveExistingEmployee = (id: string) => {
    const next = new Set(pendingRemovals);
    next.add(id);
    setPendingRemovals(next);
  };

  const handleViewEmployee = (id: string) => {
    router.push(`/employees/${id}`);
  };

  const flattenTree = (nodes: any[]): any[] => {
    if (!nodes) return [];
    return nodes.reduce((acc, n) => {
      acc.push(n);
      if (n.children) {
        acc.push(...flattenTree(n.children));
      }
      return acc;
    }, []);
  };

  const allPossibleParents = treeData
    ? flattenTree(treeData).filter((u) => u.id !== node.id)
    : [];

  const formatEmployeeForTable = useCallback((emp: any) => {
    if (!emp) return null;
    return {
      id: emp.id,
      fullName: emp.fullName || `${emp.firstName} ${emp.lastName}`,
      email: emp.email || emp.user?.email || "",
      phone: emp.phone || emp.phoneNumber || undefined,
      positionTitle: emp.positionTitle || "Member",
    };
  }, []);

  const displayManager = useMemo(() => {
    if (editForm.managerId === null) return undefined;
    if (manager?.id === editForm.managerId) return manager;

    const found = employeesData?.data?.find((e) => e.id === editForm.managerId);
    return formatEmployeeForTable(found);
  }, [editForm.managerId, manager, employeesData, formatEmployeeForTable]);

  const getStatusBadge = useCallback((status: string, isPending?: boolean) => {
    if (isPending) {
      return (
        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          To Assign
        </Badge>
      );
    }
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            Filled
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            Hiring
          </Badge>
        );
      default:
        return <Badge variant="outline">Vacant</Badge>;
    }
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                               Delete Logic                                 */
  /* -------------------------------------------------------------------------- */
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const deleteMutation = useDeleteOrgUnit();

  // Recursively calculate statistics for the unit to be deleted
  const getImpactStats = useCallback(
    (targetNodeId: string) => {
      let unitCount = 0;
      // employeeCount is recursive in the tree data, so we can take the root node's employeeCount
      // However, we should verify if we need to sum it up manually or if the backend prop covers it.
      // Based on organization.service.ts, 'employeeCount' is recursive.
      let impactedEmployees = 0;

      const findAndTraverse = (nodes: OrgUnitNode[]): boolean => {
        for (const n of nodes) {
          if (n.id === targetNodeId) {
            // Found target, now count recursive units
            const countUnits = (subtree: OrgUnitNode) => {
              unitCount++;
              subtree.children?.forEach(countUnits);
            };
            countUnits(n);
            impactedEmployees = n.employeeCount;
            return true;
          }
          if (n.children && findAndTraverse(n.children)) return true;
        }
        return false;
      };

      if (treeData) {
        // treeData is array of roots
        findAndTraverse(treeData as unknown as OrgUnitNode[]);
      }

      return { unitCount, impactedEmployees };
    },
    [treeData],
  );

  const { unitCount, impactedEmployees } = useMemo(
    () => getImpactStats(node.id),
    [node.id, getImpactStats],
  );

  const handleDelete = async () => {
    if (deleteInput !== node.name) return;

    try {
      await deleteMutation.mutateAsync(node.id);
      toast.success("Unit deleted successfully");
      setDeleteDialogOpen(false);

      // Always redirect to the root "Welcome" screen after deletion
      router.push("/organization/org-units");
    } catch (error) {
      toast.error("Failed to delete unit");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                               Render Actions                               */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /*                               Render Actions                               */
  /* -------------------------------------------------------------------------- */
  /* -------------------------------------------------------------------------- */
  /*                               Render Actions                               */
  /* -------------------------------------------------------------------------- */

  const headerActions = (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setAddChildOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Child Unit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Unit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Unit
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-full space-y-6 animate-in slide-in-from-right-4 duration-300">
        <UnitDetailHeader
          name={isEditing ? editForm.name : typedDetail.name}
          isEditing={isEditing}
          isPending={updateMutation.isPending}
          onEdit={() => setIsEditing(true)}
          onCancel={() => setIsEditing(false)}
          onSave={handleSave}
          onNameChange={(name) => setEditForm({ ...editForm, name })}
          actions={headerActions}
        />

        {/* Controlled Dialogs */}
        <AddUnitDialog
          open={addChildOpen}
          onOpenChange={setAddChildOpen}
          preselectedParentId={node.id}
        />

        <ParentSelectionSection
          parent={parent}
          isEditing={isEditing}
          parentId={editForm.parentId}
          allPossibleParents={allPossibleParents}
          onParentChange={(id) => setEditForm({ ...editForm, parentId: id })}
        />

        {node.level > 0 && (
          <ManagementTable
            manager={displayManager as any}
            isEditing={isEditing}
            managerId={editForm.managerId}
            onManagerChange={(id) =>
              setEditForm({ ...editForm, managerId: id })
            }
            onViewEmployee={handleViewEmployee}
            onRemoveManager={() =>
              setEditForm({ ...editForm, managerId: null })
            }
          />
        )}

        <IncumbentsTable
          employees={allDisplayEmployees}
          isEditing={isEditing}
          isAddingEmployee={isAddingEmployee}
          onAddEmployeeSelected={handleAddEmployeeSelected}
          onRemovePendingEmployee={removePendingEmployee}
          onRemoveEmployee={handleRemoveExistingEmployee}
          onViewEmployee={handleViewEmployee}
          setIsAddingEmployee={setIsAddingEmployee}
          getStatusBadge={getStatusBadge}
        />
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Warning: Destructive Action
            </AlertDialogTitle>
            <AlertDialogDescription asChild className="space-y-3">
              <div className="text-muted-foreground text-sm space-y-3">
                <p>
                  This action cannot be undone. This will permanently delete the
                  unit <strong>{node.name}</strong>.
                </p>
                <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm font-medium">
                  This will remove {unitCount} units and unassign{" "}
                  {impactedEmployees} employees.
                </div>
                <p>
                  Please type <strong>{node.name}</strong> to confirm.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <Label htmlFor="confirm-name" className="sr-only">
              Confirmation Name
            </Label>
            <Input
              id="confirm-name"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Type unit name"
              className="w-full"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteInput("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteInput !== node.name || deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? "Deleting..."
                : "I understand, delete this unit"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
