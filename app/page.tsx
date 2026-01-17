"use client"

import { useState, useEffect } from "react"
import { flushSync } from "react-dom"
import { Header } from "@/components/header"
import { AnalysisForm } from "@/components/analysis-form"
import { AnalysisTable } from "@/components/analysis-table"
import { AnalysisDetails } from "@/components/analysis-details"
import { PotentialLeadsTable } from "@/components/potential-leads-table"
import { NewAnalysisModal } from "@/components/new-analysis-modal"
import { Button } from "@/components/ui/button"
import { Plus, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

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
  phone?: string
  location: string
  techStack: string[]
  hasAdsPixel: boolean
  googleSpeedScore: number
  loadingTime: string
  copyrightYear: number
  companySize?: string
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
  const [scanProgress, setScanProgress] = useState<{ current: number; total: number } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

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
      phone: "",
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
      source: "Google Maps",
      techStack: [],
      hasAdsPixel: false,
      googleSpeedScore: 0,
      loadingTime: "0s",
      copyrightYear: new Date().getFullYear(),
      companySize: "",
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

      const companySizes = ["1-10", "11-50", "50+"]
      const industries = ["Construction", "Retail", "Healthcare", "Technology", "Hospitality", "Manufacturing"]
      const randomCompanySize = companySizes[Math.floor(Math.random() * companySizes.length)]
      const randomIndustry = industries[Math.floor(Math.random() * industries.length)]

      setAnalyses((prev) =>
        prev.map((a) =>
          a.id === newAnalysis.id
            ? {
                ...a,
                companyName: "Example Company AG",
                email: "info@example.ch",
                phone: Math.random() > 0.3 ? "+41 44 123 45 67" : undefined,
                location: "Zürich, Switzerland",
                companySize: randomCompanySize,
                industry: randomIndustry,
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

  const handleBulkSearch = async (
    industry: string,
    location: string,
    targetResults: number,
    filters: {
      maxRating: string
      minReviews: string
      priceLevel: string[]
      mustHavePhone: boolean
      maxPhotos: string
      websiteStatus: string
    }
  ) => {
    try {
      console.log("Starting streaming bulk search...", { industry, location, targetResults, filters })

      // Prepare request body matching BulkScanRequest schema
      const requestBody = {
        industry,
        location,
        targetResults,
        filters: {
          maxRating: filters.maxRating,
          minReviews: filters.minReviews ? parseInt(filters.minReviews) : 0,
          priceLevel: filters.priceLevel,
          mustHavePhone: filters.mustHavePhone,
          maxPhotos: filters.maxPhotos,
          websiteStatus: filters.websiteStatus,
        },
      }

      console.log("Request body:", JSON.stringify(requestBody, null, 2))

      // Get auth token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert("Not authenticated. Please log in.")
        return false
      }

      // Initialize progress
      setScanProgress({ current: 0, total: targetResults })

      // Use EventSource for streaming results
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const url = new URL(`${apiUrl}/api/v1/analyses/bulk-search-stream`)
      
      // Create a promise to handle the streaming
      return new Promise<boolean>((resolve, reject) => {
        // Use fetch for POST with SSE
        fetch(url.toString(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,  // Add auth token
          },
          body: JSON.stringify(requestBody),
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`API error: ${response.status} ${response.statusText}`)
            }

            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (!reader) {
              throw new Error("No response body")
            }

            let completedCount = 0

            // Read the stream
            while (true) {
              const { done, value } = await reader.read()

              if (done) {
                console.log("Stream complete!")
                resolve(true)
                break
              }

              // Decode the chunk
              const chunk = decoder.decode(value, { stream: true })
              const lines = chunk.split("\n")

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    console.log("🔴 SSE event received:", data.type, data.progress || "")

                    if (data.type === "status") {
                      console.log("🔵 Status:", data.message)
                    } else if (data.type === "lead") {
                      // Convert backend response to frontend Analysis format
                      const lead = data.data
                      const newAnalysis: Analysis = {
                        id: lead.id,
                        website: lead.website,
                        companyName: lead.companyName,
                        email: lead.email,
                        phone: lead.phone,
                        location: lead.location,
                        industry: lead.industry,
                        companySize: lead.companySize,
                        uiScore: lead.uiScore,
                        seoScore: lead.seoScore,
                        techScore: lead.techScore,
                        performanceScore: lead.performanceScore,
                        securityScore: lead.securityScore,
                        mobileScore: lead.mobileScore,
                        totalScore: lead.totalScore,
                        status: lead.status,
                        lastChecked: lead.lastChecked,
                        issues: lead.issues,
                        source: lead.source,
                        techStack: lead.techStack,
                        hasAdsPixel: lead.hasAdsPixel,
                        googleSpeedScore: lead.googleSpeedScore,
                        loadingTime: lead.loadingTime,
                        copyrightYear: lead.copyrightYear,
                      }

                      // Add to analyses in real-time (force immediate render)
                      flushSync(() => {
                        setAnalyses((prev) => [newAnalysis, ...prev])
                      })

                      // Add to leads if low score
                      if (newAnalysis.totalScore < 60) {
                        const newLead: Lead = {
                          id: newAnalysis.id,
                          website: newAnalysis.website,
                          totalScore: newAnalysis.totalScore,
                          mainIssue: newAnalysis.issues[0] || "Needs improvement",
                          industry: newAnalysis.industry || "Unknown",
                          source: newAnalysis.source || "Google Maps",
                          leadStrength: (newAnalysis.totalScore < 40
                            ? "strong"
                            : newAnalysis.totalScore < 50
                              ? "medium"
                              : "weak") as "weak" | "medium" | "strong",
                        }
                        setLeads((prev) => [newLead, ...prev])
                      }

                      completedCount++
                      
                      // Update progress (force immediate render with flushSync)
                      const newProgress = { current: completedCount, total: data.progress.target }
                      console.log("🟢 Updating progress:", newProgress)
                      flushSync(() => {
                        setScanProgress(newProgress)
                      })
                      
                      console.log(
                        `✅ Lead ${completedCount}/${data.progress.target} added: ${newAnalysis.companyName || newAnalysis.website}`,
                      )
                      
                      // Small delay to ensure UI updates are visible
                      await new Promise(resolve => setTimeout(resolve, 50))
                    } else if (data.type === "complete") {
                      console.log(`🟢 Search complete! Total found: ${data.totalFound}`)
                      if (data.status === "partial" && data.message) {
                        alert(data.message)
                      }
                      console.log("🔴 Clearing progress")
                      setScanProgress(null) // Clear progress
                      resolve(true)
                      break
                    } else if (data.type === "error") {
                      throw new Error(data.message)
                    }
                  } catch (e) {
                    console.error("Failed to parse SSE data:", e)
                  }
                }
              }
            }
          })
          .catch((error) => {
            console.error("Streaming error:", error)
            setScanProgress(null) // Clear progress on error
            alert(`Search failed: ${error instanceof Error ? error.message : "Unknown error"}`)
            reject(error)
          })
      })
    } catch (error) {
      console.error("Bulk search error:", error)
      setScanProgress(null) // Clear progress on error
      alert(`Search failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      return false
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button onClick={() => setIsNewAnalysisModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Analysis
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <AnalysisForm onAnalyze={handleAnalyze} onBulkSearch={handleBulkSearch} scanProgress={scanProgress} />
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
      phone: "+41 44 321 54 76",
      location: "Zürich, Switzerland",
      companySize: "1-10",
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
      source: "Google Maps",
    },
    {
      id: "2",
      website: "coiffeur-elegant.ch",
      companyName: "Coiffeur Élégant",
      email: "kontakt@coiffeur-elegant.ch",
      phone: "+41 31 456 78 90",
      location: "Bern, Switzerland",
      companySize: "11-50",
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
      source: "Google Maps",
    },
    {
      id: "3",
      website: "metzgerei-weber.ch",
      companyName: "Metzgerei Weber AG",
      email: "weber@metzgerei-weber.ch",
      phone: "+41 41 789 12 34",
      location: "Luzern, Switzerland",
      companySize: "50+",
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
      phone: undefined,
      location: "Basel, Switzerland",
      companySize: "1-10",
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
      source: "Google Maps",
    },
    {
      id: "5",
      website: "restaurant-alpenblick.ch",
      companyName: "Restaurant Alpenblick",
      email: "reservation@alpenblick.ch",
      phone: "+41 33 654 32 10",
      location: "Interlaken, Switzerland",
      companySize: "11-50",
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
      source: "Google Maps",
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
      source: "Google Maps",
      leadStrength: "strong",
    },
    {
      id: "l2",
      website: "outdated-restaurant.ch",
      totalScore: 42,
      mainIssue: "Outdated UI Design",
      industry: "Food & Beverage",
      source: "Google Maps",
      leadStrength: "strong",
    },
    {
      id: "l3",
      website: "slow-shop.ch",
      totalScore: 48,
      mainIssue: "Poor Performance",
      industry: "Retail",
      source: "Google Maps",
      leadStrength: "medium",
    },
    {
      id: "l4",
      website: "basic-garage.ch",
      totalScore: 58,
      mainIssue: "Poor SEO Setup",
      industry: "Automotive",
      source: "Google Maps",
      leadStrength: "medium",
    },
  ]
}
