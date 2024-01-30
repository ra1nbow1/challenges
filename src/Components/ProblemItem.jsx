import styles from "../Styles/ProblemItem.module.scss";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

function ProblemItem({ title, pid, difficulty }) {
  const navigate = useNavigate();
  // TODO: Заменить цвета
  let border_color = "gray";
  switch (difficulty) {
    case "easy":
      border_color = "#49CD33";
      break;
    case "normal":
      border_color = "#CD7D33";
      break;
    case "hard":
      border_color = "#CE2323";
      break;
    default:
      difficulty = "gray";
      break;
  }

  return (
    <button
      onClick={() => navigate(`/problem/${pid}`)}
      className={styles.item}
      style={{ borderColor: border_color }}
    >
      {title}
    </button>
  );
}

ProblemItem.propTypes = {
  title: PropTypes.string.isRequired,
  pid: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
};

export default ProblemItem;
