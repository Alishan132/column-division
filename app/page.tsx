import stepsData from '@/app/data.json'
import LongDivisionBoard from '@/components/long-division/LongDivisionBoard'

export default function Page() {
	return (
		<main className='min-h-screen flex justify-center bg-gray-50'>
			<LongDivisionBoard question={stepsData.question} />
		</main>
	)
}
