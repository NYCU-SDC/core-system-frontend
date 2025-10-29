import { useState } from 'react';
import './index.css';
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
  Switch
} from './components';
import styles from './App.module.css';

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Orange Component Library</h1>
        <p className={styles.subtitle}>Built with Radix UI & CSS Modules</p>
      </header>

      <main className={styles.main}>
        {/* Buttons Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Buttons</h2>
          <div className={styles.buttonGroup}>
            <Button size="small">Small Button</Button>
            <Button>Medium Button</Button>
            <Button size="large">Large Button</Button>
            <Button disabled>Disabled Button</Button>
          </div>
        </section>

        {/* Cards Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Cards</h2>
          <div className={styles.cardGrid}>
            <Card>
              <CardHeader>
                <CardTitle>Feature Card</CardTitle>
                <CardDescription>This is a beautiful orange-themed card component</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Cards have a white background with orange borders. They include hover effects and can contain multiple sections.</p>
              </CardContent>
              <CardFooter>
                <Button size="small">Learn More</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Another Card</CardTitle>
                <CardDescription>Consistent styling across all components</CardDescription>
              </CardHeader>
              <CardContent>
                <p>All components use the same CSS variables for consistent theming throughout your application.</p>
              </CardContent>
              <CardFooter>
                <Button size="small">View Details</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Third Card</CardTitle>
                <CardDescription>Responsive and accessible</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Built on top of Radix UI primitives, these components are fully accessible and keyboard navigable.</p>
              </CardContent>
              <CardFooter>
                <Button size="small">Explore</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Dialog Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Dialog</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Welcome to the Dialog</DialogTitle>
              <DialogDescription>
                This is a modal dialog component with orange borders and white background, maintaining our component library theme.
              </DialogDescription>
              <div style={{ marginTop: '20px' }}>
                <p>You can put any content here. The dialog is fully accessible and includes keyboard navigation support.</p>
              </div>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Button onClick={() => setDialogOpen(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        {/* Tabs Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Tabs</h2>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">First Tab</TabsTrigger>
              <TabsTrigger value="tab2">Second Tab</TabsTrigger>
              <TabsTrigger value="tab3">Third Tab</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">
              <p>This is the content of the first tab. Tabs have orange borders and active states are highlighted with orange accents.</p>
            </TabsContent>
            <TabsContent value="tab2">
              <p>This is the second tab content. Switch between tabs to see the smooth transitions and orange theme.</p>
            </TabsContent>
            <TabsContent value="tab3">
              <p>Third tab content goes here. All components maintain the consistent orange and white color scheme.</p>
            </TabsContent>
          </Tabs>
        </section>

        {/* Switch Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Switch</h2>
          <div className={styles.switchGroup}>
            <Switch
              label="Enable notifications"
              checked={switchChecked}
              onCheckedChange={setSwitchChecked}
            />
            <Switch label="Dark mode (coming soon)" disabled />
            <Switch label="Auto-save" defaultChecked />
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>Built with ❤️ using Radix UI and CSS Modules</p>
      </footer>
    </div>
  );
}

export default App;
