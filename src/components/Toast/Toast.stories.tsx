import { useEffect, useRef, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';
import { ToastProvider, Toaster, useToast, type ToastOptions } from './Toast';
import { Button } from '../Button';
import { Dialog, DialogClose } from '../Dialog';

/**
 * Non-modal message on Radix `Toast`. Wrap the app in `ToastProvider`, render `Toaster` once,
 * and call `useToast()` to `toast`, `update` and `dismiss`. Info and success leave after 5 s
 * (8 s with an action); errors stay until closed. Press F8 to jump to the region.
 */
const meta = {
  title: 'Components/Toast',
  component: Toaster,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', docs: { story: { inline: false, iframeHeight: 420 } } },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

const undo = { label: 'Undo', altText: 'Undo from Archive › Coastline', onClick: () => {} };

/** Fires the given toasts once on mount (StrictMode safe). */
const Fire = ({ items }: { items: ToastOptions[] }) => {
  const { toast } = useToast();
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    items.forEach((i) => toast(i));
  }, [items, toast]);
  return null;
};

const Stage = ({ items, children }: { items: ToastOptions[]; children?: ReactNode }) => (
  <ToastProvider>
    <div style={{ minHeight: 360, padding: 24 }}>{children ?? <Button variant="secondary">Page content</Button>}</div>
    <Fire items={items} />
    <Toaster />
  </ToastProvider>
);

const sticky = { duration: Infinity };
const render = (items: ToastOptions[]): Story['render'] => () => <Stage items={items} />;

export const Info: Story = {
  render: render([{ ...sticky, title: 'Frame moved to Archive', description: 'You can find it under Archive.' }]),
};
export const InfoWithAction: Story = {
  render: render([{ ...sticky, title: 'Frame moved to Archive', description: 'Coastline is now archived.', action: undo }]),
};
export const Success: Story = {
  render: render([{ ...sticky, severity: 'success', title: 'Changes saved', description: 'Your profile is up to date.' }]),
};
export const SuccessWithAction: Story = {
  render: render([{ ...sticky, severity: 'success', title: 'Published', description: 'Visible to everyone.', action: { ...undo, label: 'Unpublish', altText: 'Unpublish this page' } }]),
};
/** Errors never auto-dismiss. */
export const ErrorSticky: Story = {
  render: render([{ severity: 'error', title: 'Upload failed', description: 'The file is larger than 10 MB.' }]),
};
export const ErrorWithAction: Story = {
  render: render([{ severity: 'error', title: 'Upload failed', description: 'Check your connection.', action: { ...undo, label: 'Retry', altText: 'Retry the upload' } }]),
};
export const TitleOnly: Story = { render: render([{ ...sticky, title: 'Link copied' }]) };

/** Up to 3 are visible. Newest sits at the bottom. */
export const Stack: Story = {
  render: render([
    { ...sticky, title: 'Link copied' },
    { ...sticky, severity: 'success', title: 'Changes saved', description: 'Your profile is up to date.' },
    { severity: 'error', title: 'Upload failed', description: 'The file is larger than 10 MB.', action: { ...undo, label: 'Retry', altText: 'Retry' } },
  ]),
};

/** Below 480 px the viewport spans the width with 16 px insets. */
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' }, docs: { story: { inline: false, iframeHeight: 420 } } },
  render: render([
    { ...sticky, severity: 'success', title: 'Changes saved', description: 'Your profile is up to date.', action: undo },
  ]),
};

/** The toast follows the pointer; drag right more than 50 px to dismiss. Under `prefers-reduced-motion` all enter and exit motion is removed. */
export const Swipe: Story = {
  render: render([{ ...sticky, title: 'Drag me to the right', description: 'Past 50 px dismisses; less snaps back.' }]),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const item = await body.findByRole('listitem');
    // Synthetic pointer ids have no active pointer to capture.
    item.setPointerCapture = () => {};
    item.releasePointerCapture = () => {};
    const drag = (dx: number) => {
      const init = { pointerId: 1, button: 0, bubbles: true, clientY: 10 };
      fireEvent.pointerDown(item, { ...init, clientX: 10 });
      fireEvent.pointerMove(item, { ...init, clientX: 10 + dx });
      fireEvent.pointerUp(item, { ...init, clientX: 10 + dx });
    };
    drag(20); // below threshold: snaps back
    await new Promise((r) => setTimeout(r, 300));
    await expect(body.getByRole('listitem')).toBeInTheDocument();
    drag(90); // past 50 px: dismissed
    await waitFor(() => expect(body.queryByRole('listitem')).not.toBeInTheDocument(), { timeout: 3000 });
  },
};

