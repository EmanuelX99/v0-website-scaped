"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Loader2 } from "lucide-react"

interface NewAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  onAnalyze: (url: string) => void
  onBulkAnalyze: (count: number) => void
}

export function NewAnalysisModal({ isOpen, onClose, onAnalyze, onBulkAnalyze }: NewAnalysisModalProps) {
  const [url, setUrl] = useState("")
  const [sourceMode, setSourceMode] = useState<"manual" | "directory">("manual")
  const [isProcessing, setIsProcessing] = useState(false)
  const [dataSources, setDataSources] = useState({
    localCh: true,
    searchCh: false,
  })
  const [industry, setIndustry] = useState("")
  const [location, setLocation] = useState("")
  const [scanCount, setScanCount] = useState("25")
  const [customCount, setCustomCount] = useState("")

  const handleStartAnalysis = () => {
    setIsProcessing(true)

    if (sourceMode === "manual" && url.trim()) {
      onAnalyze(url.trim())
      setTimeout(() => {
        setIsProcessing(false)
        onClose()
        setUrl("")
      }, 500)
    } else if (sourceMode === "directory") {
      const count = scanCount === "custom" ? Number.parseInt(customCount) || 10 : Number.parseInt(scanCount)
      onBulkAnalyze(count)
      setTimeout(() => {
        setIsProcessing(false)
      }, 1000)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Analysis</DialogTitle>
        </DialogHeader>

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
            <div>
              <Label htmlFor="modal-url" className="mb-2 block text-sm font-medium text-foreground">
                Website URL
              </Label>
              <Input
                id="modal-url"
                type="url"
                placeholder="Enter website URL (e.g., example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block text-sm font-medium text-foreground">Data Sources</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="modal-local-ch"
                      checked={dataSources.localCh}
                      onCheckedChange={(checked) => setDataSources({ ...dataSources, localCh: checked as boolean })}
                    />
                    <Label htmlFor="modal-local-ch" className="text-sm text-foreground">
                      local.ch
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="modal-search-ch"
                      checked={dataSources.searchCh}
                      onCheckedChange={(checked) => setDataSources({ ...dataSources, searchCh: checked as boolean })}
                    />
                    <Label htmlFor="modal-search-ch" className="text-sm text-foreground">
                      search.ch
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="modal-industry" className="mb-2 block text-sm font-medium text-foreground">
                    Industry Filter
                  </Label>
                  <Input
                    id="modal-industry"
                    placeholder="e.g., Restaurants"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="modal-location" className="mb-2 block text-sm font-medium text-foreground">
                    Location Filter
                  </Label>
                  <Input
                    id="modal-location"
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
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleStartAnalysis} disabled={isProcessing} className="gap-2">
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
