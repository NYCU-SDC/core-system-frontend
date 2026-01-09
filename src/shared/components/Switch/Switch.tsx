import type { ComponentPropsWithoutRef } from 'react';
import * as RadixSwitch from '@radix-ui/react-switch';
import * as Label from '@radix-ui/react-label';
import styles from './Switch.module.css';

export interface SwitchProps extends ComponentPropsWithoutRef<typeof RadixSwitch.Root> {
  label?: string;
  themeColor?: string;
}

export function Switch({ label, themeColor, id, style, ...props }: SwitchProps) {
  const switchStyle = themeColor && props.checked
    ? { ...style, backgroundColor: themeColor }
    : style;

  return (
    <div className={styles.wrapper}>
      <RadixSwitch.Root
        className={styles.switch}
        style={switchStyle}
        id={id}
        {...props}
      >
        <RadixSwitch.Thumb className={styles.thumb} />
      </RadixSwitch.Root>
      {label && (
        <Label.Root
          className={styles.label}
          htmlFor={id}
          data-disabled={props.disabled ? '' : undefined}
        >
          {label}
        </Label.Root>
      )}
    </div>
  );
}
