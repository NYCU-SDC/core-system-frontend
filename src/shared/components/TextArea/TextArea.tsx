import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import * as Label from '@radix-ui/react-label';
import styles from './TextArea.module.css';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  themeColor?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, themeColor, className, style, ...props }, ref) => {
    const textareaStyle = themeColor
      ? { ...style, borderColor: themeColor }
      : style;

    return (
      <div className={styles.wrapper}>
        {label && (
          <Label.Root className={styles.label} htmlFor={props.id}>
            {label}
          </Label.Root>
        )}
        <textarea
          ref={ref}
          className={`${styles.textarea} ${error ? styles.error : ''} ${className || ''}`}
          style={textareaStyle}
          {...props}
        />
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
