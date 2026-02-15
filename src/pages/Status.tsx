import { PageLayout } from "@/components/PageLayout";
import { AnimatedSection } from "@/components/AnimatedSection";
import { CheckCircle2, AlertCircle, Clock, Activity, Server, Zap, Shield, Database } from "lucide-react";
import { Badge, GradientText, StatCard, Timeline, GlassCard } from "@/components/ui";

const services = [
  { name: "G-Nexus Platform", status: "operational", icon: <Zap className="w-4 h-4" /> },
  { name: "API Gateway", status: "operational", icon: <Server className="w-4 h-4" /> },
  { name: "Database Clusters", status: "operational", icon: <Database className="w-4 h-4" /> },
  { name: "Payment Processing", status: "operational", icon: <Shield className="w-4 h-4" /> },
  { name: "AI Inference Engine", status: "degraded", icon: <Activity className="w-4 h-4" />, message: "High latency on deepseek-r1" },
  { name: "Storage Systems", status: "operational", icon: <Server className="w-4 h-4" /> },
];

const incidents = [
  {
    id: 1,
    title: "AI Model Latency",
    description: "We are currently investigating reports of higher than usual latency for the AI chat service.",
    timestamp: "Today, 10:45 AM",
    status: "investigating",
    icon: <AlertCircle className="w-4 h-4 text-warning" />
  },
  {
    id: 2,
    title: "Scheduled Maintenance",
    description: "Completed database optimization and security patching.",
    timestamp: "Yesterday, 2:00 AM",
    status: "completed",
    icon: <CheckCircle2 className="w-4 h-4 text-success" />
  },
  {
    id: 3,
    title: "API Rate Limiting Update",
    description: "Successfully rolled out new rate limiting rules for free tier users.",
    timestamp: "Feb 10, 4:30 PM",
    status: "completed",
    icon: <CheckCircle2 className="w-4 h-4 text-success" />
  }
];

export default function Status() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative py-20 px-6 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <Badge variant="success" dot pulse className="mb-4">
            All Systems Operational
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <GradientText from="success" to="cyan" animated as="h1">
              System Status
            </GradientText>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Real-time performance metrics and operational status of G-Nexus services.
          </p>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard
            label="System Uptime"
            value="99.98%"
            trend="up"
            variant="success"
            icon={<Activity className="w-5 h-5" />}
            animated
          />
          <StatCard
            label="API Response"
            value="45ms"
            trend="neutral"
            variant="cyan"
            icon={<Zap className="w-5 h-5" />}
            animated
          />
          <StatCard
            label="Active Connections"
            value="1,240"
            trend="up"
            variant="gold"
            icon={<Server className="w-5 h-5" />}
            animated
          />
          <StatCard
            label="Avg. CPU Load"
            value="32%"
            trend="down"
            variant="default"
            icon={<Database className="w-5 h-5" />}
            animated
          />
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">

          {/* Service Status List */}
          <div className="lg:col-span-2">
            <AnimatedSection>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Server className="w-6 h-6 text-gold" /> Service Status
              </h2>
              <div className="space-y-4">
                {services.map((service, i) => (
                  <GlassCard key={service.name} variant="subtle" className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${service.status === 'operational' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {service.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        {service.message && <p className="text-xs text-warning mt-1">{service.message}</p>}
                      </div>
                    </div>
                    <Badge
                      variant={service.status === 'operational' ? 'success' : 'warning'}
                      dot
                      pulse={service.status !== 'operational'}
                    >
                      {service.status === 'operational' ? 'Operational' : 'Degraded Perf'}
                    </Badge>
                  </GlassCard>
                ))}
              </div>
            </AnimatedSection>
          </div>

          {/* Incident History & Maintenance */}
          <div className="space-y-8">
            <AnimatedSection delay={200}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-cyan" /> Recent Incidents
              </h2>
              <GlassCard variant="default" className="p-6">
                {incidents.map((incident, i) => (
                  <div key={incident.id} className="relative pl-6 pb-6 border-l border-border last:pb-0">
                    <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-border" />
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-sm">{incident.title}</h3>
                      <span className="text-xs text-muted-foreground">{incident.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{incident.description}</p>
                    <Badge variant={incident.status === 'investigating' ? 'warning' : 'success'} size="sm">
                      {incident.status}
                    </Badge>
                  </div>
                ))}
              </GlassCard>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <GlassCard variant="subtle" className="p-6 border-gold/30 bg-gold/5">
                <h3 className="font-bold text-gold mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Upcoming Maintenance
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Scheduled system upgrades will take place on Saturday, Feb 20th at 03:00 UTC. Expected downtime: 15 mins.
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Sat, Feb 20</span>
                  <span>03:00 - 03:15 UTC</span>
                </div>
              </GlassCard>
            </AnimatedSection>
          </div>

        </div>
      </section>
    </PageLayout>
  );
}
