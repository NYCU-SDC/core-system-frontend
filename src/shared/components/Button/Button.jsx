import styles from './Button.module.css';

export const Button = ({ children, size = 'medium', onClick, disabled, ...props }) => {
  const sizeClass = size !== 'medium' ? styles[size] : '';
  
  return (
    <button
      className={`${styles.button} ${sizeClass}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
