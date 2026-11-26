# Graph Report - punjab.pages.dev  (2026-11-26)

## Corpus Check
- 24 files · ~767,873 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .css 5, .xml 1, .toml 1)

## Summary
- 251 nodes · 356 edges · 19 communities (8 shown, 11 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3bcfce96`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- image-forensics.js
- js/app.js
- ip/app.js
- General Purpose Tools - Planning Document
- Punjab Investigation Tools - AI Coding Instructions
- airtelapi/[[number]].js
- Punjab Investigation Tools
- viapi/[[number]].js
- punjabi-converter.js
- onRequestGet
- generate.js
- signature/verify.js
- bsnlapi/[number].js
- translations.js

## God Nodes (most connected - your core abstractions)
1. `analyzeImage()` - 30 edges
2. `Punjab Investigation Tools` - 12 edges
3. `renderSingle()` - 9 edges
4. `Punjab Investigation Tools - AI Coding Instructions` - 9 edges
5. `processFiles()` - 8 edges
6. `General Purpose Tools - Planning Document` - 8 edges
7. `merge()` - 7 edges
8. `showToast()` - 7 edges
9. `desBlock()` - 6 edges
10. `encryptPayload()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `BSA 2023 Compliance` --references--> `getISTDateTime()`  [INFERRED]
  .github/copilot-instructions.md → js/app.js
- `Multi-Language Support` --references--> `applySiteLanguage()`  [INFERRED]
  .github/copilot-instructions.md → js/app.js
- `doBulk()` --indirect_call--> `validIP()`  [INFERRED]
  ip/app2.js → ip/app.js
- `doBulk()` --indirect_call--> `fetchLight()`  [INFERRED]
  ip/app2.js → ip/app.js

## Import Cycles
- None detected.

## Communities (19 total, 11 thin omitted)

### Community 0 - "image-forensics.js"
Cohesion: 0.08
Nodes (43): analyzeImage(), runNextTask(), calculateHashes(), calculateManipulationScore(), copyHash(), downloadReport(), extractMetadata(), fileInput (+35 more)

### Community 1 - "js/app.js"
Cohesion: 0.11
Nodes (29): Multi-Language Support, applySiteLanguage(), calculateHashesChunked(), changeSiteLanguage(), copyAllHashes(), copyHash(), displayResults(), downloadCertificateAsPDF() (+21 more)

### Community 2 - "ip/app.js"
Cohesion: 0.12
Nodes (24): doBulk(), bc(), BD, bi(), calcRisk(), cpExcel(), cpSingle(), doLookup() (+16 more)

### Community 3 - "General Purpose Tools - Planning Document"
Cohesion: 0.07
Nodes (26): Better Client-Side, Client-Side Feasibility (Browser-Based), Cloudflare Workers Capabilities, Cloudflare Workers Features, ❌ Difficult/Requires Server, Document Tools, File Handling, General Purpose Tools - Planning Document (+18 more)

### Community 4 - "Punjab Investigation Tools - AI Coding Instructions"
Cohesion: 0.08
Nodes (24): Adding New Tools, Adding Translation, Architecture, BSA 2023 Compliance, CDN Libraries (loaded via `<script>` tags), Cloudflare Functions, Common Tasks, Core Structure (+16 more)

### Community 5 - "airtelapi/[[number]].js"
Cohesion: 0.15
Nodes (21): b64decode(), CIRCLES, desBlock(), desDecrypt(), E, f(), FP, genSubkeys() (+13 more)

### Community 6 - "Punjab Investigation Tools"
Cohesion: 0.11
Nodes (18): 🛠️ All Tools (20+), 📧 Contact, 🤝 Contributing, 🗃️ Data Sources, Deployment, ⚠️ Disclaimer, 📁 General Purpose Tools, 🚀 Getting Started (+10 more)

### Community 7 - "viapi/[[number]].js"
Cohesion: 0.44
Nodes (8): aesEncrypt(), bytesToHex(), encryptPayload(), makeViRequest(), onRequest(), pbkdf2(), randomBytes(), VI_CIRCLES

## Knowledge Gaps
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Critical Conventions` connect `Punjab Investigation Tools - AI Coding Instructions` to `js/app.js`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `analyzeImage()` (e.g. with `calculateHashes()` and `extractMetadata()`) actually correct?**
  _`analyzeImage()` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Should `image-forensics.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08115942028985507 - nodes in this community are weakly interconnected._
- **Should `js/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10873440285204991 - nodes in this community are weakly interconnected._
- **Should `ip/app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11693548387096774 - nodes in this community are weakly interconnected._
- **Should `General Purpose Tools - Planning Document` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `Punjab Investigation Tools - AI Coding Instructions` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._