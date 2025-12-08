import { Card } from "@/components/ui/card"
import type { Analysis } from "@/app/page"
import { AlertCircle, TrendingDown } from "lucide-react"

interface AnalysisDetailsProps {
  analysis?: Analysis
}

export function AnalysisDetails({ analysis }: AnalysisDetailsProps) {
  if (!analysis || analysis.status !== "completed") {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <TrendingDown className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-2 font-semibold text-foreground">No Analysis Selected</h3>
          <p className="text-sm text-muted-foreground">Analyze a website to see detailed results here</p>
        </div>
      </Card>
    )
  }

  const scores = [
    { label: "UI Score", value: analysis.uiScore, color: "bg-primary" },
    { label: "SEO Score", value: analysis.seoScore, color: "bg-chart-2" },
    { label: "Tech Score", value: analysis.techScore, color: "bg-accent" },
    ...(analysis.performanceScore
      ? [{ label: "Performance", value: analysis.performanceScore, color: "bg-chart-3" }]
      : []),
    ...(analysis.securityScore ? [{ label: "Security", value: analysis.securityScore, color: "bg-chart-4" }] : []),
    ...(analysis.mobileScore ? [{ label: "Mobile", value: analysis.mobileScore, color: "bg-chart-5" }] : []),
  ]

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">Latest Analysis</h3>
          <p className="text-sm text-muted-foreground">{analysis.website}</p>
        </div>

        <div className="space-y-4">
          {scores.map((score) => (
            <div key={score.label} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{score.label}</span>
                <span className="font-semibold text-foreground">{score.value}/100</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className={`h-full ${score.color} transition-all duration-500`}
                  style={{ width: `${score.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <h4 className="text-sm font-semibold text-foreground">Issues Found</h4>
          </div>
          <ul className="space-y-2">
            {analysis.issues.map((issue, index) => (
              <li key={index} className="flex gap-2 text-sm text-muted-foreground">
                <span className="text-destructive">•</span>
                <span className="flex-1">{issue}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold">Overall Assessment:</span> This website has significant opportunities for
              improvement across UI, SEO, and technical areas. A modern redesign could increase conversion rates by
              40-60%.
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
