import { useEffect, useRef, useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { CategoryTabs } from "@/components/CategoryTabs";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Button, Input, Badge, EmptyState, GradientText, InteractiveCard, Tag } from "@/components/ui";
import { Calendar, Clock, User, ArrowRight, Search, TrendingUp, BookOpen, Mail, Inbox } from "lucide-react";
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { nexus, type BlogPost } from "@/lib/api/nexus-core";

gsap.registerPlugin(ScrollTrigger);

// Static stats for now, could be dynamic later
const stats = [
  { value: 50, suffix: "+", label: "Articles" },
  { value: 10, suffix: "k+", label: "Readers" },
  { value: 15, suffix: "+", label: "Topics" },
];

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await nexus.getPosts(100); // Fetch up to 100 posts
      setPosts(data);
    } catch (e) {
      console.error("Failed to load blog posts", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Derive dynamic content
  const featuredPost = posts.find(p => p.featured) || posts[0];
  const trendingPosts = posts.filter(p => p.trending).slice(0, 5);

  // Extract unique categories from posts, plus formatting
  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];

  // Mock authors aggregation from posts
  const authorsMap = new Map<string, { name: string, posts: number, avatar: string, role: string }>();
  posts.forEach(p => {
    if (p.author_name) {
      if (!authorsMap.has(p.author_name)) {
        authorsMap.set(p.author_name, {
          name: p.author_name,
          posts: 0,
          avatar: p.author_avatar || "👤",
          role: "Contributor"
        });
      }
      authorsMap.get(p.author_name)!.posts++;
    }
  });
  const authors = Array.from(authorsMap.values());

  const filteredPosts = posts.filter(post => {
    // Skip the featured post in the main list if we want, or keep it. usually featured is also in list or separate.
    // Let's keep it but maybe differentiate?
    // For now, simple filter.
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    // Refresh GSAP animations when posts change
    if (!containerRef.current || isLoading) return;

    ScrollTrigger.refresh();

    // Slight delay to allow DOM to update
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        const postCards = postsRef.current?.querySelectorAll('.blog-post-card');
        if (postCards) {
          postCards.forEach((card, index) => {
            gsap.fromTo(
              card,
              { opacity: 0, y: 50, scale: 0.95 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                delay: index * 0.08,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: postsRef.current,
                  start: 'top 80%',
                  toggleActions: 'play none none none', // Only play once
                },
              }
            );
          });
        }
      }, containerRef);
      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, [filteredPosts, isLoading]);

  return (
    <div ref={containerRef}>
      <PageLayout>
        {/* Custom Hero with Gradient Text */}
        <section className="relative py-20 px-6 border-b border-border/30 overflow-hidden">
          <div className="absolute inset-0 gradient-mesh opacity-30" />
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <Badge variant="gold" className="mb-4">
              📝 Blog
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <GradientText from="gold" to="cyan" animated as="h1">
                Insights & Ideas
              </GradientText>
            </h1>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
              Thoughts on technology, design, and building the future of Ethiopian digital infrastructure.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 px-6 border-y border-border/30">
          <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 100} animation="scaleUp">
                <div className="text-center">
                  <div className="font-display font-bold text-3xl text-gold">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-16 px-6">
            <div className="max-w-5xl mx-auto">
              <AnimatedSection>
                <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-gold/10 via-muted/30 to-cyan/5 border border-gold/20 overflow-hidden">
                  <FloatingParticles count={8} color="gold" />
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-gold text-background rounded-full mb-4">Featured</span>
                  <h2 className="font-display font-bold text-2xl md:text-4xl mb-4 max-w-3xl">{featuredPost.title}</h2>
                  <p className="text-muted-foreground mb-6 max-w-2xl">{featuredPost.excerpt}</p>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" /> {featuredPost.author_name || 'Admin'}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> {new Date(featuredPost.created_at || Date.now()).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> {featuredPost.read_time_min} min read
                    </span>
                  </div>
                  <Button variant="gold">
                    Read Article <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <div className="absolute top-8 right-8 text-8xl opacity-20">
                    {/* Placeholder emoji or image */}
                    {featuredPost.cover_image ? <img src={featuredPost.cover_image} className="w-32 h-32 object-cover rounded opacity-50" /> : '📝'}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>
        )}

        {/* Search & Filter */}
        <section className="px-6">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted/30 border-border/50"
                  />
                </div>
                <CategoryTabs
                  categories={categories.length > 1 ? categories : ["All", "Tech", "Design", "Business"]}
                  defaultCategory="All"
                  onChange={setSelectedCategory}
                />
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="py-12 px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
            {/* Posts */}
            <div ref={postsRef} className="lg:col-span-2 space-y-6">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Loading articles...</div>
              ) : filteredPosts.length === 0 ? (
                <EmptyState
                  icon={<Inbox className="w-16 h-16" />}
                  title="No articles found"
                  description="Try adjusting your filters or search query to find what you're looking for."
                  action={
                    <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}>
                      Clear Filters
                    </Button>
                  }
                />
              ) : (
                filteredPosts.map((post, i) => (
                  <AnimatedSection key={post.id} delay={i * 75} animation="fadeUp">
                    <InteractiveCard
                      className="blog-post-card group cursor-pointer"
                      hover="lift"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Tag variant="gold" size="sm">
                              {post.category}
                            </Tag>
                            {post.trending && (
                              <Badge variant="cyan" dot pulse size="sm">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-display font-bold text-xl mb-2 group-hover:text-gold transition-colors">{post.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author_name || 'Admin'}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.read_time_min} min</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </InteractiveCard>
                  </AnimatedSection>
                ))
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Newsletter */}
              <AnimatedSection animation="fadeLeft">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-gold/10 to-transparent border border-gold/20">
                  <Mail className="w-8 h-8 text-gold mb-4" />
                  <h3 className="font-display font-bold text-lg mb-2">Subscribe to our Newsletter</h3>
                  <p className="text-sm text-muted-foreground mb-4">Get the latest insights delivered to your inbox weekly.</p>
                  <div className="space-y-3">
                    <Input placeholder="Your email" className="bg-background/50" />
                    <Button variant="gold" className="w-full">Subscribe</Button>
                  </div>
                </div>
              </AnimatedSection>

              {/* Trending */}
              {trendingPosts.length > 0 && (
                <AnimatedSection animation="fadeLeft" delay={100}>
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-gold" />
                      <h3 className="font-display font-bold">Trending Now</h3>
                    </div>
                    <div className="space-y-4">
                      {trendingPosts.map((post, i) => (
                        <div key={post.id} className="flex items-start gap-3 cursor-pointer group">
                          <span className="text-2xl font-bold text-muted-foreground/30">{i + 1}</span>
                          <div>
                            <h4 className="text-sm font-medium group-hover:text-gold transition-colors line-clamp-2">{post.title}</h4>
                            <p className="text-xs text-muted-foreground">{post.read_time_min} min read</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              )}

              {/* Authors */}
              {authors.length > 0 && (
                <AnimatedSection animation="fadeLeft" delay={200}>
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-gold" />
                      <h3 className="font-display font-bold">Our Writers</h3>
                    </div>
                    <div className="space-y-4">
                      {authors.map((author) => (
                        <div key={author.name} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-xl overflow-hidden">
                            {author.avatar.startsWith('http') ? <img src={author.avatar} alt={author.name} /> : author.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{author.name}</p>
                            <p className="text-xs text-muted-foreground">{author.posts} articles</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              )}

              {/* Topics */}
              <AnimatedSection animation="fadeLeft" delay={300}>
                <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                  <h3 className="font-display font-bold mb-4">Popular Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {["AI", "Fintech", "React", "3D Design", "Startups", "Payments", "TypeScript", "UX"].map((topic) => (
                      <Tag key={topic} variant="outline" className="hover:variant-gold cursor-pointer">
                        {topic}
                      </Tag>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </PageLayout>
    </div>
  );
}
