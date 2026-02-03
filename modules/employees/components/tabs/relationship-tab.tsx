"use client";

import { useState } from "react";
import { DetailedEmployeeInfo } from "../../mock-details";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Edit2,
  Trash2,
  Plus,
  Save,
} from "lucide-react";
import { Badge } from "@/modules/core/components/ui/badge";
import { Button } from "@/modules/core/components/ui/button";
import { RelationshipModal } from "../relationship-modal";
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

interface RelationshipTabProps {
  info?: DetailedEmployeeInfo;
}

export function RelationshipTab({ info }: RelationshipTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [relationships, setRelationships] = useState<any[]>(
    info?.relationships || [],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRel, setEditingRel] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [relToId, setRelToId] = useState<string | null>(null);

  const handleAddRel = () => {
    setEditingRel(null);
    setIsModalOpen(true);
  };

  const handleEditRel = (rel: any) => {
    setEditingRel(rel);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (rel: any) => {
    setRelToId(rel.id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    setRelationships(relationships.filter((r) => r.id !== relToId));
    setIsDeleteDialogOpen(false);
    setRelToId(null);
  };

  const handleSaveRel = (rel: any) => {
    if (rel.id) {
      setRelationships(relationships.map((r) => (r.id === rel.id ? rel : r)));
    } else {
      const newRel = { ...rel, id: `rel-${Date.now()}` };
      setRelationships([...relationships, newRel]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Dependency/Relationship Section */}
      <section className="space-y-6">
        <div className="px-0 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Relationship Information
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[10px] gap-1.5 border-primary/20 text-primary hover:bg-primary/5 font-bold shadow-sm transition-all"
                onClick={handleAddRel}
              >
                <Plus className="h-3.5 w-3.5" />
                ADD RELATIONSHIP
              </Button>
            )}
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[10px] gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors font-bold"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="h-3.5 w-3.5" />
                EDIT
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[10px] hover:bg-muted font-bold text-muted-foreground transition-colors"
                  onClick={() => setIsEditing(false)}
                >
                  CANCEL
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 text-[10px] gap-1.5 font-bold shadow-sm transition-all"
                  onClick={() => setIsEditing(false)}
                >
                  <Save className="h-3.5 w-3.5" />
                  SAVE
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="p-0 pt-2">
          <div className="border border-border rounded-xl overflow-hidden shadow-sm bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[800px]">
                <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-6 py-3 border-b border-border">
                      Full Name
                    </th>
                    <th className="px-6 py-3 border-b border-border">
                      Relationship
                    </th>
                    <th className="px-6 py-3 border-b border-border">
                      Date of Birth
                    </th>
                    <th className="px-6 py-3 border-b border-border">
                      Occupation
                    </th>
                    <th className="px-6 py-3 border-b border-border">
                      Nationality
                    </th>
                    <th className="px-6 py-3 border-b border-border text-center">
                      Tax Dependency
                    </th>
                    <th className="px-6 py-3 border-b border-border">Period</th>
                    {isEditing && (
                      <th className="px-6 py-3 border-b border-border text-center">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {relationships.map((rel: any) => (
                    <tr
                      key={rel.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">
                          {rel.firstName} {rel.middleName} {rel.lastName}
                        </div>
                        {rel.jobTitle && (
                          <div className="text-[10px] text-muted-foreground font-medium tracking-tight mt-0.5">
                            {rel.jobTitle}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className="font-bold border-primary/10 px-2 shadow-sm"
                        >
                          {rel.relationship}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        {rel.dateOfBirth}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        {rel.occupation || "—"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        {rel.nationality}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {rel.taxDependency ? (
                            <div className="flex items-center gap-1.5 text-success bg-success/10 px-2 py-1 rounded-full border border-success/20">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-bold uppercase tracking-tight">
                                Active
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-muted-foreground/50 grayscale">
                              <ShieldAlert className="h-3.5 w-3.5" />
                              <span className="text-[10px] font-bold uppercase text-muted-foreground/70 tracking-tight">
                                None
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[11px] font-mono font-bold text-muted-foreground">
                        {rel.taxDependency ? (
                          <div className="bg-muted/50 px-2 py-1 rounded border border-border/50 inline-block">
                            {rel.taxStart} - {rel.taxEnd || "Current"}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      {isEditing && (
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              onClick={() => handleEditRel(rel)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={() => handleDeleteClick(rel)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {!relationships.length && (
                    <tr>
                      <td
                        colSpan={isEditing ? 8 : 7}
                        className="px-6 py-12 text-center text-muted-foreground italic"
                      >
                        No relationship information available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Modals and Dialogs */}
      <RelationshipModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        relationship={editingRel}
        onSave={handleSaveRel}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this relationship record. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>CANCEL</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              DELETE
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
