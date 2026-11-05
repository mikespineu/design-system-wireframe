import { useState } from 'react'
import { Button, Dialog, DialogClose } from 'design-system-test'

export function DialogFlow({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={<Button variant="secondary">Delete project</Button>}
      title="Delete this project?"
      description="This cannot be undone."
      size="sm"
      footer={
        <>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            onClick={() => {
              onDelete()
              setOpen(false)
            }}
          >
            Delete
          </Button>
        </>
      }
    >
      The project and its files are removed for everyone.
    </Dialog>
  )
}
