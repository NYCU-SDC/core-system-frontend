import * as RadixTabs from '@radix-ui/react-tabs';
import styles from './Tabs.module.css';

export const Tabs = ({ children, ...props }) => {
  return (
    <RadixTabs.Root className={styles.root} {...props}>
      {children}
    </RadixTabs.Root>
  );
};

export const TabsList = ({ children }) => {
  return <RadixTabs.List className={styles.list}>{children}</RadixTabs.List>;
};

export const TabsTrigger = ({ children, ...props }) => {
  return (
    <RadixTabs.Trigger className={styles.trigger} {...props}>
      {children}
    </RadixTabs.Trigger>
  );
};

export const TabsContent = ({ children, ...props }) => {
  return (
    <RadixTabs.Content className={styles.content} {...props}>
      {children}
    </RadixTabs.Content>
  );
};
