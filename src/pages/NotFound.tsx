import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const NotFound = () => {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const error404Ref = useRef<HTMLHeadingElement>(null);
  const errorMessageRef = useRef<HTMLParagraphElement>(null);
  const errorLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 404 text bounce-in with ref
      if (error404Ref.current) {
        gsap.fromTo(
          error404Ref.current,
          { scale: 0.5, opacity: 0, rotate: -10 },
          {
            scale: 1,
            opacity: 1,
            rotate: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.5)',
          }
        );
      }

      // Message fade up with ref
      if (errorMessageRef.current) {
        gsap.fromTo(
          errorMessageRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.3,
            ease: 'power2.out',
          }
        );
      }

      // Link slide in with ref
      if (errorLinkRef.current) {
        gsap.fromTo(
          errorLinkRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: 0.6,
            ease: 'back.out(1.2)',
          }
        );
      }

      // Glitch effect with ref
      if (error404Ref.current) {
        gsap.to(error404Ref.current, {
          x: '+=2',
          duration: 0.1,
          repeat: -1,
          yoyo: true,
          repeatDelay: 3,
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 ref={error404Ref} className="mb-4 text-4xl font-bold">404</h1>
        <p ref={errorMessageRef} className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a ref={errorLinkRef} href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
