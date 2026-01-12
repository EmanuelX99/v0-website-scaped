"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Analysis } from "@/app/page"
import { Copy, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PitchModalProps {
  analysis: Analysis | null
  isOpen: boolean
  onClose: () => void
}

export function PitchModal({ analysis, isOpen, onClose }: PitchModalProps) {
  const { toast } = useToast()

  if (!analysis) return null

  const generatePitch = () => {
    const issues = []

    if (analysis.loadingTime && Number.parseFloat(analysis.loadingTime) > 3) {
      issues.push(
        `Ihre Website lädt in ${analysis.loadingTime}, was deutlich über dem empfohlenen Wert von unter 2 Sekunden liegt`,
      )
    }

    if (analysis.googleSpeedScore < 50) {
      issues.push(
        `Google PageSpeed Score von ${analysis.googleSpeedScore}/100 - Google bevorzugt schnelle Websites in den Suchergebnissen`,
      )
    }

    if (analysis.copyrightYear < 2022) {
      issues.push(`Ihr Copyright ist von ${analysis.copyrightYear}, was potenzielle Kunden abschrecken könnte`)
    }

    if (analysis.mobileScore && analysis.mobileScore < 60) {
      issues.push(`Mobile Optimierung ist mangelhaft (Score: ${analysis.mobileScore}/100)`)
    }

    const businessOpportunity = analysis.hasAdsPixel
      ? "Da Sie bereits in Online-Werbung investieren, ist es umso wichtiger, dass Ihre Website optimal konvertiert."
      : "Eine moderne Website könnte Ihre Online-Präsenz massiv verbessern und neue Kunden generieren."

    return `Betreff: Verbesserungspotential für ${analysis.companyName}

Guten Tag ${analysis.companyName} Team,

ich habe Ihre Website ${analysis.website} analysiert und dabei einige Optimierungsmöglichkeiten entdeckt:

${issues.map((issue, idx) => `${idx + 1}. ${issue}`).join("\n")}

${businessOpportunity}

Ich habe Erfahrung mit Websites in der ${analysis.industry}-Branche und könnte Ihnen eine moderne, schnelle Website erstellen, die:
- In unter 2 Sekunden lädt
- Auf allen Geräten perfekt funktioniert
- Bei Google besser rankt
- Mehr Kunden konvertiert

Hätten Sie Interesse an einem unverbindlichen Gespräch?

Beste Grüße`
  }

  const pitch = generatePitch()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pitch)
    toast({
      title: "Pitch kopiert!",
      description: "Die personalisierte Email wurde in die Zwischenablage kopiert",
    })
  }

  const openEmailClient = () => {
    const subject = encodeURIComponent(`Verbesserungspotential für ${analysis.companyName}`)
    const body = encodeURIComponent(pitch)
    window.open(`mailto:${analysis.email}?subject=${subject}&body=${body}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personalisierter Pitch - {analysis.companyName}</DialogTitle>
          <DialogDescription>Automatisch generierte Email basierend auf den erkannten Problemen</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">{pitch}</pre>
          </div>

          <div className="flex gap-2">
            <Button onClick={copyToClipboard} variant="outline" className="gap-2 flex-1 bg-transparent">
              <Copy className="h-4 w-4" />
              In Zwischenablage kopieren
            </Button>
            <Button onClick={openEmailClient} className="gap-2 flex-1">
              <Mail className="h-4 w-4" />
              Email-Client öffnen
            </Button>
          </div>

          <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Tipp:</strong> Personalisieren Sie diese Nachricht weiter, bevor Sie sie versenden. Erwähnen Sie
              spezifische Details über deren Geschäft oder zeigen Sie Portfolio-Beispiele.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
