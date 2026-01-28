/**
 * Advanced HTML Generation System
 * Multiple templates with modern design and interactive features
 */

export interface HTMLTemplate {
    id: string;
    name: string;
    description: string;
    category: 'landing' | 'dashboard' | 'documentation' | 'portfolio' | 'saas' | 'mobile';
    generateHTML: (goal: string, analysis: string, data?: Record<string, any>) => string;
}

// Helper to extract key points from analysis text
function extractKeyPoints(text: string, count: number = 6): string[] {
    if (!text) return ['High Performance', 'Secure by Design', 'Scalable Architecture', 'User Centric', 'AI Powered', 'Global Reach'];

    // Look for bullet points or numbered lists
    const lines = text.split('\n');
    const points: string[] = [];

    for (const line of lines) {
        const clean = line.trim();
        if ((clean.startsWith('-') || clean.startsWith('•') || /^\d+\./.test(clean)) && clean.length > 10 && clean.length < 100) {
            points.push(clean.replace(/^[-•\d\.]+\s*/, '').trim());
        }
    }

    // Fallback if no bullets found
    if (points.length < count) {
        const sentences = text.match(/[A-Z][^.!?]*[.!?]/g) || [];
        points.push(...sentences.filter(s => s.length > 15 && s.length < 80).map(s => s.trim()));
    }

    // Fill remaining with defaults
    const defaults = ['Advanced Technology', 'Seamless Integration', 'Enterprise Security', 'Real-time Analytics', 'Cloud Native', '24/7 Support'];
    while (points.length < count) {
        points.push(defaults[points.length % defaults.length]);
    }

    return points.slice(0, count);
}

// Helper to guess metrics based on goal keywords
function guessMetrics(goal: string) {
    const g = goal.toLowerCase();
    if (g.includes('finance') || g.includes('trading') || g.includes('money')) {
        return { label1: 'Transaction Volume', val1: '$2.5B', label2: 'Active Traders', val2: '50k+' };
    }
    if (g.includes('health') || g.includes('fitness') || g.includes('medical')) {
        return { label1: 'Lives Impacted', val1: '1M+', label2: 'Daily Check-ins', val2: '150k' };
    }
    if (g.includes('education') || g.includes('learn') || g.includes('school')) {
        return { label1: 'Students Enrolled', val1: '500k', label2: 'Course Completion', val2: '94%' };
    }
    return { label1: 'YOY Growth', val1: '300%', label2: 'Active Users', val2: '2.5M' };
}

