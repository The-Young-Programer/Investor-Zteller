"use client"

export function WhyInvestSection() {
  return (
    <section id="why-invest" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Why Invest in Zteller</h2>

          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                  <span className="text-primary font-bold">1</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Strong Market Traction</h3>
                <p className="text-muted-foreground">
                  Zteller is experiencing rapid adoption across different Universities with month over month growth
                  exceeding 40%.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-secondary/10">
                  <span className="text-secondary font-bold">2</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Untapped Market Potential</h3>
                <p className="text-muted-foreground">
                  Millions of students across Nigeria represent a massive addressable market with minimal competition.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                  <span className="text-primary font-bold">3</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Experienced Team</h3>
                <p className="text-muted-foreground">
                  Led by fintech veterans with proven track records in building and scaling payment platforms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
