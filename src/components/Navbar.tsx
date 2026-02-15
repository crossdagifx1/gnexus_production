import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown, User, Settings, LogOut, LayoutDashboard, Shield } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";

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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if user is admin
  const isAdmin = (user as any)?.is_admin === 1 || (user as any)?.is_admin === true;

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
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
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
                    {link.dropdownItems?.map((item) => (
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

          {/* Client Portal Link (Authenticated Only) */}
          {user && (
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('portal')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center gap-1 text-muted-foreground hover:text-gold transition-colors duration-300 font-medium group">
                <LayoutDashboard className="w-4 h-4" />
                Portal
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${activeDropdown === 'portal' ? 'rotate-180' : ''}`} />
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-gold to-cyan group-hover:w-full transition-all duration-300" />
              </button>

              {/* Portal Dropdown */}
              <div className={`absolute top-full right-0 mt-2 min-w-[180px] rounded-xl bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl overflow-hidden transition-all duration-300 ${activeDropdown === 'portal' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                <Link to="/client/dashboard" className="block px-4 py-3 text-sm text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all duration-200">
                  <LayoutDashboard className="w-4 h-4 inline mr-2" />
                  Dashboard
                </Link>
                <Link to="/client/projects" className="block px-4 py-3 text-sm text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all duration-200">
                  Projects
                </Link>
                <Link to="/client/invoices" className="block px-4 py-3 text-sm text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all duration-200">
                  Invoices
                </Link>
                <Link to="/client/tickets" className="block px-4 py-3 text-sm text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all duration-200">
                  Support
                </Link>
                {isAdmin && (
                  <>
                    <div className="border-t border-border/30 my-1" />
                    <Link to="/admin" className="block px-4 py-3 text-sm text-muted-foreground hover:text-gold hover:bg-gold/10 transition-all duration-200">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Admin Panel
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          <LanguageSwitcher />

          {/* Auth-Aware Actions */}
          {user ? (
            /* User Dropdown */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Avatar className="w-8 h-8 border-2 border-gold/50">
                    <AvatarImage src={(user as any)?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-gold to-cyan text-background text-xs font-bold">
                      {user.full_name ? getInitials(user.full_name) : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.full_name || user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/client/dashboard')}>
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/client/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Login/Register Buttons */
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="gold" size="sm" className="animate-pulse-glow">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
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
      <div className={`md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/50 overflow-hidden transition-all duration-500 ${isMobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="p-6 flex flex-col gap-2">
          {/* User Info (Mobile) */}
          {user && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-4">
              <Avatar className="w-10 h-10 border-2 border-gold/50">
                <AvatarImage src={(user as any)?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-gold to-cyan text-background font-bold">
                  {user.full_name ? getInitials(user.full_name) : <User className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-sm">{user.full_name || user.username}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          )}

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

          {/* Mobile Portal Links */}
          {user && (
            <>
              <div className="border-t border-border/30 my-2" />
              <Link
                to="/client/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-foreground hover:text-gold transition-colors duration-300 font-medium py-3"
              >
                <LayoutDashboard className="w-4 h-4 inline mr-2" />
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-foreground hover:text-gold transition-colors duration-300 font-medium py-3"
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Admin Panel
                </Link>
              )}
            </>
          )}

          <div className="mt-2 mb-2">
            <LanguageSwitcher />
          </div>

          {/* Mobile Auth Buttons */}
          {user ? (
            <Button variant="outline" className="mt-4 w-full text-red-600" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          ) : (
            <div className="flex flex-col gap-2 mt-4">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="gold" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
