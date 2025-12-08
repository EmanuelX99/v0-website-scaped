"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Search, ArrowUpDown } from "lucide-react"
import type { Lead } from "@/app/page"
import { ReportModal } from "@/components/report-modal"

interface PotentialLeadsTableProps {
  leads: Lead[]
}

export function PotentialLeadsTable({ leads }: PotentialLeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [strengthFilter, setStrengthFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<"totalScore" | "website">("totalScore")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const getLeadStrengthBadge = (strength: Lead["leadStrength"]) => {
    const styles = {
      weak: "bg-chart-4/10 text-chart-4 border-chart-4/20",
      medium: "bg-accent/10 text-accent border-accent/20",
      strong: "bg-primary/10 text-primary border-primary/20",
    }
    return styles[strength]
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-primary"
    if (score >= 50) return "text-chart-4"
    return "text-destructive"
  }

  const filteredLeads = leads
    .filter((lead) => {
      const matchesSearch =
        lead.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.industry.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStrength = strengthFilter === "all" || lead.leadStrength === strengthFilter
      return matchesSearch && matchesStrength
    })
    .sort((a, b) => {
      const multiplier = sortDirection === "asc" ? 1 : -1
      if (sortField === "totalScore") {
        return (a.totalScore - b.totalScore) * multiplier
      }
      return a.website.localeCompare(b.website) * multiplier
    })

  const toggleSort = (field: "totalScore" | "website") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="border-b border-border bg-muted/50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={strengthFilter} onValueChange={setStrengthFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by strength" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Strengths</SelectItem>
                <SelectItem value="strong">Strong</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="weak">Weak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => toggleSort("website")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Website
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <button
                    onClick={() => toggleSort("totalScore")}
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    Total Score
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Main Issue
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Industry
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Lead Strength
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{lead.website}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-bold ${getScoreColor(lead.totalScore)}`}>{lead.totalScore}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{lead.mainIssue}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{lead.industry}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{lead.source}</td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant="outline" className={getLeadStrengthBadge(lead.leadStrength)}>
                      {lead.leadStrength.charAt(0).toUpperCase() + lead.leadStrength.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)} className="gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Report
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ReportModal lead={selectedLead} isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} />
    </>
  )
}
