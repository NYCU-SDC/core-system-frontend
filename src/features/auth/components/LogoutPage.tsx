import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserLayout } from '../../../layouts';
import styles from './LogoutPage.module.css';

export function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear auth state
    setTimeout(() => {
      navigate('/');
    }, 2000);
  }, [navigate]);

  return (
    <UserLayout>
      <div className={styles.container}>
        <h1 className={styles.message}>Logging out...</h1>
        <p className={styles.submessage}>You will be redirected shortly</p>
      </div>
    </UserLayout>
  );
}
