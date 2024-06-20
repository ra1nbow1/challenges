import styles from "../Styles/ProblemList.module.scss";
import ProblemItem from "../Components/ProblemItem";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { IProblem } from '../Utils/Interfaces';

function ProblemsList() {
  const [problems, setProblems] = useState<Array<IProblem>>([]);
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_PRODUCTION == "false" ? 'http://localhost:8000'  : "https://romanovmatvey.tech"
    axios.get(`${baseUrl}/problems`).then((response) => {
      setProblems(response.data);
      document.title = `Romanov — Задачи`;
    });
  }, []);

  return (
    <div className={styles.wrapper}>
      {problems.map((problem: IProblem) => (
        <ProblemItem
          key={problem.pid}
          title={problem.title}
          pid={problem.pid}
          difficulty={problem.difficulty}
        />
      ))}
    </div>
  );
}

export default ProblemsList;
