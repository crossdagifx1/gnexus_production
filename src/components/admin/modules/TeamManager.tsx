import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Github, Linkedin, Twitter, Globe, User, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { nexus, type TeamMember } from '@/lib/api/nexus-core';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';

export default function TeamManager() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentMember, setCurrentMember] = useState<Partial<TeamMember>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Skill Input State
    const [skillName, setSkillName] = useState('');
    const [skillLevel, setSkillLevel] = useState(80);

    // Social Input State
    const [socialPlatform, setSocialPlatform] = useState('linkedin');
    const [socialUrl, setSocialUrl] = useState('');

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        setIsLoading(true);
        try {
            const data = await nexus.getTeamMembers();
            setMembers(data);
        } catch (error) {
            toast.error('Failed to load team members');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (!currentMember.name || !currentMember.role) {
                toast.error('Name and Role are required');
                return;
            }

            await nexus.saveTeamMember(currentMember);

            toast.success('Team member saved successfully');
            setIsDialogOpen(false);
            loadMembers();
            setCurrentMember({});
        } catch (error) {
            console.error(error);
            toast.error('Failed to save team member');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this team member?')) return;
        try {
            await nexus.deleteTeamMember(id);
            toast.success('Team member deleted');
            loadMembers();
        } catch (error) {
            toast.error('Failed to delete team member');
        }
    }

    const startEdit = (member: TeamMember) => {
        setCurrentMember({ ...member });
        setIsDialogOpen(true);
    };

    // Skill Management
    const addSkill = () => {
        if (!skillName.trim()) return;
        const skills = currentMember.skills || [];
        setCurrentMember({ ...currentMember, skills: [...skills, { name: skillName, level: skillLevel }] });
        setSkillName('');
        setSkillLevel(80);
    };

    const removeSkill = (index: number) => {
        const skills = currentMember.skills || [];
        const newSkills = [...skills];
        newSkills.splice(index, 1);
        setCurrentMember({ ...currentMember, skills: newSkills });
    };

    // Social Management
    const addSocial = () => {
        if (!socialUrl.trim()) return;
        const links = currentMember.social_links || [];
        setCurrentMember({ ...currentMember, social_links: [...links, { platform: socialPlatform, url: socialUrl }] });
        setSocialUrl('');
    };

    const removeSocial = (index: number) => {
        const links = currentMember.social_links || [];
        const newLinks = [...links];
        newLinks.splice(index, 1);
        setCurrentMember({ ...currentMember, social_links: newLinks });
    };

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Team Manager</h1>
                    <p className="text-muted-foreground">Manage public profiles for the "Meet the Team" page.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setCurrentMember({});
                        setSkillName('');
                        setSocialUrl('');
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2" /> Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{currentMember.id ? 'Edit Profile' : 'Add Team Member'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input
                                        value={currentMember.name || ''}
                                        onChange={e => setCurrentMember(p => ({ ...p, name: e.target.value }))}
                                        placeholder="e.g. Dagmawi Amare"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Role / Title</label>
                                    <Input
                                        value={currentMember.role || ''}
                                        onChange={e => setCurrentMember(p => ({ ...p, role: e.target.value }))}
                                        placeholder="e.g. Lead Developer"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bio</label>
                                <textarea
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[80px]"
                                    value={currentMember.bio || ''}
                                    onChange={e => setCurrentMember(p => ({ ...p, bio: e.target.value }))}
                                    placeholder="Short biography..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Image URL</label>
                                    <Input
                                        value={currentMember.image_url || ''}
                                        onChange={e => setCurrentMember(p => ({ ...p, image_url: e.target.value }))}
                                        placeholder="https://..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Display Order</label>
                                    <Input
                                        type="number"
                                        value={currentMember.display_order || 0}
                                        onChange={e => setCurrentMember(p => ({ ...p, display_order: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                                <h3 className="text-sm font-bold">Skills</h3>
                                <div className="flex gap-2 items-end">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-xs">Skill Name</label>
                                        <Input
                                            value={skillName}
                                            onChange={e => setSkillName(e.target.value)}
                                            placeholder="e.g. React"
                                            className="h-8"
                                        />
                                    </div>
                                    <div className="w-24 space-y-1">
                                        <label className="text-xs">Level ({skillLevel}%)</label>
                                        <Slider
                                            value={[skillLevel]}
                                            onValueChange={(v) => setSkillLevel(v[0])}
                                            max={100}
                                            step={5}
                                            className="py-2"
                                        />
                                    </div>
                                    <Button type="button" onClick={addSkill} size="sm" variant="secondary">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {currentMember.skills?.map((skill, i) => (
                                        <Badge key={i} variant="outline" className="gap-1 bg-background">
                                            {skill.name} <span className="text-primary text-xs">({skill.level}%)</span>
                                            <Trash2 className="w-3 h-3 cursor-pointer hover:text-destructive ml-1" onClick={() => removeSkill(i)} />
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Social Links */}
                            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                                <h3 className="text-sm font-bold">Social Links</h3>
                                <div className="flex gap-2">
                                    <select
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                        value={socialPlatform}
                                        onChange={e => setSocialPlatform(e.target.value)}
                                    >
                                        <option value="linkedin">LinkedIn</option>
                                        <option value="twitter">Twitter</option>
                                        <option value="github">GitHub</option>
                                        <option value="website">Website</option>
                                    </select>
                                    <Input
                                        value={socialUrl}
                                        onChange={e => setSocialUrl(e.target.value)}
                                        placeholder="URL..."
                                        className="h-9 flex-1"
                                    />
                                    <Button type="button" onClick={addSocial} size="sm" variant="secondary">Add</Button>
                                </div>
                                <div className="space-y-1 mt-2">
                                    {currentMember.social_links?.map((link, i) => (
                                        <div key={i} className="flex items-center justify-between text-xs p-1 px-2 bg-background rounded-md border border-border/50">
                                            <span className="capitalize font-medium w-20">{link.platform}</span>
                                            <span className="truncate flex-1 text-muted-foreground">{link.url}</span>
                                            <Trash2 className="w-3 h-3 cursor-pointer hover:text-destructive ml-2" onClick={() => removeSocial(i)} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search team..."
                        className="pl-9 bg-muted/50 border-none"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {filteredMembers.map((member, i) => (
                        <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-card hover:bg-card/80 border border-border/50 rounded-xl p-6 transition-all duration-300 hover:shadow-lg flex flex-col gap-4"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                                        <AvatarImage src={member.image_url} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-bold text-lg">{member.name}</h3>
                                        <p className="text-sm text-primary">{member.role}</p>
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => startEdit(member)}>
                                            <Edit className="w-4 h-4 mr-2" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member.id)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <p className="text-sm text-muted-foreground line-clamp-3 italic">
                                "{member.bio}"
                            </p>

                            <div className="space-y-2 mt-auto">
                                <p className="text-xs font-semibold uppercase text-muted-foreground">Skills</p>
                                <div className="flex flex-wrap gap-1">
                                    {member.skills?.slice(0, 4).map((skill, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-[10px] h-5">
                                            {skill.name}
                                        </Badge>
                                    ))}
                                    {(member.skills?.length || 0) > 4 && (
                                        <span className="text-[10px] text-muted-foreground">+{member.skills!.length - 4} more</span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
