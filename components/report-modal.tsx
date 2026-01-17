"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, AlertCircle } from "lucide-react"
import type { Analysis, Lead } from "@/app/page"
import { createClient } from "@/lib/supabase/client"

interface ReportModalProps {
  analysis?: Analysis | null
  lead?: Lead | null
  isOpen: boolean
  onClose: () => void
}

export function ReportModal({ analysis, lead, isOpen, onClose }: ReportModalProps) {
  const supabase = createClient()
  
  const handleDownloadPDF = async () => {
    try {
      // Get analysis ID from either analysis or lead
      const analysisId = analysis?.id || lead?.id
      
      if (!analysisId) {
        alert("No analysis ID available for PDF generation")
        return
      }

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert("Not authenticated. Please log in.")
        return
      }

      // Fetch PDF from backend with auth token
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const response = await fetch(`${apiUrl}/api/v1/analyses/${analysisId}/pdf`, {
        headers: {
          "Authorization": `Bearer ${session.access_token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`PDF generation failed: ${response.statusText}`)
      }

      // Download PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Generate filename
      const companyName = (analysis?.companyName || lead?.company || 'Report').replace(/\s+/g, '_')
      a.download = `Website_Report_${companyName}_${analysisId.substring(0, 8)}.pdf`
      
      document.body.appendChild(a)
      a.click()
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log('✅ PDF downloaded successfully')
    } catch (error) {
      console.error('❌ PDF download failed:', error)
      alert('PDF download failed. Please try again.')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-primary"
    if (score >= 50) return "text-chart-4"
    return "text-destructive"
  }

  if (!analysis && !lead) return null

  const data = analysis || {
    website: lead?.website || "",
    uiScore: Math.floor(Math.random() * 40) + 30,
    seoScore: Math.floor(Math.random() * 40) + 30,
    techScore: Math.floor(Math.random() * 40) + 30,
    performanceScore: Math.floor(Math.random() * 40) + 30,
    securityScore: Math.floor(Math.random() * 40) + 40,
    mobileScore: Math.floor(Math.random() * 40) + 30,
    totalScore: lead?.totalScore || 50,
    issues: [lead?.mainIssue || "Various issues detected", "Needs improvement"],
  }

  const scores = [
    { label: "UI/Design", value: data.uiScore },
    { label: "SEO", value: data.seoScore },
    { label: "Technical", value: data.techScore },
    { label: "Performance", value: data.performanceScore || 0 },
    { label: "Security", value: data.securityScore || 0 },
    { label: "Mobile-Friendly", value: data.mobileScore || 0 },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Analysis Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Website Info */}
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{data.website}</h3>
              <Badge className="text-base">
                Total Score:{" "}
                <span className={`ml-1 font-bold ${getScoreColor(data.totalScore)}`}>{data.totalScore}</span>
              </Badge>
            </div>
            {lead && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Industry: {lead.industry}</span>
                <span>Source: {lead.source}</span>
              </div>
            )}
          </div>

          {/* Screenshot Placeholder */}
          <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-4xl">🖼️</div>
                <p className="text-sm text-muted-foreground">Website Screenshot</p>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div>
            <h4 className="mb-4 text-lg font-semibold text-foreground">Score Breakdown</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              {scores.map((score) => (
                <div key={score.label} className="space-y-2 rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{score.label}</span>
                    <span className={`text-lg font-bold ${getScoreColor(score.value)}`}>{score.value}/100</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full transition-all ${
                        score.value >= 70 ? "bg-primary" : score.value >= 50 ? "bg-chart-4" : "bg-destructive"
                      }`}
                      style={{ width: `${score.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issues */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h4 className="text-lg font-semibold text-foreground">Issues Found</h4>
            </div>
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
              {Array.isArray(data.issues) ? (
                data.issues.map((issue, index) => (
                  <div key={index} className="flex gap-2 text-sm text-foreground">
                    <span className="text-destructive">•</span>
                    <span>{issue}</span>
                  </div>
                ))
              ) : (
                <div className="flex gap-2 text-sm text-foreground">
                  <span className="text-destructive">•</span>
                  <span>{data.issues}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="mb-3 text-lg font-semibold text-foreground">Recommendations for Redesign</h4>
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed text-foreground">
              <p>• Implement modern, responsive design patterns with mobile-first approach</p>
              <p>• Optimize page load times through image compression and code minification</p>
              <p>• Enhance SEO with proper meta tags, structured data, and semantic HTML</p>
              <p>• Add SSL certificate and implement security best practices</p>
              <p>• Improve accessibility with ARIA labels and keyboard navigation</p>
              <p>• Integrate analytics and conversion tracking tools</p>
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-primary/10 p-4">
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-foreground">Executive Summary</h4>
            <p className="text-sm leading-relaxed text-foreground">
              This website presents significant opportunities for improvement with a current score of{" "}
              <span className="font-bold">{data.totalScore}/100</span>. A comprehensive redesign addressing the
              identified issues could increase user engagement by 40-60% and improve conversion rates substantially. Key
              focus areas include modernizing the UI, implementing technical best practices, and enhancing mobile
              responsiveness.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleDownloadPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
