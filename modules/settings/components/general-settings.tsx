"use client";

/**
 * General Settings - Mock Mode
 *
 * This component now uses local React state instead of API calls.
 * Changes are stored in memory and don't persist across page reloads.
 */

import React, { useState } from "react";
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
import { Loader2 } from "lucide-react";

interface SystemSettings {
  id: string;
  emailNotifications: boolean;
  twoFactorAuth: boolean;
  autoGenerateEmployeeIds: boolean;
  onboardingReminders: boolean;
  createEmailWorkspace: boolean;
}

// Default mock settings
const defaultSettings: SystemSettings = {
  id: "system-settings-1",
  emailNotifications: true,
  twoFactorAuth: false,
  autoGenerateEmployeeIds: true,
  onboardingReminders: true,
  createEmailWorkspace: false,
};

export const GeneralSettings = () => {
  const [settings] = useState<SystemSettings>(defaultSettings);
  const [formData, setFormData] = useState<SystemSettings>(defaultSettings);
  const [isPending, setIsPending] = useState(false);

  const handleToggle = (field: keyof SystemSettings, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsPending(true);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsPending(false);
    toast.success(
      "Settings updated successfully (mock mode - changes won't persist)",
    );
  };

  const hasChanges = Object.keys(formData).some(
    (key) =>
      formData[key as keyof SystemSettings] !==
      settings[key as keyof SystemSettings],
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">System Settings</CardTitle>
        <CardDescription>
          Configure global application settings
          <span className="ml-2 text-xs text-amber-500">(Demo Mode)</span>
        </CardDescription>
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
            <Button onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
