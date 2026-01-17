# PDF Report Generation Feature

## 📄 Overview
Professional PDF reports can now be generated for each website analysis.

## ✨ Features
- **Professional Layout**: Clean, branded PDF with all analysis data
- **Complete Data**: All scores, issues, recommendations, and executive summary
- **Easy Download**: One-click download from the report modal
- **Fast Generation**: Uses ReportLab for efficient PDF creation

## 🎯 Usage

### Frontend
Click the "Download PDF" button in the report modal to download a professional PDF report.

### Backend API
```bash
GET /api/v1/analyses/{analysis_id}/pdf
```

Returns: PDF file as download

## 📊 PDF Contents
1. **Header**: Report title and generation date
2. **Company Info**: Name, website, contact details, rating
3. **Overall Score**: Large display of total score with color coding
4. **Score Breakdown**: Individual scores (UI, SEO, Technical, Performance, Security, Mobile)
5. **Issues Found**: List of detected problems
6. **Recommendations**: Actionable improvement suggestions
7. **Executive Summary**: AI-generated summary for sales pitch
8. **Footer**: Generation timestamp

## 🎨 Design
- **Colors**: Green (80+), Orange (60-79), Red (<60)
- **Layout**: A4 size with professional spacing
- **Branding**: Customizable header and styling

## 🔧 Technical Details
- **Library**: ReportLab (Python)
- **Format**: PDF 1.4
- **Size**: ~5-10 KB per report
- **Pages**: 2-3 pages typical

## 📦 Dependencies
```bash
pip install reportlab
```

## 🚀 Example
```bash
# Test PDF generation
curl -o report.pdf http://localhost:8000/api/v1/analyses/{id}/pdf
```
