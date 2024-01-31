import styles from "../Styles/ProblemList.module.scss";
import ProblemItem from "../Components/ProblemItem";
import { useEffect, useState } from "react";
import axios from "axios";

function ProblemsList() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_PRODUCTION == "false" ? 'http://localhost:8000'  : "https://romanovmatvey.tech"
    axios.get(`${baseUrl}/problems`).then((response) => {
      setProblems(response.data);
    });
  }, []);

  return (
    <div className={styles.wrapper}>
      {problems.map((problem) => (
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
