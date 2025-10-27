/**
 * Users List Client Component
 * Handles interactive UI for user management
 */

'use client';

import { useState, useTransition } from 'react';
import { addUserAction, removeUserAction, updateUserRolesAction } from '../actions';
import type { User, UserRole } from '@/lib/admin/types';
import { ROLE_LABELS } from '@/lib/admin/types';
import { RoleSelector } from '@/components/admin/role-selector';

export function UsersListClient({
  users: initialUsers,
  currentUserEmail,
}: {
  users: User[];
  currentUserEmail: string;
}) {
  const [newEmail, setNewEmail] = useState('');
  const [newRoles, setNewRoles] = useState<UserRole[]>([]); // Empty by default, 'user' is implicit
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<UserRole[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Filter out 'user' role as it's implicit for all users
  const getVisibleRoles = (roles: UserRole[]): UserRole[] => {
    return roles.filter(role => role !== 'user');
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Add 'user' role implicitly if no roles selected
    const rolesToAdd: UserRole[] = newRoles.length === 0 ? ['user'] : newRoles;

    startTransition(async () => {
      try {
        await addUserAction(newEmail, rolesToAdd);
        setNewEmail('');
        setNewRoles([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add user');
      }
    });
  };

  const handleRemoveUser = (email: string) => {
    if (!confirm(`Remove ${email}?`)) return;

    startTransition(async () => {
      try {
        await removeUserAction(email);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove user');
      }
    });
  };

  const handleEditRoles = (email: string, currentRoles: UserRole[]) => {
    setEditingUser(email);
    // Only show assignable roles for editing
    setEditRoles(getVisibleRoles(currentRoles));
  };

  const handleSaveRoles = (email: string) => {
    // Add 'user' role implicitly if no roles selected
    const rolesToSave: UserRole[] = editRoles.length === 0 ? ['user'] : editRoles;

    setError(null);
    startTransition(async () => {
      try {
        await updateUserRolesAction(email, rolesToSave);
        setEditingUser(null);
        setEditRoles([]);
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

  return (
    <>
      {/* Add User Form */}
      <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Add User</h2>
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive-foreground">
            {error}
          </div>
        )}
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={isPending}
                className="w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Roles
              </label>
              <RoleSelector
                selectedRoles={newRoles}
                onChange={setNewRoles}
                disabled={isPending}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-6 py-2 font-semibold text-foreground transition hover:bg-primary/50 disabled:opacity-50"
          >
            {isPending ? 'Adding...' : 'Add User'}
          </button>
        </form>
      </div>

      {/* Users List */}
      <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Users ({initialUsers.length})
        </h2>

        {initialUsers.length === 0 && (
          <p className="text-center text-foreground/60">No users yet</p>
        )}

        <div className="space-y-4">
          {initialUsers.map((user) => {
            const isEditing = editingUser === user.email;

            return (
              <div
                key={user.email}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-medium text-foreground">{user.email}</p>
                      {user.email === currentUserEmail && (
                        <span className="text-xs text-muted-foreground">(You)</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Added {new Date(user.addedAt).toLocaleDateString()}
                      {user.addedBy && ` by ${user.addedBy}`}
                    </p>

                    {/* Display or Edit Roles */}
                    {isEditing ? (
                      <div className="space-y-3">
                        <RoleSelector
                          selectedRoles={editRoles}
                          onChange={setEditRoles}
                          disabled={isPending}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveRoles(user.email)}
                            disabled={isPending}
                            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/80 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isPending}
                            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {getVisibleRoles(user.roles || []).length === 0 ? (
                          <span className="text-sm text-muted-foreground italic">
                            No special roles (basic user)
                          </span>
                        ) : (
                          getVisibleRoles(user.roles || []).map(role => (
                            <span
                              key={role}
                              className={`inline-flex items-center rounded px-2 py-1 text-xs font-semibold ${
                                role === 'admin'
                                  ? 'bg-accent/20 text-accent-foreground'
                                  : role === 'community_manager'
                                  ? 'bg-primary/20 text-primary-foreground'
                                  : role === 'library_manager'
                                  ? 'bg-success/20 text-success-foreground'
                                  : 'bg-muted/60 text-muted-foreground'
                              }`}
                            >
                              {ROLE_LABELS[role]}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {!isEditing && user.email !== currentUserEmail && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditRoles(user.email, user.roles)}
                        disabled={isPending}
                        className="rounded bg-muted px-3 py-1 text-sm font-semibold text-foreground transition hover:bg-muted/70 disabled:opacity-50"
                      >
                        Edit Roles
                      </button>
                      <button
                        onClick={() => handleRemoveUser(user.email)}
                        disabled={isPending}
                        className="rounded bg-destructive/20 px-3 py-1 text-sm text-destructive-foreground transition hover:bg-destructive/30 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
