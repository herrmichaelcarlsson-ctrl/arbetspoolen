'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { JobListingWithEmployer } from '@/types';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

const employmentTypeLabels: Record<string, string> = {
  heltid: 'Heltid',
  deltid: 'Deltid',
  timmar: 'Timmar',
  säsong: 'Säsong',
  annat: 'Annat',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export default function JobDetailPage() {
  const params = useParams();
  const [listing, setListing] = useState<JobListingWithEmployer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        // Simple query without joins
        const { data, error } = await supabase
          .from('job_listings')
          .select('*')
          .eq('id', params.id)
          .single();

        console.log('Job detail query:', { data, error });

        if (error || !data) {
          setError('Annonsen hittades inte');
          setLoading(false);
          return;
        }
        
        // Increment view count (ignore if fails)
        try { await supabase.rpc('increment_job_view', { listing_id: params.id }); } catch {}

        setListing(data);
      } catch (err: any) {
        setError(err.message || 'Kunde inte hämta annonsen');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchListing();
  }, [params.id]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e8eef4', borderTopColor: '#1a5fa8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Laddar...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#1a3a5c', margin: '0 0 1rem' }}>Annonsen hittades inte</h1>
          <p style={{ color: '#64748b', margin: '0 0 1.5rem' }}>Den här annonsen finns inte eller har tagits bort.</p>
          <a href="/jobs" style={{ color: '#1a5fa8', textDecoration: 'none', fontWeight: 500 }}>← Tillbaka till alla jobb</a>
        </div>
      </div>
    );
  }

  const formatSalary = () => {
    if (listing.salary_text) return listing.salary_text;
    if (listing.salary_min && listing.salary_max) {
      return `${listing.salary_min.toLocaleString('sv-SE')} - ${listing.salary_max.toLocaleString('sv-SE')} kr/mån`;
    }
    if (listing.salary_min) return `Från ${listing.salary_min.toLocaleString('sv-SE')} kr/mån`;
    return null;
  };

  const salary = formatSalary();

  return (
    <>
      <style>{`
        .job-detail-page { min-height: 100vh; background: #f8fafc; font-family: 'DM Sans', sans-serif; }
        .job-detail-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
        .job-detail-header { background: #fff; border: 1px solid #e8eef4; border-radius: 20px; padding: 2rem; margin-bottom: 1.5rem; position: relative; }
        .job-badges { display: flex; gap: 8px; margin-bottom: 1rem; }
        .job-badge { font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 99px; text-transform: uppercase; }
        .job-badge-urgent { background: #dc2626; color: #fff; }
        .job-badge-premium { background: #f0a020; color: #fff; }
        .job-title { font-family: 'DM Serif Display', serif; font-size: clamp(24px, 4vw, 32px); color: #1a3a5c; margin: 0 0 0.5rem; line-height: 1.2; }
        .job-company { font-size: 16px; color: #64748b; margin: 0 0 1.5rem; }
        .job-meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
        .job-meta-item { display: flex; align-items: center; gap: 8px; }
        .job-meta-icon { font-size: 18px; }
        .job-meta-text { font-size: 14px; color: #475569; }
        .job-meta-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
        .job-body { background: #fff; border: 1px solid #e8eef4; border-radius: 20px; padding: 2rem; margin-bottom: 1.5rem; }
        .job-section-title { font-size: 18px; font-weight: 600; color: #1a3a5c; margin: 0 0 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e8eef4; }
        .job-description { font-size: 15px; color: #475569; line-height: 1.7; white-space: pre-wrap; }
        .job-company-card { background: #f8fafc; border-radius: 12px; padding: 1.5rem; }
        .company-logo { width: 60px; height: 60px; border-radius: 12px; background: #1a5fa8; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; font-weight: 600; margin-bottom: 1rem; }
        .company-name { font-size: 16px; font-weight: 600; color: #1a3a5c; margin: 0 0 0.5rem; }
        .company-desc { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0; }
        .job-actions { background: #fff; border: 1px solid #e8eef4; border-radius: 20px; padding: 1.5rem; }
        .action-btn { display: block; width: 100%; padding: 14px; text-align: center; border-radius: 99px; font-size: 15px; font-weight: 500; text-decoration: none; margin-bottom: 12px; transition: all 0.2s; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; }
        .action-primary { background: #1a5fa8; color: #fff; }
        .action-primary:hover { background: #1558a0; }
        .action-secondary { background: #f8fafc; color: #1a3a5c; border: 1px solid #e8eef4; }
        .action-secondary:hover { background: #f1f5f9; }
        .job-stats { display: flex; gap: 1.5rem; font-size: 13px; color: #94a3b8; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e8eef4; }
        .share-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #64748b; background: none; border: none; cursor: pointer; padding: 0; }
        .share-btn:hover { color: #1a5fa8; }
        @media (max-width: 640px) { .job-detail-container { padding: 1rem; } .job-detail-header { padding: 1.5rem; } .job-body { padding: 1.5rem; } }
      `}</style>

      <div className="job-detail-page">
        <div className="job-detail-container">
          <Breadcrumbs items={[
            { label: 'Startsida', href: '/' },
            { label: 'Lediga jobb', href: '/jobs' },
            { label: listing.title },
          ]} />

          <div className="job-detail-header">
            <div className="job-badges">
              {listing.is_urgent && <span className="job-badge job-badge-urgent">📢 Brådskande</span>}
              {listing.is_premium && <span className="job-badge job-badge-premium">⭐ Premium</span>}
            </div>
            <h1 className="job-title">{listing.title}</h1>
            {listing.company_name && <p className="job-company">@{listing.company_name}</p>}
            
            <div className="job-meta-grid">
              <div className="job-meta-item">
                <span className="job-meta-icon">📍</span>
                <div>
                  <p className="job-meta-label">Plats</p>
                  <p className="job-meta-text">{listing.city}</p>
                </div>
              </div>
              <div className="job-meta-item">
                <span className="job-meta-icon">💼</span>
                <div>
                  <p className="job-meta-label">Anställningsform</p>
                  <p className="job-meta-text">{employmentTypeLabels[listing.employment_type]}</p>
                </div>
              </div>
              {salary && (
                <div className="job-meta-item">
                  <span className="job-meta-icon">💰</span>
                  <div>
                    <p className="job-meta-label">Lön</p>
                    <p className="job-meta-text">{salary}</p>
                  </div>
                </div>
              )}
              <div className="job-meta-item">
                <span className="job-meta-icon">🏷️</span>
                <div>
                  <p className="job-meta-label">Yrke</p>
                  <p className="job-meta-text">{listing.trade}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="job-body">
            <h2 className="job-section-title">Om tjänsten</h2>
            <p className="job-description">{listing.description}</p>
          </div>

          

          <div className="job-actions">
            <a href={`mailto:?subject=Ansöker: ${listing.title}&body=Hej, jag är intresserad av tjänsten "${listing.title}" hos ${listing.company_name || 'er'}...`} className="action-btn action-primary">
              📧 Skicka mail till arbetsgivare
            </a>
            <button className="action-btn action-secondary" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Länk kopierad!');
            }}>
              🔗 Kopiera länk till annonsen
            </button>
            
            <div className="job-stats">
              <span>👁️ {listing.views_count + 1} visningar</span>
              <span>📅 Publicerad {formatDate(listing.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}