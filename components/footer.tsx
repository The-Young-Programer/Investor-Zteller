"use client"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">Z</span>
              </div>
              <span className="font-bold">Zteller</span>
            </div>
            <p className="text-sm text-muted-foreground">Revolutionizing digital payments for student associations.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-primary transition-smooth">
                  Features
                </a>
              </li>
              <li>
                <a href="#why-invest" className="hover:text-primary transition-smooth">
                  Why Invest
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-primary transition-smooth">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-smooth">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-smooth">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-smooth">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-smooth">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-smooth">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-smooth">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Zteller. All rights reserved. | Investment opportunities subject to verification and compliance.
          </p>
        </div>
      </div>
    </footer>
  )
}
