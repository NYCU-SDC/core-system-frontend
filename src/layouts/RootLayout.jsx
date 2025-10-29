import { Outlet, Link, useLocation } from 'react-router-dom';
import styles from './RootLayout.module.css';

export const RootLayout = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <Link to="/" className={styles.logo}>
            Core UI
          </Link>
          <div className={styles.navLinks}>
            <Link 
              to="/" 
              className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/components" 
              className={`${styles.navLink} ${isActive('/components') ? styles.active : ''}`}
            >
              Components
            </Link>
            <Link 
              to="/docs" 
              className={`${styles.navLink} ${isActive('/docs') ? styles.active : ''}`}
            >
              Docs
            </Link>
          </div>
        </div>
      </nav>
      
      <main className={styles.content}>
        <Outlet />
      </main>
      
      <footer className={styles.footer}>
        <p>Built with ❤️ using Radix UI and CSS Modules</p>
      </footer>
    </div>
  );
};
