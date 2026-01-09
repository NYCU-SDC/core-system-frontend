import type { ComponentPropsWithoutRef } from 'react';
import * as RadixLabel from '@radix-ui/react-label';
import styles from './Label.module.css';

export interface LabelProps extends ComponentPropsWithoutRef<typeof RadixLabel.Root> {
  required?: boolean;
}

export function Label({ children, required, className, ...props }: LabelProps) {
  return (
    <RadixLabel.Root className={`${styles.label} ${className || ''}`} {...props}>
      {children}
      {required && <span className={styles.required}>*</span>}
    </RadixLabel.Root>
  );
}
