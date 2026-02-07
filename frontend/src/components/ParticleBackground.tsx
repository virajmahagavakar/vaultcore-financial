import { useEffect, useRef } from "react";

const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        const particleCount = 50; // Number of particles
        const connectionDistance = 100;
        const mouseDefenseRadius = 150; // Radius around mouse where particles are pushed away

        let mouse = { x: -1000, y: -1000 };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            originalX: number;
            originalY: number;
            friction: number = 0.95;
            ease: number = 0.1;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.originalX = this.x;
                this.originalY = this.y;
                this.vx = (Math.random() - 0.5) * 1.5; // Random velocity
                this.vy = (Math.random() - 0.5) * 1.5;
                this.size = Math.random() * 2 + 1; // Random size
                // VaultCore colors: Cyan and Dark Blue hues
                const colors = ["rgba(6, 182, 212, 0.5)", "rgba(59, 130, 246, 0.5)", "rgba(14, 165, 233, 0.3)"];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }

            update() {
                // Normal floating movement
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges
                if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;

                // Mouse Repulsion (Antigravity effect)
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseDefenseRadius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouseDefenseRadius - distance) / mouseDefenseRadius;
                    const repulsionStrength = 5; // Strength of push

                    this.vx += forceDirectionX * force * repulsionStrength;
                    this.vy += forceDirectionY * force * repulsionStrength;
                }

                // Friction to stop them from flying off too fast
                // Note: We want them to keep floating, so friction is applied but velocity is clamped
                const maxSpeed = 4;
                const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (speed > maxSpeed) {
                    this.vx = (this.vx / speed) * maxSpeed;
                    this.vy = (this.vy / speed) * maxSpeed;
                }

            }

            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

            particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });

            // Optional: Draw connections if close
            particles.forEach((a, index) => {
                for (let j = index + 1; j < particles.length; j++) {
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(6, 182, 212, ${0.1 * (1 - distance / connectionDistance)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);

        handleResize(); // Initial resize
        init();
        animate();

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-0 pointer-events-none opacity-60"
            style={{ background: 'transparent' }} // Ensure it's transparent over the gradient
        />
    );
};

export default ParticleBackground;
