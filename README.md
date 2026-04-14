# 🔬 ScholarLens

**ScholarLens** is a fully client-side, high-performance web application designed to help researchers, students, and academics instantly assess the quality of academic papers.

By simply pasting a **DOI** or dragging and dropping a **PDF file**, ScholarLens automatically extracts metadata and provides a comprehensive dashboard of paper and author metrics without any manual searching.

🔗 **Try it here**: [ScholarLens on GitHub Pages](https://phungdo.github.io/scholarlens/)

---

## 🚀 The Problem We Solve

Currently, evaluating the quality of an academic paper is a tedious, multi-step process:

- You have to visit **Scimago** or **Google Scholar** to find the journal's Quartile or Impact Factor.
- You have to search the **CORE Portal** to find out if a conference is A*, A, B, or C.
- You have to lookup authors on Google Scholar or ORCID to find their h-index.

**ScholarLens solves this by perfectly automating the workflow in one place.**

## ✨ Features

- **DOI & PDF Input**: Paste a DOI (e.g. `10.1371/journal.pone.0313495`) or Drag & drop a PDF. (Uses local, client-side PDF.js to extract the DOI via regex).
- **Journal & Source Metrics**: Instantly shows the citation count, Impact Factor proxy (`2yr_mean_citedness`), and Journal h-index.
- **CORE Conference Rankings**: Built-in curated database of major Computer Science/Engineering conferences (A*, A, B, C rankings) bypassing the need to search the CORE portal manually.
- **Author Profiles**: Displays the h-index, institution, and position (first, last, corresponding) of key authors directly on the dashboard.
- **Open Access Status**: Instantly see if the paper is Gold, Green, Bronze, or Closed access.
- **Citation Trajectory**: Sparkline SVG with Rising/Stable/Declining label showing year-by-year citation trend from OpenAlex data.
- **Predatory Journal Detection**: Two-signal badge — warns against publishers/journals on the Beall's list (1162 publishers + 1309 journals) and confirms DOAJ listing via live API check (cached 30 days).
- **Field Percentile**: Pill shows "Top X% in {Field}" with a mini filled bar using OpenAlex primary topic data.
- **100% Client-Side Private**: No backend server. Your PDFs and research stay locally in your browser. Powered by the open-source OpenAlex API.

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3 (Modern Glassmorphism UI), Javascript (ES6)
- **PDF Extraction**: `PDF.js` via CDN for local text extraction
- **Data APIs**:
  - [OpenAlex API](https://openalex.org/) (Primary source for metadata, citations, and h-indices)
  - CrossRef API (Fallback DOI resolution)
  - [DOAJ API](https://doaj.org/) (Predatory detection — confirms legitimate open access journals)
- **Rankings Database**: Local JavaScript object compiled from CORE portal subsets.
- **Predatory List**: Bundled static data from `stop-predatory-journals` community mirror (Beall's list).

## 🏃‍♂️ How to Run Locally

Because ScholarLens is completely client-side, you don't need any complex setup:

1. Clone the repository

   ```bash
   git clone https://github.com/phungdo/scholarlens.git
   ```

2. Open `index.html` in any modern web browser.
3. Or use a local server:

   ```bash
   python3 -m http.server 8765
   ```

   Then navigate to `http://localhost:8765/`

## 🔮 Roadmap (Version 2)

We are actively building the next major features:

- **Scimago Quartile Estimator** (Q1-Q4 visual badge)
- **Reference Portfolio Analysis** (Donut charts showing the quality breakdown of all papers cited by the uploaded paper)
- **Funding & Grant Information** display
- **Industry-Academia Collaboration** detection

---
*Built for researchers, by researchers.* 🎓
