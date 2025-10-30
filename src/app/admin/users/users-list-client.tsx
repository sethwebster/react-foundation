/**
 * Users List Client Component
 * Handles interactive UI for user management
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addUserAction } from '../actions';
import type { User, UserRole } from '@/lib/admin/types';
import { RoleSelector } from '@/components/admin/role-selector';
import { RFDS } from '@/components/rfds';
import { X } from 'lucide-react';
import { UsersTable } from '@/components/admin/UsersTable';

export function UsersListClient({
  users: initialUsers,
  currentUserEmail,
}: {
  users: User[];
  currentUserEmail: string;
}) {
  const router = useRouter();
  const [newEmails, setNewEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [newRoles, setNewRoles] = useState<UserRole[]>([]); // Empty by default, 'user' is implicit
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = () => {
    router.refresh();
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
                        <RFDS.SemanticButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveEmail(email)}
                          disabled={isPending}
                          className="ml-1 h-5 w-5 p-0"
                          aria-label={`Remove ${email}`}
                        >
                          <X className="h-3 w-3" />
                        </RFDS.SemanticButton>
                      </span>
                    ))}
                  </div>
                )}
                {/* Email input */}
                <RFDS.Input
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
          <RFDS.SemanticButton
            type="submit"
            variant="primary"
            disabled={isPending}
          >
            {isPending
              ? 'Adding...'
              : newEmails.length > 1
              ? `Add ${newEmails.length} Users`
              : newEmails.length === 1
              ? 'Add 1 User'
              : 'Add User(s)'}
          </RFDS.SemanticButton>
        </form>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-border/10 bg-muted/60 p-6">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Users ({initialUsers.length})
        </h2>
        <UsersTable
          users={initialUsers}
          currentUserEmail={currentUserEmail}
          onUpdate={handleUpdate}
        />
      </div>
    </>
  );
}
