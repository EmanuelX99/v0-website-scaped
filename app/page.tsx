"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { AnalysisForm } from "@/components/analysis-form"
import { AnalysisTable } from "@/components/analysis-table"
import { AnalysisDetails } from "@/components/analysis-details"
import { PotentialLeadsTable } from "@/components/potential-leads-table"
import { NewAnalysisModal } from "@/components/new-analysis-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export interface Analysis {
  id: string
  website: string
  uiScore: number
  seoScore: number
  techScore: number
  performanceScore?: number
  securityScore?: number
  mobileScore?: number
  totalScore: number
  status: "completed" | "analyzing" | "failed"
  lastChecked: string
  issues: string[]
  industry?: string
  source?: string
}

export interface Lead {
  id: string
  website: string
  totalScore: number
  mainIssue: string
  industry: string
  source: string
  leadStrength: "weak" | "medium" | "strong"
}

export default function Dashboard() {
  const [analyses, setAnalyses] = useState<Analysis[]>([
    {
      id: "1",
      website: "oldshop.com",
      uiScore: 42,
      seoScore: 38,
      techScore: 51,
      performanceScore: 45,
      securityScore: 60,
      mobileScore: 38,
      totalScore: 44,
      status: "completed",
      lastChecked: "2 hours ago",
      issues: [
        "Outdated design patterns detected",
        "Poor mobile responsiveness",
        "Missing meta descriptions on 15 pages",
        "Slow page load times (avg 4.2s)",
      ],
      industry: "E-commerce",
      source: "Manual Input",
    },
    {
      id: "2",
      website: "vintage-store.net",
      uiScore: 55,
      seoScore: 62,
      techScore: 48,
      performanceScore: 52,
      securityScore: 70,
      mobileScore: 58,
      totalScore: 55,
      status: "completed",
      lastChecked: "5 hours ago",
      issues: ["Inconsistent typography", "Limited accessibility features", "Mixed HTTP/HTTPS content"],
      industry: "Retail",
      source: "local.ch",
    },
    {
      id: "3",
      website: "retro-market.org",
      uiScore: 68,
      seoScore: 71,
      techScore: 65,
      performanceScore: 66,
      securityScore: 75,
      mobileScore: 70,
      totalScore: 68,
      status: "completed",
      lastChecked: "1 day ago",
      issues: ["Could improve image optimization", "Missing structured data markup"],
      industry: "Marketplace",
      source: "search.ch",
    },
  ])

  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "l1",
      website: "badhair-salon.ch",
      totalScore: 35,
      mainIssue: "No SSL Certificate",
      industry: "Beauty & Wellness",
      source: "local.ch",
      leadStrength: "strong",
    },
    {
      id: "l2",
      website: "outdated-restaurant.ch",
      totalScore: 42,
      mainIssue: "Outdated UI Design",
      industry: "Food & Beverage",
      source: "search.ch",
      leadStrength: "strong",
    },
    {
      id: "l3",
      website: "slow-shop.ch",
      totalScore: 48,
      mainIssue: "Poor Performance",
      industry: "Retail",
      source: "local.ch",
      leadStrength: "medium",
    },
    {
      id: "l4",
      website: "basic-garage.ch",
      totalScore: 58,
      mainIssue: "Poor SEO Setup",
      industry: "Automotive",
      source: "search.ch",
      leadStrength: "medium",
    },
  ])

  const [isNewAnalysisModalOpen, setIsNewAnalysisModalOpen] = useState(false)

  const handleAnalyze = (url: string) => {
    const newAnalysis: Analysis = {
      id: Date.now().toString(),
      website: url,
      uiScore: 0,
      seoScore: 0,
      techScore: 0,
      performanceScore: 0,
      securityScore: 0,
      mobileScore: 0,
      totalScore: 0,
      status: "analyzing",
      lastChecked: "Just now",
      issues: [],
      source: "Manual Input",
    }
    setAnalyses([newAnalysis, ...analyses])

    // Simulate analysis completion
    setTimeout(() => {
      const uiScore = Math.floor(Math.random() * 40) + 30
      const seoScore = Math.floor(Math.random() * 40) + 30
      const techScore = Math.floor(Math.random() * 40) + 30
      const performanceScore = Math.floor(Math.random() * 40) + 30
      const securityScore = Math.floor(Math.random() * 40) + 40
      const mobileScore = Math.floor(Math.random() * 40) + 30
      const totalScore = Math.round(
        (uiScore + seoScore + techScore + performanceScore + securityScore + mobileScore) / 6,
      )

      setAnalyses((prev) =>
        prev.map((a) =>
          a.id === newAnalysis.id
            ? {
                ...a,
                uiScore,
                seoScore,
                techScore,
                performanceScore,
                securityScore,
                mobileScore,
                totalScore,
                status: "completed" as const,
                issues: ["Outdated framework version", "Poor performance metrics", "Missing SEO optimizations"],
              }
            : a,
        ),
      )
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-end">
            <Button onClick={() => setIsNewAnalysisModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <AnalysisForm onAnalyze={handleAnalyze} />
            <AnalysisTable analyses={analyses} />
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Potential Leads</h2>
                <p className="text-sm text-muted-foreground">High-priority websites that need improvement</p>
              </div>
              <PotentialLeadsTable leads={leads} />
            </div>
          </div>
          <div className="lg:sticky lg:top-8 lg:self-start">
            <AnalysisDetails analysis={analyses[0]} />
          </div>
        </div>
      </main>

      <NewAnalysisModal
        isOpen={isNewAnalysisModalOpen}
        onClose={() => setIsNewAnalysisModalOpen(false)}
        onAnalyze={handleAnalyze}
        onBulkAnalyze={(count) => {
          setIsNewAnalysisModalOpen(false)
          // Simulate bulk analysis
          for (let i = 0; i < count; i++) {
            setTimeout(() => {
              handleAnalyze(`site-${Date.now()}-${i}.ch`)
            }, i * 500)
          }
        }}
      />
    </div>
  )
}
