'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';
import { CreateJobListingForm } from '@/components/ui/CreateJobListingForm';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export default function CreateJobPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [employerProfile, setEmployerProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/employer/create-job');
        return;
      }

      setCurrentUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'employer') {
        router.push('/');
        return;
      }

      setEmployerProfile(profile);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid #e8eef4',
            borderTopColor: '#1a5fa8',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Laddar...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .create-job-page {
          min-height: 100vh;
          background: #f8fafc;
          font-family: 'DM Sans', sans-serif;
        }
        .create-job-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        .create-job-header {
          margin-bottom: 2rem;
        }
        .create-job-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(28px, 4vw, 36px);
          color: #1a3a5c;
          margin: 0 0 0.5rem;
        }
        .create-job-subtitle {
          font-size: 15px;
          color: #64748b;
          margin: 0;
        }
        @media (max-width: 640px) {
          .create-job-container { padding: 1rem; }
        }
      `}</style>

      <div className="create-job-page">
        <div className="create-job-container">
          <Breadcrumbs items={[
            { label: 'Startsida', href: '/' },
            { label: 'Mina annonser', href: '/employer/dashboard' },
            { label: 'Ny annons' },
          ]} />

          <div className="create-job-header">
            <h1 className="create-job-title">Lägg ut ny jobbannons</h1>
            <p className="create-job-subtitle">
              Beskriv tjänsten och nå ut till kvalificerade yrkespersoner i hela Sverige.
            </p>
          </div>

          <CreateJobListingForm 
            employerId={currentUser?.id || ''}
            isPremium={employerProfile?.is_premium || false}
          />
        </div>
      </div>
    </>
  );
}