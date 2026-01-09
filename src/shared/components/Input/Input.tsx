import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import * as Label from '@radix-ui/react-label';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  themeColor?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, themeColor, className, style, ...props }, ref) => {
    const inputStyle = themeColor
      ? { ...style, borderColor: themeColor }
      : style;

    return (
      <div className={styles.wrapper}>
        {label && (
          <Label.Root className={styles.label} htmlFor={props.id}>
            {label}
          </Label.Root>
        )}
        <input
          ref={ref}
          className={`${styles.input} ${error ? styles.error : ''} ${className || ''}`}
          style={inputStyle}
          {...props}
        />
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
