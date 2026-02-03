import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/modules/core/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/modules/core/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/modules/core/components/ui/popover";
import { PageRouteKey } from "@/const/page-route-key";
import { cn } from "@/lib/utils";

interface FrontendRouteComboboxProps {
  value: string;
  onChange: (value: string) => void;
  excludedRoutes?: string[];
}

const flattenRoutes = (obj: any, prefix = ""): string[] => {
  let routes: string[] = [];
  for (const key in obj) {
    if (typeof obj[key] === "function") {
      routes.push(obj[key]());
    } else if (typeof obj[key] === "object") {
      routes = [...routes, ...flattenRoutes(obj[key])];
    }
  }
  return Array.from(new Set(routes)).sort();
};

export const FrontendRouteCombobox = ({
  value,
  onChange,
  excludedRoutes = [],
}: FrontendRouteComboboxProps) => {
  const [open, setOpen] = useState(false);
  const allRoutes = flattenRoutes(PageRouteKey);
  const routes = allRoutes.filter(
    (route) => !excludedRoutes.includes(route) || route === value,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background border-border/80 text-foreground hover:bg-secondary/50"
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value === "#" ? "None (#)" : value || "Select frontend route..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-card border-border">
        <Command>
          <CommandInput placeholder="Search frontend routes..." />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>No route found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="#"
                onSelect={() => {
                  onChange("#");
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "#" ? "opacity-100" : "opacity-0",
                  )}
                />
                None (#)
              </CommandItem>
              {routes.map((route) => (
                <CommandItem
                  key={route}
                  value={route}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === route ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {route}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
