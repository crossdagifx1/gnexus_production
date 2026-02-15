import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminShell } from '@/components/admin/layout/AdminShell';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import ProjectManager from '@/components/admin/modules/ProjectManager';
import PostManager from '@/components/admin/modules/PostManager';
import ComponentManager from '@/components/admin/modules/ComponentManager';
import PlatformManager from '@/components/admin/modules/PlatformManager';
import UserManager from '@/components/admin/modules/UserManager';
import SettingsManager from '@/components/admin/modules/SettingsManager';
import ServiceManager from '@/components/admin/modules/ServiceManager';
import TeamManager from '@/components/admin/modules/TeamManager';
import InquiryManager from '@/components/admin/modules/InquiryManager';

const Admin = () => {
  return (
    <AdminShell>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="projects" element={<ProjectManager />} />
        <Route path="posts" element={<PostManager />} />
        <Route path="components" element={<ComponentManager />} />
        <Route path="platforms" element={<PlatformManager />} />
        <Route path="users" element={<UserManager />} />
        <Route path="services" element={<ServiceManager />} />
        <Route path="team" element={<TeamManager />} />
        <Route path="inquiries" element={<InquiryManager />} />
        <Route path="settings" element={<SettingsManager />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminShell>
  );
};

export default Admin;
