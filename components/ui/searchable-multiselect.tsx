import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export interface Option {
  value: string;
  label: string;
}

export interface SearchableMultiSelectProps {
  label?: string;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchableMultiSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Select...',
  disabled = false,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (currentValue: string) => {
    if (selectedValues.includes(currentValue)) {
      onChange(selectedValues.filter((v) => v !== currentValue));
    } else {
      onChange([...selectedValues, currentValue]);
    }
  };

  const handleRemove = (valueToRemove: string) => {
    onChange(selectedValues.filter((v) => v !== valueToRemove));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const getSelectedOptions = () => {
    return selectedValues
      .map((value) => options.find((opt) => opt.value === value))
      .filter(Boolean) as Option[];
  };

  return (
    <div className="w-full">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-transparent"
            disabled={disabled}
          >
            {selectedValues.length > 0
              ? `${selectedValues.length} selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No options found.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => handleSelect(opt.value)}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedValues.includes(opt.value)
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedValues.length > 0 && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Selected:</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-auto p-1 text-xs"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {getSelectedOptions().map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {option.label}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => handleRemove(option.value)}
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
