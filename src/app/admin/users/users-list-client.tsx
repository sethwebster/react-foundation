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
  const [newEmails, setNewEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [newRoles, setNewRoles] = useState<UserRole[]>([]); // Empty by default, 'user' is implicit
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRoles, setEditRoles] = useState<UserRole[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Filter out 'user' role as it's implicit for all users
  const getVisibleRoles = (roles: UserRole[]): UserRole[] => {
    return roles.filter(role => role !== 'user');
  };

  // Parse emails from pasted text (newline or comma separated)
  const parseEmails = (text: string): string[] => {
    return text
      .split(/[\n,;]+/) // Split by newline, comma, or semicolon
      .map(email => email.trim())
      .filter(email => email.length > 0 && email.includes('@'));
  };

  // Handle paste event - detect multiple emails
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const emails = parseEmails(pastedText);

    if (emails.length > 1) {
      // Multiple emails detected - prevent default and add as chips
      e.preventDefault();
      setNewEmails(prev => [...new Set([...prev, ...emails])]); // Use Set to avoid duplicates
      setEmailInput('');
    }
    // If single email, let default paste behavior happen
  };

  // Add current email input to chips
  const handleAddEmail = () => {
    if (!emailInput.trim()) return;

    const emails = parseEmails(emailInput);
    if (emails.length > 0) {
      setNewEmails(prev => [...new Set([...prev, ...emails])]);
      setEmailInput('');
    }
  };

  // Handle Enter key to add email as chip
  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddEmail();
    } else if (e.key === 'Backspace' && emailInput === '' && newEmails.length > 0) {
      // Backspace on empty input removes last email chip
      setNewEmails(prev => prev.slice(0, -1));
    }
  };

  // Remove specific email from chips
  const handleRemoveEmail = (emailToRemove: string) => {
    setNewEmails(prev => prev.filter(email => email !== emailToRemove));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Add current input if any
    if (emailInput.trim()) {
      handleAddEmail();
    }

    const emailsToAdd = emailInput.trim()
      ? [...newEmails, ...parseEmails(emailInput)]
      : newEmails;

    if (emailsToAdd.length === 0) {
      setError('Please enter at least one email address');
      return;
    }

    // Add 'user' role implicitly if no roles selected
    const rolesToAdd: UserRole[] = newRoles.length === 0 ? ['user'] : newRoles;

    startTransition(async () => {
      try {
        // Add users one by one
        const errors: string[] = [];
        for (const email of emailsToAdd) {
          try {
            await addUserAction(email, rolesToAdd);
          } catch (err) {
            errors.push(`${email}: ${err instanceof Error ? err.message : 'Failed'}`);
          }
        }

        if (errors.length > 0) {
          setError(`Some users failed to add:\n${errors.join('\n')}`);
        } else {
          // Success - clear form
          setNewEmails([]);
          setEmailInput('');
          setNewRoles([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add users');
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
                Email(s)
              </label>
              <div className="space-y-2">
                {/* Email chips */}
                {newEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-border bg-muted/30">
                    {newEmails.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 rounded-md bg-primary/20 px-2 py-1 text-sm text-primary-foreground"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(email)}
                          disabled={isPending}
                          className="ml-1 rounded hover:bg-primary/30 disabled:opacity-50"
                          aria-label={`Remove ${email}`}
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {/* Email input */}
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={handleEmailKeyDown}
                  placeholder={newEmails.length > 0 ? "Add another email..." : "user@example.com or paste multiple"}
                  disabled={isPending}
                  className="w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
                />
                <p className="text-xs text-muted-foreground">
                  Paste multiple emails (one per line) or press Enter to add
                </p>
              </div>
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
            {isPending
              ? 'Adding...'
              : newEmails.length > 1
              ? `Add ${newEmails.length} Users`
              : newEmails.length === 1
              ? 'Add 1 User'
              : 'Add User(s)'}
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
