// BSA Hash Analyzer - Main Application JavaScript
// Uses hash-wasm for high-performance hashing with chunked processing for large files

// Global variables
let processedFiles = [];
let currentLanguage = 'en';
let currentSiteLanguage = 'en';

// Chunk size for large file processing (2MB chunks)
const CHUNK_SIZE = 2 * 1024 * 1024;

// Get IST Time
function getISTDateTime() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + (istOffset + now.getTimezoneOffset() * 60 * 1000));
    
    const dateStr = istTime.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const timeStr = istTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    
    return {
        full: `${dateStr} ${timeStr} IST`,
        date: dateStr,
        time: `${timeStr} IST`
    };
}

// Apply site language to all UI elements
function applySiteLanguage(lang) {
    const t = translations[lang];
    currentSiteLanguage = lang;
    
    // Header
    const logoSubtitle = document.getElementById('logoSubtitle');
    if (logoSubtitle) logoSubtitle.textContent = t.logoSubtitle;
    
    // Hero section
    const heroTitle = document.getElementById('heroTitle');
    const heroDesc = document.getElementById('heroDesc');
    if (heroTitle) heroTitle.innerHTML = '<i class="fas fa-fingerprint"></i> ' + t.heroTitle;
    if (heroDesc) heroDesc.textContent = t.heroDesc;
    
    // Upload section
    const uploadTitle = document.getElementById('uploadTitle');
    const uploadDesc = document.getElementById('uploadDesc');
    const selectFilesBtn = document.getElementById('selectFilesBtn');
    if (uploadTitle) uploadTitle.textContent = t.uploadTitle;
    if (uploadDesc) uploadDesc.textContent = t.uploadDesc;
    if (selectFilesBtn) selectFilesBtn.textContent = t.selectFilesBtn;
    
    // Results section
    const processedFilesTitle = document.getElementById('processedFilesTitle');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const genCertBtn = document.getElementById('genCertBtn');
    if (processedFilesTitle) processedFilesTitle.textContent = t.processedFilesTitle;
    if (copyAllBtn) copyAllBtn.textContent = t.copyAllBtn;
    if (exportCsvBtn) exportCsvBtn.textContent = t.exportCsvBtn;
    if (genCertBtn) genCertBtn.textContent = t.genCertBtn;
    
    // Info section
    const aboutHashTitle = document.getElementById('aboutHashTitle');
    const md5Desc = document.getElementById('md5Desc');
    const sha1Desc = document.getElementById('sha1Desc');
    const sha256Desc = document.getElementById('sha256Desc');
    const sha512Desc = document.getElementById('sha512Desc');
    if (aboutHashTitle) aboutHashTitle.textContent = t.aboutHashTitle;
    if (md5Desc) md5Desc.textContent = t.md5Desc;
    if (sha1Desc) sha1Desc.textContent = t.sha1Desc;
    if (sha256Desc) sha256Desc.textContent = t.sha256Desc;
    if (sha512Desc) sha512Desc.textContent = t.sha512Desc;
    
    // Footer
    const footerDesc = document.getElementById('footerDesc');
    const disclaimerLink = document.getElementById('disclaimerLink');
    const aboutHashLink = document.getElementById('aboutHashLink');
    const aboutBsaLink = document.getElementById('aboutBsaLink');
    const copyright = document.getElementById('copyright');
    if (footerDesc) footerDesc.textContent = t.footerDesc;
    if (disclaimerLink) disclaimerLink.textContent = t.disclaimerLink;
    if (aboutHashLink) aboutHashLink.textContent = t.aboutHashLink;
    if (aboutBsaLink) aboutBsaLink.textContent = t.aboutBsaLink;
    if (copyright) copyright.textContent = t.copyright;
    
    // Update page title
    document.title = 'BSA Hash Analyzer | ' + t.heroTitle;
    
    // Sync certificate modal language selector
    const certificateLangSelect = document.getElementById('languageSelect');
    if (certificateLangSelect) certificateLangSelect.value = lang;
}

