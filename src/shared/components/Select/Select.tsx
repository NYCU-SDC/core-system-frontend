import type { ComponentPropsWithoutRef } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import { ChevronDown } from 'lucide-react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends ComponentPropsWithoutRef<typeof RadixSelect.Root> {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  error?: string;
  themeColor?: string;
}

export function Select({ 
  label, 
  placeholder, 
  options, 
  error, 
  themeColor,
  ...props 
}: SelectProps) {
  const triggerId = `select-${label?.replace(/\s/g, '-').toLowerCase()}`;

  return (
    <div className={styles.wrapper}>
      {label && (
        <Label.Root className={styles.label} htmlFor={triggerId}>
          {label}
        </Label.Root>
      )}
      <RadixSelect.Root {...props}>
        <RadixSelect.Trigger
          className={`${styles.trigger} ${error ? styles.error : ''}`}
          id={triggerId}
          style={themeColor ? { borderColor: themeColor } : undefined}
        >
          <RadixSelect.Value placeholder={placeholder || 'Select an option'} />
          <RadixSelect.Icon className={styles.icon}>
            <ChevronDown size={20} />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content className={styles.content} position="popper">
            <RadixSelect.Viewport className={styles.viewport}>
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className={styles.item}
                  disabled={option.disabled}
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
}
