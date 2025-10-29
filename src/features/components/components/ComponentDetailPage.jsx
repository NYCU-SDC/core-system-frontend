import { useParams, Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Switch,
} from '@/shared/components';
import { componentDetailsData } from '../services/componentData';
import styles from './ComponentDetailPage.module.css';

const componentData = componentDetailsData;

export const ComponentDetailPage = () => {
  const { slug } = useParams();
  const component = componentData[slug];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);

  if (!component) {
    return <Navigate to="/components" replace />;
  }

  const renderDemo = () => {
    switch (slug) {
      case 'button':
        return (
          <div className={styles.demoGroup}>
            <Button size="small">Small</Button>
            <Button>Medium</Button>
            <Button size="large">Large</Button>
            <Button disabled>Disabled</Button>
          </div>
        );
      case 'card':
        return (
          <Card style={{ maxWidth: '400px' }}>
            <CardHeader>
              <CardTitle>Card Example</CardTitle>
              <CardDescription>This is a sample card component</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Cards can contain any content you need.</p>
            </CardContent>
            <CardFooter>
              <Button size="small">Action</Button>
            </CardFooter>
          </Card>
        );
      case 'dialog':
        return (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Dialog Example</DialogTitle>
              <DialogDescription>
                This is a modal dialog component with orange theming.
              </DialogDescription>
              <div style={{ marginTop: '20px' }}>
                <Button onClick={() => setDialogOpen(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        );
      case 'tabs':
        return (
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">First Tab</TabsTrigger>
              <TabsTrigger value="tab2">Second Tab</TabsTrigger>
              <TabsTrigger value="tab3">Third Tab</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Content of first tab</TabsContent>
            <TabsContent value="tab2">Content of second tab</TabsContent>
            <TabsContent value="tab3">Content of third tab</TabsContent>
          </Tabs>
        );
      case 'switch':
        return (
          <div className={styles.demoGroup}>
            <Switch label="Toggle me" checked={switchChecked} onCheckedChange={setSwitchChecked} />
            <Switch label="Disabled" disabled />
            <Switch label="Default checked" defaultChecked />
          </div>
        );
      default:
        return <p>Demo coming soon...</p>;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link to="/components">Components</Link>
        <span className={styles.separator}>/</span>
        <span>{component.name}</span>
      </div>

      <div className={styles.header}>
        <div className={styles.badge}>{component.category}</div>
        <h1 className={styles.title}>{component.name}</h1>
        <p className={styles.description}>{component.description}</p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Demo</h2>
        <div className={styles.demo}>
          {renderDemo()}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Usage</h2>
        <pre className={styles.codeBlock}>
          <code>{component.usage}</code>
        </pre>
      </section>

      {component.props.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Props</h2>
          <div className={styles.propsTable}>
            <div className={styles.propsHeader}>
              <div>Name</div>
              <div>Type</div>
              <div>Default</div>
              <div>Description</div>
            </div>
            {component.props.map((prop) => (
              <div key={prop.name} className={styles.propsRow}>
                <div className={styles.propName}>{prop.name}</div>
                <div className={styles.propType}>{prop.type}</div>
                <div className={styles.propDefault}>{prop.default}</div>
                <div className={styles.propDescription}>{prop.description}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
