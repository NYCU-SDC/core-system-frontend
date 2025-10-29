import { useParams, Link, Navigate } from 'react-router-dom';
import { docContent } from '../services/docsData';
import styles from './DocDetailPage.module.css';

export const DocDetailPage = () => {
  const { category, slug } = useParams();
  const doc = docContent[category]?.[slug];

  if (!doc) {
    return <Navigate to="/docs" replace />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link to="/docs">Docs</Link>
        <span className={styles.separator}>/</span>
        <span className={styles.category}>{category}</span>
        <span className={styles.separator}>/</span>
        <span>{slug}</span>
      </div>

      <article className={styles.article}>
        <h1 className={styles.title}>{doc.title}</h1>
        <div className={styles.content}>
          {doc.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('##')) {
              return (
                <h2 key={index} className={styles.heading2}>
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('###')) {
              return (
                <h3 key={index} className={styles.heading3}>
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('```')) {
              const code = paragraph.replace(/```\w*\n?/g, '');
              return (
                <pre key={index} className={styles.codeBlock}>
                  <code>{code}</code>
                </pre>
              );
            }
            if (paragraph.startsWith('|')) {
              // Simple table rendering
              const rows = paragraph.split('\n').filter(row => !row.includes('---'));
              return (
                <div key={index} className={styles.table}>
                  {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className={rowIndex === 0 ? styles.tableHeader : styles.tableRow}>
                      {row.split('|').filter(cell => cell.trim()).map((cell, cellIndex) => (
                        <div key={cellIndex}>{cell.trim()}</div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            }
            if (paragraph.trim()) {
              return (
                <p key={index} className={styles.paragraph}>
                  {paragraph.split('`').map((part, i) => 
                    i % 2 === 0 ? part : <code key={i} className={styles.inlineCode}>{part}</code>
                  )}
                </p>
              );
            }
            return null;
          })}
        </div>
      </article>
    </div>
  );
};
