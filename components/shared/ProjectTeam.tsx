import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Mail, Phone, Shield, Code, Briefcase, User } from 'lucide-react';
import type { User as UserType } from '../../src/generated/ash-rpc';

interface ProjectTeamProps {
  teamMembers: UserType[];
}

const ProjectTeam: React.FC<ProjectTeamProps> = ({ teamMembers }) => {
  const { t } = useTranslation();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'siteflow_admin':
        return Shield;
      case 'siteflow_kam':
        return Briefcase;
      case 'siteflow_pl':
        return User;
      case 'siteflow_dev_frontend':
      case 'siteflow_dev_backend':
      case 'siteflow_dev_fullstack':
        return Code;
      case 'customer':
        return User;
      default:
        return User;
    }
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      siteflow_admin: t('project.team.roles.admin'),
      siteflow_kam: t('project.team.roles.kam'),
      siteflow_pl: t('project.team.roles.project_leader'),
      siteflow_dev_frontend: t('project.team.roles.frontend_dev'),
      siteflow_dev_backend: t('project.team.roles.backend_dev'),
      siteflow_dev_fullstack: t('project.team.roles.fullstack_dev'),
      customer: t('project.team.roles.customer'),
      partner: t('project.team.roles.partner'),
    };

    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'siteflow_admin':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'siteflow_kam':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'siteflow_pl':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'siteflow_dev_frontend':
      case 'siteflow_dev_backend':
      case 'siteflow_dev_fullstack':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'customer':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Group team members by role
  const groupedMembers = teamMembers.reduce((acc, member) => {
    const role = member.role as string;
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(member);
    return acc;
  }, {} as Record<string, UserType[]>);

  // Define role order for display
  const roleOrder = [
    'siteflow_pl',
    'siteflow_kam',
    'siteflow_dev_fullstack',
    'siteflow_dev_frontend',
    'siteflow_dev_backend',
    'siteflow_admin',
    'customer',
    'partner',
  ];

  const sortedRoles = Object.keys(groupedMembers).sort((a, b) => {
    const indexA = roleOrder.indexOf(a);
    const indexB = roleOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  if (teamMembers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('project.team.title')}</h3>
        <div className="text-center py-8 text-slate-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{t('project.team.no_members')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-slate-700" />
        <h3 className="text-lg font-semibold text-slate-900">{t('project.team.title')}</h3>
        <span className="ml-auto text-sm text-slate-500">
          {teamMembers.length} {t('project.team.members')}
        </span>
      </div>

      <div className="space-y-6">
        {sortedRoles.map((role) => {
          const members = groupedMembers[role];
          const RoleIcon = getRoleIcon(role);

          return (
            <div key={role} className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-center gap-2 mb-3">
                <RoleIcon className="w-4 h-4 text-slate-600" />
                <h4 className="text-sm font-semibold text-slate-700">{getRoleLabel(role)}</h4>
                <span className="text-xs text-slate-500">({members.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                      {member.name ? member.name.charAt(0).toUpperCase() : member.email.charAt(0).toUpperCase()}
                    </div>

                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-900 truncate">
                          {member.name || member.email.split('@')[0]}
                        </p>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1">
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{member.email}</span>
                        </a>

                        {member.phone_number && (
                          <a
                            href={`tel:${member.phone_number}`}
                            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{member.phone_number}</span>
                          </a>
                        )}
                      </div>

                      {/* Role Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-2 ${getRoleBadgeColor(
                          role
                        )}`}
                      >
                        {getRoleLabel(role)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectTeam;
