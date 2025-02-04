class CubeRenderer {
    constructor(width = 160, height = 44) {
        this.A = 0;
        this.B = 0;
        this.C = 0;
        this.width = width;
        this.height = height;
        this.cubeWidth = 15 // ขยายขนาด cube
        this.backgroundChar = '.';
        this.distanceFromCam = 120; // ปรับระยะห่างกล้อง
        this.incrementSpeed = 0.6;
        this.K1 = 50; // เพิ่มขนาดการแสดงผล

        this.buffer = new Array(width * height).fill(this.backgroundChar);
        this.zBuffer = new Array(width * height).fill(0);
    }

    calculateX(i, j, k) {
        return j * Math.sin(this.A) * Math.sin(this.B) * Math.cos(this.C) - 
               k * Math.cos(this.A) * Math.sin(this.B) * Math.cos(this.C) +
               j * Math.cos(this.A) * Math.sin(this.C) + 
               k * Math.sin(this.A) * Math.sin(this.C) + 
               i * Math.cos(this.B) * Math.cos(this.C);
    }

    calculateY(i, j, k) {
        return j * Math.cos(this.A) * Math.cos(this.C) + 
               k * Math.sin(this.A) * Math.cos(this.C) -
               j * Math.sin(this.A) * Math.sin(this.B) * Math.sin(this.C) + 
               k * Math.cos(this.A) * Math.sin(this.B) * Math.sin(this.C) -
               i * Math.cos(this.B) * Math.sin(this.C);
    }

    calculateZ(i, j, k) {
        return k * Math.cos(this.A) * Math.cos(this.B) - 
               j * Math.sin(this.A) * Math.cos(this.B) + 
               i * Math.sin(this.B);
    }

    calculateForSurface(cubeX, cubeY, cubeZ, ch, horizontalOffset = 0) {
        const x = this.calculateX(cubeX, cubeY, cubeZ);
        const y = this.calculateY(cubeX, cubeY, cubeZ);
        const z = this.calculateZ(cubeX, cubeY, cubeZ) + this.distanceFromCam;

        const ooz = 1 / z;

        const xp = Math.floor(this.width / 2 + horizontalOffset + this.K1 * ooz * x * 2);
        const yp = Math.floor(this.height / 2 + this.K1 * ooz * y);

        const idx = xp + yp * this.width;
        if (idx >= 0 && idx < this.width * this.height) {
            if (ooz > this.zBuffer[idx]) {
                this.zBuffer[idx] = ooz;
                this.buffer[idx] = ch;
            }
        }
    }

    render() {
        this.buffer.fill(this.backgroundChar);
        this.zBuffer.fill(0);

        // Render only one cube in the center
        this.renderCube(this.cubeWidth, 0);

        // Convert buffer to string
        let output = '';
        for (let k = 0; k < this.width * this.height; k++) {
            output += k % this.width ? this.buffer[k] : '\n';
        }
        return output;
    }

    renderCube(size, offsetMultiplier) {
        const horizontalOffset = offsetMultiplier * size;
        for (let cubeX = -size; cubeX < size; cubeX += this.incrementSpeed) {
            for (let cubeY = -size; cubeY < size; cubeY += this.incrementSpeed) {
                // Using different ASCII characters for each face
                this.calculateForSurface(cubeX, cubeY, -size, '@', horizontalOffset);
                this.calculateForSurface(size, cubeY, cubeX, '#', horizontalOffset);
                this.calculateForSurface(-size, cubeY, -cubeX, '$', horizontalOffset);
                this.calculateForSurface(-cubeX, cubeY, size, '*', horizontalOffset);
                this.calculateForSurface(cubeX, -size, -cubeY, '+', horizontalOffset);
                this.calculateForSurface(cubeX, size, cubeY, '=', horizontalOffset);
            }
        }
    }

    update() {
        this.A += 0.05;
        this.B += 0.05;
        this.C += 0.01;
    }
}

// ปรับขนาดการแสดงผลให้ใหญ่ขึ้น
const cubeRenderer = new CubeRenderer(80, 40);

let animationFrame;

function animate() {
    const output = cubeRenderer.render();
    document.getElementById('cubeRenderer').textContent = output;
    cubeRenderer.update();
    animationFrame = requestAnimationFrame(animate);
}

export function startCubeAnimation() {
    if (!animationFrame) {
        animate();
    }
}

export function stopCubeAnimation() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
}
