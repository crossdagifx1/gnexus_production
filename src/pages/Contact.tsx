import { useEffect, useRef, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle } from "lucide-react";
import gsap from 'gsap';
import { useToast } from "@/hooks/use-toast";
import { nexus } from "@/lib/api/nexus-core";

const contactInfo = [
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email Us",
    detail: "hello@gnexus.agency",
    link: "mailto:hello@gnexus.agency",
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Call Us",
    detail: "+251 912 345 678",
    link: "tel:+251912345678",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Visit Us",
    detail: "Addis Ababa, Ethiopia",
    link: "https://maps.google.com",
  },
];

export default function Contact() {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Form entrance
      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          { opacity: 0, x: 50 },
          { opacity: 1, x: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await nexus.saveInquiry(formData);

      setIsSuccess(true);
      toast({
        title: "Message Sent!",
        description: "Thanks for reaching out. We'll get back to you soon.",
      });

      // Reset form after delay
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: "", email: "", subject: "", message: "" });
      }, 3000);

    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div ref={containerRef}>
      <PageLayout>
        <PageHero
          badge="📬 Get in Touch"
          title="Let's Build Something Amazing"
          subtitle="Have a project in mind? We'd love to hear about it. Send us a message and let's start the conversation."
        />

        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div className="space-y-12">
              <AnimatedSection delay={100}>
                <div>
                  <h2 className="font-display font-bold text-3xl mb-6">Contact Information</h2>
                  <p className="text-muted-foreground mb-8">
                    Whether you have a question about features, pricing, need a demo, or anything else, our team is ready to answer all your questions.
                  </p>

                  <div className="space-y-6">
                    {contactInfo.map((item, index) => (
                      <a
                        key={item.title}
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-gold/50 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{item.title}</h3>
                          <p className="text-muted-foreground text-sm">{item.detail}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <div className="p-8 rounded-3xl bg-gradient-to-br from-gold/5 to-cyan/5 border border-gold/20">
                  <h3 className="font-display font-bold text-xl mb-4">Why Choose G-Nexus?</h3>
                  <ul className="space-y-3">
                    {["Expertise in AI & Web Development", "Tailored Solutions for Your Business", "Commitment to Quality & Innovation", "Proven Track Record of Success"].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>
            </div>

            {/* Contact Form */}
            <div className="relative">
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="p-8 rounded-3xl bg-card border border-border/50 shadow-2xl relative overflow-hidden"
              >
                {isSuccess && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-4">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">We'll be in touch shortly.</p>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="font-display font-bold text-2xl mb-2">Send us a Message</h3>
                  <p className="text-muted-foreground text-sm">Fill out the form below and we'll get back to you within 24 hours.</p>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Name</label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-muted/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-muted/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Project Inquiry"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="bg-muted/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us about your project..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="bg-muted/50 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full mt-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Send Message
                        <Send className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </PageLayout>
    </div>
  );
}
