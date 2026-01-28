import { useEffect, useRef } from "react";
import { Sparkles, Github, Linkedin, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const footerLinks = {
  Services: [
    { label: "Web Development", href: "/web-development" },
    { label: "3D & Architecture", href: "/3d-architecture" },
    { label: "AI Automation", href: "/ai-automation" },
    { label: "G-Nexus Platform", href: "/gnexus" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Team", href: "/team" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
  ],
  Support: [
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
    { label: "Documentation", href: "/documentation" },
    { label: "Status", href: "/status" },
  ],
};

const socialLinks = [
  { icon: <Twitter className="w-5 h-5" />, href: "#", label: "Twitter" },
  { icon: <Linkedin className="w-5 h-5" />, href: "#", label: "LinkedIn" },
  { icon: <Github className="w-5 h-5" />, href: "#", label: "GitHub" },
  { icon: <Instagram className="w-5 h-5" />, href: "#", label: "Instagram" },
];

export const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      // Brand section reveal
      gsap.fromTo(
        brandRef.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      // Link columns stagger
      const columns = linksRef.current?.querySelectorAll(".link-column");
      if (columns) {
        gsap.fromTo(
          columns,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: linksRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Social links bounce in
      const socials = brandRef.current?.querySelectorAll(".social-link");
      if (socials) {
        gsap.fromTo(
          socials,
          { opacity: 0, scale: 0 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: brandRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Parallax orbs with refs
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          yPercent: -30,
          ease: "none",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }

      if (orb2Ref.current) {
        gsap.to(orb2Ref.current, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 2,
          },
        });
      }

    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={footerRef} className="relative py-20 px-6 border-t border-border/50 overflow-hidden">
      {/* Background Elements with Parallax */}
      <div ref={orb1Ref} className="absolute top-0 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl will-change-transform" />
      <div ref={orb2Ref} className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan/5 rounded-full blur-3xl will-change-transform" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div ref={brandRef} className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-gold-glow flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <span className="text-background font-display font-bold text-xl">G</span>
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-cyan" />
              </div>
              <div>
                <span className="font-display font-bold text-2xl text-foreground">G-Nexus</span>
                <p className="text-xs text-muted-foreground">by G-Squad</p>
              </div>
            </Link>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-sm">
              Building Ethiopia's digital infrastructure through the fusion of
              ancient wisdom and futuristic technology. Join us in shaping the future.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="social-link w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-gold/20 hover:text-gold hover:scale-110 transition-all duration-300"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div ref={linksRef} className="lg:col-span-3 grid grid-cols-3 gap-8">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category} className="link-column">
                <h4 className="font-display font-bold text-foreground mb-6">{category}</h4>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-gold transition-colors duration-300 text-sm inline-flex items-center gap-2 group"
                      >
                        <span className="w-0 h-0.5 bg-gold group-hover:w-3 transition-all duration-300" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2026 G-Nexus. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Made with <span className="text-gold animate-pulse">♥</span> in
            <span className="text-gold">Addis Ababa</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
