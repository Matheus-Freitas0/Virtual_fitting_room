import { BrowserRouter, Routes, Route } from "react-router-dom";
import VisualizaTryOn from "./client/pages/VisualizaTryOn";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VisualizaTryOn />} />
        <Route path="/try-on" element={<VisualizaTryOn />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
