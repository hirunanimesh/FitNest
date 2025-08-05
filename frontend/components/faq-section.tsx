import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQSection() {
  const faqs = [
    {
      question: "How do I find gyms near me?",
      answer:
        "Use our advanced search feature to find gyms in your area. You can filter by location, amenities, pricing, and available day passes. Our interactive map shows exact locations with directions and real-time availability.",
    },
    {
      question: "How do I book a personal trainer?",
      answer:
        "Browse our network of 8,500+ certified trainers, view their profiles, specializations, and client reviews. Book directly through their available time slots and communicate through our secure platform.",
    },
    {
      question: "Can I track my fitness progress?",
      answer:
        "Our comprehensive tracking system includes BMI monitoring, weight tracking over time, workout logging, and detailed progress analytics. Set goals and watch your transformation unfold.",
    },
    {
      question: "What types of subscription plans are available?",
      answer:
        "We offer flexible plans including gym memberships, personal training packages, and combination deals. Choose from monthly, quarterly, or annual subscriptions with options to pause or modify anytime.",
    },
    {
      question: "How do I become a verified trainer or gym partner?",
      answer:
        "Submit your application with required certifications and documentation. Our verification team reviews all applications within 48-72 hours to ensure quality standards and safety compliance.",
    },
    {
      question: "Is there a mobile app available?",
      answer:
        "Yes! Download the FitNest mobile app from the App Store or Google Play. Access all features on-the-go including gym check-ins, trainer bookings, progress tracking, and workout plans.",
    },
  ]

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-4 text-black">Frequently Asked Questions</h2>
        <p className="text-center text-black mb-12">
          Get answers to common questions about FitNest and start your fitness journey with confidence.
        </p>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-gray-200">
              <AccordionTrigger className="text-left text-black hover:text-primary">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-black">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
