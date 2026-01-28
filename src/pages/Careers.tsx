import { useEffect, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { FloatingParticles } from "@/components/FloatingParticles";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { Button } from "@/components/ui/button";
import { Rocket, Heart, Coffee, Globe, Zap, BookOpen, Users, Clock, MapPin, Briefcase, GraduationCap, Wifi, Dumbbell, Plane, DollarSign, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { CategoryTabs } from "@/components/CategoryTabs";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const benefits = [
  { icon: <Coffee className="w-6 h-6" />, title: "Free Ethiopian Coffee", desc: "Unlimited access to premium Ethiopian coffee daily" },
  { icon: <Wifi className="w-6 h-6" />, title: "Remote Flexibility", desc: "Work from anywhere with flexible hours" },
  { icon: <BookOpen className="w-6 h-6" />, title: "Learning Budget", desc: "$500/year for courses, books, and conferences" },
  { icon: <Dumbbell className="w-6 h-6" />, title: "Health & Wellness", desc: "Gym membership and mental health support" },
  { icon: <Plane className="w-6 h-6" />, title: "Paid Time Off", desc: "25 days PTO plus Ethiopian holidays" },
  { icon: <DollarSign className="w-6 h-6" />, title: "Competitive Salary", desc: "Top-tier Ethiopian tech salaries + bonuses" },
  { icon: <Users className="w-6 h-6" />, title: "Team Events", desc: "Monthly team outings and annual retreats" },
  { icon: <GraduationCap className="w-6 h-6" />, title: "Career Growth", desc: "Clear paths for advancement and mentorship" },
];

const positions = [
  { title: "Senior React Developer", type: "Full-time", location: "Addis Ababa / Remote", department: "Engineering", description: "Build cutting-edge web applications for Ethiopian businesses.", requirements: ["5+ years React experience", "TypeScript proficiency", "API integration skills"] },
  { title: "3D Artist / ArchViz Specialist", type: "Full-time", location: "Addis Ababa", department: "Design", description: "Create stunning 3D visualizations for architectural projects.", requirements: ["Expert in Blender/3DS Max", "Strong portfolio", "Attention to detail"] },
  { title: "AI/ML Engineer", type: "Contract", location: "Remote", department: "Engineering", description: "Integrate AI capabilities into our G-Nexus platform.", requirements: ["Python/TensorFlow experience", "NLP knowledge", "Production ML systems"] },
  { title: "Product Designer", type: "Full-time", location: "Addis Ababa / Remote", department: "Design", description: "Shape the user experience of Ethiopian digital products.", requirements: ["UI/UX expertise", "Figma proficiency", "User research skills"] },
  { title: "Business Development Manager", type: "Full-time", location: "Addis Ababa", department: "Business", description: "Drive partnerships and growth across East Africa.", requirements: ["Sales experience", "Tech industry knowledge", "Strong network"] },
];

const applicationProcess = [
  { step: 1, title: "Apply Online", desc: "Submit your resume and portfolio", duration: "5 min" },
  { step: 2, title: "Initial Screen", desc: "Quick call to discuss your background", duration: "30 min" },
  { step: 3, title: "Technical Challenge", desc: "Practical task relevant to the role", duration: "2-4 hrs" },
  { step: 4, title: "Team Interview", desc: "Meet the team and culture fit", duration: "1 hr" },
  { step: 5, title: "Offer", desc: "Receive your offer and join!", duration: "🎉" },
];

const employeeTestimonials = [
  { quote: "Joining G-Squad was the best career decision I made. The culture here genuinely values innovation and personal growth.", author: "Hana M.", role: "Senior Developer", rating: 5 },
  { quote: "I've worked at many companies, but nowhere else has the same family feel combined with world-class technical challenges.", author: "Dawit T.", role: "Designer", rating: 5 },
  { quote: "The learning opportunities are incredible. I've grown more in one year here than in my previous five years combined.", author: "Meron A.", role: "AI Engineer", rating: 5 },
];

const cultureValues = [
  { title: "Ship Fast, Learn Faster", desc: "We value velocity and iteration over perfection", icon: <Rocket /> },
  { title: "Default to Transparency", desc: "Open communication and shared context", icon: <Globe /> },
  { title: "Own Your Impact", desc: "Everyone has the power to shape our direction", icon: <Zap /> },
  { title: "Celebrate Wins", desc: "We recognize achievements big and small", icon: <Heart /> },
];

const stats = [
  { value: 95, suffix: "%", label: "Employee Satisfaction" },
  { value: 2, suffix: " weeks", label: "Avg. Hiring Time" },
  { value: 4.9, suffix: "/5", label: "Glassdoor Rating" },
  { value: 15, suffix: "+", label: "Countries Represented" },
];

export default function Careers() {
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const departments = ["All", "Engineering", "Design", "Business"];

  const filteredPositions = selectedDepartment === "All"
    ? positions
    : positions.filter(p => p.department === selectedDepartment);

  return (
    <PageLayout>
      <PageHero
        badge="🚀 Careers"
        title="Join the Squad"
        subtitle="Help us build Ethiopia's digital future. We're looking for passionate builders who want to make an impact."
      />

      {/* Stats */}
      <section className="py-16 px-6 border-y border-border/30 relative overflow-hidden">
        <FloatingParticles count={12} color="gold" />
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 100} animation="scaleUp">
              <div className="text-center">
                <div className="font-display font-bold text-3xl md:text-4xl text-gold mb-1">
                  {typeof stat.value === "number" && stat.value % 1 === 0 ? (
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  ) : (
                    <span>{stat.value}{stat.suffix}</span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <h2 className="font-display font-bold text-3xl text-center mb-4">Why Work With Us</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">We invest in our team because your success is our success.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <AnimatedSection key={benefit.title} delay={i * 75} animation="fadeUp">
                <div className="group p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-gold/50 transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-4 group-hover:scale-110 transition-transform">
                    {benefit.icon}
                  </div>
                  <h3 className="font-display font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-24 px-6 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <h2 className="font-display font-bold text-3xl text-center mb-4">Our Culture</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">The principles that guide how we work together.</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cultureValues.map((value, i) => (
              <AnimatedSection key={value.title} delay={i * 100} animation="scaleUp">
                <div className="text-center p-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold/20 to-cyan/10 flex items-center justify-center text-gold mx-auto mb-4">
                    {value.icon}
                  </div>
                  <h3 className="font-display font-bold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Life at G-Squad Gallery */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <h2 className="font-display font-bold text-3xl text-center mb-12">Life at G-Squad</h2>
          </AnimatedSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["☕ Coffee Ceremonies", "💻 Hackathons", "🎉 Team Celebrations", "📚 Learning Sessions", "🏔️ Team Retreats", "🎮 Game Nights", "🍽️ Lunch & Learns", "🌍 Remote Work"].map((item, i) => (
              <AnimatedSection key={item} delay={i * 75} animation="scaleUp">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 flex items-center justify-center hover:border-gold/30 transition-colors group">
                  <span className="text-2xl group-hover:scale-125 transition-transform">{item}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-24 px-6 bg-muted/10">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <h2 className="font-display font-bold text-3xl text-center mb-4">How to Join</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Our streamlined hiring process gets you from application to offer in under 2 weeks.</p>
          </AnimatedSection>
          <div className="flex flex-col md:flex-row gap-4">
            {applicationProcess.map((step, i) => (
              <AnimatedSection key={step.step} delay={i * 100} animation="fadeUp" className="flex-1">
                <div className="relative p-6 rounded-2xl bg-card/50 border border-border/50 text-center h-full">
                  <div className="w-10 h-10 rounded-full bg-gold text-background font-bold flex items-center justify-center mx-auto mb-4">
                    {step.step}
                  </div>
                  <h3 className="font-display font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{step.desc}</p>
                  <span className="text-xs text-gold">{step.duration}</span>
                  {i < applicationProcess.length - 1 && (
                    <ArrowRight className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 z-10" />
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Employee Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h2 className="font-display font-bold text-3xl text-center mb-4">From Our Team</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Hear what it's really like to work at G-Squad.</p>
          </AnimatedSection>
          <TestimonialCarousel testimonials={employeeTestimonials} />
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-24 px-6 bg-muted/10">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h2 className="font-display font-bold text-3xl text-center mb-4">Open Positions</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">Find your perfect role and help us build the future.</p>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <CategoryTabs
              categories={departments}
              defaultCategory="All"
              onChange={setSelectedDepartment}
              className="mb-8"
            />
          </AnimatedSection>

          <div className="space-y-4">
            {filteredPositions.map((pos, i) => (
              <AnimatedSection key={pos.title} delay={i * 100} animation="fadeUp">
                <div className="p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-gold/50 transition-all group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display font-bold text-lg group-hover:text-gold transition-colors">{pos.title}</h3>
                        <span className="px-2 py-1 text-xs rounded-full bg-gold/10 text-gold">{pos.department}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {pos.type}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {pos.location}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{pos.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {pos.requirements.map((req, j) => (
                          <span key={j} className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3 h-3 text-gold" /> {req}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link to="/contact">
                      <Button variant="gold" className="group-hover:scale-105 transition-transform">
                        Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* No Perfect Fit CTA */}
      <section className="py-24 px-6">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-gold/10 to-cyan/5 border border-gold/20">
            <h2 className="font-display font-bold text-3xl mb-4">Don't See a Perfect Fit?</h2>
            <p className="text-muted-foreground mb-6">We're always looking for exceptional talent. Send us your resume and let's explore how you can contribute to Ethiopia's digital future.</p>
            <Link to="/contact">
              <Button variant="gold" size="lg">
                Send Open Application
              </Button>
            </Link>
          </div>
        </AnimatedSection>
      </section>
    </PageLayout>
  );
}
