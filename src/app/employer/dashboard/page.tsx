'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Profile, JobListing } from '@/types';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { CreateJobListingForm } from '@/components/ui/CreateJobListingForm';

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'create'>('listings');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/employer/dashboard');
        return;
      }

      setCurrentUser(user);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileData || profileData.role !== 'employer') {
        router.push('/');
        return;
      }

      setProfile(profileData);
      fetchListings(user.id);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const fetchListings = async (userId: string) => {
    const { data } = await supabase
      .from('job_listings')
      .select('*')
      .eq('employer_id', userId)
      .order('created_at', { ascending: false });
    
    setListings(data || []);
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna annons?')) return;
    
    setDeletingId(listingId);
    await supabase.from('job_listings').delete().eq('id', listingId);
    setListings(listings.filter(l => l.id !== listingId));
    setDeletingId(null);
  };

  const handleToggleActive = async (listing: JobListing) => {
    await supabase
      .from('job_listings')
      .update({ is_active: !listing.is_active })
      .eq('id', listing.id);
    
    setListings(listings.map(l => 
      l.id === listing.id ? { ...l, is_active: !l.is_active } : l
    ));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e8eef4', borderTopColor: '#1a5fa8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const activeListings = listings.filter(l => l.is_active);
  const inactiveListings = listings.filter(l => !l.is_active);

  return (
    <>
      <style>{`
        .dashboard-page { min-height: 100vh; background: #f8fafc; font-family: 'DM Sans', sans-serif; }
        .dashboard-container { max-width: 1100px; margin: 0 auto; padding: 2rem; }
        .dashboard-header { margin-bottom: 2rem; }
        .welcome-title { font-family: 'DM Serif Display', serif; font-size: clamp(24px, 4vw, 32px); color: #1a3a5c; margin: 0 0 0.5rem; }
        .welcome-sub { font-size: 14px; color: #64748b; margin: 0; }
        .premium-banner { background: linear-gradient(135deg, #f0a020, #e09515); border-radius: 16px; padding: 1.5rem; color: #fff; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; }
        .premium-banner h3 { font-size: 16px; margin: 0 0 0.25rem; }
        .premium-banner p { font-size: 13px; margin: 0; opacity: 0.9; }
        .premium-btn { background: #fff; color: #f0a020; padding: 10px 20px; border-radius: 99px; text-decoration: none; font-weight: 600; font-size: 14px; }
        .premium-btn:hover { background: #fff8f0; }
        .tabs { display: flex; gap: 4px; margin-bottom: 1.5rem; background: #e8eef4; padding: 4px; border-radius: 12px; width: fit-content; }
        .tab { padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer; border: none; background: transparent; transition: all 0.2s; }
        .tab:hover { color: #1a3a5c; }
        .tab.active { background: #fff; color: #1a3a5c; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .listings-grid { display: grid; gap: 16px; }
        .listing-card { background: #fff; border: 1px solid #e8eef4; border-radius: 16px; padding: 1.25rem; }
        .listing-card.inactive { opacity: 0.6; }
        .listing-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .listing-title { font-size: 16px; font-weight: 600; color: #1a3a5c; margin: 0; }
        .listing-badges { display: flex; gap: 6px; }
        .listing-badge { font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 99px; text-transform: uppercase; }
        .badge-active { background: #ecfdf5; color: #047857; }
        .badge-inactive { background: #fee2e2; color: #b91c1c; }
        .badge-urgent { background: #dc2626; color: #fff; }
        .listing-meta { display: flex; flex-wrap: wrap; gap: 16px; font-size: 13px; color: #64748b; margin-bottom: 12px; }
        .listing-actions { display: flex; gap: 8px; padding-top: 12px; border-top: 1px solid #f1f5f9; }
        .action-btn { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .action-edit { background: #f1f5f9; color: #1a3a5c; }
        .action-edit:hover { background: #e8eef4; }
        .action-delete { background: #fee2e2; color: #b91c1c; }
        .action-delete:hover { background: #fecaca; }
        .action-toggle { background: #e0f2fe; color: #0369a1; }
        .action-toggle:hover { background: #bae6fd; }
        .empty-state { text-align: center; padding: 4rem 2rem; background: #fff; border: 1px solid #e8eef4; border-radius: 16px; }
        .empty-state h3 { font-family: 'DM Serif Display', serif; font-size: 20px; color: #1a3a5c; margin: 0 0 0.5rem; }
        .empty-state p { font-size: 14px; color: #64748b; margin: 0 0 1.5rem; }
        .empty-state a { display: inline-flex; padding: 12px 24px; background: #1a5fa8; color: #fff; border-radius: 99px; text-decoration: none; font-weight: 500; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 2rem; }
        .stat-card { background: #fff; border: 1px solid #e8eef4; border-radius: 12px; padding: 1.25rem; text-align: center; }
        .stat-num { font-family: 'DM Serif Display', serif; font-size: 28px; color: #1a3a5c; margin: 0; }
        .stat-label { font-size: 12px; color: #64748b; margin: 4px 0 0; }
        @media (max-width: 640px) { .dashboard-container { padding: 1rem; } .premium-banner { flex-direction: column; gap: 1rem; text-align: center; } .tabs { width: 100%; } .tab { flex: 1; text-align: center; padding: 8px 12px; } }
      `}</style>

      <div className="dashboard-page">
        <div className="dashboard-container">
          <Breadcrumbs items={[
            { label: 'Startsida', href: '/' },
            { label: 'Dashboard' },
          ]} />

          <div className="dashboard-header">
            <h1 className="welcome-title">Välkommen, arbetsgivare!</h1>
            <p className="welcome-sub">Hantera dina jobbannonser och hitta din nästa medarbetare.</p>
          </div>

          {!profile?.is_premium && (
            <div className="premium-banner">
              <div>
                <h3>⭐ Uppgradera till Premium</h3>
                <p>Skapa obegränsat med annonser och få tillgång till fler kandidater.</p>
              </div>
              <a href="/employer/premium" className="premium-btn">Uppgradera nu →</a>
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-num">{listings.length}</p>
              <p className="stat-label">Totalt annonser</p>
            </div>
            <div className="stat-card">
              <p className="stat-num">{activeListings.length}</p>
              <p className="stat-label">Aktiva</p>
            </div>
            <div className="stat-card">
              <p className="stat-num">{listings.reduce((sum, l) => sum + l.views_count, 0)}</p>
              <p className="stat-label">Totalt visningar</p>
            </div>
            <div className="stat-card">
              <p className="stat-num">{listings.reduce((sum, l) => sum + l.applications_count, 0)}</p>
              <p className="stat-label">Ansökningar</p>
            </div>
          </div>

          <div className="tabs">
            <button className={`tab ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>
              📋 Mina annonser ({listings.length})
            </button>
            <button className={`tab ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
              ➕ Ny annons
            </button>
          </div>

          {activeTab === 'listings' ? (
            listings.length === 0 ? (
              <div className="empty-state">
                <h3> Inga annonser ännu</h3>
                <p>Skapa din första jobbannons för att hitta medarbetare.</p>
                <a href="/jobs">Se lediga jobb</a>
              </div>
            ) : (
              <div className="listings-grid">
                {listings.map((listing) => (
                  <div key={listing.id} className={`listing-card ${!listing.is_active ? 'inactive' : ''}`}>
                    <div className="listing-header">
                      <h3 className="listing-title">{listing.title}</h3>
                      <div className="listing-badges">
                        {listing.is_urgent && <span className="listing-badge badge-urgent">📢 Brådskande</span>}
                        <span className={`listing-badge ${listing.is_active ? 'badge-active' : 'badge-inactive'}`}>
                          {listing.is_active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>
                    </div>
                    <div className="listing-meta">
                      <span>📍 {listing.city}</span>
                      <span>💼 {listing.trade}</span>
                      <span>👁️ {listing.views_count} visningar</span>
                    </div>
                    <div className="listing-actions">
                      <button 
                        className="action-btn action-toggle"
                        onClick={() => handleToggleActive(listing)}
                      >
                        {listing.is_active ? '⏸️ Pausa' : '▶️ Aktivera'}
                      </button>
                      <a 
                        href={`/jobs/${listing.id}`} 
                        className="action-btn action-edit"
                        style={{ textDecoration: 'none' }}
                      >
                        👁️ Visa
                      </a>
                      <button 
                        className="action-btn action-delete"
                        onClick={() => handleDelete(listing.id)}
                        disabled={deletingId === listing.id}
                      >
                        {deletingId === listing.id ? '⏳...' : '🗑️ Ta bort'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <CreateJobListingForm 
              employerId={currentUser?.id || ''}
              isPremium={profile?.is_premium || false}
            />
          )}
        </div>
      </div>
    </>
  );
}