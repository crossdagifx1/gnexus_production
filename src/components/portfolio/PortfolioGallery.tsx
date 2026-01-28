import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  client: string;
  technologies: string[];
  project_url: string | null;
  featured: boolean;
}

const categories = [
  { id: 'all', label: 'All Projects', icon: '✦' },
  { id: 'web', label: 'Web Development', icon: '🌐' },
  { id: '3d', label: '3D & Architecture', icon: '🏛️' },
  { id: 'ai', label: 'AI Solutions', icon: '🤖' },
];

const PortfolioGallery = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const galleryRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // Clean up any existing ScrollTriggers for cards before creating new ones
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.trigger && cardsRef.current.includes(trigger.vars.trigger)) {
        trigger.kill();
      }
    });

    if (cardsRef.current.length > 0) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        cardsRef.current.forEach((card, index) => {
          if (card) {
            // Set initial state without hiding the card
            gsap.set(card, {
              opacity: 1, // Keep visible to prevent text from disappearing
              y: 0,
              scale: 1,
              rotateX: 0,
            });

            // Only animate cards that are below the fold
            gsap.fromTo(card,
              {
                opacity: 0,
                y: 60,
                scale: 0.9,
                rotateX: 15
              },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                duration: 0.8,
                delay: index * 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: card,
                  start: 'top 85%',
                  toggleActions: 'play none none reverse',
                  immediateRender: false,
                },
              }
            );
          }
        });

        // Refresh ScrollTrigger after setting up animations
        ScrollTrigger.refresh();
      });
    }

    return () => {
      // Clean up on unmount
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger && cardsRef.current.includes(trigger.vars.trigger)) {
          trigger.kill();
        }
      });
    };
  }, [projects, activeCategory]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('featured', { ascending: false })
        .order('display_order', { ascending: true });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  const openLightbox = (project: Project) => {
    const index = filteredProjects.findIndex(p => p.id === project.id);
    setLightboxIndex(index);
    setSelectedProject(project);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedProject(null);
    document.body.style.overflow = '';
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (lightboxIndex + 1) % filteredProjects.length
      : (lightboxIndex - 1 + filteredProjects.length) % filteredProjects.length;
    setLightboxIndex(newIndex);
    setSelectedProject(filteredProjects[newIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProject) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'ArrowRight') navigateLightbox('next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject, lightboxIndex]);

  return (
    <div ref={galleryRef}>
      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap justify-center gap-3 mb-12"
      >
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? 'default' : 'outline'}
            onClick={() => setActiveCategory(cat.id)}
            className={`group relative overflow-hidden transition-all duration-300 ${activeCategory === cat.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                : 'hover:border-primary/50'
              }`}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.label}
            {activeCategory === cat.id && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-primary -z-10"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
          </Button>
        ))}
      </motion.div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                ref={el => { if (el) cardsRef.current[index] = el; }}
                layout
                // Remove initial opacity since GSAP handles it - prevents text from being hidden
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className="group cursor-pointer perspective-1000"
                onClick={() => openLightbox(project)}
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted transform-gpu transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-primary/20">
                  {/* Image */}
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {categories.find(c => c.id === project.category)?.label}
                        </Badge>
                        {project.featured && (
                          <Badge className="bg-primary/20 text-primary text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-1">{project.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    </div>
                  </div>

                  {/* Corner accent */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-primary/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-300">
                    <ExternalLink className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            {/* Navigation Buttons */}
            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 w-12 h-12 bg-muted rounded-full flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Content */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-5xl w-full bg-card rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2">
                {/* Image */}
                <div className="aspect-[4/3] md:aspect-auto">
                  <img
                    src={selectedProject.image_url}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="p-8 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary">
                      {categories.find(c => c.id === selectedProject.category)?.label}
                    </Badge>
                    {selectedProject.featured && (
                      <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                    )}
                  </div>

                  <h2 className="text-3xl font-bold mb-2">{selectedProject.title}</h2>
                  <p className="text-muted-foreground mb-4">{selectedProject.client}</p>
                  <p className="text-foreground/80 mb-6">{selectedProject.description}</p>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Technologies</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies?.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto">
                    {selectedProject.project_url && (
                      <Button asChild className="w-full">
                        <a href={selectedProject.project_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Live Project
                        </a>
                      </Button>
                    )}
                  </div>

                  {/* Pagination */}
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    {lightboxIndex + 1} of {filteredProjects.length}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioGallery;
