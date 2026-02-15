import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge, Button, GradientText, Input, Tag, EmptyState } from "@/components/ui";
import { Search, HelpCircle, Mail, Inbox } from "lucide-react";
import { CategoryTabs } from "@/components/CategoryTabs";

const faqData = [
  {
    category: "General",
    questions: [
      { q: "What services does G-Squad offer?", a: "We offer web development, 3D visualization, AI automation, and our flagship G-Nexus platform for Ethiopian SMEs." },
      { q: "Do you offer ongoing support?", a: "Absolutely! We offer maintenance packages and priority support for all our clients." },
      { q: "What makes G-Squad different?", a: "We're a local Ethiopian team with global standards, deep understanding of local payment systems, and expertise in modern tech." },
    ]
  },
  {
    category: "Pricing",
    questions: [
      { q: "How much does a typical project cost?", a: "Project costs vary based on scope. Contact us for a free consultation and custom quote." },
      { q: "Do you offer payment plans?", a: "Yes! We offer flexible payment plans tailored to Ethiopian businesses, including milestone-based payments." },
      { q: "Are there any hidden fees?", a: "Never! We believe in transparent pricing. All costs are outlined upfront in our proposals." },
    ]
  },
  {
    category: "Technical",
    questions: [
      { q: "Do you support local payment methods?", a: "Yes! G-Nexus integrates with Telebirr, Chapa, and SantimPay for seamless Ethiopian payments." },
      { q: "Can you integrate with existing systems?", a: "Absolutely! We specialize in API integrations and can connect with virtually any existing system." },
      { q: "What technologies do you use?", a: "We use modern tech stacks: React, TypeScript, Node.js, PostgreSQL, and cutting-edge AI tools." },
    ]
  },
  {
    category: "Timeline",
    questions: [
      { q: "How long does a project take?", a: "Timelines vary: websites take 2-4 weeks, 3D projects 1-2 weeks, and AI solutions 4-8 weeks." },
      { q: "Can you work with tight deadlines?", a: "Yes! We offer priority development for urgent projects. Contact us to discuss your timeline." },
      { q: "Do you provide project updates?", a: "Yes! We provide weekly progress reports and have milestone reviews throughout the project." },
    ]
  },
  {
    category: "G-Nexus",
    questions: [
      { q: "What is G-Nexus?", a: "G-Nexus is our flagship AI-powered platform for Ethiopian SMEs, offering automation, payments, and business tools." },
      { q: "How much does G-Nexus cost?", a: "We offer flexible pricing starting from 1,000 ETB/month. Contact us for a custom quote based on your needs." },
      { q: "Can I try G-Nexus for free?", a: "Yes! We offer a 14-day free trial with full access to explore all features." },
    ]
  }
];

export default function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Flatten all questions for filtering
  const allQuestions = faqData.flatMap(cat =>
    cat.questions.map(q => ({ ...q, category: cat.category }))
  );

  // Filter questions
  const filteredQuestions = allQuestions.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["All", ...faqData.map(c => c.category)];

  return (
    <PageLayout>
      {/* Custom Hero */}
      <section className="relative py-20 px-6 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Badge variant="gold" className="mb-4">
            <HelpCircle className="w-3 h-3 mr-1" /> FAQ
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <GradientText from="gold" to="cyan" animated as="h1">
              Frequently Asked Questions
            </GradientText>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Find answers to common questions about our services, pricing, and process.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-12 px-6 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <CategoryTabs
                categories={categories}
                defaultCategory="All"
                onChange={setSelectedCategory}
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          {filteredQuestions.length === 0 ? (
            <EmptyState
              icon={<Inbox className="w-16 h-16" />}
              title="No questions found"
              description="Try adjusting your search or category filter to find what you're looking for."
              action={
                <Button
                  variant="outline"
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <AnimatedSection>
              <Accordion type="single" collapsible className="space-y-4">
                {filteredQuestions.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="border border-border/50 rounded-xl px-6 bg-muted/20 hover:border-gold/30 transition-colors"
                  >
                    <AccordionTrigger className="font-display font-bold hover:no-underline hover:text-gold">
                      <div className="flex items-start gap-3 text-left">
                        <Tag variant="outline" size="sm" className="flex-shrink-0">
                          {item.category}
                        </Tag>
                        <span>{item.q}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pl-[4.5rem]">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-gold/10 via-background to-cyan/10">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto text-center">
            <Mail className="w-12 h-12 text-gold mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Still Have <GradientText from="gold" to="cyan">Questions?</GradientText>
            </h2>
            <p className="text-muted-foreground mb-8">
              Our team is here to help! Get in touch and we'll respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg">
                Contact Support
              </Button>
              <Button variant="outline" size="lg">
                Schedule a Call
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </PageLayout>
  );
}
