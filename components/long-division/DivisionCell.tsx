'use client'

import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip'

interface DivisionCellProps {
	highlight?: boolean
	tooltip?: string
	showTooltip?: boolean
	children?: React.ReactNode
}

export function DivisionCell({
	highlight,
	tooltip,
	showTooltip,
	children,
}: DivisionCellProps) {
	const cellClass =
		'w-8 h-8 flex items-center justify-center border border-gray-300 text-black font-mono text-xl ' +
		(highlight ? 'bg-yellow-200' : '')

	if (showTooltip && tooltip) {
		return (
			<Tooltip open disableHoverableContent>
				<TooltipTrigger asChild>
					<div className={cellClass}>{children}</div>
				</TooltipTrigger>
				<TooltipContent side='bottom' align='center' className='text-xs'>
					{tooltip}
				</TooltipContent>
			</Tooltip>
		)
	}

	return <div className={cellClass}>{children}</div>
}