/**
 * Under `prefers-reduced-motion: reduce` enter, exit and swipe animations and the close
 * transition are removed. The play function checks the stylesheet rule and, when the browser
 * reports the preference, the computed style.
 */
export const ReducedMotion: Story = {
  render: render([{ ...sticky, title: 'No motion', description: 'Appears and leaves without animation.' }]),
  play: async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const body = within(doc.body);
    const item = await body.findByRole('listitem');
    const rules: CSSStyleRule[] = [];
    for (const sheet of Array.from(doc.styleSheets)) {
      let list: CSSRuleList;
      try { list = sheet.cssRules; } catch { continue; }
      for (const r of Array.from(list)) {
        if (r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion')) {
          rules.push(...(Array.from(r.cssRules) as CSSStyleRule[]).filter((x) => x.selectorText?.includes('.ds-toast')));
        }
      }
    }
    await expect(rules.some((r) => r.style.animationName === 'none' || r.style.animation === 'none')).toBe(true);
    if (doc.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await expect(getComputedStyle(item).animationName).toBe('none');
    }
  },
};

export const Interactive: Story = {
  render: () => {
    const Demo = () => {
      const { toast, update, dismiss } = useToast();
      const id = useRef<string>('');
      return (
        <div style={{ display: 'flex', gap: 8, padding: 24, flexWrap: 'wrap' }}>
          <Button onClick={() => toast({ title: 'Link copied' })}>Info</Button>
          <Button onClick={() => toast({ severity: 'success', title: 'Saved', action: undo })}>Success + action</Button>
          <Button onClick={() => toast({ severity: 'error', title: 'Upload failed', description: 'Try again.' })}>Error</Button>
          <Button variant="secondary" onClick={() => (id.current = toast({ title: 'Saving…', duration: Infinity }))}>Start saving</Button>
          <Button variant="secondary" onClick={() => update(id.current, { severity: 'error', title: 'Saving failed', duration: Infinity })}>Fail it</Button>
          <Button variant="ghost" onClick={() => dismiss()}>Dismiss all</Button>
        </div>
      );
    };
    return (
      <ToastProvider>
        <Demo />
        <Toaster />
      </ToastProvider>
    );
  },
};

/** Keyboard: F8 focuses the region, Tab walks newest first (toast, action, close), Esc closes the focused toast. */
export const Keyboard: Story = {
  render: render([
    { severity: 'error', title: 'Older error' },
    { severity: 'error', title: 'Newer error', action: { ...undo, label: 'Retry', altText: 'Retry' } },
  ]),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getAllByRole('listitem')).toHaveLength(2));
    await userEvent.keyboard('[F8]');
    await userEvent.tab();
    await expect(body.getAllByRole('listitem')[1]).toHaveFocus();
    await userEvent.tab();
    await expect(body.getByRole('button', { name: 'Retry' })).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(body.getAllByRole('listitem')).toHaveLength(1));
  },
};

/** A toast raised from inside an open Dialog stays visible and clickable above it. */
export const FromDialog: Story = {
  render: () => {
    const Inner = () => {
      const { toast } = useToast();
      return (
        <Dialog
          defaultOpen
          title="Edit profile"
          description="Change how you appear to others."
          footer={
            <>
              <DialogClose asChild>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <Button onClick={() => toast({ severity: 'success', title: 'Profile saved', action: undo })}>Save</Button>
            </>
          }
        />
      );
    };
    return (
      <ToastProvider>
        <Inner />
        <Toaster />
      </ToastProvider>
    );
  },
};
