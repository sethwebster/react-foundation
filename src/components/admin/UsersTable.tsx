/**
 * Users Table Component - Client Component
 * Displays users in a table format with role editing
 * Uses RFDS Table component for consistent styling
 */

'use client';

import { useState, useTransition } from 'react';
import { RFDS, type TableColumn } from '@/components/rfds';
import { RoleSelector } from '@/components/admin/role-selector';
import type { User, UserRole } from '@/lib/admin/types';
import { ROLE_LABELS } from '@/lib/admin/types';
import { updateUserRolesAction, removeUserAction } from '@/app/admin/actions';
import { Pencil, Trash2 } from 'lucide-react';

export interface UsersTableProps {
  users: User[];
  currentUserEmail: string;
  onUpdate?: () => void;
}

export function UsersTable({ users, currentUserEmail, onUpdate }: UsersTableProps) {
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<UserRole[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Filter out 'user' role as it's implicit for all users
  const getVisibleRoles = (roles: UserRole[]): UserRole[] => {
    return roles.filter(role => role !== 'user');
  };

  const handleEditRoles = (email: string, currentRoles: UserRole[]) => {
    setEditingUser(email);
    setEditRoles(getVisibleRoles(currentRoles));
    setError(null);
  };

  const handleSaveRoles = (email: string) => {
    const rolesToSave: UserRole[] = editRoles.length === 0 ? ['user'] : editRoles;
    setError(null);
    startTransition(async () => {
      try {
        await updateUserRolesAction(email, rolesToSave);
        setEditingUser(null);
        setEditRoles([]);
        onUpdate?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update roles');
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditRoles([]);
    setError(null);
  };

  const handleRemoveUser = (email: string) => {
    if (!confirm(`Remove ${email}?`)) return;
    startTransition(async () => {
      try {
        await removeUserAction(email);
        onUpdate?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove user');
      }
    });
  };

  const columns: TableColumn<User>[] = [
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (_value: unknown, user: User) => (
        <div>
          <div className="font-semibold text-foreground">{user.email}</div>
          {user.email === currentUserEmail && (
            <span className="text-xs text-muted-foreground">(You)</span>
          )}
        </div>
      ),
      accessor: (user: User) => user.email.toLowerCase(),
    },
    {
      key: 'addedAt',
      label: 'Added',
      sortable: true,
      render: (_value: unknown, user: User) => (
        <div className="text-sm">
          <div className="text-foreground">
            {new Date(user.addedAt).toLocaleDateString()}
          </div>
          {user.addedBy && (
            <div className="text-muted-foreground text-xs">
              by {user.addedBy}
            </div>
          )}
        </div>
      ),
      accessor: (user: User) => {
        const date = new Date(user.addedAt).getTime();
        return date;
      },
    },
    {
      key: 'roles',
      label: 'Roles',
      sortable: true,
      render: (_value: unknown, user: User) => {
        const isEditing = editingUser === user.email;
        
        if (isEditing) {
          return (
            <div className="space-y-2">
              <RoleSelector
                selectedRoles={editRoles}
                onChange={setEditRoles}
                disabled={isPending}
              />
              <div className="flex gap-2">
                <RFDS.SemanticButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleSaveRoles(user.email)}
                  disabled={isPending}
                >
                  Save
                </RFDS.SemanticButton>
                <RFDS.SemanticButton
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isPending}
                >
                  Cancel
                </RFDS.SemanticButton>
              </div>
              {error && editingUser === user.email && (
                <p className="text-xs text-destructive">{error}</p>
              )}
            </div>
          );
        }

        const visibleRoles = getVisibleRoles(user.roles || []);
        if (visibleRoles.length === 0) {
          return (
            <span className="text-sm text-muted-foreground italic">
              No special roles (basic user)
            </span>
          );
        }

        return (
          <div className="flex flex-wrap gap-1">
            {visibleRoles.map(role => {
              const roleColors: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
                admin: 'destructive',
                community_manager: 'primary',
                library_manager: 'success',
              };
              return (
                <RFDS.SemanticBadge
                  key={role}
                  variant={roleColors[role] || 'default'}
                >
                  {ROLE_LABELS[role]}
                </RFDS.SemanticBadge>
              );
            })}
          </div>
        );
      },
      accessor: (user: User) => {
        const visibleRoles = getVisibleRoles(user.roles || []);
        return visibleRoles.join(' ').toLowerCase() || 'basic user';
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      align: 'right',
      render: (_value: unknown, user: User) => {
        const isEditing = editingUser === user.email;
        const isCurrentUser = user.email === currentUserEmail;

        if (isEditing || isCurrentUser) {
          return null;
        }

        return (
          <div className="flex items-center gap-2 justify-end">
            <RFDS.SemanticButton
              variant="ghost"
              size="sm"
              onClick={() => handleEditRoles(user.email, user.roles)}
              disabled={isPending}
              className="h-9 w-9 p-0"
              title="Edit Roles"
              aria-label="Edit user roles"
            >
              <Pencil className="h-4 w-4" />
            </RFDS.SemanticButton>
            <RFDS.SemanticButton
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveUser(user.email)}
              disabled={isPending}
              className="h-9 w-9 p-0 text-destructive hover:text-destructive"
              title="Remove User"
              aria-label="Remove user"
            >
              <Trash2 className="h-4 w-4" />
            </RFDS.SemanticButton>
          </div>
        );
      },
    },
  ];

  return (
    <RFDS.Table
      data={users}
      columns={columns}
      searchable
      searchPlaceholder="Search users by email..."
      defaultSortKey="email"
      defaultSortDirection="asc"
      getRowKey={(user) => user.email}
    />
  );
}

