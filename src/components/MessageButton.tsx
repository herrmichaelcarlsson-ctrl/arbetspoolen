'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';

interface MessageButtonProps {
  recipientId: string;
  recipientName: string;
  className?: string;
}

export function MessageButton({ recipientId, recipientName, className }: MessageButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    router.push(`/messages?with=${recipientId}`);
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', borderRadius: 99,
        background: '#1a5fa8', color: '#fff',
        border: 'none', cursor: 'pointer',
        fontSize: 12, fontWeight: 500,
        fontFamily: 'DM Sans, sans-serif',
        transition: 'background 0.15s',
        opacity: loading ? 0.7 : 1,
      }}
    >
      💬 {loading ? '...' : `Kontakta ${recipientName.split(' ')[0]}`}
    </button>
  );
}
