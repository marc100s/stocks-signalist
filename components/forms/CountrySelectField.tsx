"use client";

import React, { useMemo } from "react";
import { Control, Controller, FieldError } from "react-hook-form";
import countryList from "react-select-country-list";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type CountrySelectProps = {
  name: "country";
  label: string;
  control: Control<SignUpFormData>;
  error?: FieldError;
  placeholder?: string;
};

export const CountrySelectField = ({
  name,
  label,
  control,
  error,
  placeholder = "Select a country...",
}: CountrySelectProps) => {
  const options = useMemo(() => countryList().getData(), []);

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className={cn(error && "text-destructive")}>
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        rules={{ required: "Country is required" }}
        render={({ field }) => (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={cn(
                  "w-full justify-between",
                  !field.value && "text-muted-foreground",
                  error && "border-destructive"
                )}
              >
                {field.value
                  ? options.find((option) => option.value === field.value)
                      ?.label
                  : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        value={option.label}
                        key={option.value}
                        onSelect={() => {
                          field.onChange(option.value);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            option.value === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
    </div>
  );
};
