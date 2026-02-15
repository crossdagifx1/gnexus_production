import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Building2, Lock, Bell, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api.php';

export default function ClientSettings() {
    const { user, token } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Profile form
    const [profile, setProfile] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        phone: (user as any)?.phone || '',
        bio: (user as any)?.bio || ''
    });

    // Company form
    const [company, setCompany] = useState({
        company_name: '',
        industry: '',
        address: '',
        city: '',
        country: '',
        website: '',
        tax_id: ''
    });

    // Password form
    const [password, setPassword] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        if (user) {
            setProfile({
                full_name: user.full_name || '',
                email: user.email || '',
                phone: (user as any)?.phone || '',
                bio: (user as any)?.bio || ''
            });
        }
        fetchCompanyInfo();
    }, [user]);

    const fetchCompanyInfo = async () => {
        try {
            const response = await axios.get(
                `${API_URL}?action=get_company_info`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success && response.data.data) {
                setCompany(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch company info:', error);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}?action=update-profile`,
                profile,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast({
                    title: 'Success',
                    description: 'Profile updated successfully',
                });
                // User will be updated on next page load or token refresh
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update profile',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCompanyUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}?action=update_company_info`,
                company,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast({
                    title: 'Success',
                    description: 'Company information updated successfully',
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update company information',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.new_password !== password.confirm_password) {
            toast({
                title: 'Error',
                description: 'New passwords do not match',
                variant: 'destructive',
            });
            return;
        }

        if (password.new_password.length < 8) {
            toast({
                title: 'Error',
                description: 'Password must be at least 8 characters long',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}?action=change-password`,
                {
                    current_password: password.current_password,
                    new_password: password.new_password
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                toast({
                    title: 'Success',
                    description: 'Password changed successfully',
                });
                setPassword({ current_password: '', new_password: '', confirm_password: '' });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to change password',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    Manage your account and preferences
                </p>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="profile">
                        <User className="w-4 h-4 mr-2" />
                        Profile
                    </TabsTrigger>
                    <TabsTrigger value="company">
                        <Building2 className="w-4 h-4 mr-2" />
                        Company
                    </TabsTrigger>
                    <TabsTrigger value="security">
                        <Lock className="w-4 h-4 mr-2" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="w-4 h-4 mr-2" />
                        Notifications
                    </TabsTrigger>
                </TabsList>

                {/* Profile Settings */}
                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Information</CardTitle>
                            <CardDescription>
                                Update your personal details and contact information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="full_name">Full Name *</Label>
                                        <Input
                                            id="full_name"
                                            value={profile.full_name}
                                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bio">Bio</Label>
                                    <Textarea
                                        id="bio"
                                        rows={4}
                                        placeholder="Tell us about yourself..."
                                        value={profile.bio}
                                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    />
                                </div>

                                <Separator />

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={loading}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Company Settings */}
                <TabsContent value="company">
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                            <CardDescription>
                                Manage your company details and billing information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCompanyUpdate} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="company_name">Company Name</Label>
                                        <Input
                                            id="company_name"
                                            value={company.company_name}
                                            onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="industry">Industry</Label>
                                        <Input
                                            id="industry"
                                            value={company.industry}
                                            onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            value={company.address}
                                            onChange={(e) => setCompany({ ...company, address: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            value={company.city}
                                            onChange={(e) => setCompany({ ...company, city: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            value={company.country}
                                            onChange={(e) => setCompany({ ...company, country: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="website">Website</Label>
                                        <Input
                                            id="website"
                                            type="url"
                                            placeholder="https://example.com"
                                            value={company.website}
                                            onChange={(e) => setCompany({ ...company, website: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tax_id">Tax ID / VAT Number</Label>
                                        <Input
                                            id="tax_id"
                                            value={company.tax_id}
                                            onChange={(e) => setCompany({ ...company, tax_id: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={loading}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>
                                Update your password to keep your account secure
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current_password">Current Password *</Label>
                                    <Input
                                        id="current_password"
                                        type="password"
                                        value={password.current_password}
                                        onChange={(e) => setPassword({ ...password, current_password: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="new_password">New Password *</Label>
                                    <Input
                                        id="new_password"
                                        type="password"
                                        value={password.new_password}
                                        onChange={(e) => setPassword({ ...password, new_password: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Must be at least 8 characters long
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm_password">Confirm New Password *</Label>
                                    <Input
                                        id="confirm_password"
                                        type="password"
                                        value={password.confirm_password}
                                        onChange={(e) => setPassword({ ...password, confirm_password: e.target.value })}
                                        required
                                    />
                                </div>

                                <Separator />

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={loading}>
                                        <Lock className="w-4 h-4 mr-2" />
                                        Update Password
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Preferences</CardTitle>
                            <CardDescription>
                                Manage how you receive updates and alerts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-center py-8 text-muted-foreground">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Notification preferences coming soon</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
