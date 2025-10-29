'use client'

import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Question } from '../types'
import { CellInput } from './CellInput'
import { DivisionCell } from './DivisionCell'

interface Props {
	question: Question
}

export default function LongDivisionBoard({ question }: Props) {
	const { Steps, Numbers, ResultDigitCount } = question
	const [stepIndex, setStepIndex] = useState(0)
	const [userInputs, setUserInputs] = useState<Record<number, string>>({})
	const [finished, setFinished] = useState(false)
	const [isAnimating, setIsAnimating] = useState(false)

	const step = Steps[stepIndex]
	const dividend = Numbers[0]
	const divisor = Numbers[1]
	const digits = String(dividend).split('')
	const dividendStr = String(dividend)

	const leftRefs = useRef<HTMLInputElement[]>([])
	const rightRefs = useRef<HTMLInputElement[]>([])

	const setCharAt = (s: string, idx: number, ch: string, totalLen: number) => {
		const arr = (s ?? '').padEnd(totalLen, ' ').split('')
		arr[idx] = ch || ' '
		return arr.join('')
	}

	const normalize = (s: string | undefined) => (s ?? '').replace(/\s/g, '')

	const handleInputChangeAt = (
		id: number,
		pos: number,
		ch: string,
		totalLen: number,
		refsArr?: React.MutableRefObject<HTMLInputElement[]>
	) => {
		setUserInputs(prev => {
			const prevStr = prev[id] ?? ''.padEnd(totalLen, ' ')
			const nextStr = setCharAt(prevStr, pos, ch, totalLen)
			return { ...prev, [id]: nextStr }
		})
		if (ch && pos < totalLen - 1) refsArr?.current?.[pos + 1]?.focus()
	}

	const handleSubmit = (id: number) => {
		const val = normalize(userInputs[id])
		if (!val) return
		if (String(step.Sum) === val) {
			toast.success(`Верно! (${step.Hint})`)
			if (step.Hint.toLowerCase().includes('спусти')) {
				setIsAnimating(true)
				setTimeout(() => {
					setIsAnimating(false)
					nextStep()
				}, 450)
			} else {
				nextStep()
			}
		} else {
			toast.error(`Ошибка: ${step.Hint}`)
		}
	}

	const nextStep = () => {
		if (stepIndex < Steps.length - 1) setStepIndex(stepIndex + 1)
		else setFinished(true)
	}

	const getEndIndexForD1 = (d1: number) => {
		const str = String(d1)
		const idx = dividendStr.indexOf(str)
		return idx !== -1 ? idx + str.length - 1 : digits.length - 1
	}

	const isBringDown = (s: (typeof Steps)[number]) =>
		s.Side === 'left' && (s.D2 === 0 || s.Hint.toLowerCase().includes('спусти'))

	const buildLeftRows = (all: typeof Steps) => {
		const rows: {
			id: number
			sum: string
			d1: number
			underline: boolean
			bringDown?: boolean
		}[] = []

		for (const s of all) {
			const bring = isBringDown(s)
			if (bring && rows.length > 0) {
				const prev = rows.at(-1)!
				prev.sum += String(s.Sum).slice(-1)
				prev.d1 = s.D1
				prev.bringDown = true
			} else {
				rows.push({
					id: s.Id,
					sum: String(s.Sum),
					d1: s.D1,
					underline: s.Hint.startsWith('Вычти'),
					bringDown: bring,
				})
			}
		}
		return rows
	}

	const leftDone = Steps.filter(s => s.Side === 'left' && s.Id < stepIndex)
	const rightDone = Steps.filter(s => s.Side === 'right' && s.Id < stepIndex)
	const leftRows = buildLeftRows(leftDone)

	if (finished)
		return (
			<div className='flex flex-col items-center mt-20 text-center'>
				<h1 className='text-3xl font-semibold text-green-600 mb-4'>
					Отлично! Деление выполнено правильно 🎉
				</h1>
			</div>
		)

	return (
		<div className='flex flex-col items-center mt-10 gap-6'>
			<h1 className='text-2xl font-semibold text-black mb-2'>
				Деление в столбик
			</h1>

			<div className='flex items-start gap-2'>
				<div
					className='grid'
					style={{ gridTemplateColumns: `repeat(${digits.length}, 2rem)` }}
				>
					{digits.map((d, i) => (
						<DivisionCell key={i}>{d}</DivisionCell>
					))}

					<div className='mt-2 flex flex-col gap-1'>
						{[
							...leftRows,
							step.Side === 'left'
								? { id: step.Id, sum: '', d1: step.D1, active: true }
								: null,
						]
							.filter(Boolean)
							.map((row: any) => {
								const end = getEndIndexForD1(row.d1)
								const activeLen = (row.active ? String(step.Sum) : row.sum)
									.length
								const start = Math.max(0, end - activeLen + 1)

								return (
									<div
										key={row.id}
										className='grid place-items-center'
										style={{
											gridTemplateColumns: `repeat(${digits.length}, 2rem)`,
										}}
									>
										{digits.map((_, j) => {
											const within = j >= start && j <= end
											const localIdx = j - start
											if (!within) return <DivisionCell key={j} />

											if (row.active) {
												const totalLen = String(step.Sum).length
												const currentVal =
													(userInputs[step.Id] ?? ''.padEnd(totalLen, ' '))[
														localIdx
													] || ''

												return (
													<DivisionCell
														key={j}
														highlight
														showTooltip={localIdx === 0}
														tooltip={localIdx === 0 ? step.Hint : undefined}
													>
														<CellInput
															ref={el =>
																(leftRefs.current[localIdx] =
																	el as HTMLInputElement)
															}
															value={currentVal.trim()}
															onChange={v =>
																handleInputChangeAt(
																	step.Id,
																	localIdx,
																	v,
																	totalLen,
																	leftRefs
																)
															}
															onKeyDown={e => {
																if (e.key === 'Enter') handleSubmit(step.Id)
																if (e.key === 'Backspace') {
																	if (currentVal.trim()) {
																		handleInputChangeAt(
																			step.Id,
																			localIdx,
																			'',
																			totalLen,
																			leftRefs
																		)
																		e.preventDefault()
																		return
																	}
																	if (localIdx > 0) {
																		handleInputChangeAt(
																			step.Id,
																			localIdx - 1,
																			'',
																			totalLen,
																			leftRefs
																		)
																		leftRefs.current[localIdx - 1]?.focus()
																		e.preventDefault()
																	}
																}
															}}
															autoFocus={localIdx === 0}
														/>
													</DivisionCell>
												)
											}

											const val = row.sum[localIdx] || ''
											const animate =
												isAnimating &&
												row.bringDown &&
												localIdx === row.sum.length - 1 &&
												step.Side === 'left'

											return (
												<DivisionCell key={j}>
													{animate ? (
														<motion.span
															initial={{ y: -20, opacity: 0 }}
															animate={{ y: 0, opacity: 1 }}
															transition={{ duration: 0.4, ease: 'easeOut' }}
															className='inline-block'
														>
															{val}
														</motion.span>
													) : (
														val
													)}
												</DivisionCell>
											)
										})}
									</div>
								)
							})}
					</div>
				</div>

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
								<DivisionCell key={i}>{d}</DivisionCell>
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
							const totalLen = String(step.Sum).length

							if (!active) return <DivisionCell key={i}>{val}</DivisionCell>

							return (
								<DivisionCell key={i} highlight showTooltip tooltip={step.Hint}>
									{Array.from({ length: totalLen }).map((__, k) => {
										const currentVal =
											(userInputs[step.Id] ?? ''.padEnd(totalLen, ' '))[k] || ''
										return (
											<CellInput
												key={k}
												ref={el =>
													(rightRefs.current[k] = el as HTMLInputElement)
												}
												value={currentVal.trim()}
												onChange={v =>
													handleInputChangeAt(
														step.Id,
														k,
														v,
														totalLen,
														rightRefs
													)
												}
												onKeyDown={e => {
													if (e.key === 'Enter') handleSubmit(step.Id)
													if (e.key === 'Backspace') {
														if (currentVal.trim()) {
															handleInputChangeAt(
																step.Id,
																k,
																'',
																totalLen,
																rightRefs
															)
															e.preventDefault()
															return
														}
														if (k > 0) {
															handleInputChangeAt(
																step.Id,
																k - 1,
																'',
																totalLen,
																rightRefs
															)
															rightRefs.current[k - 1]?.focus()
															e.preventDefault()
														}
													}
												}}
												autoFocus={k === 0}
											/>
										)
									})}
								</DivisionCell>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}
