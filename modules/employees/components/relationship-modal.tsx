"use client";

import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/modules/core/components/ui/dialog";
import { Button } from "@/modules/core/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/modules/core/components/ui/form";
import { Input } from "@/modules/core/components/ui/input";
import { useEffect } from "react";
import { Badge } from "@/modules/core/components/ui/badge";
import { Checkbox } from "@/modules/core/components/ui/checkbox";

interface Relationship {
  id?: string;
  firstName: string;
  middleName: string;
  lastName: string;
  relationship: string;
  dateOfBirth: string;
  occupation: string;
  jobTitle: string;
  nationality: string;
  taxDependency: boolean;
  taxStart: string;
  taxEnd: string;
}

interface RelationshipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relationship?: Relationship | null;
  onSave: (relationship: Relationship) => void;
}

export function RelationshipModal({
  open,
  onOpenChange,
  relationship,
  onSave,
}: RelationshipModalProps) {
  const form = useForm<Relationship>({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      relationship: "",
      dateOfBirth: "",
      occupation: "",
      jobTitle: "",
      nationality: "",
      taxDependency: false,
      taxStart: "",
      taxEnd: "",
    },
  });

  useEffect(() => {
    if (relationship) {
      form.reset(relationship);
    } else {
      form.reset({
        firstName: "",
        middleName: "",
        lastName: "",
        relationship: "",
        dateOfBirth: "",
        occupation: "",
        jobTitle: "",
        nationality: "",
        taxDependency: false,
        taxStart: "",
        taxEnd: "",
      });
    }
  }, [relationship, form]);

  const onSubmit = (data: Relationship) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {relationship ? "Edit Relationship Info" : "Add Relationship Info"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 pt-4"
          >
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Last Name (*)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Nguyen"
                        {...field}
                        className="bg-secondary/10 border-border/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Middle Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Van"
                        {...field}
                        className="bg-secondary/10 border-border/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      First Name (*)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. An"
                        {...field}
                        className="bg-secondary/10 border-border/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Relationship (*)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Child"
                        {...field}
                        className="bg-secondary/10 border-border/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Date of Birth (*)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        className="bg-secondary/10 border-border/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Career/Origin */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Occupation
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Student"
                        {...field}
                        className="bg-secondary/10 border-border/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Nationality
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Viet Nam"
                        {...field}
                        className="bg-secondary/10 border-border/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tax Info Section */}
            <div className="space-y-4 border-t border-border/50 pt-6">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-bold">
                  TAX INFORMATION
                </Badge>
              </div>
              <FormField
                control={form.control}
                name="taxDependency"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/20">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium">
                        Tax Dependency
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Tick this if the employee is currently claiming this
                        person as a tax dependent.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {form.watch("taxDependency") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                  <FormField
                    control={form.control}
                    name="taxStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Period Start
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="bg-secondary/10 border-border/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="taxEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Period End
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="bg-secondary/10 border-border/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="font-bold text-xs"
              >
                CANCEL
              </Button>
              <Button type="submit" className="font-bold text-xs">
                {relationship ? "SAVE CHANGES" : "ADD RELATIONSHIP"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
