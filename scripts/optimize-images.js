#!/usr/bin/env node

/**
 * Image Optimization Script for G-Nexus
 * 
 * This script converts images to WebP format and generates responsive sizes
 * Usage: node scripts/optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

const IMAGE_DIR = path.join(__dirname, '../public/images');
const SIZES = [320, 640, 1024, 1920];
const QUALITY = 85;

async function optimizeImage(filepath) {
    const basename = path.basename(filepath, path.extname(filepath));
    const dirname = path.dirname(filepath);

    try {
        console.log(`Processing: ${basename}`);

        // Generate WebP versions at different sizes
        for (const size of SIZES) {
            const outputPath = path.join(dirname, `${basename}-${size}w.webp`);

            await sharp(filepath)
                .resize(size, null, { withoutEnlargement: true })
                .webp({ quality: QUALITY })
                .toFile(outputPath);

            console.log(`  ✓ Created ${size}w WebP`);
        }

        // Create main WebP version (original size)
        const mainWebp = path.join(dirname, `${basename}.webp`);
        await sharp(filepath)
            .webp({ quality: QUALITY })
            .toFile(mainWebp);

        console.log(`  ✓ Created main WebP`);

    } catch (error) {
        console.error(`  ✗ Error processing ${basename}:`, error.message);
    }
}

async function findImages(dir) {
    const images = [];

    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                const subImages = await findImages(fullPath);
                images.push(...subImages);
            } else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) {
                images.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
    }

    return images;
}

async function main() {
    console.log('🎨 G-Nexus Image Optimization\n');

    try {
        // Check if image directory exists
        await fs.access(IMAGE_DIR);

        // Find all images
        const images = await findImages(IMAGE_DIR);

        if (images.length === 0) {
            console.log('No images found in', IMAGE_DIR);
            return;
        }

        console.log(`Found ${images.length} images\n`);

        // Process each image
        for (const image of images) {
            await optimizeImage(image);
        }

        console.log('\n✅ Image optimization complete!');
        console.log(`Generated WebP files at sizes: ${SIZES.join('w, ')}w`);

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('Creating images directory...');
            await fs.mkdir(IMAGE_DIR, { recursive: true });
            console.log('✓ Directory created. Please add images to public/images/');
        } else {
            console.error('Error:', error.message);
        }
    }
}

main();
