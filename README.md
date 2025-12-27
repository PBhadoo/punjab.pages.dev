# Punjab Investigation Tools

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/Status-Active%20Development-yellow.svg" alt="Status">
  <img src="https://img.shields.io/badge/BSA%202023-Compliant-green.svg" alt="BSA 2023">
</p>

A professional-grade digital forensics platform designed for law enforcement and investigation purposes. All processing happens client-side in your browser - no data is sent to any server.

🌐 **Live Site:** [punjab.pages.dev](https://punjab.pages.dev)

---

## ⚠️ Disclaimer

**This project is constantly under development.** Please don't rely solely on these tools for critical decisions. Always verify results through official channels and authorized forensic tools.

---

## 🛠️ Available Tools

### 1. Hash Generator (BSA 63(4)(c) Compliant)
Generate cryptographic hash values for digital evidence authentication under Bharatiya Sakshya Adhiniyam 2023.

**Features:**
- Multiple hash algorithms: SHA-256, SHA-512, SHA3-256, BLAKE2b, SHA-1, MD5
- Support for multiple files and any file type
- Generate official BSA 63(4)(c) certificates
- Multi-language support (English, Hindi, Punjabi)
- PDF export functionality

### 2. Image Forensics Analyzer
Comprehensive image analysis tool with 26+ forensic algorithms.

**Features:**
- Error Level Analysis (ELA)
- Noise Analysis
- Clone Detection
- JPEG Ghost Detection
- Metadata Extraction (EXIF)
- Luminance Gradient Analysis
- Color Channel Analysis
- And many more...

### 3. IMEI Verifier
Verify IMEI integrity and identify device manufacturer information.

**Features:**
- Luhn algorithm checksum validation
- TAC (Type Allocation Code) lookup with 289,000+ device entries
- Osmocom TAC Database integration
- Device brand, model, and specification lookup
- GSMArena integration for device specs
- RBI (Reporting Body Identifier) information
- PDF report generation
- URL parameter support for sharing (`?imei=XXXXXX`)

### 4. QR Code Tools
- **QR Code Generator:** Create QR codes with customizable size and error correction
- **QR Code Decoder:** Decode QR codes from images

### 5. OCR Tool
Extract text from images using Tesseract.js OCR engine.

### 6. Metadata Extractor
Extract and analyze metadata from various file types.

### 7. Video Forensics
Analyze video files for forensic investigation.

### 8. Document Forensics
Analyze documents for authenticity and tampering.

### 9. Audio Forensics
Analyze audio files for forensic purposes.

### 10. Network Tools
Network-related investigation utilities.

### 11. Steganography Tool
Detect and analyze hidden data in images.

---

## 🔒 Privacy & Security

- **100% Client-Side Processing:** All data processing happens locally in your browser
- **No Server Upload:** Your files never leave your device
- **No Data Collection:** We don't collect, store, or transmit any user data
- **Offline Capable:** Most tools work without internet connection after initial load

---

## 🏛️ Legal Compliance

This platform is designed to assist with evidence verification under:
- **Bharatiya Sakshya Adhiniyam, 2023** - Section 63(4)(c)
- Provides hash certificates for electronic evidence authentication
- Supports official documentation requirements

---

## 🗃️ Data Sources

### IMEI TAC Database
- **Source:** [Osmocom TAC Database](http://tacdb.osmocom.org/)
- **Entries:** 289,000+ device TAC codes
- **Coverage:** Comprehensive coverage of mobile device manufacturers and models

---

## 💻 Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Hash Library:** [hash-wasm](https://github.com/nicolo-ribaudo/nicolo-ribaudo.github.io) - High-performance WebAssembly hashing
- **PDF Generation:** jsPDF + html2canvas
- **OCR:** Tesseract.js
- **Image Processing:** Custom canvas-based algorithms

---

## 📁 Project Structure

```
├── index.html              # Homepage
├── css/
│   ├── styles.css          # Global styles
│   ├── homepage.css        # Homepage specific styles
│   └── tool-common.css     # Shared tool styles
├── js/
│   ├── app.js              # Main application logic
│   └── translations.js     # Multi-language support
├── hash/
│   └── index.html          # Hash Generator tool
├── image-forensics/
│   ├── index.html          # Image Forensics UI
│   └── image-forensics.js  # Forensic algorithms
├── imei/
│   ├── index.html          # IMEI Verifier
│   └── tacdb.json          # Osmocom TAC Database
├── qr/
│   ├── index.html          # QR Generator
│   └── decoder.html        # QR Decoder
├── ocr/
│   └── index.html          # OCR Tool
└── [other tools...]
```

---

## 🚀 Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/PBhadoo/punjab.pages.dev.git
   cd punjab.pages.dev
   ```

2. Serve the files using any static file server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (npx)
   npx serve
   
   # Using PHP
   php -S localhost:8000
   ```

3. Open `http://localhost:8000` in your browser

### Deployment

The site is designed to be deployed on any static hosting platform:
- Cloudflare Pages
- GitHub Pages
- Netlify
- Vercel

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 📧 Contact

For questions, suggestions, or issues, please open an issue on GitHub.

**Repository:** [github.com/PBhadoo/punjab.pages.dev](https://github.com/PBhadoo/punjab.pages.dev)

---

<p align="center">
  Made with ❤️ for Digital Forensics
</p>
