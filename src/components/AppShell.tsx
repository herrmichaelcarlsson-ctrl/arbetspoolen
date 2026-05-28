"use client";

import Link from "next/link";
import { LinkButton } from "./ui/Button";
import { MobileMenu } from "./ui/MobileMenu";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function AppShell({ 
  children
}: { 
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user);
      } else {
        setUserRole('none');
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user);
      } else {
        setUser(null);
        setIsPremium(false);
        setIsAdmin(false);
        setUserRole('none');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userObj: any) {
    const { data } = await supabase
      .from('profiles')
      .select('is_premium, is_admin, role')
      .eq('id', userObj.id)
      .single();
      
    if (data) {
      setIsPremium(!!data.is_premium);
      // Fetch unread message count
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', userObj.id)
        .eq('is_read', false)
        .then(({ count }) => setUnreadCount(count || 0));
      // Auto-grant admin rights and employer role to the owner if not set
      if (userObj.email?.toLowerCase() === 'herrmichael.carlsson@outlook.com' && (!data.is_admin || data.role !== 'employer')) {
        await supabase.from('profiles').update({ is_admin: true, role: 'employer' }).eq('id', userObj.id);
        setIsAdmin(true);
        setUserRole('employer');
      } else {
        setIsAdmin(!!data.is_admin);
        setUserRole(data.role || 'job_seeker');
      }
    } else {
      setUserRole('job_seeker');
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-white text-[var(--foreground)]">
      <MobileMenu />
      
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur-md ml-0 lg:ml-0">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/logo.png"
              alt="ARBETSpoolen"
              className="h-[52px] w-auto"
            />
          </Link>

          <nav className="flex items-center gap-2">
            <LinkButton href="/jobs" variant="ghost" size="sm" className="hidden md:inline-flex">
              Lediga jobb
            </LinkButton>
            <LinkButton href="/employer/directory" variant="ghost" size="sm" className="hidden md:inline-flex">
              Hitta kompetens
            </LinkButton>
            {userRole === 'employer' && (
              <>
                <LinkButton href="/employer/dashboard" variant="ghost" size="sm" className="hidden md:inline-flex">
                  📋 Mina annonser
                </LinkButton>
                <LinkButton href="/employer/saved" variant="ghost" size="sm" className="hidden md:inline-flex">
                  ★ Sparade
                </LinkButton>
              </>
            )}

            {/* --- HÄR ÄR LOGIKEN FÖR INLOGGAD VS UTLOGGAD --- */}
            {user ? (
              // VISAS OM MAN ÄR INLOGGAD
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-[var(--border)]">
                {isAdmin && (
                  <Link href="/admin" className="text-gray-400 hover:text-[#1a5fa8] transition-colors" title="Admin">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-1.998A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                    </svg>
                  </Link>
                )}

                <Link href="/messages" className="relative text-gray-400 hover:text-[#1a5fa8] transition-colors" title="Meddelanden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1a5fa8] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {userRole ? (
                  <Link 
                    href={userRole === 'employer' ? "/employer/profile" : "/seeker/dashboard"} 
                    className="flex items-center gap-2 group hover:bg-gray-100 transition-colors rounded-md px-2 py-1 -mx-2"
                    title="Min Profil"
                  >
                    <div className="h-8 w-8 rounded-full bg-[#1a5fa8] text-white flex items-center justify-center text-sm font-medium">
                      {(user.email || "A").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[var(--muted)] group-hover:text-[#1a5fa8] transition-colors hidden lg:inline-block">
                      Min Profil
                    </span>
                  </Link>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse"></div>
                )}
                
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = "/";
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  title="Logga ut"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            ) : (
              // VISAS OM MAN INTE ÄR INLOGGAD
              <>
                <LinkButton href="/register?role=job_seeker" variant="outline" size="sm" className="hidden sm:inline-flex">
                  För arbetssökare
                </LinkButton>
                <LinkButton href="/register?role=employer" variant="outline" size="sm" className="hidden sm:inline-flex">
                  För arbetsgivare
                </LinkButton>
                <LinkButton href="/login" variant="primary" size="sm">
                  Logga in
                </LinkButton>
              </>
            )}
            
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-[var(--surface)]">{children}</main>

      <footer className="border-t border-[var(--border)] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-[var(--muted)]">
          <div>© {new Date().getFullYear()} ARBETSpoolen · Sverige</div>
          <div>Byggd med Next.js · Supabase · Stripe</div>
        </div>
      </footer>
    </div>
  );
}