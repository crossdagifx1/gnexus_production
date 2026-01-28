import { useEffect, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { gsap } from "gsap";

const faqs = [
  { q: "What services does G-Squad offer?", a: "We offer web development, 3D visualization, AI automation, and our flagship G-Nexus platform for Ethiopian SMEs." },
  { q: "How much does a typical project cost?", a: "Project costs vary based on scope. Contact us for a free consultation and custom quote." },
  { q: "Do you support local payment methods?", a: "Yes! G-Nexus integrates with Telebirr, Chapa, and SantimPay for seamless Ethiopian payments." },
  { q: "How long does a project take?", a: "Timelines vary: websites take 2-4 weeks, 3D projects 1-2 weeks, and AI solutions 4-8 weeks." },
  { q: "Do you offer ongoing support?", a: "Absolutely! We offer maintenance packages and priority support for all our clients." },
];

export default function FAQ() {
  return (
    <PageLayout>
      <PageHero badge="❓ FAQ" title="Frequently Asked Questions" subtitle="Find answers to common questions about our services, pricing, and process." />
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border border-border/50 rounded-xl px-6 bg-muted/20">
                  <AccordionTrigger className="font-display font-bold hover:no-underline">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </section>
    </PageLayout>
  );
}
