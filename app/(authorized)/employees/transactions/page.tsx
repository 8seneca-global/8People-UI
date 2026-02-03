"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/modules/core/components/layout/page-header";
import { TransactionEmployeeList } from "@/modules/employees/components/transactions/transaction-employee-list";
import { TransactionTable } from "@/modules/employees/components/transactions/transaction-table";
import { TransactionDetailTabs } from "@/modules/employees/components/transactions/transaction-detail-tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/modules/core/components/ui/resizable";
import {
  mockTransactions,
  EmployeeTransaction,
} from "@/modules/employees/api/transactions-mock";
import { cn } from "@/lib/utils";
import { AlertCircle, User as UserIcon } from "lucide-react";

export default function TransactionsPage() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null,
  );
  const [selectedTransaction, setSelectedTransaction] =
    useState<EmployeeTransaction | null>(null);
  const [localTransactions, setLocalTransactions] =
    useState<Record<string, EmployeeTransaction[]>>(mockTransactions);

  const currentEmployeeTransactions = useMemo(() => {
    if (!selectedEmployeeId) return [];
    return (
      localTransactions[selectedEmployeeId] || localTransactions["1"] || []
    ); // Defaulting to "1" for demo
  }, [selectedEmployeeId, localTransactions]);

  const handleApprove = (id: string) => {
    if (!selectedEmployeeId) return;
    const employeeId = localTransactions[selectedEmployeeId]
      ? selectedEmployeeId
      : "1";
    const newTransactions = { ...localTransactions };
    newTransactions[employeeId] = newTransactions[employeeId].map((t) =>
      t.id === id ? { ...t, status: "Approved" as const, isActive: true } : t,
    );
    setLocalTransactions(newTransactions);

    // Update selected transaction as well
    if (selectedTransaction?.id === id) {
      setSelectedTransaction({
        ...selectedTransaction,
        status: "Approved",
        isActive: true,
      });
    }
  };

  const handleUpdate = (updatedTransaction: EmployeeTransaction) => {
    if (!selectedEmployeeId) return;
    const employeeId = localTransactions[selectedEmployeeId]
      ? selectedEmployeeId
      : "1";
    const newTransactions = { ...localTransactions };
    newTransactions[employeeId] = newTransactions[employeeId].map((t) =>
      t.id === updatedTransaction.id ? updatedTransaction : t,
    );
    setLocalTransactions(newTransactions);
    if (selectedTransaction?.id === updatedTransaction.id) {
      setSelectedTransaction(updatedTransaction);
    }
  };

  const handleToggleActive = (id: string, active: boolean) => {
    if (!selectedEmployeeId) return;
    const employeeId = localTransactions[selectedEmployeeId]
      ? selectedEmployeeId
      : "1";
    const newTransactions = { ...localTransactions };
    newTransactions[employeeId] = newTransactions[employeeId].map((t) => {
      if (t.id === id) return { ...t, isActive: active };
      if (active) return { ...t, isActive: false }; // Mutually exclusive
      return t;
    });
    setLocalTransactions(newTransactions);

    // Update selected if needed
    if (selectedTransaction?.id === id) {
      setSelectedTransaction({ ...selectedTransaction, isActive: active });
    } else if (active && selectedTransaction) {
      setSelectedTransaction({ ...selectedTransaction, isActive: false });
    }
  };

  const handleToggleRetro = (id: string, retro: boolean) => {
    if (!selectedEmployeeId) return;
    const employeeId = localTransactions[selectedEmployeeId]
      ? selectedEmployeeId
      : "1";
    const newTransactions = { ...localTransactions };
    newTransactions[employeeId] = newTransactions[employeeId].map((t) =>
      t.id === id ? { ...t, isRetroactive: retro } : t,
    );
    setLocalTransactions(newTransactions);
    if (selectedTransaction?.id === id) {
      setSelectedTransaction({ ...selectedTransaction, isRetroactive: retro });
    }
  };

  const handleDateChange = (
    id: string,
    field: "retroactiveFromDate" | "retroactiveToDate",
    value: string,
  ) => {
    if (!selectedEmployeeId) return;
    const employeeId = localTransactions[selectedEmployeeId]
      ? selectedEmployeeId
      : "1";
    const newTransactions = { ...localTransactions };
    newTransactions[employeeId] = newTransactions[employeeId].map((t) =>
      t.id === id ? { ...t, [field]: value } : t,
    );
    setLocalTransactions(newTransactions);
    if (selectedTransaction?.id === id) {
      setSelectedTransaction({ ...selectedTransaction, [field]: value });
    }
  };

  const handleConfirmAdd = (data: { action: string; reason: string }) => {
    if (!selectedEmployeeId) return;
    const employeeId = localTransactions[selectedEmployeeId]
      ? selectedEmployeeId
      : "1";

    // Find active transaction to clone
    const activeTx = localTransactions[employeeId]?.find((t) => t.isActive);

    const newTx: EmployeeTransaction = {
      id: `TR-${Math.floor(Math.random() * 10000)}`,
      action: data.action,
      reason: data.reason,
      status: "Pending",
      isActive: false,
      effectiveDate: new Date().toISOString().split("T")[0],
      isRetroactive: false,
      details: activeTx
        ? JSON.parse(JSON.stringify(activeTx.details))
        : {
            generalInfo: {
              employeeType: "FTE",
              serviceStartDate: "",
              workingTime: "Full time",
              employeeLevel: "",
              employeeBand: "",
              employeeCategory: "",
              employeeGroup: "",
              employeeSubGroup: "",
            },
            organizationJob: {
              jobTitle: "",
              orgStructure: [],
              directLineManager: "",
              functionalManager: "",
            },
            contractInfo: {
              category: "",
              contractNumber: "",
              startDate: "",
              endDate: "",
              duration: "",
              appendixNumber: "",
              signDate: "",
            },
            salaryInfo: {
              baseSalary: 0,
              currency: "VND",
              payCycle: "Monthly",
              allowances: [],
            },
          },
    };

    const newTransactions = { ...localTransactions };
    newTransactions[employeeId] = [
      newTx,
      ...(newTransactions[employeeId] || []),
    ];
    setLocalTransactions(newTransactions);
    setSelectedTransaction(newTx);
  };

  const handleDelete = (id: string) => {
    if (!selectedEmployeeId) return;
    const employeeId = localTransactions[selectedEmployeeId]
      ? selectedEmployeeId
      : "1";
    const newTransactions = { ...localTransactions };
    newTransactions[employeeId] = newTransactions[employeeId].filter(
      (t) => t.id !== id,
    );
    setLocalTransactions(newTransactions);
    if (selectedTransaction?.id === id) setSelectedTransaction(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-muted/5">
      <PageHeader
        title="Employee Transactions"
        subtitle="Review and manage workforce movements, salary changes, and promotions"
      />

      <main className="flex-1 flex overflow-hidden bg-muted/5">
        {/* Left Column: Employee Selection */}
        <div
          className={cn(
            "flex-col p-4 transition-all duration-300 overflow-hidden",
            selectedEmployeeId
              ? "hidden md:flex md:w-[340px] md:min-w-[340px] border-r border-border bg-muted/20"
              : "flex flex-1 max-w-full",
          )}
        >
          <TransactionEmployeeList
            selectedId={selectedEmployeeId}
            onSelect={(id) => {
              setSelectedEmployeeId(id);
              setSelectedTransaction(null);
            }}
          />
        </div>

        {/* Right Column: Transactions & Detail */}
        <div
          className={cn(
            "flex-1 h-full overflow-hidden bg-background flex flex-col",
            !selectedEmployeeId && "hidden",
          )}
        >
          {selectedEmployeeId ? (
            <div className="flex-1 overflow-hidden p-2 md:p-3 lg:p-4">
              <ResizablePanelGroup
                direction="vertical"
                className="h-full gap-2"
                id="transactions-detail-split-layout"
              >
                {/* Top: Transactions Table */}
                <ResizablePanel
                  defaultSize={40}
                  minSize={25}
                  id="transactions-table-panel"
                >
                  <TransactionTable
                    transactions={currentEmployeeTransactions}
                    selectedId={selectedTransaction?.id || null}
                    onSelect={setSelectedTransaction}
                    onApprove={handleApprove}
                    onEdit={handleUpdate}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                    onToggleRetro={handleToggleRetro}
                    onDateChange={handleDateChange}
                    onConfirmAdd={handleConfirmAdd}
                  />
                </ResizablePanel>

                <ResizableHandle className="bg-transparent h-0.5 hover:bg-primary/20 transition-colors" />

                {/* Bottom: Tabs Detail */}
                <ResizablePanel
                  defaultSize={60}
                  minSize={30}
                  id="transactions-tabs-panel"
                >
                  {selectedTransaction ? (
                    <TransactionDetailTabs
                      transaction={selectedTransaction}
                      onApprove={handleApprove}
                      onEdit={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-card border border-border/50 rounded-xl text-muted-foreground animate-pulse">
                      <div className="p-4 rounded-full bg-muted/30 mb-4">
                        <AlertCircle className="h-8 w-8 opacity-20" />
                      </div>
                      <p className="text-sm font-medium">
                        Select a transaction to view details
                      </p>
                    </div>
                  )}
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-card border border-border/50 rounded-xl text-muted-foreground">
              <div className="p-6 rounded-full bg-muted/20 mb-6">
                <UserIcon className="h-12 w-12 opacity-10" />
              </div>
              <h2 className="text-xl font-black text-foreground/40 tracking-tight mb-2">
                No Employee Selected
              </h2>
              <p className="text-sm max-w-[280px] text-center text-muted-foreground/60 leading-relaxed font-medium">
                Please select an employee from the list to view their
                transaction history and details.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
