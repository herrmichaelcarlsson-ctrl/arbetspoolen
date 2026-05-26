'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error('Inloggningen misslyckades. Vänligen försök igen.');

      setSuccessMessage('Välkommen tillbaka! Omdirigerar...');

      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('*').eq('id', data.user.id).single();

      if (profileError || !profile) {
        setTimeout(() => router.push('/onboarding'), 1500);
        return;
      }

      const { data: contact } = await supabase
        .from('profile_contact_details').select('*').eq('profile_id', data.user.id).single();

      if (profile.role === 'job_seeker' && (!profile.trade || !profile.city || !contact?.full_name)) {
        setTimeout(() => router.push('/onboarding'), 1500);
      } else if (profile.role === 'job_seeker') {
        setTimeout(() => router.push('/seeker/dashboard'), 1500);
      } else if (profile.role === 'employer' && !contact?.full_name) {
        setTimeout(() => router.push('/onboarding'), 1500);
      } else if (profile.role === 'employer') {
        setTimeout(() => router.push('/employer/directory'), 1500);
      } else {
        setTimeout(() => router.push('/seeker/dashboard'), 1500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ett fel uppstod vid inloggning.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        .login-wrap { font-family: 'DM Sans', sans-serif; color: #111; background: #fff; min-height: 100vh; display: flex; flex-direction: column; }

        /* NAV */
        .login-nav { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 2rem; border-bottom: 1px solid #e0eaf4; background: #fff; }
        .login-nav img { display: block; height: 60px; width: auto; }
        .login-nav-links { display: flex; gap: 8px; }
        .rb-btn { font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 7px 16px; border-radius: 99px; border: 1px solid #b8d0e8; background: transparent; color: #1a3a5c; cursor: pointer; transition: background 0.15s; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
        .rb-btn:hover { background: #eaf3fb; }
        .rb-btn-primary { background: #1a5fa8; border-color: #1a5fa8; color: #fff; font-weight: 500; }
        .rb-btn-primary:hover { background: #134a85; }

        /* FORM AREA */
        .login-body { flex: 1; display: flex; align-items: center; justify-content: center; padding: 3rem 1rem; background: #f5f9fd; }
        .login-card { background: #fff; border: 1px solid #e0eaf4; border-radius: 20px; padding: 2.5rem; width: 100%; max-width: 420px; }
        .login-card h1 { font-family: 'DM Serif Display', serif; font-size: 26px; color: #1a3a5c; margin: 0 0 0.25rem; }
        .login-card p { font-size: 14px; color: #4a6480; margin: 0 0 2rem; }

        .form-label { display: block; font-size: 11px; font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; color: #4a6480; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1a3a5c; background: #f5f9fd; border: 1px solid #e0eaf4; border-radius: 10px; outline: none; transition: border 0.15s; box-sizing: border-box; }
        .form-input:focus { border-color: #1a5fa8; background: #fff; }
        .form-group { margin-bottom: 1.25rem; }
        .form-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }

        .submit-btn { width: 100%; padding: 12px; background: #1a5fa8; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; border: none; border-radius: 99px; cursor: pointer; transition: background 0.15s; margin-top: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .submit-btn:hover { background: #134a85; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .divider { display: flex; align-items: center; gap: 12px; margin: 1.5rem 0; color: #9ca3af; font-size: 12px; }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e0eaf4; }

        .alert { padding: 10px 14px; border-radius: 10px; font-size: 13px; margin-bottom: 1.25rem; }
        .alert-error { background: #fff0f0; border: 1px solid #fca5a5; color: #b91c1c; }
        .alert-success { background: #e6f1fb; border: 1px solid #b8d0e8; color: #1a5fa8; }

        .forgot-link { font-size: 12px; color: #1a5fa8; text-decoration: none; }
        .forgot-link:hover { text-decoration: underline; }
        .register-link { color: #1a5fa8; font-weight: 500; text-decoration: none; }
        .register-link:hover { text-decoration: underline; }

        .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .login-footer { padding: 1.25rem 2rem; border-top: 1px solid #e0eaf4; display: flex; justify-content: space-between; }
        .login-footer span { font-size: 12px; color: #9ca3af; }
      `}</style>

      <div className="login-wrap">

        <nav className="login-nav">
          <a href="/">
            <img src="/logo.png" alt="ARBETSpoolen" />
          </a>
          <div className="login-nav-links">
            <a href="/register?role=seeker" className="rb-btn">För arbetssökare</a>
            <a href="/register?role=employer" className="rb-btn">För arbetsgivare</a>
          </div>
        </nav>

        <div className="login-body">
          <div className="login-card">
            <h1>Logga in</h1>
            <p>Välkommen tillbaka till ARBETSpoolen</p>

            {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">E-postadress</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="namn@domän.se"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <div className="form-row">
                  <label className="form-label" htmlFor="password" style={{ margin: 0 }}>Lösenord</label>
                  <a href="#" className="forgot-link">Glömt lösenord?</a>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? <div className="spinner" /> : <>Logga in <span>→</span></>}
              </button>
            </form>

            <div className="divider">Ny hos ARBETSpoolen?</div>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#4a6480', margin: 0 }}>
              Inget konto?{' '}
              <Link href="/register" className="register-link">Skapa konto gratis</Link>
            </p>
          </div>
        </div>

        <footer className="login-footer">
          <span>© {new Date().getFullYear()} ARBETSpoolen · Sverige</span>
          <span>Byggd med Next.js · Supabase · Stripe</span>
        </footer>

      </div>
    </>
  );
}
