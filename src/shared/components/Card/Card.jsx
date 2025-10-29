import styles from './Card.module.css';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`${styles.card} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children }) => {
  return <div className={styles.cardHeader}>{children}</div>;
};

export const CardTitle = ({ children }) => {
  return <h3 className={styles.cardTitle}>{children}</h3>;
};

export const CardDescription = ({ children }) => {
  return <p className={styles.cardDescription}>{children}</p>;
};

export const CardContent = ({ children }) => {
  return <div className={styles.cardContent}>{children}</div>;
};

export const CardFooter = ({ children }) => {
  return <div className={styles.cardFooter}>{children}</div>;
};
