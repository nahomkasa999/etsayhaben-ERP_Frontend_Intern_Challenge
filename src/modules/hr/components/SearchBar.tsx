'use client'

// ── LOCAL STATE & PROPS ──────────────────────────────────────────
// This component has NO state of its own. The parent owns `value`
// and `onChange` and hands them down. SearchBar just renders an input.

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
    return (
        <input
            type="text"
            placeholder="Search by name..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border rounded px-3 py-2 w-full max-w-xs"
        />
    )
}