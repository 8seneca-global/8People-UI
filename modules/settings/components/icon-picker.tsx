import React from "react";
import { iconMap, iconOptions } from "./constants";

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
}

export const IconPicker = ({ selectedIcon, onSelectIcon }: IconPickerProps) => {
  return (
    <div className="grid grid-cols-8 gap-2 p-3 rounded-lg border border-border bg-secondary/30 max-h-48 overflow-y-auto">
      {iconOptions.map((icon) => {
        const IconComp = iconMap[icon.value];
        const isSelected = selectedIcon === icon.value;
        return (
          <button
            key={icon.value}
            type="button"
            onClick={() => onSelectIcon(icon.value)}
            className={`flex items-center justify-center p-2 rounded-md transition-colors ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary text-muted-foreground hover:text-foreground"
            }`}
            title={icon.label}
          >
            {IconComp && <IconComp className="h-4 w-4" />}
          </button>
        );
      })}
    </div>
  );
};
