import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";


gsap.registerPlugin(ScrollTrigger);

const navLinks = [
  {
    label: "Services",
    href: "/web-development",
    hasDropdown: true,
    dropdownItems: [
      { label: "Web Development", href: "/web-development" },
      { label: "3D & Architecture", href: "/3d-architecture" },
      { label: "AI Automation", href: "/ai-automation" },
    ]
  },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Team", href: "/team" },
  { label: "Platform", href: "/gnexus" },
  { label: "Contact", href: "/contact" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Calculate scroll progress
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  // GSAP entrance animation
  useEffect(() => {
    if (!navRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
      );
    }, navRef);

    return () => ctx.revert();
  }, []);

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-background/80 backdrop-blur-xl border-b border-border/50 py-2" : "bg-transparent py-4"
        }`}
    >
      {/* Scroll Progress Bar */}
      <div
        ref={progressRef}
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-gold via-cyan to-gold transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo - Links to Home */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 filter group-hover:drop-shadow-[0_0_20px_rgba(212,166,80,0.6)]">
            <img
              src="/g-nexus-logo.png"
              alt="G-Nexus Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl text-foreground group-hover:text-gold transition-colors duration-300">
              G-Nexus
            </span>
            <span className="text-xs text-muted-foreground -mt-1">by G-Squad</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, index) => (
            <div
              key={link.label}
              className="relative"
              onMouseEnter={() => link.hasDropdown && setActiveDropdown(link.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {link.hasDropdown ? (
                <>
                  <button
                    className="flex items-center gap-1 text-muted-foreground hover:text-gold transition-colors duration-300 font-medium group"
                  >
                    {link.label}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gold to-cyan group-hover:w-full transition-all duration-300" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className={`absolute top-full left-0 mt-2 min-w-[200px] rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl overflow-hidden transition-all duration-300 ${activeDropdown === link.label ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                    {link.dropdownItems?.map((item, i) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="block px-4 py-3 text-sm text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all duration-200"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  to={link.href}
                  className={`relative text-muted-foreground hover:text-gold transition-colors duration-300 font-medium group ${location.pathname === link.href ? 'text-gold' : ''}`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-gold to-cyan transition-all duration-300 ${location.pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
                </Link>
              )}
            </div>
          ))}
          <LanguageSwitcher />
          <Link to="/contact">
            <Button variant="gold" size="sm" className="animate-pulse-glow">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center text-foreground hover:bg-gold/20 hover:text-gold transition-all duration-300"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden transition-all duration-500 ${isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="p-6 flex flex-col gap-2">
          {navLinks.map((link) => (
            <div key={link.label}>
              {link.hasDropdown ? (
                <div>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === link.label ? null : link.label)}
                    className="w-full flex items-center justify-between text-foreground hover:text-gold transition-colors duration-300 font-medium py-3 border-b border-border/30"
                  >
                    {link.label}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${activeDropdown === link.label ? 'max-h-40' : 'max-h-0'}`}>
                    {link.dropdownItems?.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block pl-4 py-2 text-sm text-muted-foreground hover:text-gold transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block text-foreground hover:text-gold transition-colors duration-300 font-medium py-3 border-b border-border/30 ${location.pathname === link.href ? 'text-gold' : ''}`}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
          <div className="mt-2 mb-2">
            <LanguageSwitcher />
          </div>
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="gold" className="mt-4 w-full">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
