/* eslint-disable @typescript-eslint/no-var-requires */
const { PythonShell } = require('python-shell')
const express = require('express')
const cors = require('cors')
const app = express()
const MongoClient = require('mongodb').MongoClient
const fs = require('fs')
const PORT = 8000
require('dotenv').config()
const { spawn } = require('node:child_process')
const winston = require('winston')
const { combine, timestamp, printf, colorize, align } = winston.format

app.use(cors())
app.use(express.json())

const logger = winston.createLogger({
	level: 'info',
	format: combine(
		colorize({ all: true }),
		timestamp({
			format: 'DD.MM.YYYY HH:mm:ss'
		}),
		align(),
		printf((info): string => `[${info.level}] ${info.timestamp}: ${info.message}`)
	),
	transports: [new winston.transports.Console()]
})

const client = new MongoClient(process.env.MONGO_URL)
const problems = client.db(process.env.DB_NAME).collection(process.env.COLLECTION_NAME)

client.connect().then((client): void => {
	logger.info('Подключение установлено')
	logger.info(client.options.dbName)
})

const options = {
	mode: 'text',
	pythonOptions: ['-u']
}

function run(solution: string, pid: number = 0): Promise<unknown> {
	fs.writeFile(`../run_${pid}.py`, solution, (err): void => {
		if (err) throw err
	})
	return new Promise((resolve, reject): void => {
		const python = spawn('python3', [`../run_${pid}.py`])

		let output: string = ''
		python.stdout.on('data', (data): void => {
			output += data.toString()
		})

		setTimeout((): void => {
			python.stdout.off('data', (data) => resolve(data.toString()))
			resolve(['Превышено время ожидания. Возможно, найдены бесконечные процессы.'])
			logger.warn(`pid: ${pid} Найден бесконечный цикл или решение не вывело результат`)
			remove(`../run_${pid}.py`)
			remove(`../run_0.py`)
			python.kill()
		}, 2000)
		let errors: string = ''
		python.stderr.on('data', (data) => {
			errors += data.toString()
		})

		python.on('close', (): void => {
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
	setTimeout((): void => {
		fs.unlink(filename, function (err): void {
			if (err && err.code == 'ENOENT') {
				logger.info('Файла не существует')
			} else if (err) {
				logger.error('Возникла ошибка при удалении файла')
			} else {
				logger.info(`${filename} удален`)
			}
		})
	}, 1000)
}

app.get('/', (req, res): void => {
	res.send({ status: 'OK' })
})

app.get('/problems', async (req, res): Promise<void> => {
	logger.info('/problems')
	const result = await problems.find({}).toArray()
	res.send(result)
})

app.get('/problem_info/:pid', async (req: IRequest, res): Promise<void> => {
	logger.info(`/problem_info/${req.params.pid}`)
	const result = await problems.findOne({ pid: req.params.pid })
	res.send(result)
})

interface IRequest {
	body: {
		code: string
	}
	params: {
		pid: number
	}
}

app.post('/run', async (req: IRequest, res): Promise<void> => {
	logger.info(`/run`)
	await run(req.body.code)
		.then((results) => {
			res.send(results)
		})
		.catch((err) => {
			res.send(err)
		})
})

app.post('/test/:pid', (req: IRequest, res): void => {
	logger.info(`/test/${req.params.pid}`)
	run(req.body.code, req.params.pid)
		.then(async (): Promise<void> => {
			const problem = await problems.findOne({ pid: req.params.pid })
			const test_cases = problem['test_cases']

			let test_file = `from run_${req.params.pid} import solution\n`
			for (const test of test_cases) {
				test_file += 'print(' + test + ')\n'
			}
			fs.writeFile(`../tests_${req.params.pid}.py`, test_file, (err): void => {
				if (err) throw err
			})
			PythonShell.run(`../tests_${req.params.pid}.py`, options)
				.then(function (result): void {
					let passing = true
					result.forEach((element): void => {
						if (element !== 'True') {
							passing = false
						}
					})
					res.send(passing)
				})
				.catch(function (err): void {
					res.send(err)
				})
		})
		.then((): void => {
			remove(`../tests_${req.params.pid}.py`)
		})
		.catch(function (err): void {
			res.send(err)
		})
})

app.listen(process.env.PORT || PORT, (): void => {
	logger.info(`Сервер запущен на порту ${PORT}`)
})
