"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">Z</span>
          </div>
          <span className="font-bold text-lg hidden sm:inline">Zteller</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-smooth">
            Features
          </a>
          <a href="#why-invest" className="text-sm font-medium hover:text-primary transition-smooth">
            Why Invest
          </a>
          <a href="#faq" className="text-sm font-medium hover:text-primary transition-smooth">
            FAQ
          </a>
          <a href="#contact" className="text-sm font-medium hover:text-primary transition-smooth">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/apply">Become an Investor</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