export const HTML_TEMPLATES: HTMLTemplate[] = [
    {
        id: 'modern-landing',
        name: 'Ultra-Modern Dynamic Landing',
        description: 'Context-aware page that adapts content to the analysis',
        category: 'landing',
        generateHTML: (goal: string, analysis: string, data?: Record<string, any>) => {
            const features = extractKeyPoints(analysis, 6);
            const metrics = guessMetrics(goal);
            const icons = ['⚡', '🛡️', '💎', '📈', '🤖', '🌍'];

            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${goal} | Advanced Experience</title>
    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <!-- External Libraries -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    
    <style>
        :root {
            --primary: #f97316;
            --secondary: #8b5cf6;
            --accent: #10b981;
            --dark: #030712; 
            --darkb: #0f172a;
            --gray: #9ca3af;
            --light: #f8fafc;
            --glass: rgba(15, 23, 42, 0.6);
            --glass-border: rgba(255, 255, 255, 0.08);
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            background: var(--dark);
            color: var(--light);
            line-height: 1.6;
            overflow-x: hidden;
            font-size: 16px;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: var(--dark); }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--primary); }
        
        /* Navigation */
        .nav-container {
            position: fixed;
            top: 20px; left: 50%; transform: translateX(-50%);
            width: 90%; max-width: 1200px;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(16px);
            z-index: 1000;
            border: 1px solid var(--glass-border);
            border-radius: 100px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            opacity: 0; /* Hidden initally for GSAP */
        }
        
        .nav { padding: 0.75rem 2rem; display: flex; justify-content: space-between; align-items: center; }
        
        .logo { 
            font-weight: 800; font-size: 1.25rem; letter-spacing: -0.02em;
            background: linear-gradient(135deg, white, #94a3b8);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            display: flex; align-items: center; gap: 0.5rem;
        }

        .nav-links { display: flex; gap: 2rem; align-items: center; }
        .nav-link { color: #94a3b8; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.3s; }
        .nav-link:hover { color: white; }
        
        .nav-cta {
            background: white; color: black; padding: 0.5rem 1.25rem; border-radius: 100px;
            font-weight: 600; font-size: 0.9rem; text-decoration: none; transition: transform 0.3s;
        }
        .nav-cta:hover { transform: scale(1.05); }

        /* Sections */
        section {
            min-height: 100vh; padding: 8rem 2rem; position: relative;
            display: flex; flex-direction: column; justify-content: center; overflow: hidden;
        }
        
        .container { max-width: 1200px; margin: 0 auto; width: 100%; position: relative; z-index: 10; }

        /* Hero */
        #hero { padding-top: 120px; }
        #webgl-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; opacity: 0.6; pointer-events: none; }

        .hero-badge {
            display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem;
            background: rgba(255,255,255,0.03); border-radius: 100px; border: 1px solid var(--glass-border);
            font-size: 0.85rem; color: #94a3b8; margin-bottom: 2rem;
        }
        
        .hero h1 {
            font-size: clamp(3.5rem, 8vw, 7rem); font-weight: 800; line-height: 1; letter-spacing: -0.04em;
            margin-bottom: 2rem; background: linear-gradient(180deg, #fff 0%, #cbd5e1 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); /* For GSAP Reveal */
        }
        
        .hero p {
            font-size: 1.25rem; color: #94a3b8; margin-bottom: 3rem; max-width: 600px; margin-inline: auto;
            line-height: 1.8;
        }
        
        .btn-group { display: flex; gap: 1rem; justify-content: center; }

        /* Glass Cards */
        .glass-card {
            background: var(--glass); border: 1px solid var(--glass-border); padding: 2.5rem;
            border-radius: 24px; transition: all 0.5s; backdrop-filter: blur(12px);
            opacity: 0; transform: translateY(50px); /* Init for GSAP */
        }
        .glass-card:hover { 
            transform: translateY(-10px) !important; border-color: rgba(255,255,255,0.2); 
            background: rgba(30, 41, 59, 0.6); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5); 
        }

        .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; }

        /* Metrics */
        .metrics-container {
            background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
            border-radius: 32px; padding: 3rem; border: 1px solid var(--glass-border);
        }

        /* Buttons */
        .btn {
            padding: 1rem 2.5rem; border-radius: 12px; font-weight: 600; text-decoration: none;
            cursor: pointer; font-size: 1rem; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .btn-primary {
            background: linear-gradient(135deg, var(--primary), #ea580c); color: white; border: none;
            box-shadow: 0 4px 20px rgba(249,115,22,0.3);
        }
        .btn-outline { background: transparent; border: 1px solid rgba(255,255,255,0.15); color: white; }
    </style>
</head>
<body>
    <div id="webgl-bg"></div>

    <div class="nav-container">
        <nav class="nav">
            <div class="logo">G-NEXUS</div>
            <div class="nav-links">
                <a href="#hero" class="nav-link">Home</a>
                <a href="#analysis" class="nav-link">Strategy</a>
                <a href="#features" class="nav-link">Features</a>
                <a href="#metrics" class="nav-link">Growth</a>
                <a href="#roadmap" class="nav-link">Roadmap</a>
            </div>
            <a href="#contact" class="nav-cta">Get Started</a>
        </nav>
    </div>

    <!-- 1. Hero -->
    <section id="hero">
        <div class="container">
            <div class="hero-badge"><span></span> AI-Optimized Architecture</div>
            <h1 class="hero-title">${goal}</h1>
            <p class="hero-text">A bespoke digital solution engineered for performance. Enhanced with Three.js 3D environments and GSAP motion synthesis.</p>
            <div class="btn-group">
                <a href="#metrics" class="btn btn-primary">See Projections</a>
                <a href="#analysis" class="btn btn-outline">Read Strategy</a>
            </div>
        </div>
    </section>

    <!-- 2. Analysis -->
    <section id="analysis">
        <div class="container">
            <div style="text-align: center; margin-bottom: 4rem;">
                <h2 class="section-title" style="font-size: 2.5rem; font-weight: 700;">Strategic Synthesis</h2>
            </div>
            <div class="glass-card" style="font-family: 'JetBrains Mono', monospace; color: #d1d5db; line-height: 1.7;">
                <pre style="white-space: pre-wrap;">${(analysis || 'Generating strategy...').slice(0, 1000)}...</pre>
            </div>
        </div>
    </section>

    <!-- 3. Features -->
    <section id="features">
        <div class="container">
             <div style="text-align: center; margin-bottom: 5rem;">
                <h2 class="section-title" style="font-size: 3rem; font-weight: 800;">Core Capabilities</h2>
            </div>
            <div class="grid-3">
                ${features.map((feature, i) => `
                <div class="glass-card feature-item">
                    <div style="font-size: 2.5rem; margin-bottom: 1.5rem;">${icons[i % icons.length]}</div>
                    <h3 style="font-size: 1.25rem; margin-bottom: 1rem; font-weight: 700;">${feature.split(':')[0]}</h3>
                    <p style="color: #94a3b8; font-size: 0.95rem;">${feature.includes(':') ? feature.split(':')[1] : 'Engineered for maximum efficiency and scalability.'}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- 4. Metrics -->
    <section id="metrics">
        <div class="container">
            <div class="grid-3" style="align-items: center;">
                <div class="metrics-text">
                    <h2 class="section-title" style="font-size: 3rem; line-height: 1.1; margin-bottom: 1.5rem; font-weight: 800;">Projected<br><span style="color: var(--accent);">Impact</span></h2>
                    <div style="display: flex; gap: 2rem;">
                         <div>
                            <div style="font-size: 2.5rem; font-weight: 700; color: white;">${metrics.val1}</div>
                            <div style="font-size: 0.9rem; color: #94a3b8;">${metrics.label1}</div>
                        </div>
                    </div>
                </div>
                <div class="metrics-container" style="grid-column: span 2;">
                    <canvas id="growthChart"></canvas>
                </div>
            </div>
        </div>
    </section>

    <!-- 5. Roadmap -->
    <section id="roadmap">
        <div class="container">
            <h2 class="section-title" style="font-size: 2.5rem; text-align: center; margin-bottom: 4rem;">Execution Roadmap</h2>
            <div class="roadmap-steps" style="max-width: 600px; margin: 0 auto;">
                <div class="glass-card" style="margin-bottom: 1rem; border-left: 4px solid var(--primary);">
                    <h3 style="color: white; margin-bottom: 0.5rem;">Phase 1: Foundation</h3>
                    <p style="color: #94a3b8;">Infrastructure setup and core development.</p>
                </div>
                <div class="glass-card" style="margin-bottom: 1rem; border-left: 4px solid var(--secondary);">
                    <h3 style="color: white; margin-bottom: 0.5rem;">Phase 2: Launch</h3>
                    <p style="color: #94a3b8;">Market entry and initial user acquisition.</p>
                </div>
                 <div class="glass-card" style="border-left: 4px solid var(--accent);">
                    <h3 style="color: white; margin-bottom: 0.5rem;">Phase 3: Scale</h3>
                    <p style="color: #94a3b8;">Global expansion and feature optimization.</p>
                </div>
            </div>
        </div>
    </section>

    <footer style="padding: 4rem 2rem; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
        <div style="margin-bottom: 2rem; font-weight: 800; font-size: 1.5rem;">G-NEXUS</div>
        <p style="color: #64748b;">&copy; 2026 G-Nexus Intelligence</p>
    </footer>

    <script>
        // Register GSAP Plugin
        gsap.registerPlugin(ScrollTrigger);

        // 1. Three.js Background (Starfield)
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('webgl-bg').appendChild(renderer.domElement);

        // Particles
        const geometry = new THREE.BufferGeometry();
        const particlesCount = 1500;
        const posArray = new Float32Array(particlesCount * 3);
        
        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 15;
        }
        geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.005,
            color: 0xf97316,
            transparent: true,
            opacity: 0.8
        });
        
        const particlesMesh = new THREE.Points(geometry, material);
        scene.add(particlesMesh);
        camera.position.z = 2;

        // Animation Loop
        const animate3D = () => {
            requestAnimationFrame(animate3D);
            particlesMesh.rotation.y += 0.0005;
            particlesMesh.rotation.x += 0.0002;
            renderer.render(scene, camera);
        };
        animate3D();

        // Responsive Three.js
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // 2. GSAP Animations
        // Navbar reveal
        gsap.to('.nav-container', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.5 });
        
        // Hero Content Stagger
        const tl = gsap.timeline();
        tl.from('.hero-badge', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' })
          .from('.hero-title', { y: 50, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.6')
          .from('.hero-text', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
          .from('.btn-group', { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');

        // ScrollTriggers for Sections
        gsap.utils.toArray('section').forEach(section => {
            gsap.from(section.querySelectorAll('.section-title, .glass-card, .metrics-text, .metrics-container'), {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out'
            });
        });

        // 3. Chart.js (Keep existing logic)
        const ctx = document.getElementById('growthChart').getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(249, 115, 22, 0.5)');
        gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Trend',
                    data: [12, 19, 35, 65, 95, 150],
                    borderColor: '#f97316',
                    backgroundColor: gradient,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    </script>
</body>
</html>`;
        }
    },
    {
        id: 'dashboard',
        name: 'Analytics Dashboard',
        description: 'Professional dashboard with charts and metrics',
        category: 'dashboard',
        generateHTML: (goal: string, analysis: string, data?: Record<string, any>) => {
            const metrics = guessMetrics(goal);
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${goal} | Dashboard</title>
    <style>
        :root { --primary: #f97316; --dark: #0f172a; --light: #f8fafc; }
        body { font-family: system-ui; background: var(--dark); color: var(--light); margin: 0; display: grid; grid-template-columns: 250px 1fr; min-height: 100vh; }
        .sidebar { background: rgba(30,41,59,0.8); padding: 2rem; border-right: 1px solid #333; }
        .main { padding: 2rem; }
        .card { background: rgba(30,41,59,0.5); padding: 1.5rem; border-radius: 12px; border: 1px solid #333; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
    </style>
</head>
<body>
    <div class="sidebar"><h3>${goal}</h3></div>
    <div class="main">
        <h1>Overview</h1>
        <div class="grid">
            <div class="card"><h3>${metrics.label1}</h3><h2>${metrics.val1}</h2></div>
            <div class="card"><h3>${metrics.label2}</h3><h2>${metrics.val2}</h2></div>
        </div>
    </div>
</body>
</html>`;
        }
    }
];

export function getTemplateById(id: string): HTMLTemplate | undefined {
    return HTML_TEMPLATES.find(template => template.id === id);
}

export function getTemplatesByCategory(category: string): HTMLTemplate[] {
    return HTML_TEMPLATES.filter(template => template.category === category);
}
