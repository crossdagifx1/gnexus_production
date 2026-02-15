// G-Nexus "Nexus Core" Frontend SDK
// Version: 1.0.0

// =============================================================================
// TYPES
// =============================================================================

export interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    permissions: string[];
    avatar_url?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Project {
    id: string;
    slug: string;
    title: string;
    description: string;
    content: string;
    client?: string;
    category: string;
    tags: string[];
    technologies: string[];
    image_url: string;
    gallery_urls?: string[];
    project_url?: string;
    featured: boolean;
    status: 'draft' | 'published' | 'archived';
    display_order: number;
    created_at?: string;
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    author_id: string;
    author_name?: string;
    author_avatar?: string;
    category: string;
    tags: string[];
    cover_image: string;
    read_time_min: number;
    featured: boolean;
    trending: boolean;
    status: 'draft' | 'review' | 'published' | 'archived';
    created_at?: string;
}

export interface SiteComponent {
    id: string;
    key: string;
    type: 'text' | 'image' | 'json' | 'feature_flag';
    value: any;
    description?: string;
    group: string;
    is_system: boolean;
    updated_at?: string;
}

export interface Platform {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    url?: string;
    status: 'active' | 'maintenance' | 'development' | 'deprecated';
    version?: string;
    display_order: number;
}

export interface Service {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
    category: 'web' | '3d' | 'ai' | 'general';
    display_order: number;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string;
    image_url: string;
    skills: { name: string; level: number }[];
    social_links: { platform: string; url: string }[];
    display_order: number;
}

export interface Inquiry {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    created_at: string;
}

// =============================================================================
// SDK
// =============================================================================

class NexusCoreSDK {
    private token: string | null = null;
    private apiUrl: string;

    constructor() {
        this.token = localStorage.getItem('nexus_token');
        this.apiUrl = import.meta.env.VITE_API_URL || '/api.php';
    }

    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {})
        };
    }

    private async request<T>(action: string, method = 'GET', body?: any): Promise<T> {
        const url = `${this.apiUrl}?action=${action}`;
        const options: RequestInit = {
            method,
            headers: this.getHeaders()
        };

        if (body && method !== 'GET') {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);
        let result;
        try {
            result = await response.json();
        } catch (e) {
            throw new Error(`API Error: Invalid JSON response. Status: ${response.status}`);
        }

        if (!response.ok || !result.success) {
            throw new Error(result.error || `API Error: ${response.statusText}`);
        }

        return result.data as T;
    }

    // --- AUTH ---

    async login(email: string, password: string): Promise<AuthResponse> {
        const data = await this.request<AuthResponse>('login', 'POST', { email, password });
        this.token = data.token;
        localStorage.setItem('nexus_token', data.token);
        localStorage.setItem('nexus_user', JSON.stringify(data.user));
        return data;
    }

    logout() {
        this.token = null;
        localStorage.removeItem('nexus_token');
        localStorage.removeItem('nexus_user');
        window.location.href = '/admin/login';
    }

    async registerFirstAdmin(email: string, password: string, fullName: string) {
        return this.request('register_first_admin', 'POST', { email, password, full_name: fullName });
    }

    isAuthenticated(): boolean {
        return !!this.token;
    }

    getUser(): User | null {
        const u = localStorage.getItem('nexus_user');
        return u ? JSON.parse(u) : null;
    }

    // --- PORTFOLIO ---

    async getProjects(limit = 100, category?: string): Promise<Project[]> {
        const query = category ? `&limit=${limit}&category=${category}` : `&limit=${limit}`;
        return this.request<Project[]>(`get_projects${query}`, 'GET');
    }

    async saveProject(project: Partial<Project>): Promise<{ id: string }> {
        return this.request<{ id: string }>('save_project', 'POST', project);
    }

    async deleteProject(id: string) {
        return this.request<{ deleted: string }>('delete_project', 'POST', { id });
    }

    // --- BLOG ---

    async getPosts(limit = 20): Promise<BlogPost[]> {
        return this.request<BlogPost[]>(`get_posts&limit=${limit}`, 'GET');
    }

    async savePost(post: Partial<BlogPost>): Promise<{ id: string }> {
        return this.request<{ id: string }>('save_post', 'POST', post);
    }

    async deletePost(id: string) {
        return this.request<{ deleted: string }>('delete_post', 'POST', { id });
    }

    // --- COMPONENTS ---

    async getComponents(group?: string): Promise<SiteComponent[]> {
        const query = group ? `&group=${group}` : '';
        return this.request<SiteComponent[]>(`get_components${query}`, 'GET');
    }

    async saveComponent(component: Partial<SiteComponent>): Promise<{ key: string }> {
        return this.request<{ key: string }>('save_component', 'POST', component);
    }

    // --- PLATFORMS ---

    async getPlatforms(): Promise<Platform[]> {
        return this.request<Platform[]>('get_platforms', 'GET');
    }

    async savePlatform(platform: Partial<Platform>): Promise<{ id: string }> {
        return this.request<{ id: string }>('save_platform', 'POST', platform);
    }

    // --- SERVICES ---

    async getServices(category?: string): Promise<Service[]> {
        const query = category ? `&category=${category}` : '';
        return this.request<Service[]>(`get_services${query}`, 'GET');
    }

    async saveService(service: Partial<Service>): Promise<{ id: string }> {
        return this.request<{ id: string }>('save_service', 'POST', service);
    }

    async deleteService(id: string) {
        return this.request<{ deleted: string }>('delete_service', 'POST', { id });
    }

    // --- TEAM ---

    async getTeamMembers(): Promise<TeamMember[]> {
        return this.request<TeamMember[]>('get_team_members', 'GET');
    }

    async saveTeamMember(member: Partial<TeamMember>): Promise<{ id: string }> {
        return this.request<{ id: string }>('save_team_member', 'POST', member);
    }

    async deleteTeamMember(id: string) {
        return this.request<{ deleted: string }>('delete_team_member', 'POST', { id });
    }

    // --- INQUIRIES ---

    async saveInquiry(inquiry: Partial<Inquiry>): Promise<{ id: string }> {
        return this.request<{ id: string }>('save_inquiry', 'POST', inquiry);
    }

    async getInquiries(status?: string): Promise<Inquiry[]> {
        const query = status ? `&status=${status}` : '';
        return this.request<Inquiry[]>(`get_inquiries${query}`, 'GET');
    }

    async updateInquiryStatus(id: string, status: string): Promise<{ id: string; status: string }> {
        return this.request('update_inquiry_status', 'POST', { id, status });
    }

    // --- USERS & ROLES ---

    async getUsers(): Promise<User[]> {
        return this.request<User[]>('get_users', 'GET');
    }

    async getRoles(): Promise<any[]> {
        return this.request<any[]>('get_roles', 'GET');
    }
}

export const nexus = new NexusCoreSDK();
