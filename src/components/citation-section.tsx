import {
  memo,
  useState,
} from "react"
import {
  Check,
  Clipboard,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import type { CitationConfig } from "@/types/project-config"

export const CitationSection = memo(function CitationSection({
  citation,
}: {
  citation: CitationConfig
}) {
  const [copiedCitation, setCopiedCitation] = useState(false)
  const title = citation.title ?? "Citing these materials"

  const copyCitation = () => {
    void navigator.clipboard.writeText(citation.bibtex).then(() => {
      setCopiedCitation(true)
      window.setTimeout(() => setCopiedCitation(false), 1800)
    })
  }

  return (
    <section id="citation" className="scroll-mt-20">
      <div className="mt-8 mb-4">
        <h2 className="border-b pb-3 text-2xl font-semibold leading-tight text-foreground">
          {title}
        </h2>
      </div>
      {citation.text ? <p className="my-5">{citation.text}</p> : null}
      <div className="relative my-6 max-w-4xl">
        <pre className="max-h-[32rem] overflow-x-auto rounded-md border bg-muted/35 p-4 pr-28 font-mono text-[0.8rem] leading-6 text-foreground">
          <code>{citation.bibtex}</code>
        </pre>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Copy BibTeX citation"
          className="absolute right-3 top-3 bg-background/95 shadow-sm backdrop-blur"
          onClick={copyCitation}
        >
          {copiedCitation ? <Check /> : <Clipboard />}
          {copiedCitation ? "Copied" : "Copy"}
        </Button>
      </div>
    </section>
  )
})
