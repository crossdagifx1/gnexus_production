import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { CheckCircle2, AlertCircle } from "lucide-react";

const services = [
  { name: "G-Nexus Platform", status: "operational" },
  { name: "API Services", status: "operational" },
  { name: "Payment Processing", status: "operational" },
  { name: "AI Features", status: "operational" },
];

export default function Status() {
  return (
    <PageLayout>
      <PageHero badge="🟢 Status" title="System Status" subtitle="Real-time status of G-Nexus services and infrastructure." />
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <AnimatedSection>
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center mb-8">
              <p className="text-green-400 font-bold">All Systems Operational</p>
            </div>
          </AnimatedSection>
          <div className="space-y-4">
            {services.map((service, i) => (
              <AnimatedSection key={service.name} delay={i * 100} animation="fadeUp">
                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between">
                  <span className="font-medium">{service.name}</span>
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm capitalize">{service.status}</span>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
