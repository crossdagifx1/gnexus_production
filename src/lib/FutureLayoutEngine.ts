/**
 * G-NEXUS FUTURE LAYOUT ENGINE
 * 
 * Generates cinematic, 3D-accelerated HTML interfaces "FutureOS".
 * Combines WebGL (Three.js), Glassmorphism, and Neural Content.
 */

import { NeuralContent } from './NeuralCore';
import { IndustryProfile } from './designIntelligence';

export function generateFutureHTML(content: NeuralContent, industry: IndustryProfile): string {
    const colors = industry.colors;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title} | FutureOS</title>
    
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Inter:wght@300;400&display=swap" rel="stylesheet">
    
    <!-- Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    
    <style>
        :root {
            --primary: ${colors.primary};
            --secondary: ${colors.secondary};
            --accent: ${colors.accent};
            --bg-dark: ${colors.background};
            --glass: rgba(255, 255, 255, 0.03);
            --glass-border: rgba(255, 255, 255, 0.08);
            --neon-glow: 0 0 10px var(--primary), 0 0 20px var(--primary);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            background: #000;
            color: #fff;
            font-family: 'Rajdhani', sans-serif;
            overflow-x: hidden;
            height: 100vh;
        }

        /* CANVAS BACKGROUND */
        #canvas-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.6;
        }

        /* HOLO-HUD OVERLAY */
        .hud-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 100;
            background: 
                linear-gradient(90deg, var(--glass-border) 1px, transparent 1px) 0 0 / 100px 100px,
                linear-gradient(0deg, var(--glass-border) 1px, transparent 1px) 0 0 / 100px 100px;
            mask-image: radial-gradient(circle at center, transparent 30%, black 100%);
        }

        .hud-corner {
            position: absolute;
            width: 100px;
            height: 100px;
            border: 2px solid var(--primary);
            opacity: 0.5;
        }
        .tl { top: 20px; left: 20px; border-right: none; border-bottom: none; }
        .tr { top: 20px; right: 20px; border-left: none; border-bottom: none; }
        .bl { bottom: 20px; left: 20px; border-right: none; border-top: none; }
        .br { bottom: 20px; right: 20px; border-left: none; border-top: none; }

        /* CONTENT CONTAINER */
        .main-content {
            position: relative;
            z-index: 10;
            max-width: 1400px;
            margin: 0 auto;
            padding: 4rem 2rem;
            height: 100vh;
            overflow-y: auto;
            scroll-behavior: smooth;
        }
        
        .main-content::-webkit-scrollbar { width: 4px; }
        .main-content::-webkit-scrollbar-thumb { background: var(--primary); }

        /* TYPOGRAPHY */
        h1 {
            font-family: 'Orbitron', sans-serif;
            font-size: 4rem;
            text-transform: uppercase;
            letter-spacing: 4px;
            margin-bottom: 0.5rem;
            text-shadow: 0 0 20px var(--primary);
            background: linear-gradient(90deg, #fff, var(--primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .subtitle {
            font-size: 1.5rem;
            color: var(--accent);
            margin-bottom: 3rem;
            font-weight: 300;
            letter-spacing: 2px;
        }

        /* GRID SYSTEM */
        .grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: 2rem;
            margin-bottom: 4rem;
        }

        /* HOLO CARDS */
        .holo-card {
            background: var(--glass);
            border: 1px solid var(--glass-border);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 4px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .holo-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: var(--primary);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.5s ease;
        }

        .holo-card:hover::before {
            transform: scaleX(1);
        }

        .holo-card:hover {
            box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
            background: rgba(255, 255, 255, 0.05);
            border-color: var(--primary);
        }

        /* DATA VIZ */
        .metric-value {
            font-family: 'Orbitron', sans-serif;
            font-size: 2.5rem;
            color: #fff;
            margin: 1rem 0;
        }

        .metric-trend {
            font-size: 0.9rem;
            color: var(--accent);
            text-transform: uppercase;
        }

        .metric-trend.up { color: #22c55e; }
        .metric-trend.down { color: #ef4444; }

        /* ANIMATION UTILS */
        .scan-line {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 5px;
            background: var(--primary);
            opacity: 0.3;
            animation: scan 4s linear infinite;
            pointer-events: none;
            z-index: 101;
        }

        @keyframes scan {
            0% { top: -10%; opacity: 0; }
            50% { opacity: 0.3; }
            100% { top: 110%; opacity: 0; }
        }
    </style>
</head>
<body>
    <div id="canvas-container"></div>
    <div class="scan-line"></div>
    
    <!-- HOLO HUD -->
    <div class="hud-overlay">
        <div class="hud-corner tl"></div>
        <div class="hud-corner tr"></div>
        <div class="hud-corner bl"></div>
        <div class="hud-corner br"></div>
    </div>

    <div class="main-content">
        <header style="margin-bottom: 4rem;">
            <div style="font-family: 'Orbitron'; color: var(--primary); font-size: 0.8rem; margin-bottom: 1rem;">
                SYSTEM STATUS: ONLINE // PROTOCOL: ${content.intent.toUpperCase()}
            </div>
            <h1>${content.title}</h1>
            <div class="subtitle">${content.subtitle}</div>
        </header>

        <!-- METRICS ROW -->
        <div class="grid">
            ${content.metrics.map(m => `
                <div class="holo-card" style="grid-column: span 3;">
                    <div style="color: var(--text-muted); font-size: 0.8rem; text-transform: uppercase;">${m.label}</div>
                    <div class="metric-value">${m.value}</div>
                    <div class="metric-trend ${m.trend}">
                        ${m.trend === 'up' ? '▲' : m.trend === 'down' ? '▼' : '►'} ${m.delta}
                    </div>
                </div>
            `).join('')}
        </div>

        <!-- MAIN SECTIONS -->
        <div class="grid">
            ${content.sections.map((section, i) => `
                <div class="holo-card" style="grid-column: span ${i === 0 ? '8' : '4'};">
                    <h3 style="font-family: 'Orbitron'; margin-bottom: 1.5rem; color: var(--primary);">${section.title}</h3>
                    ${renderSectionContent(section)}
                </div>
            `).join('')}
        </div>
        
        <!-- CHART SECTION IF EXISTS -->
        ${content.chart ? `
        <div class="holo-card" style="margin-bottom: 4rem;">
            <h3 style="font-family: 'Orbitron'; margin-bottom: 1.5rem;">${content.chart.title}</h3>
            <div style="height: 300px; display: flex; align-items: flex-end; gap: 20px; padding-top: 20px;">
                ${renderChart(content.chart, colors.primary)}
            </div>
        </div>
        ` : ''}

    </div>

    <script>
        // THREE.JS BACKGROUND SCENE
        const initThree = () => {
            const container = document.getElementById('canvas-container');
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(renderer.domElement);

            // Create Geometric Lattice based on industry color
            const geometry = new THREE.IcosahedronGeometry(10, 2);
            const material = new THREE.MeshBasicMaterial({ 
                color: '${colors.primary}',
                wireframe: true,
                transparent: true,
                opacity: 0.15
            });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);

            // Starfield
            const particlesGeometry = new THREE.BufferGeometry();
            const count = 1000;
            const posArray = new Float32Array(count * 3);
            for(let i = 0; i < count * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 50;
            }
            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.05,
                color: '${colors.secondary}'
            });
            const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
            scene.add(particlesMesh);

            camera.position.z = 20;

            // Mouse Interaction
            let mouseX = 0;
            let mouseY = 0;
            document.addEventListener('mousemove', (event) => {
                mouseX = event.clientX / window.innerWidth - 0.5;
                mouseY = event.clientY / window.innerHeight - 0.5;
            });

            const animate = () => {
                requestAnimationFrame(animate);

                sphere.rotation.x += 0.001;
                sphere.rotation.y += 0.002;

                // Reactive movement
                sphere.rotation.x += mouseY * 0.05;
                sphere.rotation.y += mouseX * 0.05;
                
                particlesMesh.rotation.y = -mouseX * 0.1;
                particlesMesh.rotation.x = -mouseY * 0.1;

                renderer.render(scene, camera);
            };

            animate();

            // Handle Resize
            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        };

        // Initialize
        initThree();

        // GSAP ENTRANCE ANIMATIONS
        gsap.from('h1', { duration: 1, y: 50, opacity: 0, ease: 'power3.out', delay: 0.2 });
        gsap.from('.subtitle', { duration: 1, y: 30, opacity: 0, ease: 'power3.out', delay: 0.4 });
        gsap.from('.holo-card', { duration: 0.8, y: 50, opacity: 0, stagger: 0.1, ease: 'power2.out', delay: 0.6 });

    </script>
