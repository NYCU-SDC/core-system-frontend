import { useState } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import { ChevronDown, Search } from 'lucide-react';
import styles from './SearchableSelect.module.css';

export interface SearchableSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SearchableSelectProps extends ComponentPropsWithoutRef<typeof RadixSelect.Root> {
  label?: string;
  placeholder?: string;
  options: SearchableSelectOption[];
  themeColor?: string;
}

export function SearchableSelect({ 
  label, 
  placeholder, 
  options, 
  themeColor,
  ...props 
}: SearchableSelectProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const triggerId = `select-${label?.replace(/\s/g, '-').toLowerCase()}`;

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.wrapper}>
      {label && (
        <Label.Root className={styles.label} htmlFor={triggerId}>
          {label}
        </Label.Root>
      )}
      <RadixSelect.Root {...props}>
        <RadixSelect.Trigger
          className={styles.trigger}
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
            <div className={styles.search}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--comment)' }} />
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>
            <RadixSelect.Viewport className={styles.viewport}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <RadixSelect.Item
                    key={option.value}
                    value={option.value}
                    className={styles.item}
                    disabled={option.disabled}
                  >
                    <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  </RadixSelect.Item>
                ))
              ) : (
                <div className={styles.empty}>No results found</div>
              )}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
