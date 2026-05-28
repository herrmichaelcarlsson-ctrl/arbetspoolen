'use client';

import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type CVTheme = 'professional' | 'modern' | 'minimal';

export default function CVBuilderPage() {
  const [profile, setProfile] = useState<any>(null);
  const [contact, setContact] = useState<any>(null);
  const [viewStats, setViewStats] = useState<{ weekly_count: number; recent_views: any[] }>({ weekly_count: 0, recent_views: [] });
  const [boostActive, setBoostActive] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<CVTheme>('professional');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: contact } = await supabase.from('profile_contact_details').select('*').eq('profile_id', user.id).single();
      
      // Load view stats
      let stats = { weekly_count: 0, recent_views: [] };
      try {
        const res = await fetch('/api/profile/views/stats', { headers: { 'x-user-id': user.id } });
        if (res.ok) stats = await res.json();
      } catch (e) { /* Stats optional */ }

      setProfile(profile);
      setContact(contact);
      setBoostActive(profile?.profile_boost_ends_at && new Date(profile.profile_boost_ends_at) > new Date());
      setViewStats(stats);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const theme = themes[selectedTheme];
    
    // Theme colors
    const primaryColor = theme.primaryColor;
    const textColor = theme.textColor;
    
    // Header with theme styling
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(contact?.full_name || profile?.trade || 'CV', 20, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(profile?.trade || '', 20, 35);
    
    // Contact info
    doc.setTextColor(...textColor);
    let y = 55;
    
    if (contact) {
      doc.setFontSize(10);
      doc.text(`📧 ${contact.contact_email}`, 20, y);
      if (contact.contact_phone) {
        y += 7;
        doc.text(`📞 ${contact.contact_phone}`, 20, y);
      }
      if (profile?.city) {
        y += 7;
        doc.text(`📍 ${profile.city}`, 20, y);
      }
    }

    // Profile section
    y += 15;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Profil', 20, y);
    
    doc.setDrawColor(...primaryColor);
    doc.line(20, y + 2, 190, y + 2);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    y += 10;
    
    const bio = profile?.bio || 'Ingen biografi tillgänglig.';
    const lines = doc.splitTextToSize(bio, 170);
    doc.text(lines, 20, y);
    y += lines.length * 6;

    // Experience section
    if (profile?.experience_years) {
      y += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Erfarenhet', 20, y);
      doc.line(20, y + 2, 190, y + 2);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      y += 10;
      doc.text(`${profile.experience_years} års erfarenhet`, 20, y);
    }

    // Certificates
    if (profile?.certificates?.length > 0) {
      y += 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('Certifikat & Licenser', 20, y);
      doc.line(20, y + 2, 190, y + 2);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      y += 10;
      
      profile.certificates.filter((c: string) => c?.trim()).forEach((cert: string) => {
        doc.text(`✓ ${cert}`, 20, y);
        y += 7;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Skapad med ARBETSpoolen', 20, 285);
    doc.text(profile?.city || '', 150, 285);

    doc.save(`${contact?.full_name || 'cv'}_ARBETSpoolen.pdf`);
  };

  const purchaseBoost = async (duration: 'week' | 'month') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

 try {
      const res = await fetch('/api/stripe/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ product: duration === 'week' ? 'candidate_boost' : 'candidate_boost_month' })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Purchase error:', err);
    }
  };

  const requestVerification = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const res = await fetch('/api/stripe/premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ product: 'verification' })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Verification error:', err);
    }
  };

  const themes = {
    professional: { name: 'Professionell', primaryColor: [26, 95, 168] as [number, number, number], textColor: [26, 26, 26] as [number, number, number] },
    modern: { name: 'Modern', primaryColor: [99, 102, 241] as [number, number, number], textColor: [30, 30, 30] as [number, number, number] },
    minimal: { name: 'Minimal', primaryColor: [0, 0, 0] as [number, number, number], textColor: [50, 50, 50] as [number, number, number] }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/seeker/dashboard" className="text-slate-600 hover:text-slate-900">
            ← Tillbaka
          </Link>
          <h1 className="font-semibold text-slate-800">CV & Kandidatinformation</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        
        {/* View Stats Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">📊 Visningsstatistik</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-blue-600">{viewStats.weekly_count}</p>
              <p className="text-slate-500">visningar denna vecka</p>
            </div>
            <div className="text-right">
              {viewStats.weekly_count > 0 ? (
                <p className="text-sm text-slate-500">
                  Populär profil! {viewStats.weekly_count > 5 ? '🔥' : '👍'}
                </p>
              ) : (
                <p className="text-sm text-slate-400">Inga visningar ännu</p>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            💡 Betala 49 kr för att se vilka företag som tittade på din profil
          </p>
        </div>

        {/* Profile Boost */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2">⚡ Framhäv din profil</h2>
          {boostActive ? (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg inline-block font-medium">
              ✓ Din profil är framhävd t.o.m. {new Date(profile.profile_boost_ends_at).toLocaleDateString('sv-SE')}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button onClick={() => purchaseBoost('week')} className="p-4 bg-white rounded-xl border border-amber-200 hover:border-amber-400 transition">
                <p className="text-xl font-bold text-slate-800">49 kr</p>
                <p className="text-sm text-slate-500">1 vecka</p>
              </button>
              <button onClick={() => purchaseBoost('month')} className="p-4 bg-white rounded-xl border border-amber-200 hover:border-amber-400 transition">
                <p className="text-xl font-bold text-slate-800">149 kr</p>
                <p className="text-sm text-slate-500">1 månad</p>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Populärast</span>
              </button>
            </div>
          )}
        </div>

        {/* CV Builder */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">📄 CV-byggare</h2>
          
          {/* Theme Selection */}
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-600 mb-3">Välj design:</p>
            <div className="flex gap-3">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTheme(key as CVTheme)}
                  className={`px-4 py-2 rounded-lg border-2 transition ${
                    selectedTheme === key 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generatePDF} className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition">
            📥 Ladda ner PDF-CV
          </button>
          <p className="mt-2 text-xs text-slate-500 text-center">Gratis grundmall</p>
        </div>

        {/* Verified Badge */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2">✅ Verifierad yrkesperson</h2>
          {profile?.has_verified_badge ? (
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">✓</span>
              <div>
                <p className="font-medium text-slate-800">Verifierad yrkesperson</p>
                <p className="text-sm text-slate-500">Dina certifikat har granskats</p>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-slate-600 mb-4">
                Ladda upp dina certifikat/legitimation och få en verifierad badge. 
                Vi granskar manuellt mot Skatteverket eller branschregister.
              </p>
              <button onClick={requestVerification} className="w-full py-3 bg-amber-500 text-white font-medium rounded-xl hover:bg-amber-600 transition">
                Verifiera nu för 99 kr
              </button>
            </div>
          )}
        </div>

        {/* Recruitment Package */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">🎯 Rekryteringspaket</h2>
              <p className="text-slate-600 mt-2">
                Vi matchar 5 kandidater till din lediga tjänst. Perfekt för dig som söker ny personal.
              </p>
              <p className="text-3xl font-bold text-slate-800 mt-4">2 999 kr</p>
              <p className="text-sm text-slate-500">engångsavgift</p>
            </div>
            <Link href="/employer/directory" className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition">
              Beställ nu →
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
