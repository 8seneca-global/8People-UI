"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/core/components/ui/table";
import { Badge } from "@/modules/core/components/ui/badge";
import { Checkbox } from "@/modules/core/components/ui/checkbox";
import { Button } from "@/modules/core/components/ui/button";
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
  Info,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  Check,
  X,
  Plus,
} from "lucide-react";
import {
  EmployeeTransaction,
  ACTION_REASONS,
} from "../../api/transactions-mock";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/core/components/ui/select";

interface TransactionTableProps {
  transactions: EmployeeTransaction[];
  selectedId: string | null;
  onSelect: (transaction: EmployeeTransaction) => void;
  onApprove: (id: string) => void;
  onEdit: (transaction: EmployeeTransaction) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onToggleRetro: (id: string, retro: boolean) => void;
  onDateChange: (
    id: string,
    field: "retroactiveFromDate" | "retroactiveToDate",
    value: string,
  ) => void;
  onConfirmAdd: (data: { action: string; reason: string }) => void;
}

export function TransactionTable({
  transactions,
  selectedId,
  onSelect,
  onApprove,
  onEdit,
  onDelete,
  onToggleActive,
  onToggleRetro,
  onDateChange,
  onConfirmAdd,
}: TransactionTableProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newAction, setNewAction] = useState("");
  const [newReason, setNewReason] = useState("");
  const [confirmingActiveId, setConfirmingActiveId] = useState<string | null>(
    null,
  );

  const handleConfirm = () => {
    if (newAction && newReason) {
      onConfirmAdd({ action: newAction, reason: newReason });
      setIsAdding(false);
      setNewAction("");
      setNewReason("");
    }
  };

  const onActiveChange = (id: string, checked: boolean) => {
    if (!checked) return; // Disallow manual uncheck
    setConfirmingActiveId(id);
  };

  const confirmActive = () => {
    if (confirmingActiveId) {
      onToggleActive(confirmingActiveId, true);
      setConfirmingActiveId(null);
    }
  };

  const actions = Object.keys(ACTION_REASONS);
  const reasons = newAction ? ACTION_REASONS[newAction] : [];
  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-card shadow-sm h-full flex flex-col">
      <AlertDialog
        open={confirmingActiveId !== null}
        onOpenChange={(open) => !open && setConfirmingActiveId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Active Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will change core employee data to match this transaction's
              history. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmActive}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-card px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight text-foreground">
          Transaction History
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 text-[10px] gap-1.5 transition-colors font-bold",
            isAdding
              ? "text-muted-foreground cursor-not-allowed"
              : "hover:bg-primary/10 hover:text-primary",
          )}
          onClick={() => !isAdding && setIsAdding(true)}
          disabled={isAdding}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Transaction
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <Table className="text-sm">
          <TableHeader className="bg-muted/30 sticky top-0 z-10">
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="px-4 py-3 text-muted-foreground">
                Action
              </TableHead>
              <TableHead className="px-4 py-3 text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="px-4 py-3 text-muted-foreground text-center">
                Active
              </TableHead>
              <TableHead className="px-4 py-3 text-muted-foreground">
                Effective Date
              </TableHead>
              <TableHead className="px-4 py-3 text-muted-foreground text-center">
                Retroactive
              </TableHead>
              <TableHead className="px-4 py-3 text-muted-foreground">
                Retroactive From
              </TableHead>
              <TableHead className="px-4 py-3 text-muted-foreground">
                Retroactive To
              </TableHead>
              <TableHead className="px-4 py-3 text-muted-foreground">
                Reason
              </TableHead>
              <TableHead className="px-4 py-3 text-muted-foreground text-center w-12">
                View
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isAdding && (
              <TableRow className="bg-primary/5 border-primary/20 border-b-2">
                <TableCell className="px-4 py-3">
                  <Select
                    value={newAction}
                    onValueChange={(val) => {
                      setNewAction(val);
                      setNewReason("");
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background border-primary/30">
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map((action) => (
                        <SelectItem
                          key={action}
                          value={action}
                          className="text-xs"
                        >
                          {action}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge className="text-[10px] h-5 font-bold px-2 bg-muted text-muted-foreground border-transparent">
                    Draft
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <Checkbox disabled className="opacity-50" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">—</span>
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <Checkbox disabled className="opacity-50" />
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">—</span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <span className="text-xs text-muted-foreground">—</span>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Select
                    value={newReason}
                    onValueChange={setNewReason}
                    disabled={!newAction}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background border-primary/30">
                      <SelectValue placeholder="Reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {reasons.map((reason) => (
                        <SelectItem
                          key={reason}
                          value={reason}
                          className="text-xs"
                        >
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-success hover:bg-success/10"
                      onClick={handleConfirm}
                      disabled={!newAction || !newReason}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => setIsAdding(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {transactions.map((t) => (
              <TableRow
                key={t.id}
                className={cn(
                  "border-border transition-colors group",
                  selectedId === t.id
                    ? "bg-primary/10 hover:bg-primary/15"
                    : "hover:bg-secondary/50",
                )}
              >
                <TableCell className="px-4 py-3 font-semibold text-card-foreground whitespace-nowrap">
                  {t.action}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] h-5 font-bold px-2",
                      t.status === "Approved"
                        ? "bg-success/20 text-success border-success/30 hover:bg-success/30"
                        : t.status === "Pending"
                          ? "bg-warning/20 text-warning border-warning/30 hover:bg-warning/30"
                          : "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30",
                    )}
                  >
                    {t.status}
                  </Badge>
                </TableCell>
                <TableCell
                  className="px-4 py-3 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={t.isActive}
                    onCheckedChange={(checked: boolean | "indeterminate") =>
                      onActiveChange(t.id, checked === true)
                    }
                    disabled={t.status === "Pending" || t.isActive}
                    className={cn(
                      "border-border/60",
                      t.isActive && "opacity-100 cursor-not-allowed",
                    )}
                  />
                </TableCell>
                <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {t.effectiveDate}
                </TableCell>
                <TableCell
                  className="px-4 py-3 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={t.isRetroactive}
                    onCheckedChange={(checked: boolean | "indeterminate") =>
                      onToggleRetro(t.id, checked === true)
                    }
                    className="border-border/60"
                  />
                </TableCell>
                <TableCell
                  className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t.isRetroactive ? (
                    <input
                      type="datetime-local"
                      value={t.retroactiveFromDate?.replace(" ", "T") || ""}
                      onChange={(e) =>
                        onDateChange(
                          t.id,
                          "retroactiveFromDate",
                          e.target.value.replace("T", " "),
                        )
                      }
                      className="bg-background border border-border/50 rounded px-2 py-1 text-[10px] w-full max-w-[140px] focus:outline-primary/30"
                    />
                  ) : (
                    " — "
                  )}
                </TableCell>
                <TableCell
                  className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  {t.isRetroactive ? (
                    <input
                      type="datetime-local"
                      value={t.retroactiveToDate?.replace(" ", "T") || ""}
                      onChange={(e) =>
                        onDateChange(
                          t.id,
                          "retroactiveToDate",
                          e.target.value.replace("T", " "),
                        )
                      }
                      className="bg-background border border-border/50 rounded px-2 py-1 text-[10px] w-full max-w-[140px] focus:outline-primary/30"
                    />
                  ) : (
                    " — "
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 text-muted-foreground truncate max-w-[240px]">
                  {t.reason || "—"}
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 transition-all",
                      selectedId === t.id
                        ? "text-primary bg-primary/20"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                    )}
                    onClick={() => onSelect(t)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
