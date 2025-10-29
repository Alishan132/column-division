'use client'

import { useRef } from 'react'

interface PinInputProps {
	length: number
	value: string
	onChange: (val: string) => void
	onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
	disabled?: boolean
	className?: string
}

export function PinInput({
	length,
	value,
	onChange,
	onKeyDown,
	disabled,
	className = '',
}: PinInputProps) {
	const inputs = useRef<HTMLInputElement[]>([])

	const handleChange = (index: number, v: string) => {
		const digit = v.replace(/\D/g, '').slice(-1)
		if (!digit && v !== '') return
		const newValue =
			value.substring(0, index) + digit + value.substring(index + 1)
		onChange(newValue)
		if (digit && index < length - 1) inputs.current[index + 1]?.focus()
	}

	const handleKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === 'Backspace' && !value[index] && index > 0)
			inputs.current[index - 1]?.focus()
		onKeyDown?.(e)
	}

	return (
		<div
			className={`flex items-center justify-center gap-[2px] w-full h-full ${className}`}
		>
			{Array.from({ length }).map((_, i) => (
				<input
					key={i}
					ref={el => (inputs.current[i] = el!)}
					value={value[i] || ''}
					onChange={e => handleChange(i, e.target.value)}
					onKeyDown={e => handleKeyDown(i, e)}
					maxLength={1}
					disabled={disabled}
					className='w-6 h-6 text-center border border-gray-300 rounded-md text-lg text-black focus:ring-2 focus:ring-blue-400 outline-none'
				/>
			))}
		</div>
	)
}
