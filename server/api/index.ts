import { PythonShell } from 'python-shell'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { MongoClient } from 'mongodb'
import fs from 'fs'
import dotenv from 'dotenv'
import { spawn } from 'child_process'
import winston from 'winston'

dotenv.config()

const PORT = 3000
const app = express()

app.use(cors())
app.use(express.json())

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.colorize({ all: true }),
		winston.format.timestamp({
			format: 'DD.MM.YYYY HH:mm:ss',
		}),
		winston.format.align(),
		winston.format.printf(
			(info) => `[${info.level}] ${info.timestamp}: ${info.message}`,
		),
	),
	transports: [new winston.transports.Console()],
})

const client = new MongoClient(process.env.MONGO_URL as string)
const problems = client
	.db(process.env.DB_NAME)
	.collection(process.env.COLLECTION_NAME as string)

client.connect().then(() => {
	logger.info('Подключение установлено')
	logger.info(client.options.dbName)
})

interface IRequest extends Request {
	body: {
		code: string
	}
	params: {
		pid: string
	}
}

function run(solution: string, pid: string = '0'): Promise<string[]> {
	return new Promise((resolve, reject) => {
		fs.writeFile(`../run_${pid}.py`, solution, (err) => {
			if (err) throw err
		})

		const python = spawn('python3', [`../run_${pid}.py`])

		let output = ''
		python.stdout.on('data', (data) => {
			output += data.toString()
		})

		setTimeout(() => {
			python.stdout.off('data', () => {})
			resolve([
				'Превышено время ожидания. Возможно, найдены бесконечные процессы.',
			])
			logger.warn(
				`pid: ${pid} Найден бесконечный цикл или решение не вывело результат`,
			)
			remove(`../run_${pid}.py`)
			remove(`../run_0.py`)
			python.kill()
		}, 2000)

		let errors = ''
		python.stderr.on('data', (data) => {
			errors += data.toString()
		})

		python.on('close', () => {
			if (errors.length > 0) {
				reject(errors.split('\n'))
				remove(`../run_${pid}.py`)
				remove(`../run_0.py`)
			} else if (output.length > 0) {
				resolve(output.split('\n'))
				remove(`../run_${pid}.py`)
				remove(`../run_0.py`)
			} else {
				resolve([])
			}
		})
	})
}

function remove(filename: string): void {
	setTimeout(() => {
		fs.unlink(filename, (err) => {
			if (err && err.code === 'ENOENT') {
				logger.info('Файла не существует')
			} else if (err) {
				logger.error('Возникла ошибка при удалении файла')
			} else {
				logger.info(`${filename} удален`)
			}
		})
	}, 1000)
}

app.get('/', (req: Request, res: Response) => {
	res.send({ status: 'OK' })
})

app.get('/problems', async (req: Request, res: Response) => {
	logger.info('/problems')
	const result = await problems.find({}).toArray()
	res.send(result)
})

app.get('/problem_info/:pid', async (req: IRequest, res: Response) => {
	logger.info(`/problem_info/${req.params.pid}`)
	const result = await problems.findOne({ pid: req.params.pid })
	res.send(result)
})

app.post('/run', async (req: IRequest, res: Response) => {
	logger.info('/run')
	await run(req.body.code)
		.then((results) => {
			res.send(results)
		})
		.catch((err) => {
			res.send(err)
		})
})

app.post('/test/:pid', async (req: IRequest, res: Response) => {
	logger.info(`/test/${req.params.pid}`)
	await run(req.body.code, req.params.pid)
		.then(async () => {
			const problem = await problems.findOne({ pid: req.params.pid })
			if (!problem) {
				res.status(404).send({ error: 'Problem not found' })
				return
			}
			const test_cases = problem['test_cases']

			let test_file = `from run_${req.params.pid} import solution\n`
			for (const test of test_cases) {
				test_file += 'print(' + test + ')\n'
			}
			fs.writeFile(`../tests_${req.params.pid}.py`, test_file, (err) => {
				if (err) throw err
			})

			PythonShell.run(`../tests_${req.params.pid}.py`, {
				mode: 'text',
				pythonOptions: ['-u'],
			})
				.then((result) => {
					let passing = true
					result.forEach((element) => {
						if (element !== 'True') {
							passing = false
						}
					})
					res.send(passing)
				})
				.catch((err) => {
					res.send(err)
				})
		})
		.then(() => {
			remove(`../tests_${req.params.pid}.py`)
		})
		.catch((err) => {
			res.send(err)
		})
})

app.listen(PORT, () => {
	logger.info(`Сервер запущен на порту ${PORT}`)
})
