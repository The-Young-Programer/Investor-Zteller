import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ApplicationForm } from "@/components/application-form"

export default function ApplyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Become an Investor</h1>
            <p className="text-lg text-muted-foreground">
              Join our community of forward thinking investors backing the future of digital payments.
            </p>
          </div>
          <ApplicationForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
