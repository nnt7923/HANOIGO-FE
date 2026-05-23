export function Field({
  label,
  onChange,
  value,
  type = 'text',
  required,
  min,
}: {
  label: string
  onChange: (value: string) => void
  value: string
  type?: string
  required?: boolean
  min?: number
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        min={min}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
  )
}
