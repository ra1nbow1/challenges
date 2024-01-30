import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProblemsList from "./Pages/ProblemsList";
import Problem from "./Pages/Problem";
import "./Styles/App.scss";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProblemsList />} />
        <Route path="/problem/:problem_id" element={<Problem />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
