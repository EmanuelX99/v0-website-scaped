import Link from "next/link"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">SiteScanner</h1>
              <p className="text-sm text-muted-foreground">Find weak websites. Sell better ones.</p>
            </div>
          </Link>
          <Link href="/settings">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
