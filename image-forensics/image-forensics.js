document.getElementById('currentYear').textContent = new Date().getFullYear();

        let currentImage = null;
        let imageFile = null;

        // Setup drag and drop
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files.length > 0) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFile(e.target.files[0]);
            }
        });

        function handleFile(file) {
            if (!file.type.startsWith('image/')) {
                showToast('Please select an image file');
                return;
            }

            imageFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                currentImage = new Image();
                currentImage.onload = () => {
                    analyzeImage();
                };
                currentImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function analyzeImage() {
            // Show loading overlay
            const overlay = document.getElementById('loadingOverlay');
            const progressText = document.getElementById('loadingProgress');
            const progressFill = document.getElementById('progressFill');
            const spinnerSlash = document.getElementById('spinnerSlash');
            overlay.classList.remove('hidden');
            
            // Animate the spinner slash
            const slashChars = ['|', '/', '—', '\\'];
            let slashIndex = 0;
            const slashInterval = setInterval(() => {
                spinnerSlash.textContent = slashChars[slashIndex];
                slashIndex = (slashIndex + 1) % slashChars.length;
            }, 150);
            
            // List of analysis tasks
            const tasks = [
                { name: 'Error Level Analysis', fn: performELA },
                { name: 'Extracting Metadata', fn: extractMetadata },
                { name: 'Calculating Hashes', fn: calculateHashes },
                { name: 'Forensic Notes', fn: generateForensicNotes },
                { name: 'Channel Separation', fn: performChannelSeparation },
                { name: 'Edge Detection', fn: performEdgeDetection },
                { name: 'Histogram Analysis', fn: performHistogramAnalysis },
                { name: 'Luminance Gradient', fn: performLuminanceGradient },
                { name: 'Noise Analysis', fn: performNoiseAnalysis },
                { name: 'JPEG Ghost Detection', fn: performJPEGGhost },
                { name: 'Bit Plane Extraction', fn: performBitPlaneExtraction },
                { name: 'Min/Max RGB', fn: performMinMaxRGB },
                { name: 'Block Grid', fn: performBlockGrid },
                { name: 'Saturation Map', fn: performSaturationMap },
                { name: 'Contrast Map', fn: performContrastMap },
                { name: 'Inverted View', fn: performInvertedView },
                { name: 'PCA Projection', fn: performPCAProjection },
                { name: 'Grayscale', fn: performGrayscale },
                { name: 'Sharpen', fn: performSharpen },
                { name: 'Emboss', fn: performEmboss },
                { name: 'Laplacian', fn: performLaplacian },
                { name: 'Threshold', fn: performThreshold },
                { name: 'Posterize', fn: performPosterize },
                { name: 'Solarize', fn: performSolarize },
                { name: 'Std Deviation Map', fn: performStdDevMap },
                { name: 'Gamma Correction', fn: performGammaCorrection }
            ];
            
            // Display original first
            document.getElementById('resultsSection').style.display = 'block';
            document.querySelector('.upload-section').style.display = 'none';
            
            const originalImg = document.getElementById('originalImage');
            originalImg.src = currentImage.src;
            
            document.getElementById('imageInfo').innerHTML = `
                <p><strong>Filename:</strong> ${imageFile.name}</p>
                <p><strong>Dimensions:</strong> ${currentImage.width} × ${currentImage.height} pixels</p>
                <p><strong>File Size:</strong> ${formatFileSize(imageFile.size)}</p>
                <p><strong>Type:</strong> ${imageFile.type}</p>
            `;
            
            // Run tasks with delays to prevent UI freeze
            let taskIndex = 0;
            
            function runNextTask() {
                if (taskIndex < tasks.length) {
                    const task = tasks[taskIndex];
                    const progress = Math.round(((taskIndex + 1) / tasks.length) * 100);
                    
                    progressText.textContent = `${task.name} (${taskIndex + 1}/${tasks.length})`;
                    progressFill.style.width = progress + '%';
                    
                    // Use setTimeout to allow UI to update
                    setTimeout(() => {
                        try {
                            task.fn();
                        } catch (e) {
                            console.error(`Error in ${task.name}:`, e);
                        }
                        taskIndex++;
                        runNextTask();
                    }, 50);
                } else {
                    // All done - calculate manipulation score
                    clearInterval(slashInterval);
                    spinnerSlash.textContent = '✓';
                    progressText.textContent = 'Calculating manipulation probability...';
                    setTimeout(async () => {
                        calculateManipulationScore();
                        progressFill.style.width = '100%';
                        progressText.textContent = 'Complete!';
                        // Wait for ELA and JPEG Ghost canvases to finish drawing
                        await performELAAsync();
                        await performJPEGGhostAsync();
                        setTimeout(() => {
                            overlay.classList.add('hidden');
                            document.getElementById('downloadReportBtn').disabled = false;
                        }, 300);
                    }, 100);
                }
            }
            
            runNextTask();
        }

        function performChannelSeparation() {
            const channels = ['red', 'green', 'blue'];
            const channelIndex = { red: 0, green: 1, blue: 2 };

            channels.forEach(channel => {
                const canvas = document.getElementById(channel + 'Channel');
                const ctx = canvas.getContext('2d');
                
                canvas.width = currentImage.width;
                canvas.height = currentImage.height;
                
                ctx.drawImage(currentImage, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                const idx = channelIndex[channel];
                
                for (let i = 0; i < data.length; i += 4) {
                    const value = data[i + idx];
                    data[i] = value;     // R
                    data[i + 1] = value; // G
                    data[i + 2] = value; // B
                    // Alpha stays the same
                }
                
                ctx.putImageData(imageData, 0, 0);
            });
        }

        function performEdgeDetection() {
            const canvas = document.getElementById('edgeCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = canvas.width;
            const height = canvas.height;
            
            // Convert to grayscale first
            const gray = new Float32Array(width * height);
            for (let i = 0; i < gray.length; i++) {
                gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
            }
            
            // Sobel kernels
            const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
            const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
            
            const output = new Uint8ClampedArray(width * height * 4);
            
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    let gx = 0, gy = 0;
                    
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = (y + ky) * width + (x + kx);
                            const kernelIdx = (ky + 1) * 3 + (kx + 1);
                            gx += gray[idx] * sobelX[kernelIdx];
                            gy += gray[idx] * sobelY[kernelIdx];
                        }
                    }
                    
                    const magnitude = Math.min(255, Math.sqrt(gx * gx + gy * gy));
                    const outIdx = (y * width + x) * 4;
                    output[outIdx] = magnitude;
                    output[outIdx + 1] = magnitude;
                    output[outIdx + 2] = magnitude;
                    output[outIdx + 3] = 255;
                }
            }
            
            const outputData = new ImageData(output, width, height);
            ctx.putImageData(outputData, 0, 0);
        }

        function performHistogramAnalysis() {
            const canvas = document.getElementById('histogramCanvas');
            const ctx = canvas.getContext('2d');
            
            // Create temp canvas to get image data
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = currentImage.width;
            tempCanvas.height = currentImage.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(currentImage, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;
            
            // Calculate histograms for R, G, B
            const histR = new Array(256).fill(0);
            const histG = new Array(256).fill(0);
            const histB = new Array(256).fill(0);
            
            for (let i = 0; i < data.length; i += 4) {
                histR[data[i]]++;
                histG[data[i + 1]]++;
                histB[data[i + 2]]++;
            }
            
            // Find max for normalization
            const maxVal = Math.max(...histR, ...histG, ...histB);
            
            // Draw histogram
            canvas.width = 512;
            canvas.height = 200;
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = canvas.width / 256;
            const scale = canvas.height / maxVal;
            
            // Draw each channel
            for (let i = 0; i < 256; i++) {
                const x = i * barWidth;
                
                // Red
                ctx.fillStyle = 'rgba(255, 107, 107, 0.5)';
                ctx.fillRect(x, canvas.height - histR[i] * scale, barWidth, histR[i] * scale);
                
                // Green
                ctx.fillStyle = 'rgba(81, 207, 102, 0.5)';
                ctx.fillRect(x, canvas.height - histG[i] * scale, barWidth, histG[i] * scale);
                
                // Blue
                ctx.fillStyle = 'rgba(51, 154, 240, 0.5)';
                ctx.fillRect(x, canvas.height - histB[i] * scale, barWidth, histB[i] * scale);
            }
            
            // Draw axis labels
            ctx.fillStyle = '#666';
            ctx.font = '10px Inter';
            ctx.fillText('0', 5, canvas.height - 5);
            ctx.fillText('255', canvas.width - 20, canvas.height - 5);
        }

        function performLuminanceGradient() {
            const canvas = document.getElementById('luminanceCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = canvas.width;
            const height = canvas.height;
            
            // Convert to luminance
            const lum = new Float32Array(width * height);
            for (let i = 0; i < lum.length; i++) {
                lum[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
            }
            
            // Calculate gradient direction using Sobel
            const output = new Uint8ClampedArray(width * height * 4);
            
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    // Sobel gradients
                    const gx = -lum[(y-1)*width+(x-1)] + lum[(y-1)*width+(x+1)]
                              -2*lum[y*width+(x-1)] + 2*lum[y*width+(x+1)]
                              -lum[(y+1)*width+(x-1)] + lum[(y+1)*width+(x+1)];
                    
                    const gy = -lum[(y-1)*width+(x-1)] - 2*lum[(y-1)*width+x] - lum[(y-1)*width+(x+1)]
                              +lum[(y+1)*width+(x-1)] + 2*lum[(y+1)*width+x] + lum[(y+1)*width+(x+1)];
                    
                    // Convert angle to hue (0-360)
                    let angle = Math.atan2(gy, gx) * 180 / Math.PI + 180;
                    const magnitude = Math.min(1, Math.sqrt(gx*gx + gy*gy) / 255);
                    
                    // HSL to RGB (hue = angle, saturation = 1, lightness = magnitude)
                    const h = angle / 360;
                    const s = magnitude > 0.1 ? 1 : 0;
                    const l = 0.3 + magnitude * 0.4;
                    
                    const rgb = hslToRgb(h, s, l);
                    const outIdx = (y * width + x) * 4;
                    output[outIdx] = rgb[0];
                    output[outIdx + 1] = rgb[1];
                    output[outIdx + 2] = rgb[2];
                    output[outIdx + 3] = 255;
                }
            }
            
            ctx.putImageData(new ImageData(output, width, height), 0, 0);
        }

        function hslToRgb(h, s, l) {
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = (p, q, t) => {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }

        function performNoiseAnalysis() {
            const canvas = document.getElementById('noiseCanvas');
            const ctx = canvas.getContext('2d');
            const amp = parseInt(document.getElementById('noiseAmp').value);
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = canvas.width;
            const height = canvas.height;
            
            // Apply median filter to get "clean" version, then subtract
            const output = new Uint8ClampedArray(width * height * 4);
            
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    const idx = (y * width + x) * 4;
                    
                    // Get 3x3 neighborhood for each channel
                    for (let c = 0; c < 3; c++) {
                        const neighbors = [];
                        for (let dy = -1; dy <= 1; dy++) {
                            for (let dx = -1; dx <= 1; dx++) {
                                neighbors.push(data[((y + dy) * width + (x + dx)) * 4 + c]);
                            }
                        }
                        neighbors.sort((a, b) => a - b);
                        const median = neighbors[4];
                        
                        // Noise = original - median, amplified
                        const noise = (data[idx + c] - median) * amp + 128;
                        output[idx + c] = Math.max(0, Math.min(255, noise));
                    }
                    output[idx + 3] = 255;
                }
            }
            
            ctx.putImageData(new ImageData(output, width, height), 0, 0);
        }

        function updateNoise() {
            document.getElementById('noiseAmpValue').textContent = document.getElementById('noiseAmp').value;
            performNoiseAnalysis();
        }

        function performJPEGGhost() {
            const qualities = [60, 70, 80, 90];
            
            qualities.forEach(quality => {
                const canvas = document.getElementById('ghostCanvas' + quality);
                const ctx = canvas.getContext('2d');
                
                canvas.width = currentImage.width;
                canvas.height = currentImage.height;
                
                // Get original image data
                ctx.drawImage(currentImage, 0, 0);
                const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Create compressed version
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = currentImage.width;
                tempCanvas.height = currentImage.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(currentImage, 0, 0);
                
                const compressedUrl = tempCanvas.toDataURL('image/jpeg', quality / 100);
                const compImg = new Image();
                compImg.onload = () => {
                    tempCtx.drawImage(compImg, 0, 0);
                    const compData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
                    
                    // Calculate difference (ghost)
                    const output = ctx.createImageData(canvas.width, canvas.height);
                    for (let i = 0; i < originalData.data.length; i += 4) {
                        const diffR = Math.abs(originalData.data[i] - compData.data[i]);
                        const diffG = Math.abs(originalData.data[i + 1] - compData.data[i + 1]);
                        const diffB = Math.abs(originalData.data[i + 2] - compData.data[i + 2]);
                        const diff = (diffR + diffG + diffB) / 3;
                        
                        // Invert: lower difference = darker (region was at this quality)
                        const val = 255 - Math.min(255, diff * 10);
                        output.data[i] = val;
                        output.data[i + 1] = val;
                        output.data[i + 2] = val;
                        output.data[i + 3] = 255;
                    }
                    ctx.putImageData(output, 0, 0);
                };
                compImg.src = compressedUrl;
            });
        }

        function performBitPlaneExtraction() {
            // Get original image data once
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = currentImage.width;
            tempCanvas.height = currentImage.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(currentImage, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = imageData.data;
            const width = tempCanvas.width;
            const height = tempCanvas.height;
            
            // Convert to grayscale
            const gray = new Uint8Array(width * height);
            for (let i = 0; i < gray.length; i++) {
                gray[i] = Math.round(0.299 * data[i*4] + 0.587 * data[i*4+1] + 0.114 * data[i*4+2]);
            }
            
            // Extract each bit plane
            for (let bit = 0; bit < 8; bit++) {
                const canvas = document.getElementById('bitplane' + bit);
                const ctx = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                
                const output = ctx.createImageData(width, height);
                const mask = 1 << bit;
                
                for (let i = 0; i < gray.length; i++) {
                    const val = (gray[i] & mask) ? 255 : 0;
                    output.data[i * 4] = val;
                    output.data[i * 4 + 1] = val;
                    output.data[i * 4 + 2] = val;
                    output.data[i * 4 + 3] = 255;
                }
                
                ctx.putImageData(output, 0, 0);
            }
        }

        function performMinMaxRGB() {
            const canvas = document.getElementById('minmaxCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            const output = ctx.createImageData(canvas.width, canvas.height);
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i+1], b = data[i+2];
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                
                // Highlight clipped values (near 0 or 255)
                const threshold = 10;
                let outR = 128, outG = 128, outB = 128;
                
                if (max >= 255 - threshold) {
                    // Highlight overexposed in red
                    outR = 255; outG = 0; outB = 0;
                } else if (min <= threshold) {
                    // Highlight underexposed in blue  
                    outR = 0; outG = 0; outB = 255;
                } else {
                    // Show luminance difference
                    const range = max - min;
                    outR = outG = outB = range;
                }
                
                output.data[i] = outR;
                output.data[i+1] = outG;
                output.data[i+2] = outB;
                output.data[i+3] = 255;
            }
            
            ctx.putImageData(output, 0, 0);
        }

        function performBlockGrid() {
            const canvas = document.getElementById('blockGridCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            // Draw original image
            ctx.drawImage(currentImage, 0, 0);
            
            // Get image data for block artifact detection
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = canvas.width;
            const height = canvas.height;
            
            // Calculate block boundary differences
            const blockSize = 8;
            
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.lineWidth = 1;
            
            // Draw grid and highlight strong boundaries
            for (let y = 0; y < height; y += blockSize) {
                for (let x = 0; x < width; x += blockSize) {
                    // Check if this block boundary has strong artifact
                    let boundaryStrength = 0;
                    
                    if (x > 0) {
                        // Check left boundary
                        for (let by = y; by < Math.min(y + blockSize, height); by++) {
                            const idx1 = (by * width + x) * 4;
                            const idx2 = (by * width + x - 1) * 4;
                            boundaryStrength += Math.abs(data[idx1] - data[idx2]);
                        }
                    }
                    
                    // Draw grid with intensity based on boundary strength
                    const intensity = Math.min(1, boundaryStrength / 500);
                    ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 + intensity * 0.6})`;
                    ctx.strokeRect(x, y, blockSize, blockSize);
                }
            }
        }

        function performSaturationMap() {
            const canvas = document.getElementById('saturationCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            const output = ctx.createImageData(canvas.width, canvas.height);
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i+1], b = data[i+2];
                const max = Math.max(r, g, b);
                const min = Math.min(r, g, b);
                const l = (max + min) / 2;
                
                let s = 0;
                if (max !== min) {
                    s = l > 127 ? (max - min) / (510 - max - min) : (max - min) / (max + min);
                }
                
                // Map saturation to heat colormap
                const sat = Math.floor(s * 255);
                if (sat < 85) {
                    output.data[i] = 0;
                    output.data[i+1] = 0;
                    output.data[i+2] = sat * 3;
                } else if (sat < 170) {
                    output.data[i] = (sat - 85) * 3;
                    output.data[i+1] = (sat - 85) * 3;
                    output.data[i+2] = 255;
                } else {
                    output.data[i] = 255;
                    output.data[i+1] = 255;
                    output.data[i+2] = 255 - (sat - 170) * 3;
                }
                output.data[i+3] = 255;
            }
            
            ctx.putImageData(output, 0, 0);
        }

        function performContrastMap() {
            const canvas = document.getElementById('contrastCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = canvas.width;
            const height = canvas.height;
            
            const output = ctx.createImageData(width, height);
            const windowSize = 3;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let min = 255, max = 0;
                    
                    // Get local min/max in window
                    for (let wy = -windowSize; wy <= windowSize; wy++) {
                        for (let wx = -windowSize; wx <= windowSize; wx++) {
                            const nx = Math.min(Math.max(x + wx, 0), width - 1);
                            const ny = Math.min(Math.max(y + wy, 0), height - 1);
                            const idx = (ny * width + nx) * 4;
                            const lum = (data[idx] + data[idx+1] + data[idx+2]) / 3;
                            min = Math.min(min, lum);
                            max = Math.max(max, lum);
                        }
                    }
                    
                    const contrast = max - min;
                    const idx = (y * width + x) * 4;
                    output.data[idx] = contrast;
                    output.data[idx+1] = contrast;
                    output.data[idx+2] = contrast;
                    output.data[idx+3] = 255;
                }
            }
            
            ctx.putImageData(output, 0, 0);
        }

        function performInvertedView() {
            const canvas = document.getElementById('invertedCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i+1] = 255 - data[i+1];
                data[i+2] = 255 - data[i+2];
            }
            
            ctx.putImageData(imageData, 0, 0);
        }

        function performPCAProjection() {
            const canvas = document.getElementById('pcaCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Calculate mean RGB
            let sumR = 0, sumG = 0, sumB = 0;
            const n = data.length / 4;
            
            for (let i = 0; i < data.length; i += 4) {
                sumR += data[i];
                sumG += data[i+1];
                sumB += data[i+2];
            }
            
            const meanR = sumR / n, meanG = sumG / n, meanB = sumB / n;
            
            // Simple PCA approximation: project onto first principal component direction
            // Use the dominant color variation direction
            const output = ctx.createImageData(canvas.width, canvas.height);
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i] - meanR;
                const g = data[i+1] - meanG;
                const b = data[i+2] - meanB;
                
                // Project onto approximate PC1 (weighted combination)
                const pc1 = (r * 0.577 + g * 0.577 + b * 0.577);
                const pc2 = (r * 0.707 - b * 0.707);
                
                // Map to visible range
                const val1 = Math.floor(Math.min(255, Math.max(0, pc1 + 128)));
                const val2 = Math.floor(Math.min(255, Math.max(0, pc2 + 128)));
                
                output.data[i] = val1;
                output.data[i+1] = val2;
                output.data[i+2] = Math.floor((val1 + val2) / 2);
                output.data[i+3] = 255;
            }
            
            ctx.putImageData(output, 0, 0);
        }

        function performGrayscale() {
            const canvas = document.getElementById('grayscaleCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                // Luminance-weighted grayscale (ITU-R BT.709)
                const lum = data[i] * 0.2126 + data[i+1] * 0.7152 + data[i+2] * 0.0722;
                data[i] = data[i+1] = data[i+2] = lum;
            }
            
            ctx.putImageData(imageData, 0, 0);
        }

        function performSharpen() {
            const canvas = document.getElementById('sharpenCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = canvas.width;
            const height = canvas.height;
            
            const output = ctx.createImageData(width, height);
            
            // Sharpen kernel: [ 0, -1,  0]
            //                 [-1,  5, -1]
            //                 [ 0, -1,  0]
            const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
            
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    for (let c = 0; c < 3; c++) {
                        let sum = 0;
                        let ki = 0;
                        for (let ky = -1; ky <= 1; ky++) {
                            for (let kx = -1; kx <= 1; kx++) {
                                const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                                sum += data[idx] * kernel[ki++];
                            }
                        }
                        output.data[(y * width + x) * 4 + c] = Math.min(255, Math.max(0, sum));
                    }
                    output.data[(y * width + x) * 4 + 3] = 255;
                }
            }
            
            ctx.putImageData(output, 0, 0);
        }

        function performEmboss() {
            const canvas = document.getElementById('embossCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = canvas.width;
            const height = canvas.height;
            
            const output = ctx.createImageData(width, height);
            
            // Emboss kernel: [-2, -1, 0]
            //                [-1,  1, 1]
            //                [ 0,  1, 2]
            const kernel = [-2, -1, 0, -1, 1, 1, 0, 1, 2];
            
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    for (let c = 0; c < 3; c++) {
                        let sum = 0;
                        let ki = 0;
                        for (let ky = -1; ky <= 1; ky++) {
                            for (let kx = -1; kx <= 1; kx++) {
                                const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                                sum += data[idx] * kernel[ki++];
                            }
                        }
                        output.data[(y * width + x) * 4 + c] = Math.min(255, Math.max(0, sum + 128));
                    }
                    output.data[(y * width + x) * 4 + 3] = 255;
                }
            }
            
            ctx.putImageData(output, 0, 0);
        }

        function performLaplacian() {
            const canvas = document.getElementById('laplacianCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = canvas.width;
            const height = canvas.height;
            
            const output = ctx.createImageData(width, height);
            
            // Laplacian kernel: [ 0,  1,  0]
            //                   [ 1, -4,  1]
            //                   [ 0,  1,  0]
            const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0];
            
            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    let sum = 0;
                    let ki = 0;
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const idx = ((y + ky) * width + (x + kx)) * 4;
                            const lum = (data[idx] + data[idx+1] + data[idx+2]) / 3;
                            sum += lum * kernel[ki++];
                        }
                    }
                    const val = Math.min(255, Math.max(0, Math.abs(sum)));
                    const idx = (y * width + x) * 4;
                    output.data[idx] = output.data[idx+1] = output.data[idx+2] = val;
                    output.data[idx+3] = 255;
                }
            }
            
            ctx.putImageData(output, 0, 0);
        }

        function performThreshold() {
            const canvas = document.getElementById('thresholdCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            const threshold = 128;
            
            for (let i = 0; i < data.length; i += 4) {
                const lum = (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114);
                const val = lum > threshold ? 255 : 0;
                data[i] = data[i+1] = data[i+2] = val;
            }
            
            ctx.putImageData(imageData, 0, 0);
        }

        function performPosterize() {
            const canvas = document.getElementById('posterizeCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            const levels = 4;
            const step = 255 / (levels - 1);
            
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.round(data[i] / step) * step;
                data[i+1] = Math.round(data[i+1] / step) * step;
                data[i+2] = Math.round(data[i+2] / step) * step;
            }
            
            ctx.putImageData(imageData, 0, 0);
        }

        function performSolarize() {
            const canvas = document.getElementById('solarizeCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            const threshold = 128;
            
            for (let i = 0; i < data.length; i += 4) {
                data[i] = data[i] > threshold ? 255 - data[i] : data[i];
                data[i+1] = data[i+1] > threshold ? 255 - data[i+1] : data[i+1];
                data[i+2] = data[i+2] > threshold ? 255 - data[i+2] : data[i+2];
            }
            
            ctx.putImageData(imageData, 0, 0);
        }

        function performStdDevMap() {
            const canvas = document.getElementById('stddevCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = canvas.width;
            const height = canvas.height;
            
            const output = ctx.createImageData(width, height);
            const windowSize = 2;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let sum = 0, sumSq = 0, count = 0;
                    
                    for (let wy = -windowSize; wy <= windowSize; wy++) {
                        for (let wx = -windowSize; wx <= windowSize; wx++) {
                            const nx = x + wx, ny = y + wy;
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                                const idx = (ny * width + nx) * 4;
                                const lum = (data[idx] + data[idx+1] + data[idx+2]) / 3;
                                sum += lum;
                                sumSq += lum * lum;
                                count++;
                            }
                        }
                    }
                    
                    const mean = sum / count;
                    const variance = (sumSq / count) - (mean * mean);
                    const stddev = Math.sqrt(Math.max(0, variance));
                    
                    const idx = (y * width + x) * 4;
                    const val = Math.min(255, stddev * 3);
                    output.data[idx] = output.data[idx+1] = output.data[idx+2] = val;
                    output.data[idx+3] = 255;
                }
            }
            
            ctx.putImageData(output, 0, 0);
        }

        function performGammaCorrection() {
            const canvas = document.getElementById('gammaCanvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
            
            ctx.drawImage(currentImage, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            const gamma = 3.0;
            const gammaCorrection = 1 / gamma;
            
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 * Math.pow(data[i] / 255, gammaCorrection);
                data[i+1] = 255 * Math.pow(data[i+1] / 255, gammaCorrection);
                data[i+2] = 255 * Math.pow(data[i+2] / 255, gammaCorrection);
            }
            
            ctx.putImageData(imageData, 0, 0);
        }

        function performELA() {
            const quality = parseInt(document.getElementById('elaQuality').value);
            const enhance = parseInt(document.getElementById('elaEnhance').value);

            const canvas = document.getElementById('elaCanvas');
            const ctx = canvas.getContext('2d');

            canvas.width = currentImage.width;
            canvas.height = currentImage.height;

            // Draw original
            ctx.drawImage(currentImage, 0, 0);

            // Get original image data
            const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Create compressed version
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = currentImage.width;
            tempCanvas.height = currentImage.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(currentImage, 0, 0);

            // Compress and reload
            const compressedDataUrl = tempCanvas.toDataURL('image/jpeg', quality / 100);
            const compressedImg = new Image();
            compressedImg.onload = () => {
                tempCtx.drawImage(compressedImg, 0, 0);
                const compressedData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);

                // Calculate difference
                const diffData = ctx.createImageData(canvas.width, canvas.height);
                for (let i = 0; i < originalData.data.length; i += 4) {
                    const diffR = Math.abs(originalData.data[i] - compressedData.data[i]) * enhance;
                    const diffG = Math.abs(originalData.data[i + 1] - compressedData.data[i + 1]) * enhance;
                    const diffB = Math.abs(originalData.data[i + 2] - compressedData.data[i + 2]) * enhance;

                    diffData.data[i] = Math.min(255, diffR);
                    diffData.data[i + 1] = Math.min(255, diffG);
                    diffData.data[i + 2] = Math.min(255, diffB);
                    diffData.data[i + 3] = 255;
                }

                ctx.putImageData(diffData, 0, 0);
            };
            compressedImg.src = compressedDataUrl;
        }

        function performELAAsync() {
            return new Promise(resolve => {
                const quality = parseInt(document.getElementById('elaQuality').value);
                const enhance = parseInt(document.getElementById('elaEnhance').value);
                const canvas = document.getElementById('elaCanvas');
                const ctx = canvas.getContext('2d');
                canvas.width = currentImage.width;
                canvas.height = currentImage.height;
                ctx.drawImage(currentImage, 0, 0);
                const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = currentImage.width;
                tempCanvas.height = currentImage.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(currentImage, 0, 0);
                const compressedDataUrl = tempCanvas.toDataURL('image/jpeg', quality / 100);
                const compressedImg = new Image();
                compressedImg.onload = () => {
                    tempCtx.drawImage(compressedImg, 0, 0);
                    const compressedData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
                    const diffData = ctx.createImageData(canvas.width, canvas.height);
                    for (let i = 0; i < originalData.data.length; i += 4) {
                        const diffR = Math.abs(originalData.data[i] - compressedData.data[i]) * enhance;
                        const diffG = Math.abs(originalData.data[i + 1] - compressedData.data[i + 1]) * enhance;
                        const diffB = Math.abs(originalData.data[i + 2] - compressedData.data[i + 2]) * enhance;
                        diffData.data[i] = Math.min(255, diffR);
                        diffData.data[i + 1] = Math.min(255, diffG);
                        diffData.data[i + 2] = Math.min(255, diffB);
                        diffData.data[i + 3] = 255;
                    }
                    ctx.putImageData(diffData, 0, 0);
                    resolve();
                };
                compressedImg.src = compressedDataUrl;
            });
        }

        function performJPEGGhostAsync() {
            const qualities = [60, 70, 80, 90];
            return Promise.all(qualities.map(quality => {
                return new Promise(resolve => {
                    const canvas = document.getElementById('ghostCanvas' + quality);
                    const ctx = canvas.getContext('2d');
                    canvas.width = currentImage.width;
                    canvas.height = currentImage.height;
                    ctx.drawImage(currentImage, 0, 0);
                    const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = currentImage.width;
                    tempCanvas.height = currentImage.height;
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCtx.drawImage(currentImage, 0, 0);
                    const compressedUrl = tempCanvas.toDataURL('image/jpeg', quality / 100);
                    const compImg = new Image();
                    compImg.onload = () => {
                        tempCtx.drawImage(compImg, 0, 0);
                        const compData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
                        const output = ctx.createImageData(canvas.width, canvas.height);
                        for (let i = 0; i < originalData.data.length; i += 4) {
                            const diffR = Math.abs(originalData.data[i] - compData.data[i]);
                            const diffG = Math.abs(originalData.data[i + 1] - compData.data[i + 1]);
                            const diffB = Math.abs(originalData.data[i + 2] - compData.data[i + 2]);
                            const diff = (diffR + diffG + diffB) / 3;
                            const val = 255 - Math.min(255, diff * 10);
                            output.data[i] = val;
                            output.data[i + 1] = val;
                            output.data[i + 2] = val;
                            output.data[i + 3] = 255;
                        }
                        ctx.putImageData(output, 0, 0);
                        resolve();
                    };
                    compImg.src = compressedUrl;
                });
            }));
        }

        function extractMetadata() {
            const metadataGrid = document.getElementById('metadataGrid');
            
            EXIF.getData(imageFile, function() {
                const allMetadata = EXIF.getAllTags(this);
                
                if (Object.keys(allMetadata).length === 0) {
                    metadataGrid.innerHTML = '<p class="no-data"><i class="fas fa-exclamation-circle"></i> No EXIF metadata found. Image may have been stripped of metadata or saved without it.</p>';
                    return;
                }

                let html = '<div class="metadata-items">';
                
                const importantTags = ['Make', 'Model', 'DateTime', 'DateTimeOriginal', 'Software', 'GPSLatitude', 'GPSLongitude', 'ExifImageWidth', 'ExifImageHeight', 'ColorSpace', 'Flash', 'FocalLength', 'ExposureTime', 'FNumber', 'ISOSpeedRatings'];
                
                importantTags.forEach(tag => {
                    if (allMetadata[tag]) {
                        let value = allMetadata[tag];
                        if (Array.isArray(value)) {
                            value = value.join(', ');
                        }
                        html += `<div class="metadata-item">
                            <span class="meta-label">${formatTagName(tag)}</span>
                            <span class="meta-value">${value}</span>
                        </div>`;
                    }
                });

                // Add remaining tags
                Object.keys(allMetadata).forEach(tag => {
                    if (!importantTags.includes(tag) && typeof allMetadata[tag] !== 'object') {
                        html += `<div class="metadata-item">
                            <span class="meta-label">${formatTagName(tag)}</span>
                            <span class="meta-value">${allMetadata[tag]}</span>
                        </div>`;
                    }
                });

                html += '</div>';
                metadataGrid.innerHTML = html;
            });
        }

        function formatTagName(tag) {
            return tag.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        }

        async function calculateHashes() {
            const hashResults = document.getElementById('hashResults');
            
            try {
                const arrayBuffer = await imageFile.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);

                const [md5, sha1, sha256, sha512] = await Promise.all([
                    hashwasm.md5(uint8Array),
                    hashwasm.sha1(uint8Array),
                    hashwasm.sha256(uint8Array),
                    hashwasm.sha512(uint8Array)
                ]);

                hashResults.innerHTML = `
                    <div class="hash-item">
                        <span class="hash-label">MD5</span>
                        <code class="hash-value">${md5}</code>
                        <button class="copy-btn" onclick="copyHash('${md5}')"><i class="fas fa-copy"></i></button>
                    </div>
                    <div class="hash-item">
                        <span class="hash-label">SHA-1</span>
                        <code class="hash-value">${sha1}</code>
                        <button class="copy-btn" onclick="copyHash('${sha1}')"><i class="fas fa-copy"></i></button>
                    </div>
                    <div class="hash-item">
                        <span class="hash-label">SHA-256</span>
                        <code class="hash-value">${sha256}</code>
                        <button class="copy-btn" onclick="copyHash('${sha256}')"><i class="fas fa-copy"></i></button>
                    </div>
                    <div class="hash-item">
                        <span class="hash-label">SHA-512</span>
                        <code class="hash-value">${sha512}</code>
                        <button class="copy-btn" onclick="copyHash('${sha512}')"><i class="fas fa-copy"></i></button>
                    </div>
                `;
            } catch (error) {
                hashResults.innerHTML = '<p class="error">Error calculating hashes</p>';
            }
        }

        function generateForensicNotes() {
            const notes = document.getElementById('forensicNotes');
            const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
            
            notes.innerHTML = `
                <div class="note-item">
                    <i class="fas fa-clock"></i>
                    <span><strong>Analysis Timestamp:</strong> ${timestamp} IST</span>
                </div>
                <div class="note-item">
                    <i class="fas fa-file"></i>
                    <span><strong>File Analyzed:</strong> ${imageFile.name}</span>
                </div>
                <div class="note-item">
                    <i class="fas fa-microchip"></i>
                    <span><strong>Processing:</strong> All analysis performed client-side in browser</span>
                </div>
                <div class="note-item warning">
                    <i class="fas fa-triangle-exclamation"></i>
                    <span><strong>Disclaimer:</strong> ELA is a screening tool and should not be used as sole evidence of manipulation. Professional forensic analysis is recommended for legal proceedings.</span>
                </div>
            `;
        }

        function calculateManipulationScore() {
            let score = 0;
            let factors = [];
            
            // Analyze ELA canvas for bright spots (potential manipulation)
            try {
                const elaCanvas = document.getElementById('elaCanvas');
                const elaCtx = elaCanvas.getContext('2d');
                const elaData = elaCtx.getImageData(0, 0, elaCanvas.width, elaCanvas.height).data;
                
                let brightPixels = 0;
                let totalPixels = elaData.length / 4;
                
                for (let i = 0; i < elaData.length; i += 4) {
                    const brightness = (elaData[i] + elaData[i+1] + elaData[i+2]) / 3;
                    if (brightness > 100) brightPixels++;
                }
                
                const elaBrightRatio = brightPixels / totalPixels;
                if (elaBrightRatio > 0.15) {
                    score += 25;
                    factors.push('High ELA variation detected');
                } else if (elaBrightRatio > 0.08) {
                    score += 15;
                    factors.push('Moderate ELA variation');
                } else if (elaBrightRatio > 0.03) {
                    score += 5;
                }
            } catch (e) {}
            
            // Check for missing EXIF (common in edited images)
            try {
                const metadataGrid = document.getElementById('metadataGrid').textContent;
                if (metadataGrid.includes('No EXIF') || metadataGrid.includes('Could not extract')) {
                    score += 15;
                    factors.push('Missing or stripped EXIF metadata');
                }
                if (!metadataGrid.includes('Camera') && !metadataGrid.includes('Make')) {
                    score += 10;
                    factors.push('No camera information found');
                }
            } catch (e) {}
            
            // Analyze noise consistency
            try {
                const noiseCanvas = document.getElementById('noiseCanvas');
                const noiseCtx = noiseCanvas.getContext('2d');
                const noiseData = noiseCtx.getImageData(0, 0, noiseCanvas.width, noiseCanvas.height).data;
                
                let noiseSum = 0;
                let noiseSumSq = 0;
                const n = noiseData.length / 4;
                
                for (let i = 0; i < noiseData.length; i += 4) {
                    const val = noiseData[i];
                    noiseSum += val;
                    noiseSumSq += val * val;
                }
                
                const noiseMean = noiseSum / n;
                const noiseVariance = (noiseSumSq / n) - (noiseMean * noiseMean);
                
                if (noiseVariance > 2000) {
                    score += 20;
                    factors.push('Inconsistent noise patterns');
                } else if (noiseVariance > 1000) {
                    score += 10;
                }
            } catch (e) {}
            
            // Check JPEG quality inconsistency from ghost analysis
            try {
                const ghostCanvases = ['ghostCanvas60', 'ghostCanvas70', 'ghostCanvas80', 'ghostCanvas90'];
                let maxDiff = 0;
                
                ghostCanvases.forEach(id => {
                    const canvas = document.getElementById(id);
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                        let sum = 0;
                        for (let i = 0; i < data.length; i += 4) {
                            sum += data[i];
                        }
                        const avg = sum / (data.length / 4);
                        maxDiff = Math.max(maxDiff, avg);
                    }
                });
                
                if (maxDiff > 50) {
                    score += 15;
                    factors.push('JPEG recompression artifacts detected');
                }
            } catch (e) {}
            
            // Check for clipped values (overexposure manipulation)
            try {
                const minmaxCanvas = document.getElementById('minmaxCanvas');
                const ctx = minmaxCanvas.getContext('2d');
                const data = ctx.getImageData(0, 0, minmaxCanvas.width, minmaxCanvas.height).data;
                
                let clippedCount = 0;
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] === 255 || data[i+2] === 255) clippedCount++;
                }
                
                const clippedRatio = clippedCount / (data.length / 4);
                if (clippedRatio > 0.1) {
                    score += 10;
                    factors.push('Significant clipping detected');
                }
            } catch (e) {}
            
            // Cap score at 100
            score = Math.min(100, Math.max(0, score));
            
            // Update UI
            const scoreCircle = document.getElementById('scoreCircle');
            const scoreValue = document.getElementById('scoreValue');
            const verdictText = document.getElementById('verdictText');
            const verdictDesc = document.getElementById('verdictDesc');
            
            scoreCircle.style.setProperty('--score', score);
            scoreValue.textContent = score + '%';
            
            // Remove old classes
            scoreCircle.classList.remove('score-low', 'score-medium', 'score-high');
            
            if (score < 25) {
                scoreCircle.classList.add('score-low');
                verdictText.textContent = '✓ Likely Authentic';
                verdictText.style.color = '#00ff88';
                verdictDesc.textContent = 'Low probability of manipulation. The image shows consistent compression artifacts, noise patterns, and metadata. ' + (factors.length > 0 ? 'Minor notes: ' + factors.join(', ') + '.' : '');
            } else if (score < 50) {
                scoreCircle.classList.add('score-medium');
                verdictText.textContent = '⚠ Possibly Modified';
                verdictText.style.color = '#ffaa00';
                verdictDesc.textContent = 'Some indicators suggest possible editing. ' + factors.join('. ') + '. Further examination recommended.';
            } else if (score < 75) {
                scoreCircle.classList.add('score-high');
                verdictText.textContent = '⚠ Likely Modified';
                verdictText.style.color = '#ff6644';
                verdictDesc.textContent = 'Multiple manipulation indicators detected. ' + factors.join('. ') + '. Professional analysis recommended.';
            } else {
                scoreCircle.classList.add('score-high');
                verdictText.textContent = '✗ High Manipulation Probability';
                verdictText.style.color = '#ff4444';
                verdictDesc.textContent = 'Strong evidence of image manipulation. ' + factors.join('. ') + '. This image should be treated as potentially altered.';
            }
        }

        function copyHash(hash) {
            navigator.clipboard.writeText(hash);
            showToast('Hash copied to clipboard');
        }

        function resetAnalysis() {
            document.getElementById('resultsSection').style.display = 'none';
            document.querySelector('.upload-section').style.display = 'block';
            fileInput.value = '';
            currentImage = null;
            imageFile = null;
        }

        async function waitForCanvasesReady(canvasIds, maxTries = 10, delay = 150) {
            for (let attempt = 0; attempt < maxTries; attempt++) {
                let allReady = true;
                for (const id of canvasIds) {
                    const c = document.getElementById(id);
                    if (!c) { allReady = false; break; }
                    const ctx = c.getContext('2d');
                    const pixels = ctx.getImageData(0, 0, c.width, c.height).data;
                    let nonZero = false;
                    for (let i = 0; i < pixels.length; i++) {
                        if (pixels[i] !== 0) { nonZero = true; break; }
                    }
                    if (!nonZero) { allReady = false; break; }
                }
                if (allReady) return true;
                await new Promise(r => setTimeout(r, delay));
            }
            return false;
        }

        async function downloadReport() {
            // Show loading overlay
            const overlay = document.getElementById('loadingOverlay');
            const loadingText = document.getElementById('loadingText');
            const progressText = document.getElementById('loadingProgress');
            const progressFill = document.getElementById('progressFill');
            const spinnerSlash = document.getElementById('spinnerSlash');
            overlay.classList.remove('hidden');
            loadingText.textContent = 'Generating PDF Report...';
            progressText.textContent = 'Preparing report data...';
            progressFill.style.width = '10%';
            const slashChars = ['|', '/', '—', '\\'];
            let slashIndex = 0;
            const slashInterval = setInterval(() => {
                spinnerSlash.textContent = slashChars[slashIndex];
                slashIndex = (slashIndex + 1) % slashChars.length;
            }, 150);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `forensic-report-${timestamp}.pdf`;

            try {
                progressText.textContent = 'Capturing canvas images...';
                progressFill.style.width = '20%';
                await new Promise(r => setTimeout(r, 100));

                // Capture all canvas images as data URLs
                const canvasData = {};
                const canvasIds = ['elaCanvas', 'redChannel', 'greenChannel', 'blueChannel', 'edgeCanvas', 'histogramCanvas'];
                for (const id of canvasIds) {
                    const canvas = document.getElementById(id);
                    if (canvas && canvas.width > 0 && canvas.height > 0) {
                        try {
                            canvasData[id] = canvas.toDataURL('image/png');
                        } catch (e) {
                            canvasData[id] = '';
                        }
                    } else {
                        canvasData[id] = '';
                    }
                }

                progressText.textContent = 'Building report...';
                progressFill.style.width = '30%';

                // Get text content
                const scoreValue = document.getElementById('scoreValue')?.textContent || 'N/A';
                const verdictText = document.getElementById('verdictText')?.textContent || '';
                const verdictDesc = document.getElementById('verdictDesc')?.textContent || '';
                const hashResults = document.getElementById('hashResults')?.innerText || 'No hash data';
                const metadataGrid = document.getElementById('metadataGrid')?.innerText || 'No metadata';
                const forensicNotes = document.getElementById('forensicNotes')?.innerText || 'No notes';

                // Create report container - append to body and make visible
                const report = document.createElement('div');
                report.id = 'pdf-report-container';
                report.style.cssText = 'position: absolute; left: 0; top: 0; width: 800px; background: #fff; padding: 30px; font-family: Arial, sans-serif; color: #222; z-index: 9998;';

                report.innerHTML = `
                    <div style="text-align:center; border-bottom:3px solid #0066cc; margin-bottom:20px; padding-bottom:10px;">
                        <h1 style="font-size:22px; color:#1a1a2e; margin:0 0 8px 0;">Image Forensic Analysis Report</h1>
                        <p style="color:#666; margin:4px 0; font-size:12px;">Generated: ${new Date().toLocaleString()}</p>
                        <p style="color:#666; margin:4px 0; font-size:12px;">Punjab Investigation Tools</p>
                    </div>
                    <div style="background:#f5f5f5; padding:12px; border-radius:4px; margin-bottom:14px;">
                        <h2 style="font-size:14px; color:#333; margin:0 0 6px 0;">Manipulation Probability: ${scoreValue}</h2>
                        <p style="font-weight:bold; margin:4px 0; font-size:13px;">${verdictText}</p>
                        <p style="color:#555; margin:4px 0; font-size:11px;">${verdictDesc}</p>
                    </div>
                    <div style="background:#f5f5f5; padding:12px; border-radius:4px; margin-bottom:14px;">
                        <h2 style="font-size:14px; color:#333; margin:0 0 6px 0;">File Information</h2>
                        <table style="width:100%; font-size:11px;">
                            <tr><td style="padding:2px 0;"><strong>Filename:</strong></td><td>${imageFile?.name || 'Unknown'}</td></tr>
                            <tr><td style="padding:2px 0;"><strong>Type:</strong></td><td>${imageFile?.type || 'Unknown'}</td></tr>
                            <tr><td style="padding:2px 0;"><strong>Dimensions:</strong></td><td>${currentImage?.width || 0} x ${currentImage?.height || 0} px</td></tr>
                            <tr><td style="padding:2px 0;"><strong>Size:</strong></td><td>${formatFileSize(imageFile?.size || 0)}</td></tr>
                        </table>
                    </div>
                    <div style="background:#f5f5f5; padding:12px; border-radius:4px; margin-bottom:14px;">
                        <h2 style="font-size:14px; color:#333; margin:0 0 6px 0;">Original Image</h2>
                        ${currentImage?.src ? `<img src="${currentImage.src}" style="max-width:100%; max-height:250px; display:block;">` : '<p>No image</p>'}
                    </div>
                    <div style="background:#f5f5f5; padding:12px; border-radius:4px; margin-bottom:14px;">
                        <h2 style="font-size:14px; color:#333; margin:0 0 6px 0;">Error Level Analysis (ELA)</h2>
                        <p style="font-size:10px; color:#666; margin-bottom:6px;">Brighter areas may indicate manipulation.</p>
                        ${canvasData.elaCanvas ? `<img src="${canvasData.elaCanvas}" style="max-width:100%; max-height:200px; display:block;">` : '<p>No ELA data</p>'}
                    </div>
                    <div style="background:#f5f5f5; padding:12px; border-radius:4px; margin-bottom:14px;">
                        <h2 style="font-size:14px; color:#333; margin:0 0 6px 0;">Color Channel Analysis</h2>
                        <div style="display:flex; gap:8px;">
                            <div style="flex:1; text-align:center;">${canvasData.redChannel ? `<img src="${canvasData.redChannel}" style="max-width:100%; max-height:120px;">` : ''}<p style="font-size:10px; margin:4px 0;">Red</p></div>
                            <div style="flex:1; text-align:center;">${canvasData.greenChannel ? `<img src="${canvasData.greenChannel}" style="max-width:100%; max-height:120px;">` : ''}<p style="font-size:10px; margin:4px 0;">Green</p></div>
                            <div style="flex:1; text-align:center;">${canvasData.blueChannel ? `<img src="${canvasData.blueChannel}" style="max-width:100%; max-height:120px;">` : ''}<p style="font-size:10px; margin:4px 0;">Blue</p></div>
                        </div>
                    </div>
                    <div style="background:#f5f5f5; padding:12px; border-radius:4px; margin-bottom:14px;">
                        <h2 style="font-size:14px; color:#333; margin:0 0 6px 0;">Edge Detection & Histogram</h2>
                        <div style="display:flex; gap:8px;">
                            <div style="flex:1; text-align:center;">${canvasData.edgeCanvas ? `<img src="${canvasData.edgeCanvas}" style="max-width:100%; max-height:150px;">` : ''}<p style="font-size:10px; margin:4px 0;">Sobel Edges</p></div>
                            <div style="flex:1; text-align:center;">${canvasData.histogramCanvas ? `<img src="${canvasData.histogramCanvas}" style="max-width:100%; max-height:150px;">` : ''}<p style="font-size:10px; margin:4px 0;">Histogram</p></div>
                        </div>
                    </div>
                    <div style="background:#f5f5f5; padding:12px; border-radius:4px; margin-bottom:14px;">
                        <h2 style="font-size:14px; color:#333; margin:0 0 6px 0;">Hash Values</h2>
                        <pre style="font-size:9px; word-break:break-all; white-space:pre-wrap; margin:0; font-family:monospace;">${hashResults}</pre>
                    </div>
                    <div style="background:#f5f5f5; padding:12px; border-radius:4px; margin-bottom:14px;">
                        <h2 style="font-size:14px; color:#333; margin:0 0 6px 0;">Metadata</h2>
                        <pre style="font-size:9px; white-space:pre-wrap; margin:0; font-family:monospace;">${metadataGrid}</pre>
                    </div>
                    <div style="background:#f5f5f5; padding:12px; border-radius:4px; margin-bottom:14px;">
                        <h2 style="font-size:14px; color:#333; margin:0 0 6px 0;">Forensic Notes</h2>
                        <pre style="font-size:10px; white-space:pre-wrap; margin:0;">${forensicNotes}</pre>
                    </div>
                    <div style="text-align:center; padding-top:12px; border-top:1px solid #ccc; font-size:10px; color:#888;">
                        <p style="margin:2px 0;">Generated by Punjab Investigation Tools - Image Forensics Analyzer</p>
                        <p style="margin:2px 0;">This report is for investigative purposes only.</p>
                    </div>
                `;

                document.body.appendChild(report);

                // Wait for images to load
                const imgs = report.querySelectorAll('img');
                await Promise.all(Array.from(imgs).map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                }));

                progressText.textContent = 'Rendering PDF...';
                progressFill.style.width = '50%';
                await new Promise(r => setTimeout(r, 300));

                // Use html2canvas to capture
                const canvas = await html2canvas(report, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    width: 800,
                    windowWidth: 800
                });

                // Remove report container
                document.body.removeChild(report);

                progressText.textContent = 'Generating PDF file...';
                progressFill.style.width = '80%';

                // Create PDF using jsPDF
                const { jsPDF } = window.jspdf;
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                const margin = 10;
                const usableWidth = pageWidth - (margin * 2);
                const usableHeight = pageHeight - (margin * 2);

                // Calculate dimensions
                const imgWidth = usableWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                // Calculate how many pixels of the canvas fit per page
                const pxPerMm = canvas.width / imgWidth;
                const pageHeightPx = usableHeight * pxPerMm;
                const totalPages = Math.ceil(canvas.height / pageHeightPx);

                // Split canvas into pages
                for (let page = 0; page < totalPages; page++) {
                    if (page > 0) pdf.addPage();

                    // Create a temporary canvas for this page section
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = canvas.width;
                    const startY = page * pageHeightPx;
                    const remainingHeight = canvas.height - startY;
                    const thisPageHeightPx = Math.min(pageHeightPx, remainingHeight);
                    pageCanvas.height = thisPageHeightPx;

                    const pageCtx = pageCanvas.getContext('2d');
                    pageCtx.drawImage(canvas, 0, startY, canvas.width, thisPageHeightPx, 0, 0, canvas.width, thisPageHeightPx);

                    const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
                    const thisPageHeightMm = thisPageHeightPx / pxPerMm;

                    pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, thisPageHeightMm);
                    
                    progressText.textContent = `Generating page ${page + 1} of ${totalPages}...`;
                }

                pdf.save(filename);

                clearInterval(slashInterval);
                spinnerSlash.textContent = '✓';
                progressFill.style.width = '100%';
                progressText.textContent = 'PDF Downloaded!';
                setTimeout(() => {
                    overlay.classList.add('hidden');
                    loadingText.textContent = 'Analyzing Image...';
                }, 500);
                showToast('PDF Report downloaded successfully!');

            } catch (error) {
                clearInterval(slashInterval);
                overlay.classList.add('hidden');
                loadingText.textContent = 'Analyzing Image...';
                showToast('Error generating PDF: ' + error.message);
                console.error('PDF generation error:', error);
            }
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            document.getElementById('toastMessage').textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }