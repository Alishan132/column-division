export type Step = {
	Id: number
	D1: number
	D2: number
	CarryIn: number
	Sum: number
	CarryOut: number
	ParentHint: string
	Hint: string
	Side: 'left' | 'right'
}

export type Question = {
	Steps: Step[]
	ResultDigitCount: number
	MathOperation: number
	Numbers: number[]
}

export type DataJson = {
	questionId: number
	studentQuestionId: number
	questionText: string
	motivationMessage: string | null
	question: Question
	steps: null
	options: null
	answerType: number
	correctAnswer: number | null
	backgroundImg: string
	questionImgs: null
	level: number
	readable: boolean
	questionReadText: string
	hints: []
	backgroundImg2: string
}
