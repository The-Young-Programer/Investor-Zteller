"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is the minimum investment amount?",
    answer:
      "The minimum investment is ₦25,000. We offer flexible investment tiers: ₦25k, ₦50k, ₦100k, ₦250k, ₦500k, or custom amounts.",
  },
  {
    question: "What are the investment terms?",
    answer:
      "You can choose investment durations of 3, 6, or 12 months. Your projected returns are calculated based on your investment amount and duration.",
  },
  // {
  //   question: "How are returns calculated?",
  //   answer:
  //     "Returns are calculated using a monthly ROI of 3.5%. Your projected return = Investment Amount × (1 + (0.035 × Duration in Months)).",
  // },
  {
    question: "How do I make my investment?",
    answer:
      "After completing the application form, you'll receive our business account details. Transfer your investment and upload proof of payment for verification.",
  },
  {
    question: "When will I receive my returns?",
    answer:
      "After your investment term completes, our team will process your returns. We'll contact you with payment details and next steps.",
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center animate-fade-in">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-muted-foreground mb-12 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Everything you need to know about investing with Zteller
          </p>

          <Accordion type="single" collapsible className="w-full animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left font-semibold hover:text-primary transition-all duration-300 hover:pl-2">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
