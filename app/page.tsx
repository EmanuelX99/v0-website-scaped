"use client"

import { useState, useEffect } from "react"
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
  // Deep data fields
  companyName: string
  email: string
  location: string
  techStack: string[]
  hasAdsPixel: boolean
  googleSpeedScore: number
  loadingTime: string
  copyrightYear: number
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
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [isNewAnalysisModalOpen, setIsNewAnalysisModalOpen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedAnalyses = localStorage.getItem("sitescanner-analyses")
    const savedLeads = localStorage.getItem("sitescanner-leads")

    if (savedAnalyses) {
      try {
        setAnalyses(JSON.parse(savedAnalyses))
      } catch (error) {
        console.error("Failed to parse saved analyses:", error)
        setAnalyses(getDemoAnalyses())
      }
    } else {
      setAnalyses(getDemoAnalyses())
    }

    if (savedLeads) {
      try {
        setLeads(JSON.parse(savedLeads))
      } catch (error) {
        console.error("Failed to parse saved leads:", error)
        setLeads(getDemoLeads())
      }
    } else {
      setLeads(getDemoLeads())
    }

    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sitescanner-analyses", JSON.stringify(analyses))
    }
  }, [analyses, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sitescanner-leads", JSON.stringify(leads))
    }
  }, [leads, isLoaded])

  const handleAnalyze = (url: string) => {
    const newAnalysis: Analysis = {
      id: Date.now().toString(),
      website: url,
      companyName: "",
      email: "",
      location: "",
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
      techStack: [],
      hasAdsPixel: false,
      googleSpeedScore: 0,
      loadingTime: "0s",
      copyrightYear: new Date().getFullYear(),
    }
    setAnalyses([newAnalysis, ...analyses])

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
                companyName: "Example Company AG",
                email: "info@example.ch",
                location: "Zürich, Switzerland",
                uiScore,
                seoScore,
                techScore,
                performanceScore,
                securityScore,
                mobileScore,
                totalScore,
                googleSpeedScore: Math.floor(Math.random() * 60) + 20,
                loadingTime: `${(Math.random() * 4 + 1).toFixed(1)}s`,
                copyrightYear: Math.random() > 0.5 ? 2023 : 2019,
                techStack: ["WordPress", "PHP"],
                hasAdsPixel: Math.random() > 0.5,
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
            <AnalysisTable analyses={analyses} setAnalyses={setAnalyses} />
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

function getDemoAnalyses(): Analysis[] {
  return [
    {
      id: "1",
      website: "baeckerei-mueller.ch",
      companyName: "Bäckerei Müller",
      email: "info@baeckerei-mueller.ch",
      location: "Zürich, Switzerland",
      uiScore: 42,
      seoScore: 38,
      techScore: 51,
      performanceScore: 45,
      securityScore: 60,
      mobileScore: 38,
      totalScore: 44,
      status: "completed",
      lastChecked: "2 hours ago",
      techStack: ["WordPress", "WooCommerce", "jQuery"],
      hasAdsPixel: true,
      googleSpeedScore: 35,
      loadingTime: "4.8s",
      copyrightYear: 2018,
      issues: [
        "Outdated design patterns detected",
        "Poor mobile responsiveness",
        "Missing meta descriptions on 15 pages",
        "Slow page load times (avg 4.8s)",
        "LCP over 4s - Critical performance issue",
      ],
      industry: "Bakery & Food",
      source: "local.ch",
    },
    {
      id: "2",
      website: "coiffeur-elegant.ch",
      companyName: "Coiffeur Élégant",
      email: "kontakt@coiffeur-elegant.ch",
      location: "Bern, Switzerland",
      uiScore: 55,
      seoScore: 62,
      techScore: 48,
      performanceScore: 52,
      securityScore: 70,
      mobileScore: 58,
      totalScore: 55,
      status: "completed",
      lastChecked: "5 hours ago",
      techStack: ["Joomla", "Bootstrap 3"],
      hasAdsPixel: true,
      googleSpeedScore: 58,
      loadingTime: "3.2s",
      copyrightYear: 2019,
      issues: [
        "Inconsistent typography",
        "Limited accessibility features",
        "Mixed HTTP/HTTPS content",
        "No structured data for local business",
      ],
      industry: "Beauty & Wellness",
      source: "search.ch",
    },
    {
      id: "3",
      website: "metzgerei-weber.ch",
      companyName: "Metzgerei Weber AG",
      email: "weber@metzgerei-weber.ch",
      location: "Luzern, Switzerland",
      uiScore: 68,
      seoScore: 71,
      techScore: 65,
      performanceScore: 66,
      securityScore: 75,
      mobileScore: 70,
      totalScore: 68,
      status: "completed",
      lastChecked: "1 day ago",
      techStack: ["Shopify", "React"],
      hasAdsPixel: true,
      googleSpeedScore: 72,
      loadingTime: "2.1s",
      copyrightYear: 2023,
      issues: ["Could improve image optimization", "Missing structured data markup", "No FAQ schema"],
      industry: "Butcher & Meat",
      source: "Manual Input",
    },
    {
      id: "4",
      website: "garage-fischer.ch",
      companyName: "Garage Fischer",
      email: "info@garage-fischer.ch",
      location: "Basel, Switzerland",
      uiScore: 35,
      seoScore: 41,
      techScore: 38,
      performanceScore: 40,
      securityScore: 55,
      mobileScore: 32,
      totalScore: 40,
      status: "completed",
      lastChecked: "3 hours ago",
      techStack: ["Custom PHP", "jQuery"],
      hasAdsPixel: false,
      googleSpeedScore: 28,
      loadingTime: "5.6s",
      copyrightYear: 2015,
      issues: [
        "Extremely outdated design",
        "No mobile optimization",
        "Critical security vulnerabilities",
        "No SSL certificate",
        "Page speed critical - over 5s",
      ],
      industry: "Automotive",
      source: "local.ch",
    },
    {
      id: "5",
      website: "restaurant-alpenblick.ch",
      companyName: "Restaurant Alpenblick",
      email: "reservation@alpenblick.ch",
      location: "Interlaken, Switzerland",
      uiScore: 48,
      seoScore: 52,
      techScore: 45,
      performanceScore: 50,
      securityScore: 65,
      mobileScore: 46,
      totalScore: 49,
      status: "completed",
      lastChecked: "6 hours ago",
      issues: [
        "Poor image optimization",
        "No online reservation system",
        "Missing Google Business integration",
        "Slow menu page loading",
      ],
      industry: "Restaurant",
      source: "search.ch",
      techStack: [],
      hasAdsPixel: false,
      googleSpeedScore: 0,
      loadingTime: "0s",
      copyrightYear: new Date().getFullYear(),
    },
  ]
}

function getDemoLeads(): Lead[] {
  return [
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
  ]
}
