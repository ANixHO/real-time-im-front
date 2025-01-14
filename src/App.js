import logo from './logo.svg';
import './App.css';
import {Navigate, Route, Router, Routes} from "react-router-dom";
import SingleChat from "./pages/SingleChat";

function App() {
  return (
      <SingleChat/>
    // <Router>
    //   <div className={"App"}>
    //     <Routes>
    //       <Route path={"/"} element={<SingleChat/>} />
    //     </Routes>
    //   </div>
    // </Router>
  );
}

export default App;
