"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SettingsIcon, Database, Sliders, CheckCircle2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function SettingsPage() {
  // Data Sources state
  const [dataSources, setDataSources] = useState({
    localCh: true,
    searchCh: true,
    swissDirectories: false,
  })
  const [industry, setIndustry] = useState("")
  const [location, setLocation] = useState("")
  const [scrapeCount, setScrapeCount] = useState("25")
  const [customCount, setCustomCount] = useState("")

  // Scoring Weights state
  const [weights, setWeights] = useState({
    ui: 20,
    tech: 20,
    seo: 20,
    performance: 15,
    security: 15,
    mobile: 10,
  })

  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  const totalWeight = Object.values(weights).reduce((sum, val) => sum + val, 0)
  const isValidWeights = totalWeight === 100

  const handleWeightChange = (key: keyof typeof weights, value: number[]) => {
    setWeights({ ...weights, [key]: value[0] })
    setShowError(false)
  }

  const handleSaveSettings = () => {
    if (!isValidWeights) {
      setShowError(true)
      return
    }
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-foreground" />
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>
          <p className="text-muted-foreground">Configure data sources, scoring weights, and analysis preferences</p>
        </div>

        {showSuccess && (
          <Alert className="mb-6 border-primary/50 bg-primary/10">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">Settings saved successfully!</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Data Sources Panel */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Data Sources</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="mb-4 block text-sm font-medium text-foreground">Active Sources</Label>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="local-ch" className="text-sm text-foreground">
                      local.ch
                    </Label>
                    <Switch
                      id="local-ch"
                      checked={dataSources.localCh}
                      onCheckedChange={(checked) => setDataSources({ ...dataSources, localCh: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="search-ch" className="text-sm text-foreground">
                      search.ch
                    </Label>
                    <Switch
                      id="search-ch"
                      checked={dataSources.searchCh}
                      onCheckedChange={(checked) => setDataSources({ ...dataSources, searchCh: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="swiss-dir" className="text-sm text-foreground">
                      Swiss Company Directories
                    </Label>
                    <Switch
                      id="swiss-dir"
                      checked={dataSources.swissDirectories}
                      onCheckedChange={(checked) => setDataSources({ ...dataSources, swissDirectories: checked })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="industry" className="mb-2 block text-sm font-medium text-foreground">
                  Industry Filter
                </Label>
                <Input
                  id="industry"
                  placeholder="e.g., Restaurants, Retail, Hotels"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="location" className="mb-2 block text-sm font-medium text-foreground">
                  Location Filter
                </Label>
                <Input
                  id="location"
                  placeholder="e.g., Zurich, Bern, Geneva"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-2 block text-sm font-medium text-foreground">Websites per Scan</Label>
                <div className="space-y-3">
                  <Select value={scrapeCount} onValueChange={setScrapeCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 websites</SelectItem>
                      <SelectItem value="25">25 websites</SelectItem>
                      <SelectItem value="50">50 websites</SelectItem>
                      <SelectItem value="100">100 websites</SelectItem>
                      <SelectItem value="250">250 websites</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {scrapeCount === "custom" && (
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      placeholder="Enter custom count (1-1000)"
                      value={customCount}
                      onChange={(e) => setCustomCount(e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Scoring Weights Panel */}
          <Card className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Scoring Weights</h2>
            </div>

            <div className="space-y-6">
              {[
                { key: "ui" as const, label: "UI/Design Score" },
                { key: "tech" as const, label: "Technical Score" },
                { key: "seo" as const, label: "SEO Score" },
                { key: "performance" as const, label: "Performance Score" },
                { key: "security" as const, label: "Security Score" },
                { key: "mobile" as const, label: "Mobile-Friendly Score" },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-foreground">{label}</Label>
                    <span className="text-sm font-semibold text-foreground">{weights[key]}%</span>
                  </div>
                  <Slider
                    value={[weights[key]]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => handleWeightChange(key, value)}
                  />
                </div>
              ))}

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Total Weight</span>
                  <span className={`text-lg font-bold ${isValidWeights ? "text-primary" : "text-destructive"}`}>
                    {totalWeight}%
                  </span>
                </div>
                {!isValidWeights && <p className="text-xs text-destructive">Total must equal 100%</p>}
              </div>

              {showError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>Please adjust weights to total 100% before saving.</AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg bg-card p-4 ring-1 ring-border">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Formula
                </p>
                <p className="text-sm leading-relaxed text-foreground">
                  Total = (UI × {weights.ui}%) + (Tech × {weights.tech}%) + (SEO × {weights.seo}%) + (Performance ×{" "}
                  {weights.performance}%) + (Security × {weights.security}%) + (Mobile × {weights.mobile}%)
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button onClick={handleSaveSettings} size="lg" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </main>
    </div>
  )
}
