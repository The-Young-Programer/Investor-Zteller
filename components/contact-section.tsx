"use client"

import { Button } from "@/components/ui/button"
import { Mail, MessageCircle } from "lucide-react"

export function ContactSection() {
  return (
    <section id="contact" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-lg text-muted-foreground mb-12">
            Have questions? Our team is here to help you get started.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <a href="mailto:investors@zteller.ng" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Us
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a
                href="https://wa.me/2348156622466"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Chat
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
