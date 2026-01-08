"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Loader2 } from "lucide-react"

interface AnalysisFormProps {
  onAnalyze: (url: string) => void
}

export function AnalysisForm({ onAnalyze }: AnalysisFormProps) {
  const [url, setUrl] = useState("")
  const [sourceMode, setSourceMode] = useState<"manual" | "google-maps">("manual")
  const [isScanning, setIsScanning] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [scanCount, setScanCount] = useState("25")
  const [customCount, setCustomCount] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onAnalyze(url.trim())
      setUrl("")
    }
  }

  const handleGoogleMapsScan = () => {
    if (!searchQuery.trim()) return

    setIsScanning(true)
    const count = scanCount === "custom" ? Number.parseInt(customCount) || 10 : Number.parseInt(scanCount)

    // Simulate scanning
    setTimeout(() => {
      // Add placeholder analyses
      for (let i = 0; i < Math.min(count, 5); i++) {
        setTimeout(() => {
          onAnalyze(`google-maps-${Date.now()}-${i}.com`)
        }, i * 300)
      }
      setIsScanning(false)
      setSearchQuery("")
    }, 1000)
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
          <div className="space-y-4">
            <div>
              <Label htmlFor="search-query" className="mb-2 block text-sm font-medium text-foreground">
                Search Query
              </Label>
              <Input
                id="search-query"
                placeholder='e.g., "Maler Zürich", "Restaurants in Berlin", "Hotels London"'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Enter any Google Maps search term (business type + location)
              </p>
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

            <Button
              onClick={handleGoogleMapsScan}
              disabled={isScanning || !searchQuery.trim()}
              className="w-full gap-2"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching Google Maps...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Start Google Maps Search
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}
