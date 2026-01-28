import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot, Bell, Building2, Save, Loader2, Plus, X,
  Facebook, Twitter, Linkedin, Instagram
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatSettings {
  agent_name: string;
  greeting_message: string;
  business_hours_start: string;
  business_hours_end: string;
  auto_response_enabled: boolean;
  quick_replies: string[];
}

interface NotificationSettings {
  email_notifications: boolean;
  sound_enabled: boolean;
  new_chat_alert: boolean;
}

interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  social_links: {
    facebook: string;
    twitter: string;
    linkedin: string;
    instagram: string;
  };
}

export const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    agent_name: 'Tsion',
    greeting_message: '',
    business_hours_start: '09:00',
    business_hours_end: '18:00',
    auto_response_enabled: false,
    quick_replies: [],
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    sound_enabled: true,
    new_chat_alert: true,
  });
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'G-Squad',
    email: '',
    phone: '',
    social_links: { facebook: '', twitter: '', linkedin: '', instagram: '' },
  });
  const [newQuickReply, setNewQuickReply] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    businessHours?: string;
    email?: string;
    phone?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  }>({});

  const { toast } = useToast();

  // Validation functions
  const validateBusinessHours = (start: string, end: string): string | null => {
    if (!start || !end) return "Both times are required";
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMins = startHour * 60 + startMin;
    const endMins = endHour * 60 + endMin;
    return startMins >= endMins ? "Start time must be before end time" : null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email) return null; // Allow empty
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(email) ? "Invalid email format" : null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null; // Allow empty
    const phoneRegex = /^\+251\s?9\d{2}\s?\d{6}$/;
    return !phoneRegex.test(phone) ? "Invalid phone format. Use: +251 9XX XXXXXX" : null;
  };

  const validateURL = (url: string): string | null => {
    if (!url) return null; // Allow empty
    try {
      new URL(url);
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return "URL must start with http:// or https://";
      }
      return null;
    } catch {
      return "Invalid URL format";
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('admin_settings')
        .select('*');

      if (data) {
        data.forEach(setting => {
          if (setting.key === 'chat_settings') {
            setChatSettings(setting.value as unknown as ChatSettings);
          } else if (setting.key === 'notification_settings') {
            setNotificationSettings(setting.value as unknown as NotificationSettings);
          } else if (setting.key === 'company_settings') {
            setCompanySettings(setting.value as unknown as CompanySettings);
          }
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (key: string, value: unknown) => {
    // Validate before saving
    if (key === 'chat_settings') {
      const settings = value as ChatSettings;
      const hoursError = validateBusinessHours(settings.business_hours_start, settings.business_hours_end);
      if (hoursError) {
        setValidationErrors({ businessHours: hoursError });
        toast({ title: 'Validation failed', description: hoursError, variant: 'destructive' });
        return;
      }
    }

    if (key === 'company_settings') {
      const settings = value as CompanySettings;
      const errors: typeof validationErrors = {};

      const emailError = validateEmail(settings.email);
      if (emailError) errors.email = emailError;

      const phoneError = validatePhone(settings.phone);
      if (phoneError) errors.phone = phoneError;

      const facebookError = validateURL(settings.social_links.facebook);
      if (facebookError) errors.facebook = facebookError;

      const twitterError = validateURL(settings.social_links.twitter);
      if (twitterError) errors.twitter = twitterError;

      const linkedinError = validateURL(settings.social_links.linkedin);
      if (linkedinError) errors.linkedin = linkedinError;

      const instagramError = validateURL(settings.social_links.instagram);
      if (instagramError) errors.instagram = instagramError;

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast({
          title: 'Validation failed',
          description: 'Please fix the errors and try again',
          variant: 'destructive'
        });
        return;
      }
    }

    setValidationErrors({});
    setIsSaving(true);
    try {
      // Cast to any to satisfy Supabase JSON type
      const { error } = await supabase
        .from('admin_settings')
        .update({ value: value as any, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;

      toast({ title: 'Settings saved successfully' });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ title: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddQuickReply = () => {
    if (newQuickReply.trim()) {
      const updated = {
        ...chatSettings,
        quick_replies: [...chatSettings.quick_replies, newQuickReply.trim()],
      };
      setChatSettings(updated);
      setNewQuickReply('');
    }
  };

  const handleRemoveQuickReply = (index: number) => {
    const updated = {
      ...chatSettings,
      quick_replies: chatSettings.quick_replies.filter((_, i) => i !== index),
    };
    setChatSettings(updated);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Settings</h3>
        <p className="text-sm text-muted-foreground">Configure your admin panel and chat settings</p>
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="gap-2">
            <Bot className="w-4 h-4" />
            Chat Settings
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="company" className="gap-2">
            <Building2 className="w-4 h-4" />
            Company
          </TabsTrigger>
        </TabsList>

        {/* Chat Settings */}
        <TabsContent value="chat">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Chat Widget Configuration</CardTitle>
                <CardDescription>Customize how your AI chat assistant behaves</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-name">AI Agent Name</Label>
                    <Input
                      id="agent-name"
                      value={chatSettings.agent_name}
                      onChange={(e) => setChatSettings({ ...chatSettings, agent_name: e.target.value })}
                      placeholder="Tsion"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hours-start">Business Hours Start</Label>
                      <Input
                        id="hours-start"
                        type="time"
                        value={chatSettings.business_hours_start}
                        onChange={(e) => setChatSettings({ ...chatSettings, business_hours_start: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hours-end">Business Hours End</Label>
                      <Input
                        id="hours-end"
                        type="time"
                        value={chatSettings.business_hours_end}
                        onChange={(e) => setChatSettings({ ...chatSettings, business_hours_end: e.target.value })}
                        className={validationErrors.businessHours ? 'border-destructive' : ''}
                      />
                    </div>
                  </div>
                  {validationErrors.businessHours && (
                    <p className="text-sm text-destructive">{validationErrors.businessHours}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="greeting">Greeting Message</Label>
                  <Textarea
                    id="greeting"
                    value={chatSettings.greeting_message}
                    onChange={(e) => setChatSettings({ ...chatSettings, greeting_message: e.target.value })}
                    placeholder="Hi! I am Tsion, your AI assistant from G-Squad..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium">Auto-response for Off-hours</p>
                    <p className="text-sm text-muted-foreground">Automatically respond when outside business hours</p>
                  </div>
                  <Switch
                    checked={chatSettings.auto_response_enabled}
                    onCheckedChange={(checked) => setChatSettings({ ...chatSettings, auto_response_enabled: checked })}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Quick Reply Suggestions</Label>
                  <div className="flex flex-wrap gap-2">
                    {chatSettings.quick_replies.map((reply, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 py-1.5 px-3">
                        {reply}
                        <button onClick={() => handleRemoveQuickReply(index)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a quick reply..."
                      value={newQuickReply}
                      onChange={(e) => setNewQuickReply(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddQuickReply()}
                    />
                    <Button variant="outline" onClick={handleAddQuickReply}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => saveSettings('chat_settings', chatSettings)}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Chat Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how you receive alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive email alerts for new chats</p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, email_notifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium">Sound Alerts</p>
                    <p className="text-sm text-muted-foreground">Play sound when new messages arrive</p>
                  </div>
                  <Switch
                    checked={notificationSettings.sound_enabled}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, sound_enabled: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div>
                    <p className="font-medium">New Chat Alert</p>
                    <p className="text-sm text-muted-foreground">Show badge when new conversations start</p>
                  </div>
                  <Switch
                    checked={notificationSettings.new_chat_alert}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, new_chat_alert: checked })
                    }
                  />
                </div>

                <Button
                  onClick={() => saveSettings('notification_settings', notificationSettings)}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Company Settings */}
        <TabsContent value="company">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Manage your company details and social links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={companySettings.name}
                      onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                      placeholder="G-Squad"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-email">Contact Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={companySettings.email}
                      onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                      placeholder="info@g-squad.net"
                      className={validationErrors.email ? 'border-destructive' : ''}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-destructive">{validationErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone Number</Label>
                  <Input
                    id="company-phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                    placeholder="+251 911 123456"
                    className={validationErrors.phone ? 'border-destructive' : ''}
                  />
                  {validationErrors.phone && (
                    <p className="text-sm text-destructive">{validationErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Social Media Links</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <Input
                          placeholder="Facebook URL"
                          value={companySettings.social_links.facebook}
                          onChange={(e) => setCompanySettings({
                            ...companySettings,
                            social_links: { ...companySettings.social_links, facebook: e.target.value }
                          })}
                          className={validationErrors.facebook ? 'border-destructive' : ''}
                        />
                      </div>
                      {validationErrors.facebook && (
                        <p className="text-sm text-destructive">{validationErrors.facebook}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Twitter className="w-5 h-5 text-sky-500" />
                        <Input
                          placeholder="Twitter URL"
                          value={companySettings.social_links.twitter}
                          onChange={(e) => setCompanySettings({
                            ...companySettings,
                            social_links: { ...companySettings.social_links, twitter: e.target.value }
                          })}
                          className={validationErrors.twitter ? 'border-destructive' : ''}
                        />
                      </div>
                      {validationErrors.twitter && (
                        <p className="text-sm text-destructive">{validationErrors.twitter}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Linkedin className="w-5 h-5 text-blue-700" />
                        <Input
                          placeholder="LinkedIn URL"
                          value={companySettings.social_links.linkedin}
                          onChange={(e) => setCompanySettings({
                            ...companySettings,
                            social_links: { ...companySettings.social_links, linkedin: e.target.value }
                          })}
                          className={validationErrors.linkedin ? 'border-destructive' : ''}
                        />
                      </div>
                      {validationErrors.linkedin && (
                        <p className="text-sm text-destructive">{validationErrors.linkedin}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-5 h-5 text-pink-500" />
                        <Input
                          placeholder="Instagram URL"
                          value={companySettings.social_links.instagram}
                          onChange={(e) => setCompanySettings({
                            ...companySettings,
                            social_links: { ...companySettings.social_links, instagram: e.target.value }
                          })}
                          className={validationErrors.instagram ? 'border-destructive' : ''}
                        />
                      </div>
                      {validationErrors.instagram && (
                        <p className="text-sm text-destructive">{validationErrors.instagram}</p>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => saveSettings('company_settings', companySettings)}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Company Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
