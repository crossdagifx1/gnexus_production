import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, Send, MessageCircle, Calendar, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { trackButtonClick } from "@/lib/analytics";


gsap.registerPlugin(ScrollTrigger);

const contactMethods = [
  { icon: <MapPin className="w-5 h-5" />, label: "Location", value: "Addis Ababa, Ethiopia" },
  { icon: <Mail className="w-5 h-5" />, label: "Email", value: "hello@gnexus.et" },
  { icon: <Phone className="w-5 h-5" />, label: "Phone", value: "+251 91 234 5678" },
];

export const ContactSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const trustRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Header reveal
      const headerElements = headerRef.current?.querySelectorAll(".contact-header-anim");
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

      // Contact cards wave animation
      const cards = cardsRef.current?.querySelectorAll(".contact-card");
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
            ease: "back.out(1.5)",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // CTA buttons
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );

      // Trust badges
      const badges = trustRef.current?.querySelectorAll(".trust-badge");
      if (badges) {
        gsap.fromTo(
          badges,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "elastic.out(1, 0.5)",
            scrollTrigger: {
              trigger: trustRef.current,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Parallax orbs with refs
      if (orb1Ref.current) {
        gsap.to(orb1Ref.current, {
          yPercent: 40,
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
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-background" />

      {/* Animated Orbs with Parallax */}
      <div ref={orb1Ref} className="absolute top-1/3 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl will-change-transform" />
      <div ref={orb2Ref} className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan/5 rounded-full blur-3xl will-change-transform" />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div ref={headerRef} className="text-center mb-16">
          <span className="contact-header-anim inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Get in Touch
          </span>
          <h2 className="contact-header-anim text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
            Let's Build{" "}
            <span className="text-gradient-gold">Together</span>
          </h2>
          <p className="contact-header-anim text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to transform your digital presence? Whether you need a website,
            3D visualization, or AI automation — we're here to help.
          </p>
        </div>

        {/* Contact Cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <div
              key={method.label}
              className="contact-card group p-6 rounded-2xl glass border-glow text-center hover:scale-105 transition-all duration-500 cursor-default"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gold/20 to-cyan/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <div className="text-gold group-hover:text-cyan transition-colors duration-300">
                  {method.icon}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{method.label}</p>
              <p className="text-foreground font-medium group-hover:text-gold transition-colors duration-300">{method.value}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/contact">
            <Button
              variant="hero"
              size="xl"
              className="group"
              onClick={() => trackButtonClick('Start a Project', 'Contact Section')}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start a Project
              <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </Button>
          </Link>
          <Button
            variant="glass"
            size="xl"
            className="group"
            onClick={() => trackButtonClick('Schedule a Call', 'Contact Section')}
          >
            <Calendar className="w-5 h-5 mr-2 group-hover:text-gold transition-colors duration-300" />
            Schedule a Call
          </Button>
        </div>

        {/* Trust Badges */}
        <div ref={trustRef} className="mt-20 pt-10 border-t border-border/30">
          <p className="text-center text-muted-foreground text-sm mb-8">
            Trusted by innovative businesses across Ethiopia
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {["Telebirr", "Chapa", "SantimPay", "Yegara"].map((partner, index) => (
              <div
                key={partner}
                className="trust-badge px-6 py-3 rounded-lg bg-muted/30 text-muted-foreground font-medium hover:bg-gold/10 hover:text-gold transition-all duration-300 cursor-default"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
