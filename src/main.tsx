import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./utils/seedDemoAudio";

createRoot(document.getElementById("root")!).render(<App />);
