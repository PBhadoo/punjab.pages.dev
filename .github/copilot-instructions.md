# Punjab Investigation Tools - AI Coding Instructions

## Project Overview
Static web forensics platform for law enforcement - **100% client-side processing**. All files are standalone HTML with embedded JavaScript. No build process, no frameworks. Deploys directly to Cloudflare Pages.

## Architecture

### Core Structure
- **No Framework**: Vanilla JavaScript, no bundlers, no npm (except Cloudflare Functions)
- **Self-Contained Pages**: Each tool is a complete `index.html` in its own folder (e.g., `/hash/`, `/imei/`, `/qrcode/`)
- **Shared Resources**: Common CSS in `/css/`, shared logic in `/js/app.js` and `/js/translations.js`
- **Zero Build Step**: Edit HTML/JS/CSS directly, changes go live on git push

### Key Components
1. **Hash Generator** (`/hash/`) - Uses `hash-wasm` for WebAssembly hashing with 2MB chunked processing for large files
2. **Image Forensics** (`/image-forensics/`) - Canvas-based with 26+ algorithms (ELA, noise analysis, clone detection, etc.)
3. **IMEI Verifier** (`/imei/`) - 289K+ device database in `tacdb.json`, Luhn checksum validation
4. **Cloudflare Functions** (`/functions/`) - Serverless API proxies for Aadhaar, telecom carrier lookups

### Data Flow Pattern
```javascript
// Typical tool pattern:
1. File upload via drag-drop or input
2. Client-side processing (FileReader, Canvas, WebAssembly)
3. Display results (no server communication)
4. Optional PDF export (jsPDF + html2canvas)
```

## Critical Conventions

### Multi-Language Support
- All UI text goes through `translations` object in `/js/translations.js`
- Supported: English (en), Hindi (hi), Punjabi (pa)
- Language stored in `localStorage` key: `bsaHashLang`
- Always sync `applySiteLanguage()` when adding new UI elements

### Hit Counter (NEW)
- **Every HTML page** must include hit counter before `</body>`:
```html
<!-- Hit Counter -->
<div style="text-align: center; padding: 20px 0;">
    <img src="https://hits.sh/punjab.pages.dev.svg?view=today-total&style=for-the-badge&label=Punjab&extraCount=0&color=080e08&labelColor=9c3232" alt="Hit Counter" />
</div>
```

### BSA 2023 Compliance
- Hash certificates MUST reference "Bharatiya Sakshya Adhiniyam, 2023 - Section 63(4)(c)"
- Certificates include Part A (officer details) and Part B (evidence hashes)
- IST timezone for all timestamps: `getISTDateTime()` in `/js/app.js`

### File Processing Pattern
```javascript
// Large files: Use chunked processing (see hash/index.html)
const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB chunks
// Prevents UI freeze, shows progress
```

### CSS Architecture
- Global dark theme in `/css/styles.css` (gradient background, glassmorphism cards)
- Tool-specific styles in `/css/tool-common.css`
- Individual tool styles inline or in tool folder (e.g., `image-forensics/image-forensics.css`)

## Development Workflow

### Local Testing
```bash
# No build needed, just serve static files:
python -m http.server 8000
# or
npx serve
```

### Adding New Tools
1. Create folder: `/newtool/`
2. Create `/newtool/index.html` (copy structure from `/hash/index.html`)
3. Add tool card to main `/index.html` homepage
4. Include hit counter before `</body>`
5. Add translations to `/js/translations.js` if using i18n

### Cloudflare Functions
- Deploy to `/functions/api/[endpoint].js` (auto-routes to `/api/[endpoint]`)
- Use for API proxies only (Aadhaar verification, telecom lookups)
- CORS must be handled: `'Access-Control-Allow-Origin': '*'`

## External Dependencies

### CDN Libraries (loaded via `<script>` tags)
- **hash-wasm**: WebAssembly hashing (`https://cdn.jsdelivr.net/npm/hash-wasm@4`)
- **jsPDF**: PDF generation (`https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`)
- **html2canvas**: Screenshot for PDF (`https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js`)
- **Tesseract.js**: OCR engine (in `/ocr/`)
- **Font Awesome 6.4.0**: Icons (`https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`)
- **Inter font**: Google Fonts for UI
- **JetBrains Mono**: Code/hash display font

### Data Files
- `/imei/tacdb.json` - 289K IMEI TAC database (Osmocom)
- `/phone/indianMobileDB.json` - Indian mobile operator prefixes
- `/mac/ouiDB.json` - MAC address OUI database

## Common Tasks

### Adding Translation
```javascript
// In /js/translations.js:
translations.en.myNewKey = 'English text';
translations.hi.myNewKey = 'हिन्दी पाठ';
translations.pa.myNewKey = 'ਪੰਜਾਬੀ ਟੈਕਸਟ';
```

### Creating PDF Reports
```javascript
// Pattern used across tools:
const { jsPDF } = window.jspdf;
const pdf = new jsPDF();
// Use html2canvas for visual elements
// See /hash/index.html generateCertificate() for full example
```

### File Upload Pattern
```javascript
// Standard drag-drop + file input:
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
});
```

## Security Notes
- **No server storage**: All processing in browser memory, no uploads
- **Client-side only**: Privacy-first design for sensitive evidence
- **CORS proxying**: Cloudflare Functions proxy external APIs (Aadhaar, telecom) to bypass CORS

## Testing Checklist
- [ ] Test on mobile (responsive design required)
- [ ] Verify all 3 languages render correctly
- [ ] Check large file handling (>100MB files in hash tool)
- [ ] Validate hit counter appears on ALL pages
- [ ] PDF export works (jsPDF + html2canvas compatibility)
