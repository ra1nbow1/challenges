import React, { MouseEvent } from "react";
import styles from "../Styles/ProblemItem.module.scss";
import { useNavigate } from "react-router-dom";
import { IProblem, Difficulties } from '../Utils/Interfaces';

function ProblemItem({title, pid, difficulty}: Pick<IProblem, 'title' | 'pid' | 'difficulty'>) {
  const navigate = useNavigate();
  let border_color: 'gray' | '#49CD33' | '#CD7D33' | '#CE2323' = "gray";
  switch (difficulty) {
    case Difficulties.easy:
      border_color = "#49CD33";
      break;
    case Difficulties.normal:
      border_color = "#CD7D33";
      break;
    case Difficulties.hard:
      border_color = "#CE2323";
      break;
  }

  return (
    <button
      onClick={(e: MouseEvent<HTMLButtonElement>): void => {navigate(`/problem/${pid}`)}}
      className={styles.item}
      style={{ borderColor: border_color }}
    >
      {title}
    </button>
  );
}

export default ProblemItem;
