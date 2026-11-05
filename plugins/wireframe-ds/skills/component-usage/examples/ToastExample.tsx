import { Button, IconProvider, ToastProvider, Toaster, createIcon, useToast, type IconSet } from 'design-system-test'

// Module level, so the provider's merge stays memoized.
const icons: Partial<IconSet> = {
  success: createIcon('Tick', <path d="M4 12l5 5L20 6" />),
}

function SaveButton() {
  const { toast, dismiss } = useToast()
  return (
    <Button
      onClick={() => {
        const id = toast({
          severity: 'success',
          title: 'Saved',
          description: 'Your changes are live.',
          action: { label: 'Undo', altText: 'Undo the save', onClick: () => dismiss(id) },
        })
      }}
    >
      Save
    </Button>
  )
}

/** ToastProvider and Toaster go once, near the root. IconProvider is optional. */
export function ToastExample() {
  return (
    <IconProvider icons={icons}>
      <ToastProvider>
        <SaveButton />
        <Toaster />
      </ToastProvider>
    </IconProvider>
  )
}
