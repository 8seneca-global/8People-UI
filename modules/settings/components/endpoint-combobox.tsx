import React, { useState, useMemo } from "react";
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
import { useModuleEndpoints } from "@/modules/settings/api";
import { cn } from "@/lib/utils";

interface EndpointComboboxProps {
  value: string;
  onChange: (value: string) => void;
  filterPath?: string;
}

interface GroupedEndpoint {
  path: string;
}

export const EndpointCombobox = ({
  value,
  onChange,
  filterPath,
}: EndpointComboboxProps) => {
  const [open, setOpen] = useState(false);
  const { data: endpoints = [] } = useModuleEndpoints();

  const groupedEndpoints = useMemo(() => {
    const paths = new Set<string>();
    endpoints.forEach((ep) => {
      if (
        !filterPath ||
        filterPath === "#" ||
        ep.path === filterPath ||
        ep.path.startsWith(filterPath + "/") ||
        // Handle cases where filterPath might be a prefix of a segment
        (filterPath.length > 1 &&
          ep.path.startsWith(filterPath) &&
          (ep.path[filterPath.length] === "?" ||
            ep.path[filterPath.length] === "/"))
      ) {
        paths.add(ep.path);
      }
    });

    return Array.from(paths)
      .sort()
      .map((path) => ({ path }));
  }, [endpoints, filterPath]);

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
            {value || "Select API endpoint..."}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[500px] p-0 bg-card border-border"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search endpoints..." />
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>No endpoint found.</CommandEmpty>
            <CommandGroup>
              {groupedEndpoints.map((endpoint) => (
                <CommandItem
                  key={endpoint.path}
                  value={endpoint.path}
                  onSelect={(currentValue) => {
                    onChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === endpoint.path ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {endpoint.path}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
