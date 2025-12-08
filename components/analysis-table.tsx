"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Analysis } from "@/app/page"
import { Clock, Loader2, FileText } from "lucide-react"
import { useState } from "react"
import { ReportModal } from "@/components/report-modal"

interface AnalysisTableProps {
  analyses: Analysis[]
}

export function AnalysisTable({ analyses }: AnalysisTableProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-primary"
    if (score >= 50) return "text-chart-4"
    return "text-destructive"
  }

  const getStatusBadge = (status: Analysis["status"]) => {
    const styles = {
      completed: "bg-primary/10 text-primary border-primary/20",
      analyzing: "bg-accent/10 text-accent border-accent/20",
      failed: "bg-destructive/10 text-destructive border-destructive/20",
    }
    return styles[status]
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Website
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  UI Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  SEO Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Tech Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Last Checked
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {analyses.map((analysis) => (
                <tr key={analysis.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{analysis.website}</td>
                  <td className="px-6 py-4 text-sm">
                    {analysis.status === "analyzing" ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className={`font-semibold ${getScoreColor(analysis.uiScore)}`}>{analysis.uiScore}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {analysis.status === "analyzing" ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className={`font-semibold ${getScoreColor(analysis.seoScore)}`}>{analysis.seoScore}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {analysis.status === "analyzing" ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className={`font-semibold ${getScoreColor(analysis.techScore)}`}>{analysis.techScore}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {analysis.status === "analyzing" ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className={`font-bold ${getScoreColor(analysis.totalScore)}`}>{analysis.totalScore}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant="outline" className={getStatusBadge(analysis.status)}>
                      {analysis.status === "analyzing" && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                      {analysis.status.charAt(0).toUpperCase() + analysis.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {analysis.lastChecked}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAnalysis(analysis)}
                      disabled={analysis.status !== "completed"}
                      className="gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Report
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ReportModal analysis={selectedAnalysis} isOpen={!!selectedAnalysis} onClose={() => setSelectedAnalysis(null)} />
    </>
  )
}