</body>
</html>`;
}

function renderSectionContent(section: NeuralContent['sections'][0]): string {
    if (section.type === 'list') {
        return `<ul style="list-style: none;">
            ${section.content.map(item => `<li style="margin-bottom: 10px; padding-left: 15px; border-left: 2px solid var(--accent);">${item}</li>`).join('')}
        </ul>`;
    }
    if (section.type === 'cards') {
        return `<div style="display: flex; flex-direction: column; gap: 10px;">
            ${section.content.map(item => `<div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 4px;">${item}</div>`).join('')}
        </div>`;
    }
    return section.content.map(p => `<p style="margin-bottom: 1rem; line-height: 1.6; color: var(--text-secondary);">${p}</p>`).join('');
}

function renderChart(chart: any, color: string): string {
    const max = Math.max(...chart.data.datasets[0].data);
    return chart.data.datasets[0].data.map((val: number, i: number) => `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%;">
            <div style="width: 100%; background: ${color}; opacity: 0.8; height: ${(val / max) * 100}%; border-radius: 4px 4px 0 0; position: relative; transition: height 1s ease;">
                <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); font-size: 12px;">${val}</div>
            </div>
            <div style="font-size: 10px; margin-top: 10px; color: #888;">${chart.data.labels[i]}</div>
        </div>
    `).join('');
}
