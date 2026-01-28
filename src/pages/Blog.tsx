import { useEffect, useRef } from "react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { AnimatedSection } from "@/components/AnimatedSection";
import { CategoryTabs } from "@/components/CategoryTabs";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User, ArrowRight, Search, TrendingUp, BookOpen, Mail } from "lucide-react";
import { useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const featuredPost = {
  title: "The Future of AI in Ethiopian Business: A 2026 Outlook",
  excerpt: "As we enter 2026, artificial intelligence is no longer a distant dream for Ethiopian businesses. From automated customer service to predictive analytics, AI is transforming how companies operate across East Africa.",
  author: "Dagmawi Amare",
  date: "Jan 2, 2026",
  readTime: "8 min read",
  category: "AI",
  image: "🤖",
};

const posts = [
  { title: "How AI is Transforming Ethiopian Business", date: "Jan 2, 2026", category: "AI", author: "Dagmawi Amare", readTime: "5 min", excerpt: "Exploring the latest AI applications helping Ethiopian SMEs compete globally.", trending: true },
  { title: "The Rise of Digital Payments in East Africa", date: "Dec 28, 2025", category: "Fintech", author: "Tsion Berihun", readTime: "7 min", excerpt: "How Telebirr, Chapa, and mobile money are revolutionizing commerce.", trending: true },
  { title: "Building for Scale: Lessons from G-Nexus", date: "Dec 20, 2025", category: "Engineering", author: "Dagmawi Amare", readTime: "10 min", excerpt: "Technical deep-dive into architecting systems for Ethiopian businesses." },
  { title: "3D Visualization Trends for 2026", date: "Dec 15, 2025", category: "Design", author: "Tsion Berihun", readTime: "6 min", excerpt: "What's next in architectural visualization and product rendering." },
  { title: "Why Ethiopian Startups Should Go Digital-First", date: "Dec 10, 2025", category: "Business", author: "G-Squad Team", readTime: "4 min", excerpt: "The case for prioritizing digital transformation from day one." },
  { title: "Understanding Habesha Futurism in Design", date: "Dec 5, 2025", category: "Design", author: "Tsion Berihun", readTime: "8 min", excerpt: "Blending 3,000 years of heritage with cutting-edge aesthetics." },
  { title: "Payment Gateway Integration Guide", date: "Dec 1, 2025", category: "Engineering", author: "Dagmawi Amare", readTime: "12 min", excerpt: "Step-by-step tutorial for integrating Ethiopian payment systems." },
  { title: "E-commerce Growth in Ethiopia 2025", date: "Nov 25, 2025", category: "Business", author: "G-Squad Team", readTime: "6 min", excerpt: "Market analysis and opportunities for online retailers." },
];

const categories = ["All", "AI", "Fintech", "Engineering", "Design", "Business"];

const stats = [
  { value: 50, suffix: "+", label: "Articles" },
  { value: 10, suffix: "k+", label: "Readers" },
  { value: 15, suffix: "+", label: "Topics" },
];

const authors = [
  { name: "Dagmawi Amare", role: "Lead Developer", posts: 24, avatar: "👨‍💻" },
  { name: "Tsion Berihun", role: "Creative Director", posts: 18, avatar: "👩‍🎨" },
];

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const postsRef = useRef<HTMLDivElement>(null);

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const trendingPosts = posts.filter(p => p.trending);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Blog post cards - masonry reveal
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
                toggleActions: 'play none none none',
              },
            }
          );
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [filteredPosts]);

  return (
    <div ref={containerRef}>
      <PageLayout>
        <PageHero
          badge="📝 Blog"
          title="Insights & Ideas"
          subtitle="Thoughts on technology, design, and building the future of Ethiopian digital infrastructure."
        />

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
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-gold/10 via-muted/30 to-cyan/5 border border-gold/20 overflow-hidden">
                <FloatingParticles count={8} color="gold" />
                <span className="inline-block px-3 py-1 text-xs font-medium bg-gold text-background rounded-full mb-4">Featured</span>
                <h2 className="font-display font-bold text-2xl md:text-4xl mb-4 max-w-3xl">{featuredPost.title}</h2>
                <p className="text-muted-foreground mb-6 max-w-2xl">{featuredPost.excerpt}</p>
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-2"><User className="w-4 h-4" /> {featuredPost.author}</span>
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {featuredPost.date}</span>
                  <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {featuredPost.readTime}</span>
                </div>
                <Button variant="gold">
                  Read Article <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <div className="absolute top-8 right-8 text-8xl opacity-20">{featuredPost.image}</div>
              </div>
            </AnimatedSection>
          </div>
        </section>

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
                  categories={categories}
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
              {filteredPosts.length === 0 ? (
                <AnimatedSection>
                  <div className="text-center py-12 text-muted-foreground">
                    No articles found matching your criteria.
                  </div>
                </AnimatedSection>
              ) : (
                filteredPosts.map((post, i) => (
                  <AnimatedSection key={post.title} delay={i * 75} animation="fadeUp">
                    <article className="blog-post-card group p-6 rounded-2xl bg-muted/30 border border-border/50 hover:border-gold/50 cursor-pointer transition-all hover:-translate-y-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-xs font-medium text-gold uppercase px-2 py-1 rounded-full bg-gold/10">{post.category}</span>
                            {post.trending && (
                              <span className="flex items-center gap-1 text-xs text-cyan">
                                <TrendingUp className="w-3 h-3" /> Trending
                              </span>
                            )}
                          </div>
                          <h3 className="font-display font-bold text-lg mb-2 group-hover:text-gold transition-colors">{post.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all" />
                      </div>
                    </article>
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
              <AnimatedSection animation="fadeLeft" delay={100}>
                <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-gold" />
                    <h3 className="font-display font-bold">Trending Now</h3>
                  </div>
                  <div className="space-y-4">
                    {trendingPosts.map((post, i) => (
                      <div key={i} className="flex items-start gap-3 cursor-pointer group">
                        <span className="text-2xl font-bold text-muted-foreground/30">{i + 1}</span>
                        <div>
                          <h4 className="text-sm font-medium group-hover:text-gold transition-colors line-clamp-2">{post.title}</h4>
                          <p className="text-xs text-muted-foreground">{post.readTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* Authors */}
              <AnimatedSection animation="fadeLeft" delay={200}>
                <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-gold" />
                    <h3 className="font-display font-bold">Our Writers</h3>
                  </div>
                  <div className="space-y-4">
                    {authors.map((author) => (
                      <div key={author.name} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-xl">
                          {author.avatar}
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

              {/* Topics */}
              <AnimatedSection animation="fadeLeft" delay={300}>
                <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                  <h3 className="font-display font-bold mb-4">Popular Topics</h3>
                  <div className="flex flex-wrap gap-2">
                    {["AI", "Fintech", "React", "3D Design", "Startups", "Payments", "TypeScript", "UX"].map((topic) => (
                      <span key={topic} className="px-3 py-1 text-xs rounded-full bg-muted/50 hover:bg-gold/20 cursor-pointer transition-colors">
                        {topic}
                      </span>
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
