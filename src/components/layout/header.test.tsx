// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseSession = vi.fn();

vi.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span>{alt}</span>,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  ButtonLink: ({ children, href }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/components/layout/mobile-menu', () => ({
  MobileMenu: () => <span>Mobile menu</span>,
}));

vi.mock('@/components/ui/user-avatar', () => ({
  UserAvatar: () => <span>User avatar</span>,
}));

vi.mock('@/components/ui/theme-toggle-wrapper', () => ({
  ThemeToggleWrapper: () => <span>Theme toggle</span>,
}));

describe('Header session state', () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ isAdmin: false }),
    }));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  it('does not show a signed-out action while the session is loading', async () => {
    mockUseSession.mockReturnValue({ data: undefined, status: 'loading' });
    const { Header } = await import('./header');

    await act(async () => root.render(<Header />));

    expect(container.textContent).not.toContain('Sign in');
  });

  it('shows the profile action for an authenticated session', async () => {
    mockUseSession.mockReturnValue({
      data: { user: { email: 'member@example.com' } },
      status: 'authenticated',
    });
    const { Header } = await import('./header');

    await act(async () => root.render(<Header />));

    expect(container.textContent).toContain('User avatar');
    expect(container.textContent).not.toContain('Sign in');
  });

  it('shows the sign-in action after an unauthenticated session resolves', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    const { Header } = await import('./header');

    await act(async () => root.render(<Header />));

    expect(container.textContent).toContain('Sign in');
  });
});
