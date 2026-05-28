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
        .job-badge { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; padding: 4px 12px; border-radius: 99px; text-transform: uppercase; }
        .job-badge-premium { background: linear-gradient(135deg, #f0a020, #e09515); color: #fff; }
        .job-badge-urgent { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; }
        .job-title { font-family: 'DM Serif Display', serif; font-size: clamp(24px, 4vw, 32px); color: #1a3a5c; margin: 0 0 0.5rem; line-height: 1.2; }
        .job-company { font-size: 16px; color: #64748b; margin: 0 0 1.5rem; }
        .job-meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
        .job-meta-item { display: flex; align-items: flex-start; gap: 8px; }
        .job-meta-icon { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #f1f5f9; border-radius: 8px; flex-shrink: 0; }
        .job-meta-icon svg { width: 16px; height: 16px; color: #64748b; }
        .job-meta-text { font-size: 14px; color: #475569; margin: 0; }
        .job-meta-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 2px; }
        .job-body { background: #fff; border: 1px solid #e8eef4; border-radius: 20px; padding: 2rem; margin-bottom: 1.5rem; }
        .job-section-title { font-size: 18px; font-weight: 600; color: #1a3a5c; margin: 0 0 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid #e8eef4; }
        .job-description { font-size: 15px; color: #475569; line-height: 1.7; white-space: pre-wrap; }
        .job-actions { background: #fff; border: 1px solid #e8eef4; border-radius: 20px; padding: 1.5rem; }
        .action-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 14px; text-align: center; border-radius: 99px; font-size: 15px; font-weight: 500; text-decoration: none; margin-bottom: 12px; transition: all 0.2s; cursor: pointer; border: none; font-family: 'DM Sans', sans-serif; }
        .action-btn svg { width: 18px; height: 18px; }
        .action-primary { background: #1a5fa8; color: #fff; }
        .action-primary:hover { background: #1558a0; }
        .action-secondary { background: #f8fafc; color: #1a3a5c; border: 1px solid #e8eef4; }
        .action-secondary:hover { background: #f1f5f9; }
        .job-stats { display: flex; gap: 1.5rem; font-size: 13px; color: #94a3b8; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e8eef4; }
        .job-stats span { display: flex; align-items: center; gap: 4px; }
        .job-stats svg { width: 14px; height: 14px; }
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
              {listing.is_premium && (
                <span className="job-badge job-badge-premium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Premium
                </span>
              )}
              {listing.is_urgent && (
                <span className="job-badge job-badge-urgent">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  Brådskande
                </span>
              )}
            </div>
            <h1 className="job-title">{listing.title}</h1>
            {listing.company_name && <p className="job-company">@{listing.company_name}</p>}
            
            <div className="job-meta-grid">
              <div className="job-meta-item">
                <span className="job-meta-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </span>
                <div>
                  <p className="job-meta-label">Plats</p>
                  <p className="job-meta-text">{listing.city}</p>
                </div>
              </div>
              <div className="job-meta-item">
                <span className="job-meta-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <p className="job-meta-label">Anställningsform</p>
                  <p className="job-meta-text">{employmentTypeLabels[listing.employment_type]}</p>
                </div>
              </div>
              {salary && (
                <div className="job-meta-item">
                  <span className="job-meta-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <div>
                    <p className="job-meta-label">Lön</p>
                    <p className="job-meta-text">{salary}</p>
                  </div>
                </div>
              )}
              <div className="job-meta-item">
                <span className="job-meta-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </span>
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Skicka mail till arbetsgivare
            </a>
            <button className="action-btn action-secondary" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Länk kopierad!');
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Kopiera länk till annonsen
            </button>
            
            <div className="job-stats">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {listing.views_count + 1} visningar
              </span>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Publicerad {formatDate(listing.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}