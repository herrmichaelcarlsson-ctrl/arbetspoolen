'use client';

import Link from 'next/link';
import { JobListingWithEmployer } from '@/types';

interface JobListingCardProps {
  listing: JobListingWithEmployer;
  showCompany?: boolean;
}

const employmentTypeLabels: Record<string, string> = {
  heltid: 'Heltid',
  deltid: 'Deltid',
  timmar: 'Timmar',
  säsong: 'Säsong',
  annat: 'Annat',
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Precis nu';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} tim`;
  if (diffDays < 7) return `${diffDays} dagar`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} veckor`;
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

export function JobListingCard({ listing, showCompany = true }: JobListingCardProps) {
  const timeAgo = listing.created_at ? formatTimeAgo(listing.created_at) : '';

  const formatSalary = () => {
    if (listing.salary_text) return listing.salary_text;
    if (listing.salary_min && listing.salary_max) {
      return `${listing.salary_min.toLocaleString('sv-SE')} - ${listing.salary_max.toLocaleString('sv-SE')} kr`;
    }
    if (listing.salary_min) return `Från ${listing.salary_min.toLocaleString('sv-SE')} kr`;
    return null;
  };

  const salary = formatSalary();

  return (
    <Link href={`/jobs/${listing.id}`} className="job-card">
      <div className="job-card-accent" />
      
      <div className="job-card-content">
        <div className="job-header">
          <div className="job-title-area">
            <h3 className="job-title">{listing.title}</h3>
            {showCompany && listing.company_name && (
              <p className="job-company">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {listing.company_name}
              </p>
            )}
          </div>
          {(listing.is_urgent || listing.is_premium) && (
            <div className="job-badges">
              {listing.is_premium && (
                <span className="job-badge premium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Premium
                </span>
              )}
              {listing.is_urgent && (
                <span className="job-badge urgent">Brådskande</span>
              )}
            </div>
          )}
        </div>

        <div className="job-meta">
          <span className="job-meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {listing.city}
          </span>
          <span className="job-meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {employmentTypeLabels[listing.employment_type]}
          </span>
          {salary && (
            <span className="job-meta-item salary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {salary}
            </span>
          )}
        </div>

        <p className="job-description">
          {listing.description.length > 100 
            ? listing.description.substring(0, 100) + '...' 
            : listing.description}
        </p>

        <div className="job-footer">
          <span className="job-trade-tag">{listing.trade}</span>
          <div className="job-info">
            {listing.views_count > 0 && (
              <span className="job-stat">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {listing.views_count}
              </span>
            )}
            <span className="job-time">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {timeAgo}
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .job-card {
          display: flex;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: all 0.25s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03);
          border: 1px solid #eef2f7;
        }
        .job-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(26, 95, 168, 0.12);
          border-color: #1a5fa8;
        }
        .job-card-accent {
          width: 5px;
          background: linear-gradient(180deg, #1a5fa8 0%, #2d7dd2 100%);
          flex-shrink: 0;
        }
        .job-card:hover .job-card-accent {
          background: linear-gradient(180deg, #1558a0 0%, #1a5fa8 100%);
        }
        .job-card-content {
          flex: 1;
          padding: 1.25rem 1.5rem;
        }
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }
        .job-title-area {
          flex: 1;
          min-width: 0;
        }
        .job-title {
          font-size: 17px;
          font-weight: 600;
          color: #1a3a5c;
          margin: 0 0 4px;
          line-height: 1.3;
        }
        .job-company {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        .job-company svg {
          color: #94a3b8;
        }
        .job-badges {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }
        .job-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 99px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .job-badge.premium {
          background: linear-gradient(135deg, #f0a020, #e09515);
          color: #fff;
        }
        .job-badge.urgent {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: #fff;
        }
        .job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 0.75rem;
        }
        .job-meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          color: #475569;
        }
        .job-meta-item svg {
          color: #94a3b8;
        }
        .job-meta-item.salary {
          color: #059669;
          font-weight: 500;
        }
        .job-meta-item.salary svg {
          color: #059669;
        }
        .job-description {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 1rem;
        }
        .job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }
        .job-trade-tag {
          font-size: 12px;
          font-weight: 500;
          padding: 5px 12px;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          color: #475569;
          border-radius: 99px;
          border: 1px solid #e2e8f0;
        }
        .job-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .job-stat, .job-time {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #94a3b8;
        }
        .job-stat svg, .job-time svg {
          color: #cbd5e1;
        }
        @media (max-width: 640px) {
          .job-card-content { padding: 1rem; }
          .job-header { flex-direction: column; gap: 8px; }
          .job-badges { order: -1; }
          .job-meta { gap: 10px; }
          .job-meta-item { font-size: 12px; }
        }
      `}</style>
    </Link>
  );
}

export function JobListingCardSkeleton() {
  return (
    <div className="job-card-skeleton">
      <div className="skeleton-accent" />
      <div className="skeleton-content">
        <div className="skeleton-header">
          <div className="skeleton-title" />
          <div className="skeleton-badge" />
        </div>
        <div className="skeleton-meta">
          <div className="skeleton-meta-item" />
          <div className="skeleton-meta-item" />
          <div className="skeleton-meta-item" style={{ width: 120 }} />
        </div>
        <div className="skeleton-desc" />
        <div className="skeleton-desc" style={{ width: '80%' }} />
        <div className="skeleton-desc" style={{ width: '60%' }} />
        <div className="skeleton-footer">
          <div className="skeleton-tag" />
          <div className="skeleton-stats">
            <div className="skeleton-stat" />
            <div className="skeleton-stat" />
          </div>
        </div>
      </div>
      <style jsx>{`
        .job-card-skeleton {
          display: flex;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #eef2f7;
        }
        .skeleton-accent {
          width: 5px;
          background: #e8eef4;
        }
        .skeleton-content {
          flex: 1;
          padding: 1.25rem 1.5rem;
        }
        .skeleton-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .skeleton-title {
          height: 22px;
          background: linear-gradient(90deg, #e8eef4 25%, #f1f5f9 50%, #e8eef4 75%);
          background-size: 200% 100%;
          border-radius: 6px;
          width: 60%;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-badge {
          height: 22px;
          width: 80px;
          background: linear-gradient(90deg, #e8eef4 25%, #f1f5f9 50%, #e8eef4 75%);
          background-size: 200% 100%;
          border-radius: 99px;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 0.75rem;
        }
        .skeleton-meta-item {
          height: 16px;
          width: 80px;
          background: linear-gradient(90deg, #e8eef4 25%, #f1f5f9 50%, #e8eef4 75%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-desc {
          height: 14px;
          background: linear-gradient(90deg, #e8eef4 25%, #f1f5f9 50%, #e8eef4 75%);
          background-size: 200% 100%;
          border-radius: 4px;
          margin-bottom: 8px;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
          margin-top: 0.5rem;
        }
        .skeleton-tag {
          height: 26px;
          width: 100px;
          background: linear-gradient(90deg, #e8eef4 25%, #f1f5f9 50%, #e8eef4 75%);
          background-size: 200% 100%;
          border-radius: 99px;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-stats {
          display: flex;
          gap: 12px;
        }
        .skeleton-stat {
          height: 14px;
          width: 50px;
          background: linear-gradient(90deg, #e8eef4 25%, #f1f5f9 50%, #e8eef4 75%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 640px) {
          .skeleton-content { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}