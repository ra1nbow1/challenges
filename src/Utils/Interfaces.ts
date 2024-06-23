export const enum Difficulties {
	easy = 'easy',
	normal = 'normal',
	hard = 'hard'
}

export interface IProblem {
	pid: string
	title: string
	instructions: string
	code: string
	difficulty: Difficulties
	test_cases: string[]
}
