'use client'

import { Button } from '@/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { useState } from 'react'
import { Question } from './types'

interface Props {
	question: Question
}

export default function LongDivisionBoard({ question }: Props) {
	const { Steps, Numbers, ResultDigitCount } = question
	const [stepIndex, setStepIndex] = useState(0)

	const step = Steps[stepIndex]
	const dividend = Numbers[0]
	const divisor = Numbers[1]
	const digits = String(dividend).split('')
	const dividendStr = String(dividend)

	const nextStep = () => {
		if (stepIndex < Steps.length - 1) setStepIndex(stepIndex + 1)
	}
	const prevStep = () => {
		if (stepIndex > 0) setStepIndex(stepIndex - 1)
	}

	const getEndIndexForD1 = (d1: number) => {
		const str = String(d1)
		const idx = dividendStr.indexOf(str)
		return idx !== -1 ? idx + str.length - 1 : digits.length - 1
	}

	const isBringDown = (s: (typeof Steps)[number]) =>
		s.Side === 'left' && (s.D2 === 0 || s.Hint.toLowerCase().includes('спусти'))

	const buildLeftRows = (all: typeof Steps) => {
		const rows: { id: number; sum: string; d1: number; underline: boolean }[] =
			[]
		for (const s of all) {
			if (isBringDown(s) && rows.length > 0) {
				const prev = rows.at(-1)!
				prev.sum += String(s.Sum).slice(-1)
				prev.d1 = s.D1
			} else {
				rows.push({
					id: s.Id,
					sum: String(s.Sum),
					d1: s.D1,
					underline: s.Hint.startsWith('Вычти'),
				})
			}
		}
		return rows
	}

	const leftDone = Steps.filter(s => s.Side === 'left' && s.Id < stepIndex)
	const rightDone = Steps.filter(s => s.Side === 'right' && s.Id < stepIndex)
	const leftRows = buildLeftRows(leftDone)

	const cell =
		'w-8 h-8 flex items-center justify-center border border-gray-300 text-black font-mono text-xl'

	return (
		<div className='flex flex-col items-center mt-10 gap-6'>
			<h1 className='text-2xl font-semibold text-black mb-2'>
				Деление в столбик
			</h1>

			<div className='flex items-start gap-2'>
				{/* Делимое и левая часть */}
				<div
					className='grid'
					style={{ gridTemplateColumns: `repeat(${digits.length}, 2rem)` }}
				>
					{digits.map((digit, i) => {
						let active = false
						if (step.Side === 'right') {
							const end = getEndIndexForD1(step.D1)
							const start = end - String(step.D1).length + 1
							active = i >= start && i <= end
						}
						return (
							<div
								key={i}
								className={`${cell} ${active ? 'bg-yellow-200' : ''}`}
							>
								{digit}
							</div>
						)
					})}

					<div className='mt-2 flex flex-col gap-1'>
						{leftRows.map((row, i) => {
							const end = getEndIndexForD1(row.d1)
							const start = Math.max(0, end - String(row.sum).length + 1)
							const prev = leftRows[i - 1]
							const underlineAbove =
								prev?.underline || (row.underline && i === 0)
							return (
								<div key={row.id} className='flex flex-col relative'>
									{underlineAbove && (
										<div className='absolute -top-1 w-full h-[2px] bg-black/60' />
									)}
									<div
										className='grid place-items-center'
										style={{
											gridTemplateColumns: `repeat(${digits.length}, 2rem)`,
										}}
									>
										{digits.map((_, j) => {
											const within = j >= start && j <= end
											const val = within ? row.sum[j - start] : ''
											return (
												<div key={j} className={cell}>
													{val}
												</div>
											)
										})}
									</div>
								</div>
							)
						})}

						{step.Side === 'left' && (
							<Tooltip open disableHoverableContent>
								<TooltipTrigger asChild>
									<div
										className='grid place-items-center'
										style={{
											gridTemplateColumns: `repeat(${digits.length}, 2rem)`,
										}}
									>
										{digits.map((_, i) => {
											const end = getEndIndexForD1(step.D1)
											const start = Math.max(
												0,
												end - String(step.Sum).length + 1
											)
											const within = i >= start && i <= end
											return (
												<div key={i} className={cell}>
													{within && (
														<span className='bg-yellow-200 w-full h-full inline-flex' />
													)}
												</div>
											)
										})}
									</div>
								</TooltipTrigger>
								<TooltipContent
									side='bottom'
									align='center'
									className='text-xs'
								>
									{step.Hint}
								</TooltipContent>
							</Tooltip>
						)}
					</div>
				</div>

				{/* Делитель и частное */}
				<div className='flex flex-col items-center text-black'>
					<div
						className='grid'
						style={{
							gridTemplateColumns: `repeat(${String(divisor).length}, 2rem)`,
						}}
					>
						{String(divisor)
							.split('')
							.map((d, i) => (
								<div key={i} className={`${cell} font-bold`}>
									{d}
								</div>
							))}
					</div>

					<div
						className='mt-2 grid'
						style={{
							gridTemplateColumns: `repeat(${ResultDigitCount}, 2rem)`,
						}}
					>
						{Array.from({ length: ResultDigitCount }).map((_, i) => {
							const val = rightDone[i]?.Sum ?? ''
							const active = step.Side === 'right' && i === rightDone.length
							return (
								<Tooltip key={i} open={active} disableHoverableContent>
									<TooltipTrigger asChild>
										<div className={`${cell} ${active ? 'bg-yellow-200' : ''}`}>
											{val}
										</div>
									</TooltipTrigger>
									<TooltipContent
										side='bottom'
										align='center'
										className='text-xs'
									>
										{step.Hint}
									</TooltipContent>
								</Tooltip>
							)
						})}
					</div>
				</div>
			</div>

			<div className='flex gap-2 mt-10'>
				<Button
					onClick={prevStep}
					disabled={stepIndex === 0}
					variant='secondary'
				>
					prev step
				</Button>
				<Button onClick={nextStep} disabled={stepIndex === Steps.length - 1}>
					next step
				</Button>
			</div>
		</div>
	)
}
