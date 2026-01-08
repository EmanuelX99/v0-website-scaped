"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import type { Analysis } from "@/app/page"
import {
  Clock,
  Loader2,
  FileText,
  Mail,
  Copy,
  Building2,
  MapPin,
  Zap,
  AlertTriangle,
  Download,
  Mailbox,
  Upload,
  Users,
} from "lucide-react"
import { useState, useRef } from "react" // Added useRef for file input
import { ReportModal } from "@/components/report-modal"
import { PitchModal } from "@/components/pitch-modal"
import { useToast } from "@/hooks/use-toast"

interface AnalysisTableProps {
  analyses: Analysis[]
  setAnalyses?: (analyses: Analysis[]) => void // Added setAnalyses prop for importing data
}

export function AnalysisTable({ analyses, setAnalyses }: AnalysisTableProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)
  const [pitchAnalysis, setPitchAnalysis] = useState<Analysis | null>(null)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null) // Ref for hidden file input

  const handleImportCSV = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text.split("\n")
      const headers = lines[0].split(",").map((h) => h.trim())

      const parsedAnalyses: Analysis[] = []

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue

        const values = lines[i].split(",").map((v) => v.trim())
        const row: Record<string, string> = {}

        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })

        // Calculate scores based on performance data
        const speedScore = Number.parseInt(row.googleSpeedScore) || 0
        const uiScore = Math.min(Math.round(speedScore * 0.8 + Math.random() * 20), 100)
        const seoScore = Math.min(Math.round(speedScore * 0.9 + Math.random() * 10), 100)
        const techScore = Math.min(Math.round(speedScore * 0.85 + Math.random() * 15), 100)
        const totalScore = Math.round((uiScore + seoScore + techScore) / 3)

        parsedAnalyses.push({
          id: Date.now().toString() + i,
          companyName: row.companyName || "",
          website: row.website || "",
          email: row.email || "",
          location: row.location || "",
          industry: row.industry || "",
          // Split techStack by comma
          techStack: row.techStack ? row.techStack.split(",").map((t) => t.trim()) : [],
          // Convert TRUE/FALSE string to boolean
          hasAdsPixel: row.hasAdsPixel?.toUpperCase() === "TRUE",
          googleSpeedScore: speedScore,
          loadingTime: row.loadingTime || "0s",
          // Split issues by semicolon
          issues: row.issues ? row.issues.split(";").map((i) => i.trim()) : [],
          uiScore,
          seoScore,
          techScore,
          totalScore,
          status: "completed",
          lastChecked: "Just now",
          copyrightYear: new Date().getFullYear(),
          source: row.source || "CSV Import",
          companySize: row.companySize || undefined, // Added companySize field
        })
      }

      if (setAnalyses) {
        setAnalyses(parsedAnalyses)
        toast({
          title: "Import Successful",
          description: `${parsedAnalyses.length} websites imported from CSV`,
        })
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Error parsing CSV file. Please check the format.",
        variant: "destructive",
      })
    }
  }

  const handleExportCSV = () => {
    const headers = [
      "Website",
      "Company Name",
      "Email",
      "Location",
      "Industry",
      "Tech Stack",
      "Has Ads Pixel",
      "Google Speed Score",
      "Loading Time",
      "Copyright Year",
      "UI Score",
      "SEO Score",
      "Tech Score",
      "Total Score",
      "Status",
      "Last Checked",
      "Source",
      "Company Size",
    ]

    const rows = analyses.map((a) => [
      a.website,
      a.companyName || "",
      a.email || "",
      a.location || "",
      a.industry || "",
      (a.techStack || []).join("; "),
      a.hasAdsPixel ? "Yes" : "No",
      (a.googleSpeedScore || 0).toString(),
      a.loadingTime || "",
      (a.copyrightYear || new Date().getFullYear()).toString(),
      a.uiScore.toString(),
      a.seoScore.toString(),
      a.techScore.toString(),
      a.totalScore.toString(),
      a.status,
      a.lastChecked,
      a.source || "",
      a.companySize || "N/A",
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `sitescanner-leads-${new Date().toISOString().split("T")[0]}.csv`
    link.click()

    toast({
      title: "Export Successful",
      description: "Leads exported to CSV file",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Email copied to clipboard",
    })
  }

  const getSpeedScoreColor = (score: number) => {
    if (score >= 90) return "text-primary"
    if (score >= 50) return "text-chart-4"
    return "text-destructive"
  }

  const getSpeedScoreBg = (score: number) => {
    if (score >= 90) return "bg-primary/10 text-primary border-primary/20"
    if (score >= 50) return "bg-chart-4/10 text-chart-4 border-chart-4/20"
    return "bg-destructive/10 text-destructive border-destructive/20"
  }

  const getStatusBadge = (status: Analysis["status"]) => {
    const styles = {
      completed: "bg-primary/10 text-primary border-primary/20",
      analyzing: "bg-accent/10 text-accent border-accent/20",
      failed: "bg-destructive/10 text-destructive border-destructive/20",
    }
    return styles[status]
  }

  const isHotLead = (analysis: Analysis) => {
    return analysis.hasAdsPixel && analysis.totalScore < 60
  }

  const isOutdated = (year: number) => {
    return year < 2022
  }

  const getCompanySizeBadge = (size?: string) => {
    if (!size) return { className: "bg-muted/50 text-muted-foreground border-border", label: "N/A" }
    if (size === "50+") return { className: "bg-primary/10 text-primary border-primary/20", label: size }
    if (size === "11-50") return { className: "bg-accent/10 text-accent border-accent/20", label: size }
    return { className: "bg-muted/50 text-foreground border-border", label: size }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-foreground">Analysis Results</h2>
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
            <Button onClick={handleImportCSV} variant="outline" size="sm" className="gap-2 bg-transparent">
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button onClick={handleExportCSV} variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export Leads CSV
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tech & Tracking
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Performance
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {analyses.map((analysis) => {
                const companySizeBadge = getCompanySizeBadge(analysis.companySize)

                return (
                  <tr
                    key={analysis.id}
                    className={`hover:bg-muted/30 transition-colors ${isHotLead(analysis) ? "bg-destructive/5" : ""}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm font-semibold text-foreground truncate">
                              {analysis.companyName || analysis.website}
                            </span>
                            {isOutdated(analysis.copyrightYear) && (
                              <HoverCard>
                                <HoverCardTrigger>
                                  <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                                </HoverCardTrigger>
                                <HoverCardContent className="w-60">
                                  <div className="space-y-1">
                                    <p className="text-sm font-semibold">Outdated Website</p>
                                    <p className="text-xs text-muted-foreground">
                                      Copyright from {analysis.copyrightYear} - Website likely abandoned or unmaintained
                                    </p>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            )}
                            {isHotLead(analysis) && (
                              <Badge
                                variant="outline"
                                className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] px-1 py-0 flex-shrink-0"
                              >
                                HOT
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {analysis.industry && (
                              <Badge
                                variant="outline"
                                className="bg-muted/50 text-muted-foreground border-border text-[10px] px-1.5 py-0"
                              >
                                {analysis.industry}
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className={`${companySizeBadge.className} text-[10px] px-1.5 py-0`}
                            >
                              <Users className="h-2.5 w-2.5 mr-0.5" />
                              {companySizeBadge.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-foreground truncate">{analysis.email || "N/A"}</span>
                          {analysis.email && (
                            <button
                              onClick={() => copyToClipboard(analysis.email)}
                              className="opacity-0 group-hover:opacity-100 hover:text-primary transition-opacity"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{analysis.location || "N/A"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <HoverCard>
                          <HoverCardTrigger>
                            <div className="flex flex-wrap gap-1">
                              {(analysis.techStack || []).slice(0, 2).map((tech, idx) => (
                                <Badge key={idx} variant="outline" className="text-[10px] px-1.5 py-0">
                                  {tech}
                                </Badge>
                              ))}
                              {(analysis.techStack || []).length > 2 && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  +{(analysis.techStack || []).length - 2}
                                </Badge>
                              )}
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-60">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold">Full Tech Stack</p>
                              <div className="flex flex-wrap gap-1">
                                {(analysis.techStack || []).map((tech, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                        {analysis.hasAdsPixel && (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/20 text-[10px] px-1.5 py-0"
                          >
                            <Zap className="h-2.5 w-2.5 mr-1" />
                            Ads Pixel
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {analysis.status === "analyzing" ? (
                        <span className="text-muted-foreground text-xs">—</span>
                      ) : (
                        <div className="space-y-2">
                          <HoverCard>
                            <HoverCardTrigger>
                              <Badge variant="outline" className={getSpeedScoreBg(analysis.googleSpeedScore)}>
                                Speed: {analysis.googleSpeedScore}
                              </Badge>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-60">
                              <div className="space-y-2">
                                <p className="text-sm font-semibold">Performance Details</p>
                                <div className="space-y-1 text-xs">
                                  <p>
                                    <span className="text-muted-foreground">Google PageSpeed:</span>{" "}
                                    <span className={getSpeedScoreColor(analysis.googleSpeedScore)}>
                                      {analysis.googleSpeedScore}/100
                                    </span>
                                  </p>
                                  <p>
                                    <span className="text-muted-foreground">Load Time:</span> {analysis.loadingTime}
                                  </p>
                                  {analysis.googleSpeedScore < 50 && (
                                    <p className="text-destructive">⚠️ Critical: Slow LCP, High CLS</p>
                                  )}
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{analysis.loadingTime}</span>
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <Badge variant="outline" className={getStatusBadge(analysis.status)}>
                        {analysis.status === "analyzing" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                        {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                      </Badge>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPitchAnalysis(analysis)}
                          disabled={analysis.status !== "completed"}
                          className="gap-1.5 h-8 px-2"
                        >
                          <Mailbox className="h-3.5 w-3.5" />
                          Pitch
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAnalysis(analysis)}
                          disabled={analysis.status !== "completed"}
                          className="gap-1.5 h-8 px-2"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Report
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <ReportModal analysis={selectedAnalysis} isOpen={!!selectedAnalysis} onClose={() => setSelectedAnalysis(null)} />
      <PitchModal analysis={pitchAnalysis} isOpen={!!pitchAnalysis} onClose={() => setPitchAnalysis(null)} />
    </>
  )
}
