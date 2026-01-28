import { useEffect, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contactInfoRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Contact info items - slide in from left
      const contactItems = contactInfoRef.current?.querySelectorAll('.contact-item');
      if (contactItems) {
        gsap.fromTo(
          contactItems,
          { opacity: 0, x: -40 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: contactInfoRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Form fields - sequential reveal
      const formInputs = formRef.current?.querySelectorAll('input, textarea');
      if (formInputs) {
        gsap.fromTo(
          formInputs,
          { opacity: 0, y: 20, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: formRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Submit button - pulse effect
      const submitButton = formRef.current?.querySelector('button');
      if (submitButton) {
        gsap.fromTo(
          submitButton,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: 0.4,
            ease: 'elastic.out(1, 0.6)',
            scrollTrigger: {
              trigger: formRef.current,
              start: 'top 75%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef}>
      <PageLayout>
        <PageHero badge="📬 Contact" title="Let's Build Together" subtitle="Have a project in mind? We'd love to hear from you. Reach out and let's create something extraordinary." />
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
            <AnimatedSection animation="fadeUp">
              <div ref={contactInfoRef} className="space-y-8">
                <div><h3 className="font-display font-bold text-2xl mb-6">Get in Touch</h3><p className="text-muted-foreground">Ready to start your digital transformation journey? Fill out the form and we'll get back to you within 24 hours.</p></div>
                <div className="space-y-4">
                  {[{ icon: <Mail />, label: "hello@gnexuset.com" }, { icon: <Phone />, label: "+251 91 234 5678" }, { icon: <MapPin />, label: "Addis Ababa, Ethiopia" }].map((item, i) => (
                    <div key={i} className="contact-item flex items-center gap-3"><div className="p-2 rounded-lg bg-gold/10 text-gold">{item.icon}</div><span>{item.label}</span></div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="fadeUp" delay={200}>
              <form ref={formRef} className="p-8 rounded-3xl bg-muted/30 border border-border/50 space-y-6">
                <div className="grid md:grid-cols-2 gap-4"><Input placeholder="Your Name" className="bg-background/50" /><Input placeholder="Email" type="email" className="bg-background/50" /></div>
                <Input placeholder="Subject" className="bg-background/50" />
                <Textarea placeholder="Your Message" rows={5} className="bg-background/50" />
                <Button variant="gold" className="w-full group">Send Message <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button>
              </form>
            </AnimatedSection>
          </div>
        </section>
      </PageLayout>
    </div>
  );
}
