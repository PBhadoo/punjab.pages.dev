# General Purpose Tools - Planning Document

## Research & Ideas

### PDF Tools
1. **IMG to PDF** - Convert images (JPG, PNG, WebP, etc.) to PDF
2. **PDF to IMG** - Extract pages from PDF as images
3. **Merge PDFs** - Combine multiple PDFs into one
4. **Split PDF** - Split PDF into separate pages or ranges
5. **Compress PDF** - Reduce PDF file size
6. **Rotate PDF** - Rotate pages in PDF
7. **Delete PDF Pages** - Remove specific pages from PDF
8. **Reorder PDF Pages** - Rearrange page order
9. **Add Page Numbers** - Insert page numbers to PDF
10. **Add Watermark** - Add text/image watermark to PDF

### Image Tools
11. **Compress Images** - Reduce image file size (JPG, PNG, WebP)
12. **Convert Images** - Convert between formats (JPG↔PNG↔WebP)
13. **Resize Images** - Change image dimensions
14. **Crop Images** - Crop images to specific dimensions
15. **Rotate Images** - Rotate images by degrees
16. **Image to Base64** - Convert images to Base64 encoding
17. **Base64 to Image** - Decode Base64 to image
18. **Add Watermark to Images** - Overlay text/image on images

### Document Tools
19. **Word to PDF** - Convert DOCX to PDF
20. **Excel to PDF** - Convert XLSX to PDF
21. **PowerPoint to PDF** - Convert PPTX to PDF

### Text Tools
22. **Text to PDF** - Convert plain text to PDF
23. **Markdown to PDF** - Convert markdown to PDF
24. **HTML to PDF** - Convert HTML to PDF

### Utility Tools
25. **File Splitter** - Split large files into chunks
26. **File Joiner** - Join split files back together
27. **Batch Rename** - Rename multiple files at once
28. **File Format Detector** - Identify file types by magic bytes

## Client-Side Feasibility (Browser-Based)

### ✅ Highly Feasible
- IMG to PDF (using jsPDF)
- PDF to IMG (using PDF.js)
- Compress Images (Canvas + quality reduction)
- Convert Images (Canvas API)
- Resize Images (Canvas API)
- Rotate Images (Canvas API)
- Crop Images (Canvas API)
- Image to Base64 (FileReader API)
- Base64 to Image (Canvas + Blob)
- Text to PDF (jsPDF)
- Add Watermark to Images (Canvas API)
- File Format Detector (File API + magic bytes)

### ⚠️ Partially Feasible
- Merge PDFs (using pdf-lib.js - client-side library)
- Split PDF (using pdf-lib.js)
- Compress PDF (limited - using pdf-lib.js)
- Rotate PDF (using pdf-lib.js)
- Delete PDF Pages (using pdf-lib.js)
- Reorder PDF Pages (using pdf-lib.js)
- Add Page Numbers to PDF (using pdf-lib.js)
- Add Watermark to PDF (using pdf-lib.js)
- HTML to PDF (using jsPDF or html2pdf.js)
- Markdown to PDF (markdown-it + jsPDF)

### ❌ Difficult/Requires Server
- Word to PDF (needs conversion engine)
- Excel to PDF (needs conversion engine)
- PowerPoint to PDF (needs conversion engine)

## Cloudflare Workers Capabilities

### Cloudflare Workers Features
1. **Edge Computing** - Run JavaScript at edge locations
2. **Streams API** - Handle large files in chunks
3. **File Size Limits** - 10MB request body, 25MB subrequest
4. **ImageResizer** - Built-in image optimization (Workers paid plan)
5. **R2 Storage** - Object storage for temporary files

### Possible with Cloudflare Workers
- Image compression (using Workers ImageResizer)
- Image format conversion (ImageResizer)
- Image resizing (ImageResizer)
- Temporary file storage (R2)
- Rate limiting for tools
- Analytics tracking

### Better Client-Side
Most PDF/image manipulation is better done client-side for:
- Privacy (no upload needed)
- Speed (no network latency)
- Cost (no server processing)
- Legal compliance (evidence stays on device)

## Recommended Implementation Strategy

### Phase 1: Core Image Tools (All Client-Side)
- ✅ IMG to PDF
- ✅ Compress Images
- ✅ Resize Images
- ✅ Convert Images
- ✅ Image to Base64
- ✅ Crop Images

### Phase 2: PDF Tools (Client-Side with pdf-lib.js)
- ✅ Merge PDFs
- ✅ Split PDF
- ✅ Rotate PDF
- ✅ Delete Pages
- ✅ PDF to IMG (using PDF.js)

### Phase 3: Advanced Features
- Add watermarks
- Batch processing
- Drag & drop multi-file support
- ZIP file export for multiple outputs

### Phase 4: Optional Cloudflare Integration
- ImageResizer API proxy (for premium optimization)
- R2 temporary storage (for large files >100MB)
- Analytics dashboard

## Libraries to Use

### PDF Manipulation
- **pdf-lib** (https://pdf-lib.js.org/) - Create and modify PDFs client-side
- **PDF.js** (https://mozilla.github.io/pdf.js/) - Render PDF pages to canvas
- **jsPDF** (already in use) - Generate PDFs from scratch

### Image Processing
- **Canvas API** (native) - Image manipulation
- **Pica** (https://github.com/nodeca/pica) - High-quality image resizing
- **browser-image-compression** - Client-side image compression

### File Handling
- **JSZip** (https://stuk.github.io/jszip/) - Create ZIP files
- **FileSaver.js** - Save files client-side

## UI/UX Considerations
- Same dark theme as existing tools
- Multi-language support (EN/HI/PA)
- Drag & drop interface
- Progress indicators for large files
- Batch processing support
- Preview before download
- Mobile responsive

## Next Steps
1. ✅ Create `/general/` folder
2. ✅ Build initial `index.html` with tool cards
3. Start with IMG to PDF tool (simplest)
4. Add more tools incrementally
5. Test Cloudflare Workers integration if needed
