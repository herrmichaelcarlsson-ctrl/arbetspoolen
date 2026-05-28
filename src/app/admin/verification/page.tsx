'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type VerificationStatus = 'pending' | 'approved' | 'rejected';

interface VerificationRequest {
  id: string;
  profile_id: string;
  status: VerificationStatus;
  document_url: string;
  document_type: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  notes: string | null;
  stripe_payment_id: string | null;
  // Joined profile data
  profile?: {
    trade: string | null;
    city: string | null;
    experience_years: number | null;
    contact_email?: string;
  };
}

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | VerificationStatus>('all');
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        alert('Endast administratörer har åtkomst till denna sida.');
        return;
      }

      // Load verification requests
      let query = supabase
        .from('verification_requests')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Load profile data separately
      const profileIds = (data || []).map((r: any) => r.profile_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, trade, city, experience_years')
        .in('id', profileIds);
      
      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p: any) => { profileMap[p.id] = p; });
      
      const requestsWithProfiles = (data || []).map((r: any) => ({
        ...r,
        profile: profileMap[r.profile_id] || {}
      }));
      
      setRequests(requestsWithProfiles);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    
    setActionLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          notes: adminNotes
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      // Refresh list and close modal
      await loadRequests();
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (err) {
      console.error('Action error:', err);
      alert('Ett fel uppstod vid uppdateringen.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: VerificationStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    const labels = {
      pending: '⏳ Väntande',
      approved: '✅ Godkänd',
      rejected: '❌ Avvisad'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getDocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      certificate: '📜 Certifikat',
      license: '📋 Licens',
      tax: '🏛️ Skatteverket',
      other: '📎 Annat'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-slate-600 hover:text-slate-900">
              ← Admin
            </Link>
            <h1 className="font-semibold text-slate-800">Verifieringsförfrågningar</h1>
          </div>
          <div className="text-sm text-slate-500">
            {requests.filter(r => r.status === 'pending').length} väntande
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {f === 'all' ? 'Alla' : f === 'pending' ? 'Väntande' : f === 'approved' ? 'Godkända' : 'Avvisade'}
              {f === 'pending' && requests.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-2 bg-yellow-400 text-yellow-900 rounded-full px-2 py-0.5 text-xs">
                  {requests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-lg">Inga verifieringsförfrågningar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-slate-800">
                        Profil: {req.profile?.trade || 'Okänt yrke'}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>
                    <div className="text-sm text-slate-500 space-y-1">
                      <p>📍 {req.profile?.city || 'Stad ej angiven'}</p>
                      <p>💼 {req.profile?.experience_years || 0} års erfarenhet</p>
                      <p>📧 {(req as any).profile?.email || 'E-post saknas'}</p>
                      <p>📎 {getDocTypeLabel(req.document_type)}</p>
                      <p>📅 Inlämnad: {new Date(req.submitted_at).toLocaleDateString('sv-SE')}</p>
                      {req.stripe_payment_id && (
                        <p className="text-green-600">✓ Betalning mottagen ({req.stripe_payment_id.slice(0, 20)}...)</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {req.document_url && (
                      <a 
                        href={req.document_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                      >
                        📄 Visa dokument
                      </a>
                    )}
                    
                    {req.status === 'pending' && (
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setAdminNotes(req.notes || '');
                        }}
                        className="px-4 py-2 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-700 transition"
                      >
                        Granska →
                      </button>
                    )}
                    
                    {req.reviewed_at && (
                      <p className="text-xs text-slate-400">
                        {req.status === 'approved' ? 'Godkändes' : 'Avvisades'} {new Date(req.reviewed_at).toLocaleString('sv-SE')}
                      </p>
                    )}
                  </div>
                </div>
                
                {req.notes && req.status !== 'pending' && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase mb-1">Anteckningar</p>
                    <p className="text-sm text-slate-700">{req.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Granska verifiering</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Yrke</p>
                <p className="text-slate-800">{selectedRequest.profile?.trade}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Stad</p>
                <p className="text-slate-800">{selectedRequest.profile?.city}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Dokumenttyp</p>
                <p className="text-slate-800">{getDocTypeLabel(selectedRequest.document_type)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Dokument</p>
                <a 
                  href={selectedRequest.document_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Öppna dokument ↗
                </a>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Anteckningar (valfritt)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Lägg till anteckningar om granskningen..."
                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleVerificationAction('approved')}
                disabled={actionLoading}
                className="flex-1 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition disabled:opacity-50"
              >
                ✅ Godkänna
              </button>
              <button
                onClick={() => handleVerificationAction('rejected')}
                disabled={actionLoading}
                className="flex-1 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition disabled:opacity-50"
              >
                ❌ Avvisa
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedRequest(null);
                setAdminNotes('');
              }}
              className="w-full mt-3 py-2 text-slate-600 hover:text-slate-800 transition"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
