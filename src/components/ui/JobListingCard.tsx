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

// Simple time formatter
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Precis nu';
  if (diffMins < 60) return `${diffMins}m sedan`;
  if (diffHours < 24) return `${diffHours}h sedan`;
  if (diffDays < 7) return `${diffDays}d sedan`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}v sedan`;
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

export function JobListingCard({ listing, showCompany = true }: JobListingCardProps) {
  const timeAgo = listing.created_at ? formatTimeAgo(listing.created_at) : '';

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
    <Link href={`/jobs/${listing.id}`} className="job-card">
      {listing.is_urgent && (
        <span className="job-urgent-badge">📢 Brådskande</span>
      )}
      {listing.is_premium && (
        <span className="job-premium-badge">⭐ Premium</span>
      )}
      
      <div className="job-card-header">
        <h3 className="job-title">{listing.title}</h3>
        {showCompany && listing.company_name && (
          <p className="job-company">{listing.company_name}</p>
        )}
      </div>

      <div className="job-meta">
        <span className="job-meta-item">📍 {listing.city}</span>
        <span className="job-meta-item">💼 {employmentTypeLabels[listing.employment_type]}</span>
        {salary && <span className="job-meta-item">💰 {salary}</span>}
      </div>

      <p className="job-description">
        {listing.description.length > 120 
          ? listing.description.substring(0, 120) + '...' 
          : listing.description}
      </p>

      <div className="job-footer">
        <span className="job-trade-tag">{listing.trade}</span>
        <div className="job-stats">
          {listing.views_count > 0 && (
            <span className="job-stat">👁️ {listing.views_count}</span>
          )}
          <span className="job-time">{timeAgo}</span>
        </div>
      </div>

      <style jsx>{`
        .job-card {
          display: block;
          background: #fff;
          border: 1px solid #e8eef4;
          border-radius: 16px;
          padding: 1.25rem;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
          position: relative;
        }
        .job-card:hover {
          border-color: #1a5fa8;
          box-shadow: 0 4px 20px rgba(26, 95, 168, 0.08);
          transform: translateY(-2px);
        }
        .job-urgent-badge {
          position: absolute;
          top: -8px;
          right: 12px;
          background: #dc2626;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 99px;
          text-transform: uppercase;
        }
        .job-premium-badge {
          position: absolute;
          top: -8px;
          left: 12px;
          background: #f0a020;
          color: #fff;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 99px;
          text-transform: uppercase;
        }
        .job-card-header {
          margin-bottom: 10px;
          padding-top: 8px;
        }
        .job-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a3a5c;
          margin: 0 0 4px;
          line-height: 1.3;
        }
        .job-company {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        .job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 12px;
        }
        .job-meta-item {
          font-size: 13px;
          color: #475569;
        }
        .job-description {
          font-size: 14px;
          color: #64748b;
          line-height: 1.55;
          margin: 0 0 14px;
        }
        .job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }
        .job-trade-tag {
          font-size: 12px;
          padding: 4px 10px;
          background: #f1f5f9;
          color: #475569;
          border-radius: 6px;
        }
        .job-stats {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .job-stat, .job-time {
          font-size: 12px;
          color: #94a3b8;
        }
        @media (max-width: 640px) {
          .job-meta { gap: 8px; }
          .job-meta-item { font-size: 12px; }
        }
      `}</style>
    </Link>
  );
}

export function JobListingCardSkeleton() {
  return (
    <div className="job-card-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title" />
        <div className="skeleton-company" />
      </div>
      <div className="skeleton-meta">
        <div className="skeleton-tag" />
        <div className="skeleton-tag" />
      </div>
      <div className="skeleton-desc" />
      <div className="skeleton-desc" style={{ width: '60%' }} />
      <style jsx>{`
        .job-card-skeleton {
          background: #fff;
          border: 1px solid #e8eef4;
          border-radius: 16px;
          padding: 1.25rem;
        }
        .skeleton-header { margin-bottom: 12px; }
        .skeleton-title {
          height: 20px;
          background: #e8eef4;
          border-radius: 4px;
          margin-bottom: 6px;
          width: 70%;
          animation: pulse 1.5s infinite;
        }
        .skeleton-company {
          height: 14px;
          background: #e8eef4;
          border-radius: 4px;
          width: 40%;
          animation: pulse 1.5s infinite;
        }
        .skeleton-meta {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .skeleton-tag {
          height: 24px;
          width: 80px;
          background: #e8eef4;
          border-radius: 6px;
          animation: pulse 1.5s infinite;
        }
        .skeleton-desc {
          height: 14px;
          background: #e8eef4;
          border-radius: 4px;
          margin-bottom: 8px;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}