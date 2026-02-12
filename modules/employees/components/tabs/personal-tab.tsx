"use client";

import { useState } from "react";
import { Badge } from "@/modules/core/components/ui/badge";
import { DetailedEmployeeInfo } from "../../mock-details";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  UserPlus,
  ShieldCheck,
  Edit2,
  Save,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/modules/core/components/ui/button";
import { Input } from "@/modules/core/components/ui/input";
import { EmergencyContactModal } from "../emergency-contact-modal";
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

interface PersonalTabProps {
  info?: DetailedEmployeeInfo;
}

export function PersonalTab({ info }: PersonalTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [contacts, setContacts] = useState<any[]>(
    info?.emergencyContacts || [],
  );
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contactToDeleteIndex, setContactToDeleteIndex] = useState<
    number | null
  >(null);

  const handleAddContact = () => {
    setEditingContact(null);
    setEditingIndex(null);
    setIsContactModalOpen(true);
  };

  const handleEditContact = (contact: any, index: number) => {
    setEditingContact(contact);
    setEditingIndex(index);
    setIsContactModalOpen(true);
  };

  const handleDeleteClick = (index: number) => {
    setContactToDeleteIndex(index);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contactToDeleteIndex !== null) {
      const newContacts = [...contacts];
      newContacts.splice(contactToDeleteIndex, 1);
      setContacts(newContacts);
    }
    setIsDeleteDialogOpen(false);
    setContactToDeleteIndex(null);
  };

  const handleSaveContact = (contact: any) => {
    if (editingIndex !== null) {
      const newContacts = [...contacts];
      newContacts[editingIndex] = contact;
      setContacts(newContacts);
    } else {
      setContacts([...contacts, contact]);
    }
    setIsContactModalOpen(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-12">
      {/* Global Tab Edit Button */}
      <div className="flex justify-end sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2 px-1 border-b border-border/50 mb-4">
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors font-bold"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-3.5 w-3.5" />
            EDIT PERSONAL INFO
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
              SAVE CHANGES
            </Button>
          </div>
        )}
      </div>

      {/* Personal Details Section */}
      <section className="space-y-6">
        <div className="px-0 py-2 border-b border-border">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Personal Details
          </h3>
        </div>
        <div className="p-0 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8">
            <DetailField
              label="Date of Birth"
              value={info?.dateOfBirth || "—"}
              isEditable={isEditing}
            />
            <DetailField
              label="Place of Birth"
              value={info?.placeOfBirth || "—"}
              isEditable={isEditing}
            />
            <DetailField
              label="Nationality (*)"
              value={info?.nationality || "—"}
              isEditable={isEditing}
            />
            <DetailField
              label="Blood Group"
              value={info?.bloodGroup || "—"}
              isEditable={isEditing}
            />
            <DetailField
              label="Religion"
              value={info?.religion || "—"}
              isEditable={isEditing}
            />
            <DetailField
              label="Gender"
              value={info?.gender || "—"}
              isEditable={isEditing}
            />
            <DetailField
              label="Race"
              value={info?.race || "—"}
              isEditable={isEditing}
            />
            <DetailField
              label="Mother Language"
              value={info?.motherLanguage || "—"}
              isEditable={isEditing}
            />
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-success" />
                Payslip Password
              </label>
              <div className="bg-secondary/30 border border-border/50 rounded px-3 py-1.5 text-sm font-mono text-muted-foreground flex items-center justify-between">
                <span>****************</span>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px] px-2 h-5 hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    Show
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Communication Section */}
      <section className="space-y-6">
        <div className="px-0 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Communication
            </h3>
          </div>
        </div>
        <div className="p-0 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-x-12 gap-y-6">
            <DetailField
              label="Mobile Phone 1 (*)"
              value={info?.mobilePhone1 || "—"}
              icon={<Phone className="h-3 w-3" />}
              isEditable={isEditing}
            />
            <DetailField
              label="Mobile Phone 2"
              value={info?.mobilePhone2 || "—"}
              icon={<Phone className="h-3 w-3" />}
              isEditable={isEditing}
            />
            <DetailField
              label="Home Phone 1"
              value={info?.homePhone1 || "—"}
              icon={<Phone className="h-3 w-3" />}
              isEditable={isEditing}
            />
            <DetailField
              label="Home Phone 2"
              value={info?.homePhone2 || "—"}
              icon={<Phone className="h-3 w-3" />}
              isEditable={isEditing}
            />
            <DetailField
              label="Company Phone"
              value={info?.companyPhone || "—"}
              icon={<Phone className="h-3 w-3" />}
              isEditable={isEditing}
            />
            <DetailField
              label="Extension"
              value={info?.extension || "—"}
              isEditable={isEditing}
            />

            <DetailField
              label="Business Email (*)"
              value={info?.businessEmail || "—"}
              icon={<Mail className="h-3 w-3" />}
              isEmail
              isEditable={isEditing}
            />
            <DetailField
              label="Personal Email"
              value={info?.personalEmail || "—"}
              icon={<Mail className="h-3 w-3" />}
              isEmail
              isEditable={isEditing}
            />

            <DetailField
              label="Facebook URL"
              value={info?.facebookUrl || "—"}
              icon={<Globe className="h-3 w-3" />}
              isEditable={isEditing}
            />
            <DetailField
              label="Twitter URL"
              value={info?.twitterUrl || "—"}
              icon={<Globe className="h-3 w-3" />}
              isEditable={isEditing}
            />
          </div>
        </div>
      </section>

      {/* Address Section */}
      <section className="space-y-6">
        <div className="px-0 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Address Information
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 pt-2">
          <AddressSubsection
            title="Permanent Address"
            address={info?.permanentAddress}
            isEditable={isEditing}
          />
          <AddressSubsection
            title="Temporary Address"
            address={info?.temporaryAddress}
            isEditable={isEditing}
          />
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="space-y-6">
        <div className="px-0 py-2 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Emergency Contacts
            </h3>
          </div>
          {isEditing && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[10px] gap-1.5 border-primary/20 text-primary hover:bg-primary/5 font-bold shadow-sm transition-all"
              onClick={handleAddContact}
            >
              <Plus className="h-3.5 w-3.5" />
              ADD CONTACT
            </Button>
          )}
        </div>
        <div className="p-0 pt-2">
          <div className="border border-border rounded-xl shadow-sm overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                  <tr>
                    <th className="px-6 py-3 border-b border-border">
                      Contact Person Name
                    </th>
                    <th className="px-6 py-3 border-b border-border">
                      Relationship
                    </th>
                    <th className="px-6 py-3 border-b border-border">Phone</th>
                    <th className="px-6 py-3 border-b border-border">Email</th>
                    <th className="px-6 py-3 border-b border-border">Remark</th>
                    {isEditing && (
                      <th className="px-6 py-3 border-b border-border text-center">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contacts.map((contact, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {contact.name}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className="font-normal border-primary/10"
                        >
                          {contact.relationship}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-mono">{contact.phone}</td>
                      <td className="px-6 py-4">{contact.email || "—"}</td>
                      <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]">
                        {contact.remark || "—"}
                      </td>
                      {isEditing && (
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                              onClick={() => handleEditContact(contact, idx)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              onClick={() => handleDeleteClick(idx)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                  {!contacts.length && (
                    <tr>
                      <td
                        colSpan={isEditing ? 6 : 5}
                        className="px-6 py-8 text-center text-muted-foreground italic"
                      >
                        No emergency contacts available.
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
      <EmergencyContactModal
        open={isContactModalOpen}
        onOpenChange={setIsContactModalOpen}
        contact={editingContact}
        onSave={handleSaveContact}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete this emergency contact. This
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

function AddressSubsection({
  title,
  address,
  isEditable,
}: {
  title: string;
  address: any;
  isEditable?: boolean;
}) {
  return (
    <div className="space-y-6 bg-muted/20 p-4 rounded-xl border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="h-3.5 w-3.5 text-primary/70" />
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
          {title}
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailField
          label="Country"
          value={address?.country || "—"}
          isEditable={isEditable}
        />
        <DetailField
          label="Province/City"
          value={address?.province || "—"}
          isEditable={isEditable}
        />
        <DetailField
          label="District/Town"
          value={address?.district || "—"}
          isEditable={isEditable}
        />
        <DetailField
          label="Ward/Commune"
          value={address?.ward || "—"}
          isEditable={isEditable}
        />
        <div className="md:col-span-2">
          <DetailField
            label="Street/Block"
            value={address?.street || "—"}
            isEditable={isEditable}
          />
        </div>
        <DetailField
          label="Postal Code"
          value={address?.postalCode || "—"}
          isEditable={isEditable}
        />
        <DetailField
          label="Other"
          value={address?.other || "—"}
          isEditable={isEditable}
        />
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  icon,
  isEmail,
  isEditable,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  isEmail?: boolean;
  isEditable?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {isEditable ? (
        <Input
          defaultValue={value}
          className="h-9 text-sm font-medium bg-background border-primary/20 focus-visible:ring-primary/20 transition-all"
        />
      ) : (
        <div
          className={`bg-secondary/10 border border-border/30 rounded px-3 py-1.5 text-sm font-medium min-h-[34px] flex items-center
          ${isEmail ? "text-primary hover:underline cursor-pointer" : "text-foreground"}
        `}
        >
          {value}
        </div>
      )}
    </div>
  );
}
