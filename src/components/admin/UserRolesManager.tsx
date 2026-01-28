import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Shield, ShieldCheck, ShieldAlert, User } from 'lucide-react';

interface UserRole {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'user';
  created_at: string;
  email?: string;
}

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
}

export const UserRolesManager = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'super_admin' | 'admin' | 'moderator' | 'user'>('user');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      if (profilesError) throw profilesError;

      // Map emails to roles
      const rolesWithEmails = (rolesData || []).map(role => {
        const profile = profilesData?.find(p => p.id === role.user_id);
        return {
          ...role,
          email: profile?.email || 'Unknown'
        };
      });

      setUserRoles(rolesWithEmails);
      setProfiles(profilesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error fetching users',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRole = async () => {
    if (!newUserEmail.trim()) {
      toast({ title: 'Please enter an email', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      // Find user by email in profiles
      const profile = profiles.find(p => p.email?.toLowerCase() === newUserEmail.toLowerCase());
      
      if (!profile) {
        toast({ 
          title: 'User not found', 
          description: 'The user must have logged in at least once.',
          variant: 'destructive' 
        });
        return;
      }

      // Check if role already exists
      const existingRole = userRoles.find(r => r.user_id === profile.id);
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newUserRole })
          .eq('id', existingRole.id);
        
        if (error) throw error;
        toast({ title: 'Role updated successfully' });
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: profile.id, role: newUserRole });
        
        if (error) throw error;
        toast({ title: 'Role assigned successfully' });
      }

      setIsDialogOpen(false);
      setNewUserEmail('');
      setNewUserRole('user');
      fetchData();
    } catch (error) {
      console.error('Error adding role:', error);
      toast({ 
        title: 'Error assigning role', 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
      
      toast({ title: 'Role removed successfully' });
      fetchData();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast({ 
        title: 'Error removing role', 
        variant: 'destructive' 
      });
    }
  };

  const handleUpdateRole = async (roleId: string, newRole: 'super_admin' | 'admin' | 'moderator' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('id', roleId);

      if (error) throw error;
      
      toast({ title: 'Role updated successfully' });
      fetchData();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({ 
        title: 'Error updating role', 
        description: 'You may not have permission to change this role.',
        variant: 'destructive' 
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <ShieldAlert className="w-4 h-4" />;
      case 'admin':
        return <ShieldCheck className="w-4 h-4" />;
      case 'moderator':
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'moderator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const isSuperAdmin = (role: string) => role === 'super_admin';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">User Roles</h3>
          <p className="text-sm text-muted-foreground">
            Manage user access levels and permissions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Assign Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign User Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The user must have logged in at least once.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as typeof newUserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full access</SelectItem>
                    <SelectItem value="moderator">Moderator - Limited access</SelectItem>
                    <SelectItem value="user">User - Basic access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddRole} className="w-full" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Assign Role
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {userRoles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No user roles assigned yet.</p>
          <p className="text-sm">Assign roles to control access to the admin panel.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userRoles.map((userRole) => (
              <TableRow key={userRole.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {userRole.email}
                    {isSuperAdmin(userRole.role) && (
                      <Badge variant="destructive" className="text-xs">Protected</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {isSuperAdmin(userRole.role) ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/20">
                      <ShieldAlert className="w-4 h-4 text-destructive" />
                      <span className="text-destructive font-medium">Super Admin</span>
                    </div>
                  ) : (
                    <Select 
                      value={userRole.role} 
                      onValueChange={(v) => handleUpdateRole(userRole.id, v as typeof userRole.role)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(userRole.role)}
                          <span className="capitalize">{userRole.role.replace('_', ' ')}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Admin
                          </div>
                        </SelectItem>
                        <SelectItem value="moderator">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Moderator
                          </div>
                        </SelectItem>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            User
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(userRole.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {!isSuperAdmin(userRole.role) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDeleteRole(userRole.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};
