import { Link } from 'react-router-dom';
import { Button } from '@/shared/components';
import styles from './NotFoundPage.module.css';

export const NotFoundPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Page Not Found</h2>
        <p className={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button size="large">Go Home</Button>
        </Link>
      </div>
    </div>
  );
};
