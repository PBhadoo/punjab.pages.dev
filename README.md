# Punjab Investigation Tools

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/Status-Active%20Development-yellow.svg" alt="Status">
  <img src="https://img.shields.io/badge/BSA%202023-Compliant-green.svg" alt="BSA 2023">
  <img src="https://img.shields.io/badge/Tools-20+-purple.svg" alt="Tools">
</p>

A professional-grade digital forensics and utility platform designed for law enforcement and investigation purposes. All processing happens client-side in your browser — no data is sent to any server.

🌐 **Live Site:** [punjab.pages.dev](https://punjab.pages.dev)

---

## ⚠️ Disclaimer

**This project is constantly under development.** Please don't rely solely on these tools for critical decisions. Always verify results through official channels and authorized forensic tools.

---

## 🛠️ All Tools (20+)

### 🔐 Investigation & Forensic Tools

| # | Tool | Path | Description |
|---|------|------|-------------|
| 1 | **Hash Generator** | `/hash/` | SHA-256, SHA-512, SHA3, BLAKE2b, MD5, SHA-1 with BSA 63(4)(c) certificate generation |
| 2 | **Image Forensics** | `/image-forensics/` | ELA analysis, manipulation detection, EXIF metadata, noise analysis, clone detection |
| 3 | **IMEI Verifier** | `/imei/` | Luhn algorithm validation, TAC lookup with 289K+ devices, manufacturer ID |
| 4 | **MAC Address Lookup** | `/mac/` | OUI lookup, vendor identification, format validation |
| 5 | **Phone Number Lookup** | `/phone/` | Country/region/operator identification, portability info |
| 6 | **File Comparison** | `/compare/` | Byte-by-byte comparison, hash matching, integrity verification |
| 7 | **Fingerprint Matcher** | `/fingerprint/` | Pattern matching, similarity percentage, minutiae analysis |
| 8 | **Document Metadata** | `/metadata/` | Creation date, author, modification history extraction |
| 9 | **CDR Analysis** | `/cdr/` | Call Data Records visualization, call patterns, contact analysis |
| 10 | **IPDR Analysis** | `/ipdr/` | IP Data Records tracking, session analysis, usage patterns |
| 11 | **Aadhaar Validator** | `/aadhaar/` | Verhoeff algorithm checksum, format validation, UIDAI link |
| 12 | **IP Address Lookup** | `/ip/` | Geolocation, ISP/ASN, VPN/proxy/Tor detection, bulk lookup with PDF reports |
| 13 | **Steganography Tool** | `/steganography/` | Hidden data detection, LSB analysis, encode/decode messages |
| 14 | **OCR Tool** | `/ocr/` | Text extraction from images, multi-language (English, Hindi, Punjabi) |
| 15 | **QR Code Tools** | `/qrcode/` | Generate/scan QR codes, UPI payment codes, WiFi, vCards |

### 🔑 Security & Utility Tools

| # | Tool | Path | Description |
|---|------|------|-------------|
| 16 | **Password Generator** | `/password/` | Crypto-secure passwords via Web Crypto API, passphrase mode, bulk generation |
| 17 | **Signature Checksum** | `/signature/` | SHA-256 daily signature codes, PIN-based verification |

### 🅰️ Punjabi Language Tools

| # | Tool | Path | Description |
|---|------|------|-------------|
| 18 | **Gurmukhi Pad** | `/transliterate/` | English→Punjabi typing with live suggestions via Google Input Tools API |
| 19 | **Font Converter** | `/font-converter/` | Convert between 7 Gurmukhi fonts (Unicode, AnmolLipi, Asees, GurbaniLipi, DrChatrik, Joy, Satluj) |

### 📁 General Purpose Tools

| # | Tool | Path | Description |
|---|------|------|-------------|
| 20 | **General Tools Hub** | `/general/` | 24+ PDF & image tools — merge, split, compress, convert, resize, watermark, QR codes, and more |

**General tools include:** Merge PDFs, Split PDF, Compress PDF, Rotate PDF, Delete Pages, Reorder Pages, Add Page Numbers, Add Watermark, Protect/Unlock PDF, HTML to PDF, Text to PDF, PDF to Images, Images to PDF, Compress Images, Convert Images, Resize Images, Crop Images, Rotate Images, Image Watermark, Base64 Encode/Decode, Generate QR, Decode QR, Image to QR, QR to Image, Batch Rename, File Format Detector

---

## 🔒 Privacy & Security

- **100% Client-Side Processing** — All data processing happens locally in your browser
- **No Server Upload** — Your files never leave your device
- **No Data Collection** — We don't collect, store, or transmit any user data
- **Offline Capable** — Most tools work without internet connection after initial load

---

## 🏛️ Legal Compliance

Designed to assist with evidence verification under:
- **Bharatiya Sakshya Adhiniyam, 2023** — Section 63(4)(c)
- Generates Part A and Part B hash certificates for electronic evidence
- Multi-language certificate support (English, Hindi, Punjabi)

---

## 💻 Technology Stack

| Component | Technology |
|-----------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Hashing | [hash-wasm](https://github.com/nicolo-ribaudo/nicolo-ribaudo.github.io) (WebAssembly) |
| PDF Generation | jsPDF + html2canvas |
| OCR | Tesseract.js |
| Transliteration | Google Input Tools API |
| Font Conversion | PunjabiFontConvertor engine (self-hosted) |
| Image Processing | Canvas-based algorithms |
| Hosting | Cloudflare Pages |
| Serverless Functions | Cloudflare Pages Functions |

---

## 📁 Project Structure

```
punjab.pages.dev/
├── index.html                    # Homepage with search & 20+ tool cards
├── README.md
├── css/
│   ├── styles.css                # Global styles
│   ├── homepage.css              # Homepage styles
│   └── tool-common.css           # Shared tool styles
├── js/
│   ├── app.js                    # Hash tool main logic
│   └── translations.js           # Multi-language (EN/HI/PA)
│
├── hash/index.html               # Hash Generator (BSA compliant)
├── image-forensics/
│   ├── index.html
│   ├── image-forensics.js
│   └── image-forensics.css
├── imei/
│   ├── index.html
│   └── tacdb.json                # 289K+ device TAC database
├── mac/
│   ├── index.html
│   └── ouiDB.json                # MAC OUI database
├── phone/
│   ├── index.html
│   └── indianMobileDB.json       # Indian operator database
├── ip/
│   ├── index.html
│   ├── app.js
│   ├── app2.js
│   └── vpn-asns.json
├── compare/index.html            # File Comparison
├── fingerprint/index.html        # Fingerprint Matcher
├── metadata/index.html           # Document Metadata
├── cdr/index.html                # CDR Analysis
├── ipdr/index.html               # IPDR Analysis
├── aadhaar/index.html            # Aadhaar Validator
├── qrcode/index.html             # QR Code Tools
├── ocr/index.html                # OCR Tool
├── steganography/index.html      # Steganography
├── signature/index.html          # Signature Checksum
├── password/index.html           # Password Generator
│
├── transliterate/index.html      # Gurmukhi Pad (Punjabi typing)
├── font-converter/
│   ├── index.html                # Font Converter UI
│   ├── punjabi-converter.js      # Conversion engine (self-hosted)
│   └── punjabi-font.css          # Gurmukhi font faces (self-hosted)
│
├── general/                      # 24+ General Purpose Tools
│   ├── index.html                # Tools hub
│   ├── merge-pdfs/index.html
│   ├── split-pdf/index.html
│   ├── compress-pdf/index.html
│   ├── rotate-pdf/index.html
│   ├── delete-pdf-pages/index.html
│   ├── reorder-pdf/index.html
│   ├── add-page-numbers/index.html
│   ├── add-pdf-watermark/index.html
│   ├── protect-pdf/index.html
│   ├── unlock-pdf/index.html
│   ├── html-to-pdf/index.html
│   ├── text-to-pdf/index.html
│   ├── pdf-to-images/index.html
│   ├── images-to-pdf/index.html
│   ├── compress-images/index.html
│   ├── convert-images/index.html
│   ├── resize-images/index.html
│   ├── crop-images/index.html
│   ├── rotate-images/index.html
│   ├── watermark-images/index.html
│   ├── image-base64/index.html
│   ├── generate-qr/index.html
│   ├── decode-qr/index.html
│   ├── image-to-qr/index.html
│   ├── qr-to-image/index.html
│   ├── batch-rename/index.html
│   └── file-format-detector/index.html
│
├── functions/                    # Cloudflare Pages Functions (Serverless)
│   ├── api/
│   │   ├── transliterate.js      # Google Input Tools API proxy
│   │   ├── detect-format.js      # File format detection
│   │   ├── aadhaar/captcha.js    # Aadhaar captcha proxy
│   │   ├── aadhaar/verify.js     # Aadhaar verify proxy
│   │   ├── ip/[address].js       # IP lookup proxy
│   │   └── signature/
│   │       ├── generate.js       # Signature code generation
│   │       └── verify.js         # Signature code verification
│   ├── airtelapi/[[number]].js
│   ├── bsnlapi/[number].js
│   ├── reliancejioapi/[number].js
│   └── viapi/[[number]].js
│
├── disclaimer.html
├── privacy.html
├── terms.html
├── robots.txt
└── sitemap.xml
```

---

## 🚀 Getting Started

### Local Development

```bash
# Clone
git clone https://github.com/PBhadoo/punjab.pages.dev.git
cd punjab.pages.dev

# Serve with any static server
python -m http.server 8000
# or
npx serve
# or
npx wrangler pages dev .    # For Cloudflare Functions support
```

Open `http://localhost:8000` in your browser.

### Deployment

Deployed on **Cloudflare Pages** with automatic builds from GitHub. Compatible with any static hosting:
- Cloudflare Pages (recommended — supports Functions)
- GitHub Pages
- Netlify
- Vercel

---

## 🗃️ Data Sources

| Database | Source | Entries |
|----------|--------|---------|
| IMEI TAC | [Osmocom TAC Database](http://tacdb.osmocom.org/) | 289,000+ devices |
| MAC OUI | IEEE OUI Registry | Comprehensive vendor list |
| Indian Mobile | Custom compilation | Operator/circle mapping |
| VPN ASNs | Community maintained | VPN/proxy ASN list |
| Font Conversion | [typingbaba.com](https://www.typingbaba.com/) engine | 7 Gurmukhi fonts |

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
  Made with ❤️ for Digital Forensics & Punjab Police
</p>
