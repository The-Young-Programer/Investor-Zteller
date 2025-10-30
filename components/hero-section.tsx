"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-muted rounded-full animate-fade-in">
            <p className="text-sm font-medium text-primary">Invest in Innovation</p>
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold mb-6 text-balance leading-tight animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Invest in the future of{" "}
            <span className="gradient-primary bg-clip-text text-transparent">digital payments</span> for student
            associations
          </h1>

          <p
            className="text-lg md:text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            Join forward-thinking investors backing Zteller's mission to revolutionize payment solutions for student
            organizations across Africa.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <Link href="/apply" className="flex items-center gap-2">
                Become an Investor
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="transition-all duration-300 hover:scale-105 hover:shadow-lg bg-transparent"
            >
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
