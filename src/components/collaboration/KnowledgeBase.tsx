import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Book, Search, Plus, Folder, FileText, Star, Clock, Eye, Edit, Trash2,
    ChevronRight, Tag, BookOpen, Lightbulb, HelpCircle, Code, Bookmark, ArrowLeft
} from 'lucide-react';

interface Article { id: string; title: string; content: string; category: string; tags: string[]; views: number; lastUpdated: Date; starred: boolean; }
interface Category { id: string; name: string; icon: string; count: number; color: string; }

const KnowledgeBase: React.FC = () => {
    const [activeTab, setActiveTab] = useState('browse');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const [categories] = useState<Category[]>([
        { id: '1', name: 'Getting Started', icon: '🚀', count: 12, color: 'bg-blue-500/10' },
        { id: '2', name: 'API Reference', icon: '📚', count: 24, color: 'bg-green-500/10' },
        { id: '3', name: 'Tutorials', icon: '📖', count: 18, color: 'bg-purple-500/10' },
        { id: '4', name: 'Best Practices', icon: '✨', count: 8, color: 'bg-yellow-500/10' },
        { id: '5', name: 'Troubleshooting', icon: '🔧', count: 15, color: 'bg-red-500/10' },
        { id: '6', name: 'FAQ', icon: '❓', count: 32, color: 'bg-indigo-500/10' },
    ]);

    const [articles] = useState<Article[]>([
        { id: '1', title: 'Quick Start Guide', content: '# Quick Start\n\nWelcome to Gnexus! This guide will help you get started...\n\n## Installation\n\n```bash\nnpm install gnexus\n```\n\n## Basic Usage\n\nImport and initialize the client:\n\n```javascript\nimport { Gnexus } from "gnexus";\nconst client = new Gnexus({ apiKey: "YOUR_KEY" });\n```', category: 'Getting Started', tags: ['beginner', 'setup'], views: 1250, lastUpdated: new Date(), starred: true },
        { id: '2', title: 'Authentication API', content: '# Authentication\n\nSecure your API requests using JWT tokens...', category: 'API Reference', tags: ['auth', 'security'], views: 890, lastUpdated: new Date(Date.now() - 86400000), starred: false },
        { id: '3', title: 'Building Your First Agent', content: '# Create an AI Agent\n\nLearn how to build custom AI agents...', category: 'Tutorials', tags: ['ai', 'agents'], views: 2100, lastUpdated: new Date(Date.now() - 172800000), starred: true },
        { id: '4', title: 'Performance Optimization', content: '# Optimization Tips\n\nBest practices for optimal performance...', category: 'Best Practices', tags: ['performance'], views: 560, lastUpdated: new Date(Date.now() - 259200000), starred: false },
        { id: '5', title: 'Common Errors', content: '# Troubleshooting\n\nSolutions to common issues...', category: 'Troubleshooting', tags: ['errors', 'debugging'], views: 1800, lastUpdated: new Date(Date.now() - 345600000), starred: false },
    ]);

    const filteredArticles = articles.filter(a =>
        (!selectedCategory || a.category === categories.find(c => c.id === selectedCategory)?.name) &&
        (!searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.tags.some(t => t.includes(searchQuery.toLowerCase())))
    );

    const getCategoryIcon = (name: string) => {
        const cat = categories.find(c => c.name === name);
        return cat?.icon || '📄';
    };

    if (selectedArticle) {
        return (
            <div className="p-6 space-y-6">
                <Button variant="ghost" onClick={() => setSelectedArticle(null)}><ArrowLeft className="w-4 h-4 mr-2" />Back to Knowledge Base</Button>
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{getCategoryIcon(selectedArticle.category)}</span>
                                    <Badge variant="outline">{selectedArticle.category}</Badge>
                                </div>
                                <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{selectedArticle.views} views</span>
                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Updated {selectedArticle.lastUpdated.toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="icon"><Star className={`w-4 h-4 ${selectedArticle.starred ? 'fill-yellow-500 text-yellow-500' : ''}`} /></Button>
                                <Button variant="outline" size="icon"><Edit className="w-4 h-4" /></Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap font-sans">{selectedArticle.content}</pre>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                            {selectedArticle.tags.map((tag, i) => <Badge key={i} variant="secondary"><Tag className="w-3 h-3 mr-1" />{tag}</Badge>)}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div><h1 className="text-3xl font-bold">Knowledge Base</h1><p className="text-muted-foreground">Documentation, tutorials, and resources</p></div>
                <Button><Plus className="w-4 h-4 mr-2" />New Article</Button>
            </div>

            {/* Search */}
            <Card><CardContent className="p-4">
                <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search documentation..." className="pl-12 h-12 text-lg" /></div>
                <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-muted-foreground">Popular:</span>
                    {['authentication', 'api', 'agents', 'setup'].map(term => (
                        <Badge key={term} variant="secondary" className="cursor-pointer hover:bg-secondary/80" onClick={() => setSearchQuery(term)}>{term}</Badge>
                    ))}
                </div>
            </CardContent></Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList><TabsTrigger value="browse"><Folder className="w-4 h-4 mr-2" />Browse</TabsTrigger>
                    <TabsTrigger value="starred"><Star className="w-4 h-4 mr-2" />Starred</TabsTrigger>
                    <TabsTrigger value="recent"><Clock className="w-4 h-4 mr-2" />Recent</TabsTrigger></TabsList>

                <TabsContent value="browse" className="space-y-6">
                    {/* Categories */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((cat) => (
                            <Card key={cat.id} className={`cursor-pointer hover:shadow-md transition-all ${selectedCategory === cat.id ? 'ring-2 ring-primary' : ''} ${cat.color}`}
                                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}>
                                <CardContent className="p-4 text-center">
                                    <span className="text-3xl">{cat.icon}</span>
                                    <p className="font-medium mt-2">{cat.name}</p>
                                    <p className="text-sm text-muted-foreground">{cat.count} articles</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Articles */}
                    <Card><CardHeader><CardTitle>{selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'All Articles'}</CardTitle></CardHeader>
                        <CardContent><ScrollArea className="h-[400px]"><div className="space-y-3">
                            {filteredArticles.map((article) => (
                                <div key={article.id} className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => setSelectedArticle(article)}>
                                    <span className="text-2xl">{getCategoryIcon(article.category)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium truncate">{article.title}</h4>
                                            {article.starred && <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                            <Badge variant="outline" className="text-xs">{article.category}</Badge>
                                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.views}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{article.lastUpdated.toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                </div>
                            ))}
                        </div></ScrollArea></CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="starred"><Card><CardContent className="p-6"><ScrollArea className="h-[500px]"><div className="space-y-3">
                    {articles.filter(a => a.starred).map((article) => (
                        <div key={article.id} className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => setSelectedArticle(article)}>
                            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                            <div className="flex-1"><h4 className="font-medium">{article.title}</h4><p className="text-sm text-muted-foreground">{article.category}</p></div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                    ))}
                </div></ScrollArea></CardContent></Card></TabsContent>

                <TabsContent value="recent"><Card><CardContent className="p-6"><ScrollArea className="h-[500px]"><div className="space-y-3">
                    {articles.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()).map((article) => (
                        <div key={article.id} className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50" onClick={() => setSelectedArticle(article)}>
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            <div className="flex-1"><h4 className="font-medium">{article.title}</h4><p className="text-sm text-muted-foreground">Updated {article.lastUpdated.toLocaleDateString()}</p></div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                    ))}
                </div></ScrollArea></CardContent></Card></TabsContent>
            </Tabs>
        </div>
    );
};

export default KnowledgeBase;
