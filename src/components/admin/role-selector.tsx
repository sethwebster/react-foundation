/**
 * Role Selector Component
 * Multi-select role picker with descriptions
 */

'use client';

import { useState } from 'react';
import type { UserRole, AssignableRole } from '@/lib/admin/types';
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_HIERARCHY, ASSIGNABLE_ROLES } from '@/lib/admin/types';

interface RoleSelectorProps {
  selectedRoles: UserRole[];
  onChange: (roles: UserRole[]) => void;
  disabled?: boolean;
}

export function RoleSelector({ selectedRoles, onChange, disabled = false }: RoleSelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleRole = (role: UserRole) => {
    if (disabled) return;

    if (selectedRoles.includes(role)) {
      // Remove role
      onChange(selectedRoles.filter(r => r !== role));
    } else {
      // Add role
      onChange([...selectedRoles, role]);
    }
  };

  // Only show assignable roles (filter out 'user' which is implicit)
  const visibleSelectedRoles = selectedRoles.filter(role => role !== 'user');

  // Sort roles by hierarchy level (highest first)
  const sortedRoles = [...ASSIGNABLE_ROLES].sort((a, b) =>
    ROLE_HIERARCHY[b] - ROLE_HIERARCHY[a]
  );

  const getHighestRole = (): UserRole | null => {
    if (selectedRoles.length === 0) return null;
    return selectedRoles.reduce((highest, role) =>
      ROLE_HIERARCHY[role] > ROLE_HIERARCHY[highest] ? role : highest
    );
  };

  const highestRole = getHighestRole();

  return (
    <div className="relative">
      {/* Display selected roles (exclude 'user') */}
      <div
        className={`min-h-[42px] rounded-lg border border-border bg-input px-3 py-2 cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => !disabled && setShowDropdown(!showDropdown)}
      >
        {visibleSelectedRoles.length === 0 ? (
          <span className="text-muted-foreground text-sm">Select roles...</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {visibleSelectedRoles.map(role => (
              <span
                key={role}
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${
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
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRole(role);
                    }}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown with all roles */}
      {showDropdown && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown content */}
          <div className="absolute left-0 right-0 top-full mt-2 z-20 rounded-lg border border-border bg-card shadow-lg">
            <div className="p-2">
              {sortedRoles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`w-full text-left rounded-lg px-3 py-2 transition ${
                    selectedRoles.includes(role)
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedRoles.includes(role)
                        ? 'bg-primary border-primary'
                        : 'border-border'
                    }`}>
                      {selectedRoles.includes(role) && (
                        <svg className="w-3 h-3 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        {ROLE_LABELS[role]}
                        {role === highestRole && selectedRoles.length > 1 && (
                          <span className="text-xs font-normal text-muted-foreground">(highest)</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-0.5">
                        {ROLE_DESCRIPTIONS[role]}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
