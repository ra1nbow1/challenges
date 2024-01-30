import styles from "../Styles/ProblemList.module.scss";
import ProblemItem from "../Components/ProblemItem";
import { useEffect, useState } from "react";
import axios from "axios";

function ProblemsList() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/problems").then((response) => {
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
