import { useEffect, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { SkillProgressBar } from "@/components/SkillProgressBar";
import { FloatingParticles } from "@/components/FloatingParticles";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { Code, Palette, Linkedin, Twitter, Github, Globe, Coffee, Lightbulb, Users, Heart } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const team = [
  {
    name: "Dagmawi Amare",
    role: "Lead Developer & Co-Founder",
    icon: <Code className="w-8 h-8" />,
    bio: "Full-Stack wizard with 5+ years of experience. AI enthusiast who automates the boring stuff. Passionate about building scalable solutions for Ethiopian businesses.",
    skills: [
      { name: "React/TypeScript", level: 95 },
      { name: "Node.js/Python", level: 90 },
      { name: "AI/ML Integration", level: 85 },
      { name: "System Architecture", level: 88 },
    ],
    quote: "Technology should empower, not complicate. Every line of code I write is for Ethiopia's digital future.",
    social: { linkedin: "#", twitter: "#", github: "#" },
    funFact: "Consumes 5+ cups of Ethiopian coffee daily",
  },
  {
    name: "Tsion Berihun",
    role: "Creative Director & Co-Founder",
    icon: <Palette className="w-8 h-8" />,
    bio: "3D visualization expert and pixel perfectionist with an eye for detail. Design is in the details, and every detail tells a story of Ethiopian excellence.",
    skills: [
      { name: "3D Modeling/Rendering", level: 98 },
      { name: "UI/UX Design", level: 92 },
      { name: "Motion Graphics", level: 88 },
      { name: "Brand Strategy", level: 85 },
    ],
    quote: "Great design bridges cultures. I blend Habesha aesthetics with modern minimalism to create timeless experiences.",
    social: { linkedin: "#", twitter: "#", github: "#" },
    funFact: "Has a collection of 200+ traditional patterns",
  },
];

const teamValues = [
  { icon: <Lightbulb className="w-6 h-6" />, title: "Innovation First", desc: "We challenge conventions and embrace creative solutions." },
  { icon: <Users className="w-6 h-6" />, title: "Collaboration", desc: "The best ideas emerge from diverse perspectives working together." },
  { icon: <Heart className="w-6 h-6" />, title: "Passion", desc: "We genuinely care about the success of every project and client." },
  { icon: <Coffee className="w-6 h-6" />, title: "Ethiopian Pride", desc: "We celebrate our heritage while building for the future." },
];

const dayInLife = [
  { time: "6:00 AM", activity: "Morning coffee ceremony & planning", emoji: "☕" },
  { time: "8:00 AM", activity: "Team standup & priority alignment", emoji: "🎯" },
  { time: "9:00 AM", activity: "Deep work: coding, designing, creating", emoji: "💻" },
  { time: "12:00 PM", activity: "Lunch & cultural exchange", emoji: "🍽️" },
  { time: "2:00 PM", activity: "Client meetings & collaboration", emoji: "🤝" },
  { time: "5:00 PM", activity: "Review, iterate, improve", emoji: "🔄" },
  { time: "6:00 PM", activity: "Learning & skill development", emoji: "📚" },
];

const testimonials = [
  { quote: "Working with Dagi and Tsion transformed our business. Their attention to detail and understanding of Ethiopian market is unmatched.", author: "Abebe Kebede", role: "CEO", company: "TechEthiopia", rating: 5 },
  { quote: "The G-Squad team delivered beyond expectations. They're not just developers, they're true partners in success.", author: "Sara Hailu", role: "Founder", company: "Addis Eats", rating: 5 },
  { quote: "Professional, creative, and deeply committed to quality. The best tech team in Ethiopia, hands down.", author: "Yonas Tadesse", role: "CTO", company: "PayEthio", rating: 5 },
];

export default function Team() {
  const containerRef = useRef<HTMLDivElement>(null);
  const membersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Team member cards - alternating slide effect
      const memberCards = membersRef.current?.querySelectorAll('.team-member-card');
      if (memberCards) {
        memberCards.forEach((card, index) => {
          const isEven = index % 2 === 0;
          gsap.fromTo(
            card,
            { opacity: 0, x: isEven ? -60 : 60, y: 30 },
            {
              opacity: 1,
              x: 0,
              y: 0,
              duration: 0.9,
              delay: index * 0.2,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none none',
              },
            }
          );
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <PageLayout>
        <PageHero
          badge="👥 Our Team"
          title="Meet the Squad"
          subtitle="Two expert founders united by a shared vision: to digitize Ethiopia's future with world-class technology and design."
        />

        {/* Team Values */}
        <section className="py-16 px-6 border-y border-border/30">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {teamValues.map((value, i) => (
              <AnimatedSection key={value.title} delay={i * 100} animation="fadeUp">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold mx-auto mb-3">
                    {value.icon}
                  </div>
                  <h3 className="font-display font-bold text-sm mb-1">{value.title}</h3>
                  <p className="text-xs text-muted-foreground">{value.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>

        {/* Team Members */}
        <section className="py-24 px-6 relative">
          <FloatingParticles count={10} color="mixed" />
          <div ref={membersRef} className="max-w-6xl mx-auto space-y-24">
            {team.map((member, i) => (
              <AnimatedSection key={member.name} delay={i * 200} animation={i % 2 === 0 ? "fadeLeft" : "fadeRight"}>
                <div className={`team-member-card grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                  {/* Profile Card */}
                  <div className={`order-2 ${i % 2 === 1 ? "lg:order-1" : "lg:order-2"}`}>
                    <div className="group p-8 rounded-3xl bg-muted/30 border border-border/50 hover:border-gold/50 transition-all">
                      <div className="flex items-start gap-6">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold/20 to-cyan/20 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                          {member.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-2xl">{member.name}</h3>
                          <p className="text-gold text-sm mb-3">{member.role}</p>
                          <p className="text-muted-foreground text-sm">{member.bio}</p>
                          <div className="flex gap-3 mt-4">
                            <a href={member.social.linkedin} className="p-2 rounded-lg bg-muted/50 hover:bg-gold/20 transition-colors">
                              <Linkedin className="w-4 h-4" />
                            </a>
                            <a href={member.social.twitter} className="p-2 rounded-lg bg-muted/50 hover:bg-gold/20 transition-colors">
                              <Twitter className="w-4 h-4" />
                            </a>
                            <a href={member.social.github} className="p-2 rounded-lg bg-muted/50 hover:bg-gold/20 transition-colors">
                              <Github className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Quote */}
                      <blockquote className="mt-6 p-4 rounded-xl bg-background/50 border-l-2 border-gold italic text-sm text-muted-foreground">
                        "{member.quote}"
                      </blockquote>

                      {/* Fun Fact */}
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <span className="text-gold">⚡</span>
                        <span className="text-muted-foreground">Fun fact: {member.funFact}</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className={`order-1 ${i % 2 === 1 ? "lg:order-2" : "lg:order-1"}`}>
                    <h4 className="font-display font-bold text-lg mb-6">Core Expertise</h4>
                    <div className="space-y-5">
                      {member.skills.map((skill, j) => (
                        <SkillProgressBar
                          key={skill.name}
                          label={skill.name}
                          percentage={skill.level}
                          color={j % 2 === 0 ? "gold" : "cyan"}
                          delay={j * 100}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>

        {/* A Day in the Life */}
        <section className="py-24 px-6 bg-muted/10">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="font-display font-bold text-3xl text-center mb-4">A Day at G-Squad</h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">How we blend Ethiopian traditions with modern productivity.</p>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {dayInLife.map((item, i) => (
                <AnimatedSection key={item.time} delay={i * 100} animation="scaleUp">
                  <div className="p-4 rounded-xl bg-card/50 border border-border/50 hover:border-gold/30 transition-colors text-center">
                    <span className="text-3xl mb-2 block">{item.emoji}</span>
                    <p className="text-gold font-mono text-sm mb-1">{item.time}</p>
                    <p className="text-sm text-muted-foreground">{item.activity}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <h2 className="font-display font-bold text-3xl text-center mb-4">What Clients Say</h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">Real feedback from businesses we've helped transform.</p>
            </AnimatedSection>
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>

        {/* Join CTA */}
        <section className="py-24 px-6">
          <AnimatedSection>
            <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-gold/10 to-cyan/5 border border-gold/20">
              <Globe className="w-12 h-12 text-gold mx-auto mb-6" />
              <h2 className="font-display font-bold text-3xl mb-4">Want to Join the Squad?</h2>
              <p className="text-muted-foreground mb-6">We're always looking for passionate builders who share our vision for Ethiopia's digital future.</p>
              <a href="/careers" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold text-background font-medium hover:scale-105 transition-transform">
                View Open Positions
              </a>
            </div>
          </AnimatedSection>
        </section>
      </PageLayout>
    </div>
  );
}
