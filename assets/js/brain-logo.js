/**
 * 3D Particle "A" Logo - Footer Only
 * Creates the A-Zentrix logo with white glowing pyramid particles
 * Rendered only in the footer section
 */

class ParticleLogoA {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Container not found:', containerId);
            return;
        }

        this.width = this.container.offsetWidth || 400;
        this.height = this.container.offsetHeight || 400;
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.scrollProgress = 0;

        this.init();
        this.createLogoParticles();
        this.animate();
        this.addEventListeners();
    }

    init() {
        // Scene setup
        this.scene = new THREE.Scene();

        // Camera
        this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);

        // Clear container and add canvas
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        // Main logo group
        this.logoGroup = new THREE.Group();
        this.scene.add(this.logoGroup);
    }

    // Generate circle points - dense for glow effect
    getCirclePoints(radius, count, zOffset = 0) {
        const points = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            points.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                z: zOffset + (Math.random() - 0.5) * 0.1
            });
        }
        return points;
    }

    // Generate "A" letter points - matching the reference image style
    getLetterAPoints(scale) {
        const points = [];
        const density = 40;

        // Left leg of A (bottom-left to top-center)
        for (let i = 0; i < density; i++) {
            const t = i / density;
            points.push({
                x: (-0.55 + t * 0.55) * scale,
                y: (-0.8 + t * 1.6) * scale,
                z: (Math.random() - 0.5) * 0.1
            });
        }

        // Right leg of A (top-center to bottom-right)
        for (let i = 0; i < density; i++) {
            const t = i / density;
            points.push({
                x: (0 + t * 0.55) * scale,
                y: (0.8 - t * 1.6) * scale,
                z: (Math.random() - 0.5) * 0.1
            });
        }

        // Horizontal bar of A
        for (let i = 0; i < density * 0.5; i++) {
            const t = i / (density * 0.5);
            points.push({
                x: (-0.3 + t * 0.6) * scale,
                y: -0.1 * scale,
                z: (Math.random() - 0.5) * 0.1
            });
        }

        // Extra particles for thickness/glow on A
        for (let i = 0; i < density; i++) {
            const t = i / density;
            // Left leg thicker
            points.push({
                x: (-0.55 + t * 0.55) * scale + (Math.random() - 0.5) * 0.06,
                y: (-0.8 + t * 1.6) * scale + (Math.random() - 0.5) * 0.06,
                z: (Math.random() - 0.5) * 0.12
            });
            // Right leg thicker
            points.push({
                x: (0 + t * 0.55) * scale + (Math.random() - 0.5) * 0.06,
                y: (0.8 - t * 1.6) * scale + (Math.random() - 0.5) * 0.06,
                z: (Math.random() - 0.5) * 0.12
            });
        }

        return points;
    }

    createLogoParticles() {
        // Create multiple rings for the circle (gives thickness/glow)
        const circlePoints = [
            ...this.getCirclePoints(1.45, 200),
            ...this.getCirclePoints(1.42, 180),
            ...this.getCirclePoints(1.48, 180),
            ...this.getCirclePoints(1.40, 120),
            ...this.getCirclePoints(1.50, 120)
        ];

        // "A" letter particles
        const letterPoints = this.getLetterAPoints(1.15);

        // Combine all points
        const allPoints = [...circlePoints, ...letterPoints];

        // Use tetrahedron (pyramid) geometry - matching site style
        const pyramidGeometry = new THREE.TetrahedronGeometry(0.022, 0);

        allPoints.forEach((point) => {
            // White/light colors for glow effect
            const brightness = 0.8 + Math.random() * 0.2;
            const color = new THREE.Color(brightness, brightness, brightness);

            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.5 + Math.random() * 0.5
            });

            const particle = new THREE.Mesh(pyramidGeometry, material);

            // Add slight random offset for organic look
            const offset = 0.04;
            particle.position.set(
                point.x + (Math.random() - 0.5) * offset,
                point.y + (Math.random() - 0.5) * offset,
                point.z
            );

            // Random initial rotation
            particle.rotation.x = Math.random() * Math.PI;
            particle.rotation.y = Math.random() * Math.PI;
            particle.rotation.z = Math.random() * Math.PI;

            // Animation properties
            particle.userData = {
                originalPosition: particle.position.clone(),
                pulseOffset: Math.random() * Math.PI * 2,
                pulseSpeed: 0.3 + Math.random() * 0.8,
                orbitRadius: 0.008 + Math.random() * 0.02,
                orbitSpeed: 0.15 + Math.random() * 0.4,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 1.2,
                    y: (Math.random() - 0.5) * 1.2,
                    z: (Math.random() - 0.5) * 1.2
                },
                baseScale: 0.5 + Math.random() * 0.8
            };

            this.particles.push(particle);
            this.logoGroup.add(particle);
        });

        // Add ambient glow particles
        this.addGlowParticles(100);
    }

    addGlowParticles(count) {
        const pyramidGeometry = new THREE.TetrahedronGeometry(0.018, 0);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 1.2 + Math.random() * 0.6;
            const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.4;
            const y = Math.sin(angle) * radius + (Math.random() - 0.5) * 0.4;
            const z = (Math.random() - 0.5) * 0.4;

            const brightness = 0.5 + Math.random() * 0.5;
            const color = new THREE.Color(brightness, brightness, brightness);

            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.1 + Math.random() * 0.2
            });

            const particle = new THREE.Mesh(pyramidGeometry, material);
            particle.position.set(x, y, z);

            particle.rotation.x = Math.random() * Math.PI;
            particle.rotation.y = Math.random() * Math.PI;
            particle.rotation.z = Math.random() * Math.PI;

            particle.userData = {
                originalPosition: particle.position.clone(),
                pulseOffset: Math.random() * Math.PI * 2,
                pulseSpeed: 0.2 + Math.random() * 0.5,
                orbitRadius: 0.03 + Math.random() * 0.06,
                orbitSpeed: 0.1 + Math.random() * 0.25,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 2,
                    y: (Math.random() - 0.5) * 2,
                    z: (Math.random() - 0.5) * 2
                },
                baseScale: 0.3 + Math.random() * 0.5,
                isGlow: true
            };

            this.particles.push(particle);
            this.logoGroup.add(particle);
        }
    }

    addEventListeners() {
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            this.mouseX = ((e.clientX - rect.left) / this.width) * 2 - 1;
            this.mouseY = -((e.clientY - rect.top) / this.height) * 2 + 1;
        });

        this.container.addEventListener('mouseleave', () => {
            this.mouseX = 0;
            this.mouseY = 0;
        });

        window.addEventListener('scroll', () => {
            const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
            this.scrollProgress = window.scrollY / scrollMax;
        });

        window.addEventListener('resize', () => {
            this.width = this.container.offsetWidth || 400;
            this.height = this.container.offsetHeight || 400;
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width, this.height);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Logo rotation - gentle + mouse + scroll
        this.logoGroup.rotation.y = Math.sin(time * 0.1) * 0.12 + this.mouseX * 0.25 + this.scrollProgress * 0.2;
        this.logoGroup.rotation.x = Math.cos(time * 0.08) * 0.08 + this.mouseY * 0.15;
        this.logoGroup.rotation.z = Math.sin(time * 0.05) * 0.02;

        // Animate particles
        for (const particle of this.particles) {
            const { originalPosition, pulseOffset, pulseSpeed, orbitRadius, orbitSpeed, rotationSpeed, baseScale, isGlow } = particle.userData;

            // Orbital motion
            const orbitX = Math.sin(time * orbitSpeed + pulseOffset) * orbitRadius;
            const orbitY = Math.cos(time * orbitSpeed * 1.2 + pulseOffset) * orbitRadius;
            const orbitZ = Math.sin(time * orbitSpeed * 0.8 + pulseOffset) * orbitRadius * 0.5;

            particle.position.x = originalPosition.x + orbitX;
            particle.position.y = originalPosition.y + orbitY;
            particle.position.z = originalPosition.z + orbitZ;

            // Rotate pyramids
            particle.rotation.x += rotationSpeed.x * 0.005;
            particle.rotation.y += rotationSpeed.y * 0.005;
            particle.rotation.z += rotationSpeed.z * 0.005;

            // Pulsing scale
            const pulse = Math.sin(time * pulseSpeed + pulseOffset);
            const scale = baseScale * (1 + pulse * 0.15);
            particle.scale.setScalar(scale);

            // Opacity pulsing
            if (isGlow) {
                particle.material.opacity = 0.1 + pulse * 0.1 + 0.05;
            } else {
                particle.material.opacity = 0.5 + pulse * 0.25 + 0.15;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when ready
function initLogoA() {
    const container = document.getElementById('brain-logo-container');
    if (container && typeof THREE !== 'undefined') {
        new ParticleLogoA('brain-logo-container');
    } else {
        setTimeout(initLogoA, 100);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLogoA);
} else {
    initLogoA();
}
