import { useEffect, useRef } from "react";
import { Linkedin, Github, Code, Palette } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface TeamMemberProps {
  name: string;
  role: string;
  expertise: string;
  quote: string;
  icon: React.ReactNode;
  index: number;
}

const TeamMember = ({ name, role, expertise, quote, icon, index }: TeamMemberProps) => (
  <div className="team-card group relative">
    <div className="relative p-8 rounded-2xl glass border-glow overflow-hidden hover:scale-105 transition-transform duration-500">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Animated Background Orbs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />

      <div className="relative z-10">
        {/* Avatar with Icon */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold/30 to-cyan/20 mb-6 flex items-center justify-center overflow-hidden group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
          <div className="text-gold group-hover:text-cyan transition-colors duration-500">
            {icon}
          </div>
        </div>

        {/* Info */}
        <h3 className="text-2xl font-display font-bold text-foreground mb-2 group-hover:text-gold transition-colors duration-300">
          {name}
        </h3>
        <p className="text-gold text-sm font-semibold mb-2 tracking-wide uppercase">{role}</p>
        <p className="text-muted-foreground text-sm mb-6">{expertise}</p>

        {/* Quote */}
        <blockquote className="text-muted-foreground italic border-l-2 border-gold/50 pl-4 text-sm leading-relaxed group-hover:border-cyan/50 transition-colors duration-300">
          "{quote}"
        </blockquote>

        {/* Social Links */}
        <div className="flex gap-3 mt-8">
          <a href="#" className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-gold/20 hover:text-gold hover:scale-110 transition-all duration-300">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="#" className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-cyan/20 hover:text-cyan hover:scale-110 transition-all duration-300">
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  </div>
);

const team = [
  {
    name: "Dagmawi Amare",
    role: "Founder & Lead Developer",
    expertise: "Full-Stack, AI Agents, API Integration",
    quote: "Let's build this efficiently. How can we use AI to make this smarter?",
    icon: <Code className="w-10 h-10" />,
  },
  {
    name: "Tsion Berihun",
    role: "Co-Founder & Creative Director",
    expertise: "3D Visualization, ArchViz, UI/UX",
    quote: "It needs to look premium. Let's make the user flow intuitive and beautiful.",
    icon: <Palette className="w-10 h-10" />,
  },
];

export const TeamSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header text reveal
      const headerElements = headerRef.current?.querySelectorAll(".team-header-anim");
      if (headerElements) {
        gsap.fromTo(
          headerElements,
          { opacity: 0, y: 60, filter: "blur(10px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            stagger: 0.15,
            ease: "expo.out",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Cards flip-in animation
      const cards = cardsRef.current?.querySelectorAll(".team-card");
      if (cards) {
        gsap.fromTo(
          cards,
          {
            opacity: 0,
            y: 100,
            rotateX: 45,
            scale: 0.9,
            transformPerspective: 1000,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            scale: 1,
            duration: 1,
            stagger: 0.2,
            ease: "back.out(1.5)",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Floating orbs parallax with refs
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          yPercent: 40,
          xPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }

      if (orb2Ref.current) {
        gsap.to(orb2Ref.current, {
          yPercent: -30,
          xPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 px-6 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 tibeb-pattern" />

      {/* Animated Floating Orbs with Parallax */}
      <div ref={orb1Ref} className="absolute top-20 left-20 w-64 h-64 bg-gold/5 rounded-full blur-3xl will-change-transform" />
      <div ref={orb2Ref} className="absolute bottom-20 right-20 w-96 h-96 bg-cyan/5 rounded-full blur-3xl will-change-transform" />


      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <div ref={headerRef} className="text-center mb-20">
          <span className="team-header-anim inline-block px-4 py-2 rounded-full bg-cyan/10 text-cyan text-sm font-medium mb-6">
            The Visionaries
          </span>
          <h2 className="team-header-anim text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
            Meet the{" "}
            <span className="text-gradient-cyber">Founders</span>
          </h2>
          <p className="team-header-anim text-xl text-muted-foreground max-w-2xl mx-auto">
            Two visionaries united by a mission to transform Ethiopia's digital landscape
            through innovation and creativity.
          </p>
        </div>

        {/* Team Grid - 2 columns centered */}
        <div ref={cardsRef} className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {team.map((member, index) => (
            <TeamMember key={member.name} {...member} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
