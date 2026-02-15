import { createRoot } from "react-dom/client";
import "./index.css";
// import App from "./App.tsx";
import gsap from "gsap";

// Configure GSAP to suppress null target warnings
gsap.config({ nullTargetWarn: false });

console.log("Main.tsx: DYNAMIC LOADER START (ITERATION 2)");

const rootElement = document.getElementById("root");

if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
        <div style={{ padding: 20, fontFamily: 'monospace' }}>
            Initializing... (Iteration 2)
        </div>
    );

    // Dynamic import to catch module evaluation errors
    import("./App.tsx")
        .then((module) => {
            const App = module.default;
            console.log("Main.tsx: App loaded");
            root.render(<App />);
        })
        .catch((error) => {
            console.error("Main.tsx: FAILED TO LOAD APP", error);
            root.render(
                <div style={{ padding: 20, color: 'red', fontFamily: 'monospace' }}>
                    <h1>CRITICAL ERROR LOADING APP</h1>
                    <pre>{String(error)}</pre>
                    <pre>{error?.stack}</pre>
                </div>
            );
        });
} else {
    console.error("Main.tsx: FATAL - Root element not found!");
}
