'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { FLAT_TRADES, SWEDISH_CITIES } from '@/lib/constants';

interface CreateJobListingFormProps {
  employerId: string;
  isPremium: boolean;
}

export function CreateJobListingForm({ employerId, isPremium }: CreateJobListingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trade: '',
    city: '',
    salary_min: '',
    salary_max: '',
    salary_text: '',
    employment_type: 'heltid' as const,
    is_urgent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const listingData = {
        employer_id: employerId,
        title: formData.title,
        description: formData.description,
        trade: formData.trade,
        city: formData.city,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        salary_text: formData.salary_text || null,
        employment_type: formData.employment_type,
        is_urgent: formData.is_urgent && isPremium,
        is_premium: isPremium,
      };

      const { data, error: insertError } = await supabase
        .from('job_listings')
        .insert(listingData)
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        router.push(`/jobs/${data.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Kunde inte skapa annonsen');
    } finally {
      setLoading(false);
    }
  };

  if (!isPremium) {
    return (
      <div className="premium-required">
        <div className="premium-icon">📢</div>
        <h3>Premium krävs</h3>
        <p>Du behöver ett Premium-konto för att lägga ut jobbannonser.</p>
        <a href="/employer/premium" className="upgrade-btn">
          Uppgradera till Premium →
        </a>
        <style jsx>{`
          .premium-required {
            text-align: center;
            padding: 3rem 2rem;
            background: #fff;
            border: 1px solid #e8eef4;
            border-radius: 20px;
          }
          .premium-icon { font-size: 48px; margin-bottom: 1rem; }
          h3 {
            font-family: 'DM Serif Display', serif;
            font-size: 24px;
            color: #1a3a5c;
            margin: 0 0 0.75rem;
          }
          p { font-size: 15px; color: #64748b; margin: 0 0 1.5rem; }
          .upgrade-btn {
            display: inline-flex;
            padding: 12px 24px;
            background: #1a5fa8;
            color: #fff;
            border-radius: 99px;
            text-decoration: none;
            font-weight: 500;
            transition: background 0.2s;
          }
          .upgrade-btn:hover { background: #1558a0; }
        `}</style>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="job-form">
      {error && <div className="form-error">{error}</div>}
      {success && (
        <div className="form-success">
          ✅ Annonsen är publicerad! Omdirigerar...
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title">Annonsrubrik *</label>
        <input
          id="title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="t.ex. Erfaren Snickare sökes"
          maxLength={100}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="trade">Yrkeskategori *</label>
          <select
            id="trade"
            required
            value={formData.trade}
            onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
          >
            <option value="">Välj yrke</option>
            {FLAT_TRADES.map((trade) => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="city">Stad *</label>
          <select
            id="city"
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          >
            <option value="">Välj stad</option>
            {SWEDISH_CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Arbetsbeskrivning *</label>
        <textarea
          id="description"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Beskriv tjänsten, krav, villkor..."
          rows={6}
          maxLength={2000}
        />
        <span className="char-count">{formData.description.length}/2000</span>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="employment_type">Anställningsform</label>
          <select
            id="employment_type"
            value={formData.employment_type}
            onChange={(e) => setFormData({ 
              ...formData, 
              employment_type: e.target.value as any 
            })}
          >
            <option value="heltid">Heltid</option>
            <option value="deltid">Deltid</option>
            <option value="timmar">Timmar</option>
            <option value="säsong">Säsong</option>
            <option value="annat">Annat</option>
          </select>
        </div>

        <div className="form-group">
          <label>Lön (valfritt)</label>
          <div className="salary-inputs">
            <input
              type="number"
              placeholder="Min"
              value={formData.salary_min}
              onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={formData.salary_max}
              onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
            />
            <span>kr/mån</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="salary_text">Eller skriv lön i text</label>
        <input
          id="salary_text"
          type="text"
          value={formData.salary_text}
          onChange={(e) => setFormData({ ...formData, salary_text: e.target.value })}
          placeholder="t.ex. Enligt avtal, fast lön + provision"
        />
      </div>

      {isPremium && (
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.is_urgent}
              onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
            />
            <span>Markera som brådskande (visas högst upp)</span>
          </label>
        </div>
      )}

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? (
          <>
            <span className="spinner" />
            Publicerar...
          </>
        ) : (
          'Publicera annons →'
        )}
      </button>

      <style jsx>{`
        .job-form {
          background: #fff;
          border: 1px solid #e8eef4;
          border-radius: 20px;
          padding: 2rem;
        }
        .form-error {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          color: #b91c1c;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 14px;
        }
        .form-success {
          background: #ecfdf5;
          border: 1px solid #6ee7b7;
          color: #047857;
          padding: 12px 16px;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 14px;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #1a3a5c;
          margin-bottom: 6px;
        }
        input[type="text"],
        input[type="number"],
        select,
        textarea {
          width: 100%;
          padding: 10px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #1a3a5c;
          background: #f8fafc;
          border: 1px solid #e8eef4;
          border-radius: 10px;
          outline: none;
          transition: border 0.15s;
          box-sizing: border-box;
        }
        input:focus, select:focus, textarea:focus {
          border-color: #1a5fa8;
          background: #fff;
        }
        textarea { resize: vertical; min-height: 120px; }
        .char-count {
          display: block;
          text-align: right;
          font-size: 12px;
          color: #94a3b8;
          margin-top: 4px;
        }
        .salary-inputs {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .salary-inputs input { width: 100px; }
        .salary-inputs span { color: #64748b; }
        .checkbox-group { margin-top: 1rem; }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-weight: 400;
        }
        .checkbox-label input { width: 18px; height: 18px; }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #1a5fa8;
          color: #fff;
          border: none;
          border-radius: 99px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s;
        }
        .submit-btn:hover { background: #1558a0; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </form>
  );
}