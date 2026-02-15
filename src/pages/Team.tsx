import { useEffect, useRef, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Github, Linkedin, Twitter, Globe, Link as LinkIcon, User } from "lucide-react";
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { nexus, type TeamMember } from '@/lib/api/nexus-core';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

gsap.registerPlugin(ScrollTrigger);

const defaultTeam: any[] = [
  {
    name: "Alex Cross",
    role: "Founder & Lead Architect",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
    bio: "Visionary developer with a passion for AI and immersive web experiences. Building the future of digital interaction.",
    social: [
      { platform: "twitter", url: "#" },
      { platform: "github", url: "#" },
      { platform: "linkedin", url: "#" }
    ]
  },
  {
    name: "Sarah Chen",
    role: "AI Research Lead",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces",
    bio: "Specializing in natural language processing and agentic workflows. Turning complex AI models into practical tools.",
    social: [
      { platform: "linkedin", url: "#" },
      { platform: "website", url: "#" }
    ]
  },
  {
    name: "Marcus Johnson",
    role: "3D Visualizer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces",
    bio: "Award-winning 3D artist creating photorealistic environments and architectural visualizations.",
    social: [
      { platform: "instagram", url: "#" },
      { platform: "artstation", url: "#" }
    ]
  },
  {
    name: "Elena Rodriguez",
    role: "UX/UI Designer",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces",
    bio: "Crafting intuitive and beautiful digital interfaces. Obsessed with micro-interactions and user delight.",
    social: [
      { platform: "dribbble", url: "#" },
      { platform: "linkedin", url: "#" }
    ]
  }
];

const SocialIconRenderer = ({ platform }: { platform: string }) => {
  const p = platform.toLowerCase();
  if (p.includes('twitter') || p.includes('x')) return <Twitter className="w-5 h-5" />;
  if (p.includes('github')) return <Github className="w-5 h-5" />;
  if (p.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
  if (p.includes('website') || p.includes('globe')) return <Globe className="w-5 h-5" />;
  return <LinkIcon className="w-5 h-5" />;
}

export default function Team() {
  const containerRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [team, setTeam] = useState<TeamMember[]>(defaultTeam as any);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const data = await nexus.getTeamMembers();
        if (data && data.length > 0) {
          setTeam(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchTeam();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Team cards - staggered reveal
      const cards = teamRef.current?.querySelectorAll('.team-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 50, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: teamRef.current,
              start: "top 75%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // CTA parallax
      if (ctaRef.current) {
        gsap.fromTo(ctaRef.current,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ctaRef.current,
              start: "top 80%"
            }
          }
        )
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <PageLayout>
        <PageHero
          badge="👥 The Team"
          title="Meet the Minds"
          subtitle="A collective of developers, designers, and AI specialists united by a passion for innovation."
        />

        <section className="py-24 px-6">
          <div ref={teamRef} className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <AnimatedSection key={member.id || index} delay={index * 100} animation="scaleUp">
                <div className="team-card group relative bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
                  {/* Image/Avatar wrapper */}
                  <div className="aspect-square w-full overflow-hidden bg-muted relative">
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={member.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                        <User className="w-20 h-20 opacity-20" />
                      </div>
                    )}

                    {/* Social Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                      {(member.social_links || (member as any).social)?.map((link: any, i: number) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-primary transition-colors transform hover:scale-110"
                        >
                          <SocialIconRenderer platform={link.platform} />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                    <p className="text-primary text-sm font-medium mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm line-clamp-4">{member.bio}</p>

                    {/* Skills pills if available */}
                    {member.skills && member.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {member.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>

        <section className="py-24 px-6 bg-muted/20">
          <div ref={ctaRef} className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Join Our Team</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              We're always looking for talented individuals to join our mission.
              If you're passionate about AI and web technologies, we'd love to hear from you.
            </p>
            <a href="/contact" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
              Get in Touch
            </a>
          </div>
        </section>

      </PageLayout>
    </div>
  );
}
