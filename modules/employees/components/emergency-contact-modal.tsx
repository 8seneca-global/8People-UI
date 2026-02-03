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

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  remark: string;
}

interface EmergencyContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: EmergencyContact | null;
  onSave: (contact: EmergencyContact) => void;
}

export function EmergencyContactModal({
  open,
  onOpenChange,
  contact,
  onSave,
}: EmergencyContactModalProps) {
  const form = useForm<EmergencyContact>({
    defaultValues: {
      name: "",
      relationship: "",
      phone: "",
      email: "",
      remark: "",
    },
  });

  useEffect(() => {
    if (contact) {
      form.reset(contact);
    } else {
      form.reset({
        name: "",
        relationship: "",
        phone: "",
        email: "",
        remark: "",
      });
    }
  }, [contact, form]);

  const onSubmit = (data: EmergencyContact) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {contact ? "Edit Emergency Contact" : "Add Emergency Contact"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Contact Person Name (*)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Nguyen Thi A"
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
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Relationship (*)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Mother"
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Phone Number (*)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. 0912345678"
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
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. name@example.com"
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
                name="remark"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Remark
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Any additional notes"
                        {...field}
                        className="bg-secondary/10 border-border/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {contact ? "SAVE CHANGES" : "ADD CONTACT"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
