import { useState, type FormEvent } from 'react'
import { Button, Field, Input, Stack, Textarea, useFieldControl } from 'design-system-test'

/** A control of your own can join a Field by spreading useFieldControl(). */
const PlainNumber = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
  const field = useFieldControl()
  return <input type="number" {...field} {...props} />
}

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const error = submitted && !email.includes('@') ? 'Enter a valid email address.' : undefined

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack gap={4}>
        <Field label="Email" hint="We never share it." error={error} required>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Seats">
          <PlainNumber min={1} />
        </Field>
        <Field label="Notes" hint="Optional">
          <Textarea rows={3} />
        </Field>
        <Button type="submit">Sign up</Button>
      </Stack>
    </form>
  )
}
