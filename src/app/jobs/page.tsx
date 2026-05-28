'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { JobListingWithEmployer } from '@/types';
import { FLAT_TRADES, SWEDISH_CITIES } from '@/lib/constants';
import { JobListingCard, JobListingCardSkeleton } from '@/components/ui/JobListingCard';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Pagination } from '@/components/ui/Pagination';

const EMPLOYMENT_TYPES = [
  { value: '', label: 'Alla anställningsformer' },
  { value: 'heltid', label: 'Heltid' },
  { value: 'deltid', label: 'Deltid' },
  { value: 'timmar', label: 'Timmar' },
  { value: 'säsong', label: 'Säsong' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Senaste först' },
  { value: 'created_at_asc', label: 'Äldsta först' },
  { value: 'title', label: 'A-Ö' },
  { value: 'title_desc', label: 'Ö-A' },
];

function JobsContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<JobListingWithEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const [trade, setTrade] = useState(searchParams.get('trade') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [employmentType, setEmploymentType] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const fetchListings = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      let query = supabase
        .from('job_listings')
        .select(`
          *,
          employer:profiles(id, trade, city),
          employer_details:employer_company_details(company_name, company_logo_url)
        `, { count: 'exact' });

      if (trade) query = query.eq('trade', trade);
      if (city) query = query.eq('city', city);
      if (employmentType) query = query.eq('employment_type', employmentType);
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      if (sortBy === 'created_at') query = query.order('created_at', { ascending: false });
      else if (sortBy === 'created_at_asc') query = query.order('created_at', { ascending: true });
      else if (sortBy === 'title') query = query.order('title', { ascending: true });
      else if (sortBy === 'title_desc') query = query.order('title', { ascending: false });
      
      query = query.order('is_urgent', { ascending: false });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      const transformedData = (data || []).map((item: any) => ({
        ...item,
        company_name: item.employer_details?.company_name || null,
        company_logo_url: item.employer_details?.company_logo_url || null,
      }));

      setListings(transformedData);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [trade, city, employmentType, sortBy, currentPage, searchQuery]);
  useEffect(() => { setCurrentPage(1); }, [trade, city, employmentType, searchQuery]);

  const clearFilters = () => {
    setTrade(''); setCity(''); setEmploymentType(''); setSearchQuery(''); setSortBy('created_at');
  };

  const hasActiveFilters = trade || city || employmentType || searchQuery;

  return (
    <>
      <style jsx>{`
        .jobs-page { min-height: 100vh; background: #f8fafc; }
        .jobs-container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .jobs-header { margin-bottom: 2rem; }
        .jobs-title { font-family: 'DM Serif Display', serif; font-size: clamp(28px, 4vw, 36px); color: #1a3a5c; margin: 0 0 0.5rem; }
        .jobs-subtitle { font-size: 15px; color: #64748b; margin: 0; }
        .jobs-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }
        .filters-panel { background: #fff; border: 1px solid #e8eef4; border-radius: 16px; padding: 1.5rem; height: fit-content; position: sticky; top: 100px; }
        .filters-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .filters-header h3 { font-size: 16px; font-weight: 600; color: #1a3a5c; margin: 0; }
        .clear-btn { font-size: 12px; color: #1a5fa8; background: none; border: none; cursor: pointer; text-decoration: underline; }
        .filter-group { margin-bottom: 1.25rem; }
        .filter-label { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .filter-select, .filter-input { width: 100%; padding: 8px 12px; font-size: 14px; border: 1px solid #e8eef4; border-radius: 8px; background: #f8fafc; color: #1a3a5c; outline: none; }
        .filter-select:focus, .filter-input:focus { border-color: #1a5fa8; background: #fff; }
        .results-area { flex: 1; }
        .results-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .results-count { font-size: 14px; color: #64748b; }
        .results-count strong { color: #1a3a5c; }
        .sort-select { padding: 8px 12px; font-size: 14px; border: 1px solid #e8eef4; border-radius: 8px; background: #fff; color: #1a3a5c; outline: none; }
        .search-bar { display: flex; gap: 12px; margin-bottom: 1.5rem; }
        .search-input { flex: 1; padding: 10px 16px; font-size: 14px; border: 1px solid #e8eef4; border-radius: 10px; background: #fff; color: #1a3a5c; outline: none; }
        .search-input:focus { border-color: #1a5fa8; }
        .listings-grid { display: grid; gap: 16px; }
        .empty-state { text-align: center; padding: 4rem 2rem; background: #fff; border: 1px solid #e8eef4; border-radius: 16px; }
        .empty-state h3 { font-family: 'DM Serif Display', serif; font-size: 20px; color: #1a3a5c; margin: 0 0 0.5rem; }
        .empty-state p { font-size: 14px; color: #64748b; margin: 0; }
        .pagination-wrapper { margin-top: 2rem; display: flex; justify-content: center; }
        .create-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: #1a5fa8; color: #fff; border-radius: 99px; text-decoration: none; font-size: 14px; font-weight: 500; transition: background 0.2s; }
        .create-btn:hover { background: #1558a0; }
        @media (max-width: 900px) { .jobs-layout { grid-template-columns: 1fr; } .filters-panel { position: relative; top: 0; } }
        @media (max-width: 640px) { .jobs-container { padding: 1rem; } .results-header { flex-direction: column; gap: 12px; align-items: stretch; } .search-bar { flex-direction: column; } }
      `}</style>

      <div className="jobs-page">
        <div className="jobs-container">
          <Breadcrumbs items={[{ label: 'Startsida', href: '/' }, { label: 'Lediga jobb' }]} />

          <div className="jobs-header">
            <h1 className="jobs-title">Lediga jobb i Sverige</h1>
            <p className="jobs-subtitle">Hitta lediga tjänster inom bygg, restaurang, transport och fler branscher</p>
          </div>

          <div className="jobs-layout">
            <aside className="filters-panel">
              <div className="filters-header">
                <h3>🔍 Filter</h3>
                {hasActiveFilters && <button onClick={clearFilters} className="clear-btn">Nollställ</button>}
              </div>

              <div className="filter-group">
                <label className="filter-label">Yrkeskategori</label>
                <select className="filter-select" value={trade} onChange={(e) => setTrade(e.target.value)}>
                  <option value="">Alla yrken</option>
                  {FLAT_TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Stad</label>
                <select className="filter-select" value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">Hela Sverige</option>
                  {SWEDISH_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">Anställningsform</label>
                <select className="filter-select" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
                  {EMPLOYMENT_TYPES.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              <a href="/employer/create-job" className="create-btn">➕ Lägg ut annons</a>
            </aside>

            <main className="results-area">
              <div className="search-bar">
                <input type="text" className="search-input" placeholder="Sök i annonser..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>

              <div className="results-header">
                <p className="results-count">Visar <strong>{listings.length}</strong> av <strong>{totalCount}</strong> annonser</p>
                <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>

              {loading ? (
                <div className="listings-grid">
                  {[1, 2, 3, 4, 5, 6].map((i) => <JobListingCardSkeleton key={i} />)}
                </div>
              ) : listings.length === 0 ? (
                <div className="empty-state">
                  <h3>Inga annonser hittades</h3>
                  <p>Prova att ändra dina filter eller sök igen.</p>
                </div>
              ) : (
                <>
                  <div className="listings-grid">
                    {listings.map((listing) => <JobListingCard key={listing.id} listing={listing} showCompany={true} />)}
                  </div>
                  {totalCount > ITEMS_PER_PAGE && (
                    <div className="pagination-wrapper">
                      <Pagination currentPage={currentPage} totalPages={Math.ceil(totalCount / ITEMS_PER_PAGE)} onPageChange={setCurrentPage} />
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e8eef4', borderTopColor: '#1a5fa8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Laddar...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <JobsContent />
    </Suspense>
  );
}