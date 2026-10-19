import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./Alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: { title: "Info", children: "New frames were added to the archive." },
  argTypes: {
    severity: {
      control: "inline-radio",
      options: ["info", "success", "error"],
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { args: { severity: "info" } };
export const Success: Story = {
  args: {
    severity: "success",
    title: "Saved",
    children: "Your changes are stored.",
  },
};
export const Error: Story = {
  args: {
    severity: "error",
    title: "Error",
    children: "Upload failed. Check the file and try again.",
  },
};

export const All: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Alert severity="info" title="Info">
        New frames were added to the archive.
      </Alert>
      <Alert severity="success" title="Saved">
        Your changes are stored.
      </Alert>
      <Alert severity="error" title="Error">
        Upload failed. Check the file and try again.
      </Alert>
    </div>
  ),
};
