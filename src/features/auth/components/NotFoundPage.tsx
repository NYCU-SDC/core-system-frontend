import { useNavigate } from 'react-router-dom';
import { UserLayout } from '../../../layouts';
import { Button } from '../../../shared/components';
import { Home } from 'lucide-react';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <UserLayout>
      <div className={styles.container}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.message}>Page Not Found</p>
        <p className={styles.submessage}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className={styles.actions}>
          <Button icon={Home} onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    </UserLayout>
  );
}
