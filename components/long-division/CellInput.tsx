'use client'

import { forwardRef } from 'react'

interface CellInputProps {
	value: string
	onChange: (v: string) => void
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
	autoFocus?: boolean
	disabled?: boolean
}

export const CellInput = forwardRef<HTMLInputElement, CellInputProps>(
	({ value, onChange, onKeyDown, autoFocus, disabled }, ref) => {
		return (
			<input
				ref={ref}
				value={value || ''}
				onChange={e => {
					const v = e.target.value.replace(/\D/g, '').slice(-1)
					onChange(v)
				}}
				onKeyDown={onKeyDown}
				maxLength={1}
				autoFocus={autoFocus}
				disabled={disabled}
				className='w-full h-full text-center font-mono text-xl text-black outline-none border-none bg-transparent [appearance:textfield]'
				inputMode='numeric'
			/>
		)
	}
)

CellInput.displayName = 'CellInput'
