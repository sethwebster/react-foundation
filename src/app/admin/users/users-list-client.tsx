/**
 * Users List Client Component
 * Handles interactive UI for user management
 */

'use client';

import { useState, useTransition } from 'react';
import { addUserAction, removeUserAction, updateUserRoleAction } from '../actions';
import type { User } from '@/lib/admin/user-management-service';

export function UsersListClient({
  users: initialUsers,
  currentUserEmail,
}: {
  users: User[];
  currentUserEmail: string;
}) {
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        await addUserAction(newEmail, newRole);
        setNewEmail('');
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

  const handleChangeRole = (email: string, role: 'user' | 'admin') => {
    startTransition(async () => {
      try {
        await updateUserRoleAction(email, role);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update role');
      }
    });
  };

  return (
    <>
      {/* Add User Form */}
      <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">Add User</h2>
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}
        <form onSubmit={handleAddUser} className="flex gap-4">
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="user@example.com"
            disabled={isPending}
            className="flex-1 rounded-lg border border-border/20 bg-foreground/50 px-4 py-2 text-foreground outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 disabled:opacity-50"
          />
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as 'user' | 'admin')}
            disabled={isPending}
            className="rounded-lg border border-border/20 bg-foreground/50 px-4 py-2 text-foreground outline-none focus:border-cyan-400 disabled:opacity-50"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
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

        <div className="space-y-2">
          {initialUsers.map((user) => (
            <div
              key={user.email}
              className="flex items-center justify-between rounded-lg border border-border/10 bg-foreground/30 p-4"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{user.email}</p>
                <p className="text-sm text-foreground/50">
                  Added {new Date(user.addedAt).toLocaleDateString()}
                  {user.addedBy && ` by ${user.addedBy}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Role Badge */}
                <span
                  className={`rounded px-3 py-1 text-sm font-semibold ${
                    user.role === 'admin'
                      ? 'bg-accent/20 text-purple-300'
                      : 'bg-primary/20 text-cyan-300'
                  }`}
                >
                  {user.role}
                </span>

                {/* Change Role */}
                {user.email !== currentUserEmail && (
                  <button
                    onClick={() =>
                      handleChangeRole(
                        user.email,
                        user.role === 'admin' ? 'user' : 'admin'
                      )
                    }
                    disabled={isPending}
                    className="rounded bg-background/10 px-3 py-1 text-sm text-foreground/70 transition hover:bg-background/20 hover:text-foreground disabled:opacity-50"
                  >
                    Make {user.role === 'admin' ? 'User' : 'Admin'}
                  </button>
                )}

                {/* Remove */}
                {user.email !== currentUserEmail && (
                  <button
                    onClick={() => handleRemoveUser(user.email)}
                    disabled={isPending}
                    className="rounded bg-destructive/20 px-3 py-1 text-sm text-red-300 transition hover:bg-destructive/30 disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}

                {user.email === currentUserEmail && (
                  <span className="text-sm text-foreground/40">(You)</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