// Change site language and save to localStorage
function changeSiteLanguage() {
    const siteLanguageSelect = document.getElementById('siteLanguage');
    const selectedLang = siteLanguageSelect.value;
    localStorage.setItem('bsaHashLang', selectedLang);
    applySiteLanguage(selectedLang);
}

// Load saved language from localStorage
function loadSavedLanguage() {
    const savedLang = localStorage.getItem('bsaHashLang');
    if (savedLang && translations[savedLang]) {
        const siteLanguageSelect = document.getElementById('siteLanguage');
        if (siteLanguageSelect) siteLanguageSelect.value = savedLang;
        applySiteLanguage(savedLang);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupDragAndDrop();
    setupFileInput();
    loadSavedLanguage();
    
    // Check if hash-wasm is loaded
    if (typeof hashwasm !== 'undefined') {
        updateStatus('Hash libraries loaded successfully!', 'success');
    } else {
        updateStatus('Loading hash libraries...', 'processing');
    }
});

// Drag and Drop Setup
function setupDragAndDrop() {
    const uploadArea = document.getElementById('uploadArea');

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
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFiles(files);
        }
    });
}

// File Input Setup
function setupFileInput() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    });
}

// Process Files with chunked hashing for large files
async function processFiles(files) {
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressFile = document.getElementById('progressFile');
    const progressPercent = document.getElementById('progressPercent');

    progressContainer.classList.add('active');
    updateStatus('Processing files...', 'processing');

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        progressFile.textContent = `Processing: ${file.name} (${formatFileSize(file.size)})`;
        
        const fileData = {
            name: file.name,
            size: formatFileSize(file.size),
            sizeBytes: file.size,
            type: file.type || 'Unknown',
            lastModified: new Date(file.lastModified).toLocaleString(),
            processedAt: new Date().toLocaleString(),
            hashes: {}
        };

        try {
            // Use chunked hashing for large files to prevent browser freezing
            const hashes = await calculateHashesChunked(file, (chunkProgress) => {
                const overallProgress = ((i + chunkProgress) / files.length) * 100;
                progressFill.style.width = overallProgress + '%';
                progressPercent.textContent = Math.round(overallProgress) + '%';
            });
            
            fileData.hashes = hashes;
            processedFiles.push(fileData);
        } catch (error) {
            console.error('Error processing file:', file.name, error);
            showToast(`Error processing ${file.name}: ${error.message}`);
        }

        const progress = ((i + 1) / files.length) * 100;
        progressFill.style.width = progress + '%';
        progressPercent.textContent = Math.round(progress) + '%';
    }

    progressContainer.classList.remove('active');
    updateStatus('Ready', 'ready');
    displayResults();
}

