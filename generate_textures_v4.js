/**
 * Generate High-Fidelity 3D Particle Textures (V4 - Artifact Fix)
 * Creates organic, high-resolution particle maps with strict padding to prevent edge artifacts.
 */

const fs = require('fs');
const path = require('path');

async function generateParticleTextures() {
    let sharp;
    try {
        sharp = require('sharp');
    } catch (e) {
        console.log('Installing sharp...');
        require('child_process').execSync('npm install sharp', { stdio: 'inherit' });
        sharp = require('sharp');
    }

    const logoPath = 'WhatsApp Image 2026-01-12 at 9.39.52 AM.jpeg';
    const outputDir = 'assets/images';
    const analysisSize = 800;

    console.log('Loading logo for V4 processing...');

    // Fit containing ensuring valid aspect ratio and padding within acquisition
    const logoBuffer = await sharp(logoPath)
        .resize(analysisSize, analysisSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const { data, info } = logoBuffer;
    const { width, height } = info;

    const TARGET_PARTICLES = 15000;
    const particles = [];
    const samples = 150000;

    console.log('Scanning image volume with safety padding...');

    for (let i = 0; i < samples; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);

        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];

        const brightness = (r + g + b) / 3;

        // Strict threshold to avoid faint background noise
        if (brightness > 25 && brightness < 250 && a > 200) {
            // Normalize 0-1
            let posX = x / width;
            let posY = 1.0 - (y / height); // Flip Y

            // Apply 10% safety padding to position
            // Remap 0..1 to 0.1..0.9
            posX = posX * 0.8 + 0.1;
            posY = posY * 0.8 + 0.1;

            const posZ = 0.5 + (brightness / 255) * 0.1 + (Math.random() - 0.5) * 0.05;

            particles.push({
                x: posX,
                y: posY,
                z: posZ,
                r: r,
                g: g,
                b: b,
                scale: Math.max(0.2, brightness / 255)
            });
        }

        if (particles.length >= TARGET_PARTICLES) break;
    }

    // Shuffle
    for (let i = particles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [particles[i], particles[j]] = [particles[j], particles[i]];
    }

    console.log(`Generated ${particles.length} particles`);

    // Output texture size
    const texDim = 128;
    console.log(`Texture Size: ${texDim}x${texDim}`);

    const colorData = Buffer.alloc(texDim * texDim * 3);
    const scaleData = Buffer.alloc(texDim * texDim);
    const posData = Buffer.alloc(texDim * texDim * 3);

    for (let i = 0; i < texDim * texDim; i++) {
        if (i < particles.length) {
            const p = particles[i];

            colorData[i * 3] = p.r;
            colorData[i * 3 + 1] = p.g;
            colorData[i * 3 + 2] = p.b;

            scaleData[i] = Math.floor(p.scale * 255);

            posData[i * 3] = Math.floor(p.x * 255);
            posData[i * 3 + 1] = Math.floor(p.y * 255);
            posData[i * 3 + 2] = Math.floor(p.z * 255);
        } else {
            // Unused - Invisible
            scaleData[i] = 0;
            colorData[i * 3] = 0;
            posData[i * 3] = 0; // IMPORTANT: Zero position
        }
    }

    // Save v4 files
    await sharp(colorData, { raw: { width: texDim, height: texDim, channels: 3 } }).png().toFile(path.join(outputDir, 'cd-33-logo-v4.png'));
    await sharp(scaleData, { raw: { width: texDim, height: texDim, channels: 1 } }).png().toFile(path.join(outputDir, 'sc-33-logo-v4.png'));
    await sharp(posData, { raw: { width: texDim, height: texDim, channels: 3 } }).png().toFile(path.join(outputDir, 'pos-33-logo-v4.png'));

    console.log('✅ Generated V4 Textures (Padding Fix)');
    console.log('  assets/images/cd-33-logo-v4.png');
    console.log('  assets/images/sc-33-logo-v4.png');
    console.log('  assets/images/pos-33-logo-v4.png');
}

generateParticleTextures().catch(console.error);
