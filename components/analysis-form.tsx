"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Search, Loader2, Briefcase, MapPin, SlidersHorizontal } from "lucide-react"

interface AnalysisFormProps {
  onAnalyze: (url: string) => void
  onBulkSearch?: (
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
  ) => Promise<boolean>
  scanProgress?: { current: number; total: number } | null
}

export function AnalysisForm({ onAnalyze, onBulkSearch, scanProgress }: AnalysisFormProps) {
  const [url, setUrl] = useState("")
  const [sourceMode, setSourceMode] = useState<"manual" | "google-maps">("manual")
  const [isScanning, setIsScanning] = useState(false)

  // Search inputs
  const [industry, setIndustry] = useState("")
  const [location, setLocation] = useState("")

  const [maxRating, setMaxRating] = useState("any")
  const [minReviews, setMinReviews] = useState("")
  const [priceLevel, setPriceLevel] = useState<string[]>([])
  const [mustHavePhone, setMustHavePhone] = useState(false)
  const [maxPhotos, setMaxPhotos] = useState("any")
  const [websiteStatus, setWebsiteStatus] = useState("any")

  const [scanCount, setScanCount] = useState("25")
  const [customCount, setCustomCount] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onAnalyze(url.trim())
      setUrl("")
    }
  }

  const handleGoogleMapsScan = async () => {
    if (!industry.trim() || !location.trim()) return

    setIsScanning(true)
    const count = scanCount === "custom" ? Number.parseInt(customCount) || 10 : Number.parseInt(scanCount)

    try {
      // Call backend API via onBulkSearch callback
      if (onBulkSearch) {
        const success = await onBulkSearch(industry, location, count, {
          maxRating,
          minReviews,
          priceLevel,
          mustHavePhone,
          maxPhotos,
          websiteStatus,
        })

        if (success) {
          // Clear form on success
          setIndustry("")
          setLocation("")
          // Reset filters to defaults
          setMaxRating("any")
          setMinReviews("")
          setPriceLevel([])
          setMustHavePhone(false)
          setMaxPhotos("any")
          setWebsiteStatus("any")
        }
      } else {
        // Fallback to old behavior if onBulkSearch not provided
        for (let i = 0; i < Math.min(count, 5); i++) {
          setTimeout(() => {
            onAnalyze(`google-maps-${Date.now()}-${i}.com`)
          }, i * 300)
        }
      }
    } catch (error) {
      console.error("Scan error:", error)
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <Label className="mb-2 block text-sm font-medium text-foreground">Source Mode</Label>
          <Select value={sourceMode} onValueChange={(val) => setSourceMode(val as "manual" | "google-maps")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Single Website Scan</SelectItem>
              <SelectItem value="google-maps">Google Maps Bulk Search</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {sourceMode === "manual" ? (
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              type="url"
              placeholder="Enter website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" className="gap-2">
              <Search className="h-4 w-4" />
              Analyze
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="industry" className="mb-2 block text-sm font-medium text-foreground">
                  Branche / Keyword
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="industry"
                    placeholder="z.B. Zahnarzt, Restaurant"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location" className="mb-2 block text-sm font-medium text-foreground">
                  Stadt / Ort
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="z.B. Zürich, Berlin"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <Accordion type="single" collapsible className="rounded-lg border border-border bg-card/50">
              <AccordionItem value="filters" className="border-none">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Advanced Filters</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-6">
                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Qualität & Größe
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {/* Max Rating */}
                        <div>
                          <Label htmlFor="max-rating" className="mb-2 block text-xs font-medium text-foreground">
                            Max Rating
                          </Label>
                          <Select value={maxRating} onValueChange={setMaxRating}>
                            <SelectTrigger id="max-rating" className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              <SelectItem value="4.8">&lt; 4.8</SelectItem>
                              <SelectItem value="4.5">&lt; 4.5</SelectItem>
                              <SelectItem value="4.0">&lt; 4.0</SelectItem>
                              <SelectItem value="3.5">&lt; 3.5</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Min Reviews - Number Input */}
                        <div>
                          <Label htmlFor="min-reviews" className="mb-2 block text-xs font-medium text-foreground">
                            Min Reviews
                          </Label>
                          <Input
                            id="min-reviews"
                            type="number"
                            min="0"
                            placeholder="z.B. 10"
                            value={minReviews}
                            onChange={(e) => setMinReviews(e.target.value)}
                            className="h-9"
                          />
                        </div>

                        <div>
                          <Label className="mb-2 block text-xs font-medium text-foreground">Price Level</Label>
                          <ToggleGroup
                            type="multiple"
                            value={priceLevel}
                            onValueChange={setPriceLevel}
                            className="grid grid-cols-5 gap-1 h-9"
                            variant="outline"
                          >
                            <ToggleGroupItem value="any" aria-label="Any price" className="h-9 px-2 text-xs">
                              Any
                            </ToggleGroupItem>
                            <ToggleGroupItem value="1" aria-label="Price level 1" className="h-9 px-2 text-xs">
                              $
                            </ToggleGroupItem>
                            <ToggleGroupItem value="2" aria-label="Price level 2" className="h-9 px-2 text-xs">
                              $$
                            </ToggleGroupItem>
                            <ToggleGroupItem value="3" aria-label="Price level 3" className="h-9 px-2 text-xs">
                              $$$
                            </ToggleGroupItem>
                            <ToggleGroupItem value="4" aria-label="Price level 4" className="h-9 px-2 text-xs">
                              $$$$
                            </ToggleGroupItem>
                          </ToggleGroup>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Kontakt & Content
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-3">
                        {/* Must Have Phone Number - Switch */}
                        <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2">
                          <Label
                            htmlFor="phone-required"
                            className="text-xs font-medium text-foreground cursor-pointer"
                          >
                            Nur mit Telefonnummer
                          </Label>
                          <Switch id="phone-required" checked={mustHavePhone} onCheckedChange={setMustHavePhone} />
                        </div>

                        {/* Max Photos */}
                        <div>
                          <Label htmlFor="max-photos" className="mb-2 block text-xs font-medium text-foreground">
                            Schlechte Visuals / Wenig Fotos
                          </Label>
                          <Select value={maxPhotos} onValueChange={setMaxPhotos}>
                            <SelectTrigger id="max-photos" className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              <SelectItem value="50">&lt; 50 Fotos</SelectItem>
                              <SelectItem value="100">&lt; 100 Fotos</SelectItem>
                              <SelectItem value="200">&lt; 200 Fotos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Website Status */}
                        <div>
                          <Label htmlFor="website-status" className="mb-2 block text-xs font-medium text-foreground">
                            Website Status
                          </Label>
                          <Select value={websiteStatus} onValueChange={setWebsiteStatus}>
                            <SelectTrigger id="website-status" className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any</SelectItem>
                              <SelectItem value="has-website">Has Website</SelectItem>
                              <SelectItem value="no-website">No Website</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div>
              <Label htmlFor="scan-count" className="mb-2 block text-sm font-medium text-foreground">
                Anzahl der zu scannenden Websites
              </Label>
              <Select value={scanCount} onValueChange={setScanCount}>
                <SelectTrigger id="scan-count">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Website</SelectItem>
                  <SelectItem value="5">5 Websites</SelectItem>
                  <SelectItem value="10">10 Websites</SelectItem>
                  <SelectItem value="25">25 Websites</SelectItem>
                  <SelectItem value="50">50 Websites</SelectItem>
                  <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                </SelectContent>
              </Select>
              {scanCount === "custom" && (
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="Anzahl eingeben (1-1000)"
                  value={customCount}
                  onChange={(e) => setCustomCount(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            <Button
              onClick={handleGoogleMapsScan}
              disabled={isScanning || !industry.trim() || !location.trim()}
              className="w-full gap-2 h-11 text-base font-semibold"
              size="lg"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {scanProgress ? `Analyzing... ${scanProgress.current}/${scanProgress.total}` : "Searching Google Maps..."}
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Start Google Maps Search
                </>
              )}
            </Button>
            {scanProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Progress</span>
                  <span>
                    {scanProgress.current} / {scanProgress.total} leads
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${(scanProgress.current / scanProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
            <p className="text-center text-xs text-muted-foreground">
              {scanProgress
                ? "Results appearing in real-time below ↓"
                : "Durchsucht Google Maps nach Unternehmen mit Verbesserungspotenzial"}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
