"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Loader2 } from "lucide-react"

interface AnalysisFormProps {
  onAnalyze: (url: string) => void
}

export function AnalysisForm({ onAnalyze }: AnalysisFormProps) {
  const [url, setUrl] = useState("")
  const [sourceMode, setSourceMode] = useState<"manual" | "directory">("manual")
  const [isScanning, setIsScanning] = useState(false)
  const [dataSources, setDataSources] = useState({
    localCh: true,
    searchCh: false,
  })
  const [industry, setIndustry] = useState("")
  const [location, setLocation] = useState("")
  const [scanCount, setScanCount] = useState("25")
  const [customCount, setCustomCount] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onAnalyze(url.trim())
      setUrl("")
    }
  }

  const handleDirectoryScan = () => {
    setIsScanning(true)
    const count = scanCount === "custom" ? Number.parseInt(customCount) || 10 : Number.parseInt(scanCount)

    // Simulate scanning
    setTimeout(() => {
      // Add placeholder analyses
      for (let i = 0; i < Math.min(count, 5); i++) {
        setTimeout(() => {
          onAnalyze(`directory-site-${Date.now()}-${i}.ch`)
        }, i * 300)
      }
      setIsScanning(false)
    }, 1000)
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <Label className="mb-2 block text-sm font-medium text-foreground">Source Mode</Label>
          <Select value={sourceMode} onValueChange={(val) => setSourceMode(val as "manual" | "directory")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual Input</SelectItem>
              <SelectItem value="directory">Directory Scraping</SelectItem>
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
          <div className="space-y-4">
            <div>
              <Label className="mb-3 block text-sm font-medium text-foreground">Data Sources</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="local-ch"
                    checked={dataSources.localCh}
                    onCheckedChange={(checked) => setDataSources({ ...dataSources, localCh: checked as boolean })}
                  />
                  <Label htmlFor="local-ch" className="text-sm text-foreground">
                    local.ch
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="search-ch"
                    checked={dataSources.searchCh}
                    onCheckedChange={(checked) => setDataSources({ ...dataSources, searchCh: checked as boolean })}
                  />
                  <Label htmlFor="search-ch" className="text-sm text-foreground">
                    search.ch
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="industry-filter" className="mb-2 block text-sm font-medium text-foreground">
                  Industry Filter
                </Label>
                <Input
                  id="industry-filter"
                  placeholder="e.g., Restaurants"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location-filter" className="mb-2 block text-sm font-medium text-foreground">
                  Location Filter
                </Label>
                <Input
                  id="location-filter"
                  placeholder="e.g., Zurich"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium text-foreground">Number of Websites</Label>
              <div className="space-y-3">
                <Select value={scanCount} onValueChange={setScanCount}>
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
                {scanCount === "custom" && (
                  <Input
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="Enter count (1-1000)"
                    value={customCount}
                    onChange={(e) => setCustomCount(e.target.value)}
                  />
                )}
              </div>
            </div>

            <Button onClick={handleDirectoryScan} disabled={isScanning} className="w-full gap-2">
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Start Scan
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
