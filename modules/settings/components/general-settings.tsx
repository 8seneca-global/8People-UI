"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/core/components/ui/card";
import { Label } from "@/modules/core/components/ui/label";
import { Switch } from "@/modules/core/components/ui/switch";
import { Button } from "@/modules/core/components/ui/button";
import { api } from "@/lib/axios";
import { Loader2 } from "lucide-react";

interface SystemSettings {
  id: string;
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  autoGenerateEmployeeIds: boolean;
  onboardingReminders: boolean;
  createEmailWorkspace: boolean;
}

export const GeneralSettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<SystemSettings>>({});

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["system-settings"],
    queryFn: async () => {
      const response = await api.get<SystemSettings>("/settings/system");
      setFormData(response.data);
      return response.data;
    },
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SystemSettings>) => {
      const response = await api.patch("/settings/system", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      toast.success("Settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  const handleToggle = (field: keyof SystemSettings, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const hasChanges =
    settings &&
    Object.keys(formData).some(
      (key) =>
        formData[key as keyof SystemSettings] !==
        settings[key as keyof SystemSettings]
    );

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">System Settings</CardTitle>
        <CardDescription>Configure global application settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-card-foreground">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Send email notifications for important events
            </p>
          </div>
          <Switch
            checked={formData.emailNotifications ?? false}
            onCheckedChange={(checked) =>
              handleToggle("emailNotifications", checked)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-card-foreground">
              Two-Factor Authentication
            </Label>
            <p className="text-sm text-muted-foreground">
              Require 2FA for all admin users
            </p>
          </div>
          <Switch
            checked={formData.twoFactorAuth ?? false}
            onCheckedChange={(checked) =>
              handleToggle("twoFactorAuth", checked)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-card-foreground">
              Auto-generate Employee IDs
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically generate IDs for new employees
            </p>
          </div>
          <Switch
            checked={formData.autoGenerateEmployeeIds ?? true}
            onCheckedChange={(checked) =>
              handleToggle("autoGenerateEmployeeIds", checked)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-card-foreground">Onboarding Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Send automatic reminders for pending onboarding tasks
            </p>
          </div>
          <Switch
            checked={formData.onboardingReminders ?? true}
            onCheckedChange={(checked) =>
              handleToggle("onboardingReminders", checked)
            }
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-card-foreground">
              Create Email Workspace
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically create email workspace for new employees
            </p>
          </div>
          <Switch
            checked={formData.createEmailWorkspace ?? false}
            onCheckedChange={(checked) =>
              handleToggle("createEmailWorkspace", checked)
            }
          />
        </div>

        {hasChanges && (
          <div className="pt-4 flex justify-end">
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
