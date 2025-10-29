// Component metadata for the components showcase
export const componentsData = [
	{
		slug: "button",
		name: "Button",
		description: "Versatile button component with multiple sizes and states",
		category: "Form",
	},
	{
		slug: "card",
		name: "Card",
		description: "Container component with header, content, and footer sections",
		category: "Layout",
	},
	{
		slug: "dialog",
		name: "Dialog",
		description: "Modal dialog with overlay for important interactions",
		category: "Overlay",
	},
	{
		slug: "tabs",
		name: "Tabs",
		description: "Tabbed navigation for organizing content into sections",
		category: "Navigation",
	},
	{
		slug: "switch",
		name: "Switch",
		description: "Toggle switch for binary on/off states",
		category: "Form",
	},
	{
		slug: "tooltip",
		name: "Tooltip",
		description: "Contextual information on hover (coming soon)",
		category: "Overlay",
	},
];

export const componentDetailsData = {
	button: {
		name: "Button",
		description: "A versatile button component with multiple sizes and states",
		category: "Form",
		usage: `import { Button } from '@/shared/components';

<Button>Click me</Button>
<Button size="small">Small</Button>
<Button size="large">Large</Button>
<Button disabled>Disabled</Button>`,
		props: [
			{ name: "size", type: "small | medium | large", default: "medium", description: "Button size" },
			{ name: "disabled", type: "boolean", default: "false", description: "Disabled state" },
			{ name: "onClick", type: "function", default: "-", description: "Click handler" },
		],
	},
	card: {
		name: "Card",
		description: "Container component with header, content, and footer sections",
		category: "Layout",
		usage: `import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/components';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Your content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>`,
		props: [{ name: "className", type: "string", default: "-", description: "Additional CSS classes" }],
	},
	dialog: {
		name: "Dialog",
		description: "Modal dialog with overlay for important interactions",
		category: "Overlay",
		usage: `import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/shared/components';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
  </DialogContent>
</Dialog>`,
		props: [
			{ name: "open", type: "boolean", default: "-", description: "Controlled open state" },
			{ name: "onOpenChange", type: "function", default: "-", description: "Open state change handler" },
		],
	},
	tabs: {
		name: "Tabs",
		description: "Tabbed navigation for organizing content into sections",
		category: "Navigation",
		usage: `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components';

<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>`,
		props: [
			{ name: "defaultValue", type: "string", default: "-", description: "Default active tab" },
			{ name: "value", type: "string", default: "-", description: "Controlled active tab" },
		],
	},
	switch: {
		name: "Switch",
		description: "Toggle switch for binary on/off states",
		category: "Form",
		usage: `import { Switch } from '@/shared/components';

<Switch label="Enable notifications" />
<Switch checked={value} onCheckedChange={setValue} />`,
		props: [
			{ name: "label", type: "string", default: "-", description: "Label text" },
			{ name: "checked", type: "boolean", default: "-", description: "Controlled checked state" },
			{ name: "onCheckedChange", type: "function", default: "-", description: "Check state change handler" },
		],
	},
	tooltip: {
		name: "Tooltip",
		description: "Contextual information on hover (coming soon)",
		category: "Overlay",
		usage: "Coming soon...",
		props: [],
	},
};
