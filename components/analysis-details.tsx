import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Analysis } from "@/app/page"
import { AlertCircle, TrendingDown, Zap, Clock, AlertTriangle } from "lucide-react"

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

  const isHotLead = analysis.hasAdsPixel && analysis.totalScore < 60
  const isOutdated = analysis.copyrightYear < 2022

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">Latest Analysis</h3>
          <p className="text-sm text-muted-foreground">{analysis.website}</p>
          <div className="flex gap-2 mt-2">
            {isHotLead && (
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                <Zap className="h-3 w-3 mr-1" />
                Hot Lead - High Priority
              </Badge>
            )}
            {isOutdated && (
              <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/20">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Outdated ({analysis.copyrightYear})
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-border">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Company</p>
              <p className="font-medium">{analysis.companyName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Location</p>
              <p className="font-medium">{analysis.location}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Email</p>
              <p className="font-medium text-xs truncate">{analysis.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Industry</p>
              <p className="font-medium">{analysis.industry}</p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-xs mb-1">Tech Stack</p>
            <div className="flex flex-wrap gap-1">
              {analysis.techStack.map((tech, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">Speed Score</p>
              <p className="text-lg font-bold text-foreground">{analysis.googleSpeedScore}/100</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">Load Time</p>
              <p className="text-lg font-bold text-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {analysis.loadingTime}
              </p>
            </div>
          </div>

          {analysis.hasAdsPixel && (
            <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
              <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                Ads Pixel Detected - Budget Available
              </p>
            </div>
          )}
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
              <span className="font-semibold">Conversion Potential:</span>{" "}
              {isHotLead
                ? "Extremely high! They're already spending on ads but the site is underperforming. Perfect opportunity to show ROI improvement."
                : "This website has clear opportunities for improvement. A modern redesign could significantly increase conversion rates."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
