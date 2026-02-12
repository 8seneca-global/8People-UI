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
import { useSystemRoutes } from "@/modules/core/api";
import { cn } from "@/lib/utils";

interface RouteComboboxProps {
  value: string;
  onChange: (value: string) => void;
  filterPath?: string;
}

export const RouteCombobox = ({
  value,
  onChange,
  filterPath,
}: RouteComboboxProps) => {
  const [open, setOpen] = useState(false);
  const { data: allRoutes = [] } = useSystemRoutes();

  const routes = React.useMemo(() => {
    if (!filterPath || filterPath === "#") return allRoutes;
    return allRoutes.filter(
      (r) => r === filterPath || r.startsWith(filterPath + "/"),
    );
  }, [allRoutes, filterPath]);

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
            {value || "Select route..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 bg-card border-border">
        <Command>
          <CommandInput placeholder="Search routes..." />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>No route found.</CommandEmpty>
            <CommandGroup>
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
