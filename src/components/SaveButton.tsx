'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SaveButtonProps {
  candidateId: string;
  employerId: string;
}

export function SaveButton({ candidateId, employerId }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('saved_candidates')
      .select('id')
      .eq('employer_id', employerId)
      .eq('candidate_id', candidateId)
      .maybeSingle()
      .then(({ data }) => {
        setSaved(!!data);
        setLoading(false);
      });
  }, [candidateId, employerId]);

  const toggle = async () => {
    setLoading(true);
    if (saved) {
      await supabase
        .from('saved_candidates')
        .delete()
        .eq('employer_id', employerId)
        .eq('candidate_id', candidateId);
      setSaved(false);
    } else {
      await supabase
        .from('saved_candidates')
        .insert({ employer_id: employerId, candidate_id: candidateId });
      setSaved(true);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? 'Ta bort från sparade' : 'Spara kandidat'}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: '50%',
        border: `1px solid ${saved ? '#f0a020' : '#e0eaf4'}`,
        background: saved ? '#fff4e0' : '#fff',
        cursor: 'pointer', transition: 'all 0.15s',
        fontSize: 15, opacity: loading ? 0.5 : 1,
      }}
    >
      {saved ? '★' : '☆'}
    </button>
  );
}