// Calculate hashes using chunked streaming for large files
async function calculateHashesChunked(file, onProgress) {
    // Create hash instances for all algorithms
    const [md5Hasher, sha1Hasher, sha256Hasher, sha512Hasher, sha3_256Hasher, blake2bHasher] = await Promise.all([
        hashwasm.createMD5(),
        hashwasm.createSHA1(),
        hashwasm.createSHA256(),
        hashwasm.createSHA512(),
        hashwasm.createSHA3(256),
        hashwasm.createBLAKE2b(256)
    ]);
    
    // Initialize all hashers
    md5Hasher.init();
    sha1Hasher.init();
    sha256Hasher.init();
    sha512Hasher.init();
    sha3_256Hasher.init();
    blake2bHasher.init();
    
    const fileSize = file.size;
    let offset = 0;
    
    // Process file in chunks
    while (offset < fileSize) {
        const chunk = file.slice(offset, offset + CHUNK_SIZE);
        const arrayBuffer = await chunk.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Update all hashers with this chunk
        md5Hasher.update(uint8Array);
        sha1Hasher.update(uint8Array);
        sha256Hasher.update(uint8Array);
        sha512Hasher.update(uint8Array);
        sha3_256Hasher.update(uint8Array);
        blake2bHasher.update(uint8Array);
        
        offset += CHUNK_SIZE;
        
        // Report progress
        if (onProgress) {
            onProgress(Math.min(offset / fileSize, 1));
        }
        
        // Yield to the browser to prevent freezing
        await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    // Get final hash values
    return {
        md5: md5Hasher.digest('hex'),
        sha1: sha1Hasher.digest('hex'),
        sha256: sha256Hasher.digest('hex'),
        sha512: sha512Hasher.digest('hex'),
        sha3_256: sha3_256Hasher.digest('hex'),
        blake2b: blake2bHasher.digest('hex')
    };
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Display results
function displayResults() {
    const resultsSection = document.getElementById('resultsSection');
    const fileCards = document.getElementById('fileCards');
    const fileCount = document.getElementById('fileCount');

    resultsSection.classList.add('active');
    fileCount.textContent = processedFiles.length;

    fileCards.innerHTML = processedFiles.map((file, index) => `
        <div class="file-card">
            <div class="file-card-header">
                <div class="file-info">
                    <div class="file-icon">
                        <i class="fas fa-file"></i>
                    </div>
                    <div class="file-details">
                        <h4>${escapeHtml(file.name)}</h4>
                        <div class="file-meta">
                            <span><i class="fas fa-weight-hanging"></i> ${file.size}</span>
                            <span><i class="fas fa-tag"></i> ${escapeHtml(file.type)}</span>
                            <span><i class="fas fa-clock"></i> ${file.processedAt}</span>
                        </div>
                    </div>
                </div>
                <div class="file-status">
                    <i class="fas fa-check-circle"></i>
                    Verified
                </div>
            </div>
            <div class="file-card-body">
                <div class="hash-grid">
                    <div class="hash-item">
                        <div class="hash-label">
                            <span class="hash-type">MD5</span>
                            <button class="copy-btn" onclick="copyHash('${file.hashes.md5}', this)">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <div class="hash-value">${file.hashes.md5}</div>
                    </div>
                    <div class="hash-item">
                        <div class="hash-label">
                            <span class="hash-type">SHA-1</span>
                            <button class="copy-btn" onclick="copyHash('${file.hashes.sha1}', this)">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <div class="hash-value">${file.hashes.sha1}</div>
                    </div>
                    <div class="hash-item">
                        <div class="hash-label">
                            <span class="hash-type">SHA-256</span>
                            <button class="copy-btn" onclick="copyHash('${file.hashes.sha256}', this)">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <div class="hash-value">${file.hashes.sha256}</div>
                    </div>
                    <div class="hash-item">
                        <div class="hash-label">
                            <span class="hash-type">SHA-512</span>
                            <button class="copy-btn" onclick="copyHash('${file.hashes.sha512}', this)">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <div class="hash-value">${file.hashes.sha512}</div>
                    </div>
                    <div class="hash-item">
                        <div class="hash-label">
                            <span class="hash-type">SHA3-256</span>
                            <button class="copy-btn" onclick="copyHash('${file.hashes.sha3_256}', this)">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <div class="hash-value">${file.hashes.sha3_256}</div>
                    </div>
                    <div class="hash-item">
                        <div class="hash-label">
                            <span class="hash-type">BLAKE2b-256</span>
                            <button class="copy-btn" onclick="copyHash('${file.hashes.blake2b}', this)">
                                <i class="fas fa-copy"></i> Copy
                            </button>
                        </div>
                        <div class="hash-value">${file.hashes.blake2b}</div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Update status
function updateStatus(message, type) {
    const statusText = document.getElementById('statusText');
    statusText.textContent = message;
}

// Copy hash to clipboard
function copyHash(hash, button) {
    navigator.clipboard.writeText(hash).then(() => {
        button.classList.add('copied');
        button.innerHTML = '<i class="fas fa-check"></i> Copied';
        showToast('Hash copied to clipboard!');
        setTimeout(() => {
            button.classList.remove('copied');
            button.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
    });
}

// Copy all hashes
function copyAllHashes() {
    let text = '';
    processedFiles.forEach(file => {
        text += `File: ${file.name}\n`;
        text += `Size: ${file.size}\n`;
        text += `MD5: ${file.hashes.md5}\n`;
        text += `SHA-1: ${file.hashes.sha1}\n`;
        text += `SHA-256: ${file.hashes.sha256}\n`;
        text += `SHA-512: ${file.hashes.sha512}\n`;
        text += `SHA3-256: ${file.hashes.sha3_256}\n`;
        text += `BLAKE2b-256: ${file.hashes.blake2b}\n`;
        text += '\n---\n\n';
    });
    navigator.clipboard.writeText(text).then(() => {
        showToast('All hashes copied to clipboard!');
    });
}

// Export CSV
function exportCSV() {
    let csv = 'File Name,File Size,MD5,SHA-1,SHA-256,SHA-512,SHA3-256,BLAKE2b-256,Processed At\n';
    processedFiles.forEach(file => {
        csv += `"${file.name}","${file.size}","${file.hashes.md5}","${file.hashes.sha1}","${file.hashes.sha256}","${file.hashes.sha512}","${file.hashes.sha3_256}","${file.hashes.blake2b}","${file.processedAt}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hash_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV file downloaded!');
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Certificate Modal Functions
function openCertificateModal() {
    if (processedFiles.length === 0) {
        showToast('Please process files first!');
        return;
    }
    syncCertificateLanguageSelectors(currentSiteLanguage);
    currentLanguage = currentSiteLanguage;
    
    generateCertificate();
    document.getElementById('certificateModal').classList.add('active');
}

function closeCertificateModal() {
    document.getElementById('certificateModal').classList.remove('active');
}

// Sync both top and bottom language selectors
function syncCertificateLanguageSelectors(lang) {
    const langSelectTop = document.getElementById('languageSelectTop');
    const langSelectBottom = document.getElementById('languageSelect');
    if (langSelectTop) langSelectTop.value = lang;
    if (langSelectBottom) langSelectBottom.value = lang;
}

// Handle language change from top selector
function updateCertificateLanguageFromTop() {
    const newLang = document.getElementById('languageSelectTop').value;
    syncCertificateLanguageSelectors(newLang);
    updateLanguageEverywhere(newLang);
}

// Handle language change from bottom selector
function updateCertificateLanguage() {
    const newLang = document.getElementById('languageSelect').value;
    syncCertificateLanguageSelectors(newLang);
    updateLanguageEverywhere(newLang);
}

// Update language across entire site
function updateLanguageEverywhere(lang) {
    currentLanguage = lang;
    const siteLanguageSelect = document.getElementById('siteLanguage');
    if (siteLanguageSelect) siteLanguageSelect.value = lang;
    localStorage.setItem('bsaHashLang', lang);
    applySiteLanguage(lang);
    generateCertificate();
}

function generateCertificate() {
    const t = translations[currentLanguage];
    const certContent = document.getElementById('certificateContent');
    const istDateTime = getISTDateTime();
    
    // Format date as DD/MM/YYYY
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + (istOffset + now.getTimezoneOffset() * 60 * 1000));
    const dd = String(istTime.getDate()).padStart(2, '0');
    const mm = String(istTime.getMonth() + 1).padStart(2, '0');
    const yyyy = istTime.getFullYear();
    const hh = String(istTime.getHours()).padStart(2, '0');
    const min = String(istTime.getMinutes()).padStart(2, '0');
    const ss = String(istTime.getSeconds()).padStart(2, '0');
    const formattedDate = `${dd}/${mm}/${yyyy}`;
    const formattedTime = `${hh}:${min}:${ss}`;
    
    // Build Annexure pages (10 files per page)
    const filesPerPage = 10;
    const totalAnnexures = Math.ceil(processedFiles.length / filesPerPage) || 1;
    
    // Generate annexure pages for Part A
    let annexurePagesA = '';
    for (let page = 0; page < totalAnnexures; page++) {
        const startIdx = page * filesPerPage;
        const endIdx = Math.min(startIdx + filesPerPage, processedFiles.length);
        const pageFiles = processedFiles.slice(startIdx, endIdx);
        
        let pageRows = '';
        pageFiles.forEach((file, idx) => {
            const ext = file.name.split('.').pop().toUpperCase();
            pageRows += `
                <tr>
                    <td class="sno">${startIdx + idx + 1}</td>
                    <td class="filename">${escapeHtml(file.name)}</td>
                    <td class="filetype">${ext}</td>
                    <td class="filesize">${file.size}</td>
                    <td class="hashvalues">
                        <strong>SHA-1:</strong> ${file.hashes.sha1}<br>
                        <strong>SHA-256:</strong> ${file.hashes.sha256}<br>
                        <strong>SHA-512:</strong> ${file.hashes.sha512}<br>
                        <strong>SHA3-256:</strong> ${file.hashes.sha3_256}<br>
                        <strong>BLAKE2b:</strong> ${file.hashes.blake2b}
                    </td>
                </tr>
            `;
        });
        
        annexurePagesA += `
        <div class="certificate ${page < totalAnnexures - 1 ? 'cert-page-break' : ''}">
            <div class="cert-annexure-title">${t.certAnnexure} - ${t.pageOf} ${page + 1} / ${totalAnnexures}</div>
            <div class="cert-section-ref" style="margin-bottom: 20px;">(${t.certAttachedTo} ${t.certPartACert})</div>
            
            <table class="cert-hash-table">
                <thead>
                    <tr>
                        <th>${t.certSNo}</th>
                        <th>${t.certFileName}</th>
                        <th>${t.certFileType}</th>
                        <th>${t.certFileSize}</th>
                        <th>${t.certHashValues}</th>
                    </tr>
                </thead>
                <tbody>
                    ${pageRows}
                </tbody>
            </table>
            
            <div class="cert-page-footer">
                ${t.certGeneratedOn} ${formattedDate} ${t.certAt} ${formattedTime} ${t.certIST} | ${t.toolName}
            </div>
        </div>
        `;
    }
    
    // Generate annexure pages for Part B
    let annexurePagesB = '';
    for (let page = 0; page < totalAnnexures; page++) {
        const startIdx = page * filesPerPage;
        const endIdx = Math.min(startIdx + filesPerPage, processedFiles.length);
        const pageFiles = processedFiles.slice(startIdx, endIdx);
        
        let pageRows = '';
        pageFiles.forEach((file, idx) => {
            const ext = file.name.split('.').pop().toUpperCase();
            pageRows += `
                <tr>
                    <td class="sno">${startIdx + idx + 1}</td>
                    <td class="filename">${escapeHtml(file.name)}</td>
                    <td class="filetype">${ext}</td>
                    <td class="filesize">${file.size}</td>
                    <td class="hashvalues">
                        <strong>SHA-1:</strong> ${file.hashes.sha1}<br>
                        <strong>SHA-256:</strong> ${file.hashes.sha256}<br>
                        <strong>SHA-512:</strong> ${file.hashes.sha512}<br>
                        <strong>SHA3-256:</strong> ${file.hashes.sha3_256}<br>
                        <strong>BLAKE2b:</strong> ${file.hashes.blake2b}
                    </td>
                </tr>
            `;
        });
        
        annexurePagesB += `
        <div class="certificate ${page < totalAnnexures - 1 ? 'cert-page-break' : ''}">
            <div class="cert-annexure-title">${t.certAnnexure} - ${t.pageOf} ${page + 1} / ${totalAnnexures}</div>
            <div class="cert-section-ref" style="margin-bottom: 20px;">(${t.certAttachedTo} ${t.certPartBCert})</div>
            
            <table class="cert-hash-table">
                <thead>
                    <tr>
                        <th>${t.certSNo}</th>
                        <th>${t.certFileName}</th>
                        <th>${t.certFileType}</th>
                        <th>${t.certFileSize}</th>
                        <th>${t.certHashValues}</th>
                    </tr>
                </thead>
                <tbody>
                    ${pageRows}
                </tbody>
            </table>
            
            <div class="cert-page-footer">
                ${t.certGeneratedOn} ${formattedDate} ${t.certAt} ${formattedTime} ${t.certIST} | ${t.toolName}${page === totalAnnexures - 1 ? '<br><span style="font-size: 9px; color: #999;">' + t.certHashNote + '</span>' : ''}
            </div>
        </div>
        `;
    }
    
    // Annexure text for certificates
    const annexureText = totalAnnexures > 1 
        ? `<strong>${t.certAnnexure}</strong> (${totalAnnexures} ${t.certPages})` 
        : `<strong>${t.certAnnexure}</strong>`;

    certContent.innerHTML = `
        <!-- PART-A - Certificate (to be filled by the Party) -->
        <div class="certificate cert-page-break">
            <div class="cert-main-title">${t.certTitle}</div>
            <div class="cert-section-ref">${t.certSectionRef}</div>
            
            <div class="cert-part-title">${t.partALabel}</div>
            <div class="cert-part-subtitle">${t.partADesc}</div>
            
            <p class="cert-para" style="margin-top: 25px;">
                ${t.certI} <span class="cert-blank"></span>, 
                ${t.certSonDaughterSpouse} <span class="cert-blank"></span>,
                ${t.certAge} <span class="cert-blank"></span>,
                ${t.certResidingAt} <span class="cert-blank-long"></span>
            </p>
            
            <p class="cert-para">${t.certAffirm}</p>
            <p class="cert-para">
                ${t.certProducedRecord}
            </p>
            
            <div class="cert-checkbox-grid">
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceComputer}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceDVR}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceMobile}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceFlash}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceCD}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceServer}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceCloud}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceOther}</div>
            </div>
            
            <table class="cert-device-table">
                <tr>
                    <td class="label">${t.certMakeModel}:</td>
                    <td></td>
                    <td class="label">${t.certColor}:</td>
                    <td></td>
                </tr>
                <tr>
                    <td class="label">${t.certSerialNumber}:</td>
                    <td colspan="3"></td>
                </tr>
                <tr>
                    <td class="label">${t.certIMEI}:</td>
                    <td colspan="3"></td>
                </tr>
            </table>
            
            <p style="font-size: 11px;">
                ${t.certDeviceInfo}
                <span class="cert-form-line-long"></span>
            </p>
            
            <p class="cert-para">
                ${t.certDeviceStatement}
            </p>
            
            <p class="cert-para">
                ${t.certDeviceNotWorking}
                <span class="cert-checkbox" style="margin-left: 10px;"></span> ${t.certOwned}
                <span class="cert-checkbox" style="margin-left: 10px;"></span> ${t.certMaintained}
                <span class="cert-checkbox" style="margin-left: 10px;"></span> ${t.certManaged}
                <span class="cert-checkbox" style="margin-left: 10px;"></span> ${t.certOperated}
                ${t.certByMe}
            </p>
            
            <p class="cert-para">
                ${t.certHashStatement} ${annexureText}, ${t.certObtainedThrough} <strong>${t.certAttached} ${annexureText}.</strong>
            </p>
            
            <div class="cert-info-row">
                <div class="cert-info-item"><strong>${t.certDate}:</strong> ${formattedDate}</div>
                <div class="cert-info-item"><strong>${t.certTime}:</strong> ${formattedTime}</div>
                <div class="cert-info-item"><strong>${t.certPlace}:</strong> <span class="cert-form-line" style="width: 150px;"></span></div>
            </div>
            
            <div class="cert-info-row">
                <div class="cert-info-item"><strong>${t.certName}:</strong> <span class="cert-form-line" style="width: 200px;"></span></div>
                <div class="cert-info-item"><strong>${t.certDesignation}:</strong> <span class="cert-form-line" style="width: 180px;"></span></div>
                <div class="cert-info-item" style="margin-left: auto;"><div class="cert-sign-box" style="width: 120px;">${t.certSignature}</div></div>
            </div>
            
            <div class="cert-page-footer">
                ${t.certFooter}
            </div>
        </div>
        
        <!-- Annexure-I for Part A -->
        ${annexurePagesA}
        
        <!-- PART-B - Certificate (to be filled by the Expert) -->
        <div class="certificate cert-page-break cert-part-b">
            <div class="cert-main-title">${t.certTitle}</div>
            <div class="cert-section-ref">${t.certSectionRef}</div>
            
            <div class="cert-part-title">${t.partBLabel}</div>
            <div class="cert-part-subtitle">${t.partBDesc}</div>
            
            <p class="cert-para" style="margin-top: 25px;">
                ${t.certI} <span class="cert-blank"></span>, 
                ${t.certSonDaughterSpouse} <span class="cert-blank"></span>,
                ${t.certAge} <span class="cert-blank"></span>,
                ${t.certResidingAt} <span class="cert-blank-long"></span>
            </p>
            
            <p class="cert-para">${t.certAffirm}</p>
            
            <p class="cert-para">
                ${t.certProducedRecordB}
            </p>
            
            <div class="cert-checkbox-grid">
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceComputer}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceDVR}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceMobile}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceFlash}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceCD}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceServer}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceCloud}</div>
                <div class="cert-checkbox-item"><span class="cert-checkbox"></span> ${t.certDeviceOther}</div>
            </div>
            
            <table class="cert-device-table">
                <tr>
                    <td class="label">${t.certMakeModel}:</td>
                    <td></td>
                    <td class="label">${t.certColor}:</td>
                    <td></td>
                </tr>
                <tr>
                    <td class="label">${t.certSerialNumber}:</td>
                    <td colspan="3"></td>
                </tr>
                <tr>
                    <td class="label">${t.certIMEI}:</td>
                    <td colspan="3"></td>
                </tr>
            </table>
            
            <p class="cert-para" style="font-size: 11px;">
                ${t.certDeviceInfo}
                <span class="cert-form-line-long"></span>
            </p>
            
            <p class="cert-para">
                ${t.certHashStatement} ${annexureText}, ${t.certObtainedThrough} <strong>${t.certAttached} ${annexureText}.</strong>
            </p>
            
            <div class="cert-info-row">
                <div class="cert-info-item"><strong>${t.certDate}:</strong> ${formattedDate}</div>
                <div class="cert-info-item"><strong>${t.certTime}:</strong> ${formattedTime}</div>
                <div class="cert-info-item"><strong>${t.certPlace}:</strong> <span class="cert-form-line" style="width: 150px;"></span></div>
            </div>
            
            <div class="cert-info-row">
                <div class="cert-info-item"><strong>${t.certName}:</strong> <span class="cert-form-line" style="width: 200px;"></span></div>
                <div class="cert-info-item"><strong>${t.certDesignation}:</strong> <span class="cert-form-line" style="width: 180px;"></span></div>
                <div class="cert-info-item" style="margin-left: auto;"><div class="cert-sign-box" style="width: 120px;">${t.certSignature}</div></div>
            </div>
            
            <div class="cert-page-footer">
                ${t.certFooter}
            </div>
        </div>
        
        <!-- Annexure-I for Part B -->
        ${annexurePagesB}
    `;
}

function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown Browser';
    
    if (ua.indexOf('Firefox') > -1) {
        browser = 'Mozilla Firefox';
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
        browser = 'Opera';
    } else if (ua.indexOf('Trident') > -1) {
        browser = 'Internet Explorer';
    } else if (ua.indexOf('Edge') > -1) {
        browser = 'Microsoft Edge (Legacy)';
    } else if (ua.indexOf('Edg') > -1) {
        browser = 'Microsoft Edge';
    } else if (ua.indexOf('Chrome') > -1) {
        browser = 'Google Chrome';
    } else if (ua.indexOf('Safari') > -1) {
        browser = 'Safari';
    }
    
    return browser;
}

function printCertificate() {
    // Generate filename with format: Certificate-63-4-c-YYYYMMDD-HHmmss
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
                   (now.getMonth() + 1).toString().padStart(2, '0') +
                   now.getDate().toString().padStart(2, '0') + '-' +
                   now.getHours().toString().padStart(2, '0') +
                   now.getMinutes().toString().padStart(2, '0') +
                   now.getSeconds().toString().padStart(2, '0');
    const originalTitle = document.title;
    document.title = 'Certificate-63-4-c-' + dateStr;
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 1000);
}

function downloadCertificateAsPDF() {
    showToast('Use Print and select "Save as PDF" option');
    printCertificate();
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show disclaimer
function showDisclaimer() {
    alert('DISCLAIMER:\n\nThis tool is provided for educational and informational purposes only. The hash values generated are computed entirely client-side in your browser using hash-wasm library. No file data is transmitted or stored on any server.\n\nThe developers make no warranties regarding the accuracy or reliability of the hash values for legal or forensic purposes. Users should verify results using multiple tools when used for official purposes.\n\nThe certificates generated are templates and require proper authentication by authorized officers as per Bharatiya Sakshya Adhiniyam, 2023.\n\nBy using this tool, you agree to use it responsibly and in compliance with all applicable laws and regulations.');
}

// Show about hash
function showAboutHash() {
    alert('ABOUT HASH ALGORITHMS:\n\nA hash function is a mathematical algorithm that converts data of any size into a fixed-size string of characters. This output is called a hash value or digest.\n\nKey Properties:\n• Deterministic: Same input always produces same output\n• Fast: Quick to compute for any input size\n• One-way: Cannot reverse to get original data\n• Collision-resistant: Hard to find two inputs with same hash\n\nAlgorithms Used:\n• MD5 (128-bit) - Legacy, for reference only\n• SHA-1 (160-bit) - Deprecated but still referenced\n• SHA-256 (256-bit) - Recommended for evidence\n• SHA-512 (512-bit) - Highest security in SHA-2 family\n• SHA3-256 (256-bit) - Latest SHA-3 standard\n• BLAKE2b-256 (256-bit) - Modern, fast, secure\n\nCommon Uses:\n• File integrity verification\n• Digital signatures\n• Electronic evidence authentication\n• Digital forensics');
}

// Show about BSA 2023
function showAboutBSA() {
    alert('BHARATIYA SAKSHYA ADHINIYAM, 2023\n(Indian Evidence Act Replacement)\n\nSection 63 - Admissibility of Electronic Records:\n\nSection 63(4) states that for electronic records to be admissible as evidence, a certificate must be provided identifying:\n\n(a) The electronic record and manner of production\n(b) The device that produced the record\n(c) Conditions under which the record was produced\n(d) The particulars to show that the computer was operating properly\n\nSection 63(4)(c) specifically requires:\nA certificate signed by a person occupying a responsible official position in relation to the operation of the relevant device or management of the relevant activities.\n\nThis tool generates:\n• PART A: Certificate under Section 63(4) conditions\n• PART B: Hash value certificate for integrity verification\n\nNote: Hash values serve as digital fingerprints to verify that electronic evidence has not been altered.');
}

// Close modal on outside click
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('certificateModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCertificateModal();
            }
        });
    }
});
