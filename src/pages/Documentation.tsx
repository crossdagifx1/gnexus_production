import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Book, ExternalLink } from "lucide-react";

const docs = [
  { title: "Getting Started with G-Nexus", desc: "Quick setup guide for new users" },
  { title: "Payment Integration Guide", desc: "Connect Telebirr, Chapa, and more" },
  { title: "API Reference", desc: "Full API documentation for developers" },
  { title: "Dashboard Customization", desc: "Personalize your G-Nexus experience" },
];

export default function Documentation() {
  return (
    <PageLayout>
      <PageHero badge="📚 Documentation" title="Documentation" subtitle="Everything you need to get the most out of G-Nexus and our services." />
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {docs.map((doc, i) => (
            <AnimatedSection key={doc.title} delay={i * 100} animation="fadeUp">
              <div className="p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-gold/50 cursor-pointer transition-all group">
                <div className="flex items-start justify-between">
                  <Book className="w-8 h-8 text-gold mb-4" />
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-gold transition-colors" />
                </div>
                <h3 className="font-display font-bold mb-2">{doc.title}</h3>
                <p className="text-sm text-muted-foreground">{doc.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
