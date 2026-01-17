"""
PDF Report Generator for Website Analysis
Converts analysis data into professional PDF reports using ReportLab
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from datetime import datetime
from typing import Dict, Any
import logging
import io

logger = logging.getLogger(__name__)


class PDFReportGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles"""
        # Title style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#10B981'),
            spaceAfter=30,
            alignment=TA_CENTER
        ))
        
        # Company name style
        self.styles.add(ParagraphStyle(
            name='CompanyName',
            parent=self.styles['Heading2'],
            fontSize=18,
            textColor=colors.HexColor('#111827'),
            spaceBefore=10,
            spaceAfter=10
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading3'],
            fontSize=14,
            textColor=colors.HexColor('#374151'),
            spaceBefore=20,
            spaceAfter=10,
            leftIndent=0
        ))
        
        # Issue style
        self.styles.add(ParagraphStyle(
            name='IssueText',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#991B1B'),
            leftIndent=20,
            bulletIndent=10
        ))
        
        # Recommendation style
        self.styles.add(ParagraphStyle(
            name='RecText',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#065F46'),
            leftIndent=20,
            bulletIndent=10
        ))
    
    def generate_pdf(self, analysis_data: Dict[str, Any]) -> bytes:
        """
        Generate PDF Report from Analysis Data
        
        Args:
            analysis_data: Dictionary with all analysis data from database
            
        Returns:
            PDF as bytes (for download or email)
        """
        try:
            logger.info(f"Generating PDF for: {analysis_data.get('company_name', 'Unknown')}")
            
            # Create PDF buffer
            buffer = io.BytesIO()
            
            # Create PDF document
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=2*cm,
                leftMargin=2*cm,
                topMargin=2*cm,
                bottomMargin=2*cm
            )
            
            # Build content
            story = []
            story.extend(self._build_header(analysis_data))
            story.extend(self._build_company_info(analysis_data))
            story.extend(self._build_overall_score(analysis_data))
            story.extend(self._build_score_breakdown(analysis_data))
            story.append(PageBreak())
            story.extend(self._build_issues(analysis_data))
            story.extend(self._build_recommendations(analysis_data))
            story.extend(self._build_executive_summary(analysis_data))
            story.extend(self._build_footer(analysis_data))
            
            # Build PDF
            doc.build(story)
            
            # Get PDF bytes
            pdf_bytes = buffer.getvalue()
            buffer.close()
            
            logger.info(f"✅ PDF generated successfully, size: {len(pdf_bytes)} bytes")
            return pdf_bytes
            
        except Exception as e:
            logger.error(f"❌ PDF generation failed: {str(e)}")
            raise
    
    def _build_header(self, data: Dict[str, Any]) -> list:
        """Build PDF header"""
        elements = []
        
        # Title
        elements.append(Paragraph("🚀 Website Analysis Report", self.styles['CustomTitle']))
        elements.append(Spacer(1, 0.3*cm))
        
        # Date
        date_text = f"Erstellt am {datetime.now().strftime('%d.%m.%Y %H:%M')}"
        elements.append(Paragraph(date_text, self.styles['Normal']))
        elements.append(Spacer(1, 1*cm))
        
        return elements
    
    def _build_company_info(self, data: Dict[str, Any]) -> list:
        """Build company information section"""
        elements = []
        
        # Company name
        company_name = data.get('company_name', 'Unknown Business')
        elements.append(Paragraph(company_name, self.styles['CompanyName']))
        
        # Company details table
        details = []
        if data.get('website'):
            details.append(['🌐 Website:', data['website']])
        if data.get('business_address'):
            details.append(['📍 Adresse:', data['business_address']])
        if data.get('business_phone'):
            details.append(['📞 Telefon:', data['business_phone']])
        if data.get('email'):
            details.append(['✉️ Email:', data['email']])
        if data.get('google_maps_rating'):
            details.append(['⭐ Bewertung:', f"{data['google_maps_rating']}/5 ({data.get('google_maps_reviews', 0)} Bewertungen)"])
        
        if details:
            table = Table(details, colWidths=[4*cm, 12*cm])
            table.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#6B7280')),
                ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1F2937')),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ]))
            elements.append(table)
        
        elements.append(Spacer(1, 1*cm))
        return elements
    
    def _build_overall_score(self, data: Dict[str, Any]) -> list:
        """Build overall score section"""
        elements = []
        
        total_score = data.get('total_score', 0)
        score_color = self._get_score_color(total_score)
        
        # Score display
        score_table = Table([[f"{total_score}/100"]], colWidths=[4*cm])
        score_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE', (0, 0), (-1, -1), 36),
            ('TEXTCOLOR', (0, 0), (-1, -1), score_color),
            ('BOX', (0, 0), (-1, -1), 4, score_color),
            ('ROUNDEDCORNERS', [5, 5, 5, 5]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 20),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 20),
        ]))
        
        # Center the table
        wrapper_table = Table([[score_table]], colWidths=[16*cm])
        wrapper_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ]))
        
        elements.append(Paragraph("Gesamtbewertung", self.styles['SectionHeader']))
        elements.append(wrapper_table)
        elements.append(Spacer(1, 0.5*cm))
        
        return elements
    
    def _build_score_breakdown(self, data: Dict[str, Any]) -> list:
        """Build score breakdown section"""
        elements = []
        
        elements.append(Paragraph("📊 Detaillierte Score-Übersicht", self.styles['SectionHeader']))
        
        scores = [
            ('UI/Design', data.get('ui_score')),
            ('SEO', data.get('seo_score')),
            ('Technical', data.get('tech_score')),
            ('Performance', data.get('performance_score')),
            ('Security', data.get('security_score')),
            ('Mobile', data.get('mobile_score')),
        ]
        
        # Filter out None scores
        scores = [(name, score) for name, score in scores if score is not None]
        
        for name, score in scores:
            score_color = self._get_score_color(score)
            
            # Score row
            row_data = [[name, f"{score}/100"]]
            table = Table(row_data, colWidths=[12*cm, 4*cm])
            table.setStyle(TableStyle([
                ('FONTSIZE', (0, 0), (-1, -1), 11),
                ('TEXTCOLOR', (0, 0), (0, 0), colors.HexColor('#374151')),
                ('TEXTCOLOR', (1, 0), (1, 0), score_color),
                ('FONTNAME', (1, 0), (1, 0), 'Helvetica-Bold'),
                ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ]))
            elements.append(table)
            
            # Progress bar
            bar_width = score * 0.16  # 16cm max width
            bar_table = Table([['']], colWidths=[bar_width*cm])
            bar_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), score_color),
                ('ROUNDEDCORNERS', [3, 3, 3, 3]),
            ]))
            elements.append(bar_table)
            elements.append(Spacer(1, 0.4*cm))
        
        return elements
    
    def _build_issues(self, data: Dict[str, Any]) -> list:
        """Build issues section"""
        elements = []
        
        issues = data.get('issues', [])
        if issues:
            elements.append(Paragraph("🚨 Gefundene Probleme", self.styles['SectionHeader']))
            
            for issue in issues[:10]:  # Limit to 10
                bullet_text = f"• {issue}"
                elements.append(Paragraph(bullet_text, self.styles['IssueText']))
                elements.append(Spacer(1, 0.2*cm))
            
            elements.append(Spacer(1, 0.5*cm))
        
        return elements
    
    def _build_recommendations(self, data: Dict[str, Any]) -> list:
        """Build recommendations section"""
        elements = []
        
        elements.append(Paragraph("💡 Empfehlungen zur Verbesserung", self.styles['SectionHeader']))
        
        recommendations = self._extract_recommendations(data)
        
        for rec in recommendations:
            bullet_text = f"✓ {rec}"
            elements.append(Paragraph(bullet_text, self.styles['RecText']))
            elements.append(Spacer(1, 0.2*cm))
        
        elements.append(Spacer(1, 0.5*cm))
        return elements
    
    def _build_executive_summary(self, data: Dict[str, Any]) -> list:
        """Build executive summary section"""
        elements = []
        
        elements.append(Paragraph("📋 Executive Summary", self.styles['SectionHeader']))
        
        summary = self._extract_executive_summary(data)
        summary_style = ParagraphStyle(
            'Summary',
            parent=self.styles['Normal'],
            fontSize=10,
            alignment=TA_JUSTIFY,
            leading=14
        )
        
        elements.append(Paragraph(summary, summary_style))
        elements.append(Spacer(1, 1*cm))
        
        return elements
    
    def _build_footer(self, data: Dict[str, Any]) -> list:
        """Build footer"""
        elements = []
        
        footer_text = f"Dieser Report wurde automatisch generiert am {datetime.now().strftime('%d.%m.%Y %H:%M')}"
        footer_style = ParagraphStyle(
            'Footer',
            parent=self.styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#6B7280'),
            alignment=TA_CENTER
        )
        
        elements.append(Spacer(1, 2*cm))
        elements.append(Paragraph(footer_text, footer_style))
        
        return elements
    
    def _extract_executive_summary(self, data: Dict[str, Any]) -> str:
        """Extract executive summary from issues list or generate default"""
        issues = data.get('issues', [])
        
        # Look for executive summary pattern in issues
        for issue in issues:
            if isinstance(issue, str) and len(issue) > 100:
                return issue
        
        # Generate default summary
        company_name = data.get('company_name', 'Diese Website')
        total_score = data.get('total_score', 0)
        
        return (f"{company_name} hat eine Gesamtbewertung von {total_score}/100 Punkten. "
                f"Die Analyse zeigt Verbesserungspotenzial in mehreren Bereichen. "
                f"Eine professionelle Optimierung kann die User Experience um 40-60% verbessern "
                f"und die Conversion Rate signifikant steigern.")
    
    def _extract_recommendations(self, data: Dict[str, Any]) -> list:
        """Extract recommendations based on scores"""
        recommendations = []
        
        if data.get('mobile_score', 100) < 80:
            recommendations.append("Implementierung eines mobile-first, responsive Designs")
        
        if data.get('security_score', 100) < 70:
            recommendations.append("Verbesserung der Security Headers (HSTS, CSP, X-Frame-Options)")
        
        if data.get('performance_score', 100) < 70:
            recommendations.append("Optimierung der Ladezeiten durch Image-Kompression")
        
        if data.get('seo_score', 100) < 70:
            recommendations.append("SEO-Optimierung mit Meta-Tags und strukturierten Daten")
        
        if data.get('ui_score', 100) < 70:
            recommendations.append("Modernisierung des UI-Designs")
        
        # Add generic recommendations
        recommendations.extend([
            "Integration von Analytics und Conversion Tracking",
            "Verbesserung der Accessibility (ARIA Labels)",
            "Implementierung eines Content Management Systems"
        ])
        
        return recommendations[:8]
    
    def _get_score_color(self, score: int):
        """Get color based on score"""
        if score is None:
            return colors.HexColor('#9CA3AF')
        if score >= 80:
            return colors.HexColor('#10B981')
        if score >= 60:
            return colors.HexColor('#F59E0B')
        return colors.HexColor('#EF4444')

