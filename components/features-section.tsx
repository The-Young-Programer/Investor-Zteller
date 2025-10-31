"use client"

import { Zap, TrendingUp, Shield } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Fast Transactions",
    description: "Instant payment processing for associations with minimal friction.",
  },
  {
    icon: TrendingUp,
    title: "Growing Market",
    description: "Expanding across Nigeria universities with strong traction and adoption.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "5th level grade security protecting every transaction and user data.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in">What Zteller Does</h2>
          <p className="text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Revolutionizing payment infrastructure for student organizations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${0.1 * (idx + 1)}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
