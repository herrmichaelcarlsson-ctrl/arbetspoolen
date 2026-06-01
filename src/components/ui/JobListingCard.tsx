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
      return `${listing.salary_min.toLocaleString('sv-SE')} - ${listing.salary_max.toLocaleString('sv-SE')} kr/mån`;
    }
    if (listing.salary_min) return `Från ${listing.salary_min.toLocaleString('sv-SE')} kr/mån`;
    return null;
  };

  const salary = formatSalary();

  return (
    <Link href={`/jobs/${listing.id}`} className="job-card">
      {/* Urgency badge overlay */}
      {listing.is_urgent && (
        <div className="urgent-banner">
          <span className="urgent-icon">🔥</span>
          <span>Brådskande</span>
        </div>
      )}
      
      <div className="job-content">
        {/* Left side with accent */}
        <div className={`job-accent ${listing.is_urgent ? 'accent-urgent' : listing.is_premium ? 'accent-premium' : ''}`} />
        
        {/* Main content */}
        <div className="job-main">
          {/* Header row */}
          <div className="job-header">
            <div className="job-title-section">
              <h3 className="job-title">{listing.title}</h3>
              {showCompany && listing.company_name && (
                <div className="job-company-row">
                  <span className="company-icon">🏢</span>
                  <span className="job-company">{listing.company_name}</span>
                </div>
              )}
            </div>
            {listing.is_premium && (
              <div className="premium-badge">
                <span>⭐</span>
                <span>Premium</span>
              </div>
            )}
          </div>

          {/* Meta info row */}
          <div className="job-meta-row">
            <div className="meta-item">
              <span className="meta-icon">📍</span>
              <span>{listing.city}</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">💼</span>
              <span>{employmentTypeLabels[listing.employment_type] || listing.employment_type}</span>
            </div>
            {salary && (
              <div className="meta-item salary">
                <span className="meta-icon">💰</span>
                <span>{salary}</span>
              </div>
            )}
          </div>

          {/* Description */}
          <p className="job-description">
            {listing.description.length > 120 
              ? listing.description.substring(0, 120) + '...' 
              : listing.description}
          </p>

          {/* Footer */}
          <div className="job-footer">
            <div className="job-tags">
              <span className="trade-tag">{listing.trade}</span>
            </div>
            <div className="job-stats">
              {listing.views_count > 0 && (
                <span className="stat">
                  <span className="stat-icon">👁️</span>
                  <span>{listing.views_count}</span>
                </span>
              )}
              <span className="stat">
                <span className="stat-icon">🕐</span>
                <span>{timeAgo}</span>
              </span>
              <span className="apply-hint">
                Ansök →
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .job-card {
          display: block;
          position: relative;
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .job-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(26, 95, 168, 0.15);
          border-color: #1a5fa8;
        }
        .urgent-banner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: linear-gradient(90deg, #ef4444, #dc2626);
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 6px 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 1;
        }
        .urgent-icon { font-size: 12px; }
        .job-content {
          display: flex;
          padding-top: ${listing.is_urgent ? '32px' : '0'};
        }
        .job-accent {
          width: 6px;
          background: linear-gradient(180deg, #1a5fa8 0%, #3b82f6 100%);
          flex-shrink: 0;
        }
        .accent-urgent {
          background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
        }
        .accent-premium {
          background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
        }
        .job-main {
          flex: 1;
          padding: 1.5rem 1.75rem;
        }
        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }
        .job-title-section {
          flex: 1;
          min-width: 0;
        }
        .job-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 6px;
          line-height: 1.3;
          letter-spacing: -0.3px;
        }
        .job-company-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .company-icon { font-size: 14px; }
        .job-company {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }
        .premium-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #92400e;
          font-size: 11px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 99px;
          border: 1px solid #fcd34d;
          flex-shrink: 0;
        }
        .job-meta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 1rem;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          color: #475569;
          background: #f8fafc;
          padding: 6px 12px;
          border-radius: 8px;
          font-weight: 500;
        }
        .meta-item.salary {
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          color: #059669;
          border: 1px solid #a7f3d0;
        }
        .meta-icon { font-size: 14px; }
        .job-description {
          font-size: 14px;
          color: #64748b;
          line-height: 1.7;
          margin: 0 0 1.25rem;
        }
        .job-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }
        .job-tags {
          display: flex;
          gap: 8px;
        }
        .trade-tag {
          font-size: 12px;
          font-weight: 600;
          padding: 6px 14px;
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          color: #1e40af;
          border-radius: 99px;
          border: 1px solid #bfdbfe;
        }
        .job-stats {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #94a3b8;
        }
        .stat-icon { font-size: 13px; }
        .apply-hint {
          font-size: 13px;
          font-weight: 600;
          color: #1a5fa8;
          opacity: 0;
          transform: translateX(-5px);
          transition: all 0.2s ease;
        }
        .job-card:hover .apply-hint {
          opacity: 1;
          transform: translateX(0);
        }
        @media (max-width: 640px) {
          .job-main { padding: 1.25rem; }
          .job-title { font-size: 16px; }
          .job-header { flex-direction: column; gap: 8px; }
          .job-meta-row { gap: 8px; }
          .meta-item { font-size: 12px; padding: 5px 10px; }
          .job-footer { flex-direction: column; gap: 12px; align-items: flex-start; }
          .apply-hint { opacity: 1; transform: none; }
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
          <div className="skeleton-meta-item" />
        </div>
        <div className="skeleton-desc" />
        <div className="skeleton-desc" style={{ width: '80%' }} />
        <div className="skeleton-desc" style={{ width: '50%' }} />
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
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid #eef2f7;
        }
        .skeleton-accent {
          width: 6px;
          background: #e2e8f0;
        }
        .skeleton-content {
          flex: 1;
          padding: 1.5rem 1.75rem;
        }
        .skeleton-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .skeleton-title {
          height: 24px;
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          border-radius: 8px;
          width: 55%;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-badge {
          height: 28px;
          width: 80px;
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          border-radius: 99px;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-meta {
          display: flex;
          gap: 10px;
          margin-bottom: 1rem;
        }
        .skeleton-meta-item {
          height: 32px;
          width: 90px;
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          border-radius: 8px;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-desc {
          height: 14px;
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          border-radius: 4px;
          margin-bottom: 10px;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
          margin-top: 0.75rem;
        }
        .skeleton-tag {
          height: 28px;
          width: 100px;
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          border-radius: 99px;
          animation: shimmer 1.5s infinite;
        }
        .skeleton-stats {
          display: flex;
          gap: 12px;
        }
        .skeleton-stat {
          height: 16px;
          width: 50px;
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          border-radius: 4px;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 640px) {
          .skeleton-content { padding: 1.25rem; }
          .skeleton-header { flex-direction: column; gap: 10px; }
          .skeleton-title { width: 70%; }
        }
      `}</style>
    </div>
  );
}