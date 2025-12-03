/**
 * Unlock Cards Demo Page
 * 
 * Preview all unlock card variations
 * Access at: /premium/unlock-cards-demo
 */

import { PremiumAccessProvider } from "@/context/PremiumAccessContext";
import { 
  UnlockCardResource, 
  UnlockCardInsight, 
  UnlockCardChecklist, 
  UnlockCardBlog 
} from "@/components/unlock-cards";

function UnlockCardsDemoContent() {
  return (
    <div className="min-h-screen bg-background p-8 md:p-12">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Unlock Card Components Demo
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Preview all unlock card variations matching different section styles
          </p>
        </div>

        {/* 1. Resource Card Style */}
        <section className="overflow-visible">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            1. Resource Card Style (Horizontal Carousel)
          </h2>
          <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-8 pt-4 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent" style={{ overflowY: 'visible' }}>
            <div className="flex-shrink-0 w-72 md:w-80 rounded-xl border border-border/30 bg-card p-5">
              <div className="h-full flex flex-col justify-center items-center text-center">
                <div className="text-sm text-muted-foreground mb-2">Sample Resource Card</div>
                <div className="text-xs text-muted-foreground/70">w-72 md:w-80</div>
              </div>
            </div>
            <div className="flex-shrink-0 w-72 md:w-80 rounded-xl border border-border/30 bg-card p-5">
              <div className="h-full flex flex-col justify-center items-center text-center">
                <div className="text-sm text-muted-foreground mb-2">Sample Resource Card</div>
                <div className="text-xs text-muted-foreground/70">w-72 md:w-80</div>
              </div>
            </div>
            <UnlockCardResource count={5} />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Matches curated resources carousel style - same dimensions (w-72 md:w-80)
          </p>
        </section>

        {/* 2. Deep Insight Card Style */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            2. Deep Insight Card Style (Grid Layout)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="rounded-xl border border-border/30 bg-card p-5 min-h-[280px] flex flex-col justify-center items-center text-center">
              <div className="text-sm text-muted-foreground">Sample Insight Card</div>
              <div className="text-xs text-muted-foreground/70 mt-2">Grid layout</div>
            </div>
            <UnlockCardInsight count={4} />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Matches deep insights grid style - full width in grid, min-h-[280px]
          </p>
        </section>

        {/* 3. Checklist Inline Style */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            3. Checklist Inline Style (Compact)
          </h2>
          <div className="rounded-xl border border-border/30 bg-card p-6 max-w-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">Sample Checklist</h3>
            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-4 w-4 rounded border border-border flex-shrink-0" />
                <span className="text-sm text-foreground">Sample checklist item 1</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-4 w-4 rounded border border-border flex-shrink-0" />
                <span className="text-sm text-foreground">Sample checklist item 2</span>
              </div>
              <UnlockCardChecklist categoryName="User Research" count={3} />
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Compact inline style - fits within expanded checklist sections
          </p>
        </section>

        {/* 4. Blog Card Style */}
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            4. Blog/Article Card Style (Grid Layout)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="rounded-xl border border-border/30 bg-card p-5 min-h-[280px] flex flex-col justify-center items-center text-center">
              <div className="text-sm text-muted-foreground">Sample Blog Card</div>
              <div className="text-xs text-muted-foreground/70 mt-2">Grid layout</div>
            </div>
            <UnlockCardBlog count={6} />
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Matches blog/article grid style - similar to insights, with article icon
          </p>
        </section>

        {/* Usage Instructions */}
        <section className="rounded-xl border border-border/30 bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            How to View in App
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">1. Start the dev server:</strong>
              <code className="block mt-1 p-2 bg-muted rounded text-xs">npm run dev</code>
            </div>
            <div>
              <strong className="text-foreground">2. Visit this demo page:</strong>
              <code className="block mt-1 p-2 bg-muted rounded text-xs">
                http://localhost:3001/premium/unlock-cards-demo
              </code>
            </div>
            <div>
              <strong className="text-foreground">3. Or see them in action:</strong>
              <code className="block mt-1 p-2 bg-muted rounded text-xs">
                http://localhost:3001/premium/quiz
              </code>
              <div className="mt-2 text-xs">
                Complete quiz twice, then view results to see unlock cards in sections
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function UnlockCardsDemo() {
  return (
    <PremiumAccessProvider>
      <UnlockCardsDemoContent />
    </PremiumAccessProvider>
  );
}

