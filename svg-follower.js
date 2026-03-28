/**
 * SVGFollower - Native Vanilla JS Integration
 * Traces mouse and touch movements with animated shapes and paths.
 * Styled using the Maharashtrian Wedding Site color palette.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Elegant Wedding Theme Palette
    const colors = ["#F0A500", "#E25C2B", "#CBA135", "#A86573"];
    const removeDelay = 400;

    // Create the background SVG container
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", window.innerWidth);
    svg.setAttribute("height", window.innerHeight);
    svg.setAttribute("class", "svg-follower-stage"); 
    
    // Style to ensure it sits behind content and doesn't block interactions
    svg.style.position = "fixed";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100vw";
    svg.style.height = "100vh";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "-1"; // Sits firmly in the background
    
    document.body.appendChild(svg);

    // Keep it sized to viewport
    window.addEventListener("resize", () => {
        svg.setAttribute("width", window.innerWidth);
        svg.setAttribute("height", window.innerHeight);
    });

    class Follower {
        constructor(stage, color) {
            this.stage = stage;
            this.color = color;
            this.points = [];
            
            // Create the path line
            this.line = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.line.style.fill = color;
            this.line.style.stroke = color;
            this.line.style.strokeWidth = "1";
            this.stage.appendChild(this.line);
        }

        getDrift() {
            return (Math.random() - 0.5) * 3;
        }

        add(position) {
            const direction = { x: 0, y: 0 };
            
            if (this.points.length > 0) {
                direction.x = (position.x - this.points[0].position.x) * 0.25;
                direction.y = (position.y - this.points[0].position.y) * 0.25;
            }

            const point = {
                position: position,
                time: Date.now(),
                drift: {
                    x: this.getDrift() + direction.x / 2,
                    y: this.getDrift() + direction.y / 2,
                },
                age: 0,
                direction: direction,
            };

            const shapeChance = Math.random();
            const chance = 0.1;
            
            if (shapeChance < chance) {
                this.makeCircle(point);
            } else if (shapeChance < chance * 2) {
                this.makeSquare(point);
            } else if (shapeChance < chance * 3) {
                this.makeTriangle(point);
            }

            this.points.unshift(point);
        }

        createLine() {
            const path = [this.points.length ? "M" : ""];

            if (this.points.length > 0) {
                let forward = true;
                let i = 0;

                while (i >= 0) {
                    const point = this.points[i];
                    const offsetX = point.direction.x * ((i - this.points.length) / this.points.length) * 0.6;
                    const offsetY = point.direction.y * ((i - this.points.length) / this.points.length) * 0.6;
                    
                    const x = point.position.x + (forward ? offsetY : -offsetY);
                    const y = point.position.y + (forward ? offsetX : -offsetX);
                    
                    point.age += 0.2;

                    path.push(`${x + point.drift.x * point.age} ${y + point.drift.y * point.age}`);

                    i += forward ? 1 : -1;
                    if (i === this.points.length) {
                        i--;
                        forward = false;
                    }
                }
            }

            return path.join(" ");
        }

        trim() {
            if (this.points.length > 0) {
                const last = this.points[this.points.length - 1];
                const now = Date.now();
                if (last.time < now - removeDelay) {
                    this.points.pop();
                }
            }
            this.line.setAttribute("d", this.createLine());
        }

        makeCircle(point) {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            const radius = (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1;
            circle.setAttribute("r", String(radius));
            circle.style.fill = this.color;
            circle.setAttribute("cx", "0");
            circle.setAttribute("cy", "0");
            this.moveShape(circle, point);
        }

        makeSquare(point) {
            const size = (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1.5;
            const square = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            square.setAttribute("width", String(size));
            square.setAttribute("height", String(size));
            square.style.fill = this.color;
            this.moveShape(square, point);
        }

        makeTriangle(point) {
            const size = (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1.5;
            const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            triangle.setAttribute("points", `0,0 ${size},${size / 2} 0,${size}`);
            triangle.style.fill = this.color;
            this.moveShape(triangle, point);
        }

        moveShape(shape, point) {
            this.stage.appendChild(shape);
            
            const driftX = point.position.x + point.direction.x * (Math.random() * 20) + point.drift.x * (Math.random() * 10);
            const driftY = point.position.y + point.direction.y * (Math.random() * 20) + point.drift.y * (Math.random() * 10);

            shape.style.transform = `translate(${point.position.x}px, ${point.position.y}px)`;
            shape.style.transition = "all 0.5s ease-out";

            setTimeout(() => {
                shape.style.transform = `translate(${driftX}px, ${driftY}px) scale(0) rotate(${Math.random() * 360}deg)`;
                setTimeout(() => {
                    if (this.stage.contains(shape)) {
                        this.stage.removeChild(shape);
                    }
                }, 500);
            }, 10);
        }
    }

    const followers = colors.map((color) => new Follower(svg, color));

    function handleMouseMove(e) {
        followers.forEach((follower) => follower.add({ x: e.clientX, y: e.clientY }));
    }

    function handleTouchMove(e) {
        // We do NOT call e.preventDefault() here so users can still scroll the page normally
        const touch = e.touches[0];
        if (touch) {
            followers.forEach((follower) => follower.add({ x: touch.clientX, y: touch.clientY }));
        }
    }

    // Attach passive listeners to entire window
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    // Animation loop
    function animate() {
        followers.forEach((follower) => follower.trim());
        requestAnimationFrame(animate);
    }
    animate();
});
