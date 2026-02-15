import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Book, ExternalLink, Search, Code, CreditCard, LayoutDashboard, Settings, terminal, FileText, ChevronRight } from "lucide-react";
import { Badge, Button, GradientText, Input, InteractiveCard, Tag, EmptyState } from "@/components/ui";
import { CategoryTabs } from "@/components/CategoryTabs";

const docCategories = ["All", "Getting Started", "Payments", "API", "Platform"];

const docs = [
  {
    id: 1,
    title: "Quick Start Guide",
    desc: "Set up your G-Nexus account and launch your first project in minutes.",
    category: "Getting Started",
    icon: <BaseIcon icon={Rocket} color="gold" />,
    readTime: "5 min"
  },
  {
    id: 2,
    title: "Payment Integration",
    desc: "Connect Telebirr, Chapa, and SantimPay with zero code.",
    category: "Payments",
    icon: <BaseIcon icon={CreditCard} color="cyan" />,
    readTime: "10 min"
  },
  {
    id: 3,
    title: "API Reference",
    desc: "Complete documentation for the G-Nexus REST and GraphQL APIs.",
    category: "API",
    icon: <BaseIcon icon={Code} color="success" />,
    readTime: "15 min"
  },
  {
    id: 4,
    title: "Dashboard Customization",
    desc: "Personalize your admin dashboard widgets and layout.",
    category: "Platform",
    icon: <BaseIcon icon={LayoutDashboard} color="gold" />,
    readTime: "8 min"
  },
  {
    id: 5,
    title: "User Management",
    desc: "Manage team members, roles, and permissions securely.",
    category: "Platform",
    icon: <BaseIcon icon={Users} color="cyan" />,
    readTime: "6 min"
  },
  {
    id: 6,
    title: "Webhooks & Events",
    desc: "Listen to real-time events and trigger automated workflows.",
    category: "API",
    icon: <BaseIcon icon={Zap} color="success" />,
    readTime: "12 min"
  }
];

// Helper for icons since we can't use JSX in the object directly without importing icons
import { Rocket, Users, Zap } from "lucide-react";

function BaseIcon({ icon: Icon, color }: { icon: any, color: string }) {
  const colorClasses = {
    gold: "text-gold bg-gold/10",
    cyan: "text-cyan bg-cyan/10",
    success: "text-success bg-success/10",
  };
  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses] || "text-primary bg-primary/10"}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
}

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredDocs = docs.filter(doc => {
    const matchesCategory = selectedCategory === "All" || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative py-20 px-6 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Badge variant="cyan" className="mb-4">
            <Book className="w-3 h-3 mr-1" /> Documentation
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <GradientText from="cyan" to="success" animated as="h1">
              Developer Hub
            </GradientText>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Everything you need to build, deploy, and scale with G-Nexus.
          </p>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="py-12 px-6 bg-muted/10 sticky top-[60px] z-20 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 focus:bg-background transition-colors"
                />
              </div>
              <CategoryTabs
                categories={docCategories}
                defaultCategory="All"
                onChange={setSelectedCategory}
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Docs Grid */}
      <section className="py-16 px-6 min-h-[60vh]">
        <div className="max-w-6xl mx-auto">
          {filteredDocs.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-16 h-16" />}
              title="No documentation found"
              description="Try adjusting your search query or browse by category."
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc, i) => (
                <AnimatedSection key={doc.id} delay={i * 50} animation="fadeUp">
                  <InteractiveCard hover="lift" className="h-full flex flex-col p-6 group">
                    <div className="flex items-start justify-between mb-4">
                      {doc.icon}
                      <Tag variant="outline" size="sm" className="text-muted-foreground">
                        {doc.readTime}
                      </Tag>
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2 group-hover:text-cyan transition-colors">
                      {doc.title}
                    </h3>
                    <p className="text-sm text-text-secondary mb-6 flex-1">
                      {doc.desc}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                      <Tag size="sm" variant="cyan" className="bg-cyan/5 border-cyan/20">
                        {doc.category}
                      </Tag>
                      <span className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-cyan transition-colors">
                        Read Guide <ChevronRight className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  </InteractiveCard>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Help CTA */}
      <section className="py-20 px-6">
        <AnimatedSection>
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-success/10 to-cyan/10 rounded-2xl p-8 md:p-12 border border-success/20 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Can't find what you're looking for?</h2>
              <p className="text-muted-foreground">Our support team is available 24/7 to help you with any technical implementation.</p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline">Join Community</Button>
              <Button variant="default">Contact Support</Button>
            </div>
          </div>
        </AnimatedSection>
      </section>
    </PageLayout>
  );
}
