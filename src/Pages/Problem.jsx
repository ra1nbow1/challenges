import styles from '../Styles/Problem.module.scss'
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { darcula } from '@uiw/codemirror-theme-darcula';
import parse from 'html-react-parser';
import { isMobile } from 'react-device-detect';

function Problem() {
  const baseUrl = import.meta.env.VITE_PRODUCTION == "false" ? 'http://localhost:8000'  : "https://romanovmatvey.tech"
  const { problem_id } = useParams();
  const [problem, setProblem] = useState({});
  const [openedTab, setOpenedTab] = useState('instructions');
  const [output, setOutput] = useState('Пусто')
  const [solution, setSolution] = useState(problem?.code || '')
  const [difficultyColor, setDifficultyColor] = useState('gray')

  useEffect(() => {
    axios.get(`${baseUrl}/problem_info/${problem_id}`).then((response) => {
      document.title = `Romanov — ${response.data.title}`;
      switch (response.data.difficulty) {
        case 'easy':
          response.data.difficulty = 'простой'
          setDifficultyColor('#49CD33')
          break;
        case 'normal':
          response.data.difficulty = 'нормальный'
          setDifficultyColor('#CD7D33')
          break;
        case 'hard':
          response.data.difficulty = 'сложный'
          setDifficultyColor('#CE2323')
          break;
      }
      setProblem(response.data);
      setSolution(response.data.code)
    });
  }, [problem_id]);

  const run = () => {
    setOpenedTab('output')
    axios.post(`${baseUrl}/run`, {
        code: solution,
      }).then((response) => {
        const status = response.data.exitCode == undefined
        if (status) {
          let displayData = []
          response.data.forEach(element => {
            displayData.push(element.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
          })
          setOutput(parse(displayData.join('<br/>')))
        }
        else {
          setOutput(response.data.traceback || 'Не удалось запустить код. Исправьте синтаксические ошибки.')
        }

      })
  }

  const check = () => {
    setOpenedTab('output')
    // Проверка валидности названия функции и колва аргументов
    if (solution.includes(' solution(') && solution.split('\n')[0].split('(').length == problem.test_cases[0].split('(').length) {
    axios.post(`${baseUrl}/test/${problem_id}`, {
        code: solution,
      }).then((response) => {
        if (response.data) {
          setOutput('Все тесты прошли успешно!')
        }
        else {
          setOutput('Тесты не прошли. Исправьте ошибки в коде.')
        }
      })
      .catch(() => setOutput('Ошибка сети'))
    } else{
      setOutput('Исправьте название функции или ее аргументы. Попробуйте перенести модули в функцию.')
    }
  }

  const editorConfig = {tabSize: 4, lineNumbers: true, indentOnInput: true, autocompletion: true, highlightActiveLine: false, closeBrackets: true, highlightActiveLineGutter: false, lintKeymap: true }

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <Link to={'/'} className={styles.goBack}>Назад</Link>
        <div className={styles.row}>
          <div className={styles.title}>{problem.title}</div>
          <div className={styles.difficulty}>{problem.difficulty}</div>
        </div>
        <div className={styles.buttons}>
            <button className={styles.instructions_button} onClick={() => setOpenedTab('instructions')} style={ openedTab == 'instructions' ? { background: '#343131' } : {background: 'none'}}>Условие</button>
            <button className={styles.output_button} onClick={() => setOpenedTab('output')} style={ openedTab == 'output' ? { background: '#343131' } : {background: 'none'}}>Вывод</button>
        </div>
        <div className={styles.tab}>
          { openedTab == 'instructions' ? parse(problem.instructions || '') : output}
        </div>
      </div>
      {!isMobile ?
        <div className={styles.right}>
          <div className={styles.language}>Python 3.11</div>
          <div className={styles.editor}>
            <div className={styles.label}>Решение:</div>
            <CodeMirror className={styles.editor} onChange={(value) => setSolution(value)} theme={darcula} extensions={python()} basicSetup={editorConfig} value={solution} width="961px" height="483px" />
          </div>
          <div className={styles.tests}>
            <div className={styles.label}>Базовые тесты:</div>
            <CodeMirror extensions={python()} editable={false} theme={darcula} basicSetup={editorConfig} value={problem.test_cases?.join('\n') || ''} width="961px" height="161px" />
          </div>
          <div className={styles.row}>
            <div className={styles.warning}>Для корректной работы не изменяйте название и аргументы функции solution().</div>
            <div className={styles.run_buttons}>
              <button className={styles.run} onClick={run} style={{ borderColor: difficultyColor, color: difficultyColor}}>Запустить</button>
              <button className={styles.test} onClick={check} style={{ borderColor: difficultyColor, backgroundColor: difficultyColor}}>Проверить</button>
            </div>
          </div>
        </div>
      :
        <div className={styles.mobile_warning}>Решение задач не предусмотрено на мобильных устройствах.</div>
      }
    </div>
  );
}

export default Problem;
