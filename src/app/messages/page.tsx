'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  other_user_id: string;
  other_name: string;
  other_role: string;
  other_avatar: string | null;
  last_message: string;
  last_time: string;
  unread_count: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Load user
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single();
      setUserRole(profile?.role || 'job_seeker');

      await loadConversations(user.id);

      // If ?with=userId in URL, open that conversation
      const withId = searchParams.get('with');
      if (withId) setActiveConvId(withId);

      setLoading(false);
    };
    init();
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConvId && userId) {
      loadMessages(activeConvId);
      // Mark as read
      supabase.from('messages')
        .update({ is_read: true })
        .eq('sender_id', activeConvId)
        .eq('recipient_id', userId)
        .then(() => loadConversations(userId!));
    }
  }, [activeConvId, userId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `recipient_id=eq.${userId}`,
      }, (payload) => {
        if (payload.new.sender_id === activeConvId) {
          setMessages(prev => [...prev, payload.new as Message]);
        }
        loadConversations(userId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, activeConvId]);

  const loadConversations = async (uid: string) => {
    // Get all messages involving the user
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
      .order('created_at', { ascending: false });

    if (!msgs) return;

    // Build unique conversations
    const convMap = new Map<string, Conversation>();
    for (const msg of msgs) {
      const otherId = msg.sender_id === uid ? msg.recipient_id : msg.sender_id;
      if (!convMap.has(otherId)) {
        convMap.set(otherId, {
          other_user_id: otherId,
          other_name: '',
          other_role: '',
          other_avatar: null,
          last_message: msg.content,
          last_time: msg.created_at,
          unread_count: 0,
        });
      }
      if (msg.sender_id !== uid && !msg.is_read) {
        convMap.get(otherId)!.unread_count++;
      }
    }

    // Fetch profile info for each other user
    const otherIds = Array.from(convMap.keys());
    if (otherIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, role, avatar_url')
        .in('id', otherIds);

      const { data: contacts } = await supabase
        .from('profile_contact_details')
        .select('profile_id, full_name')
        .in('profile_id', otherIds);

      // Also check company names for employers
      for (const [id, conv] of convMap.entries()) {
        const profile = profiles?.find(p => p.id === id);
        const contact = contacts?.find(c => c.profile_id === id);
        conv.other_name = contact?.full_name || 'Okänd användare';
        conv.other_role = profile?.role || 'job_seeker';
        conv.other_avatar = profile?.avatar_url || null;
      }
    }

    setConversations(Array.from(convMap.values()));
    if (activeConvId) {
      setActiveConv(convMap.get(activeConvId) || null);
    }
  };

  const loadMessages = async (otherId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    setActiveConv(conversations.find(c => c.other_user_id === otherId) || null);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !userId || !activeConvId || sending) return;
    setSending(true);
    const content = newMessage.trim();
    setNewMessage('');
    const { data } = await supabase.from('messages').insert({
      sender_id: userId,
      recipient_id: activeConvId,
      content,
    }).select().single();
    if (data) setMessages(prev => [...prev, data]);
    await loadConversations(userId);
    setSending(false);
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif', background: '#f5f9fd' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #e0eaf4', borderTopColor: '#1a5fa8', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#4a6480', fontSize: 13 }}>Laddar meddelanden...</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }

        .msg-wrap { font-family: 'DM Sans', sans-serif; background: #f5f9fd; height: calc(100vh - 72px); display: flex; }

        /* Sidebar */
        .msg-sidebar { width: 300px; flex-shrink: 0; background: #fff; border-right: 1px solid #e0eaf4; display: flex; flex-direction: column; }
        .msg-sidebar-header { padding: 1.25rem 1rem; border-bottom: 1px solid #e0eaf4; }
        .msg-sidebar-title { font-size: 15px; font-weight: 500; color: #1a3a5c; margin: 0; }
        .msg-conv-list { flex: 1; overflow-y: auto; }
        .msg-conv-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px; cursor: pointer; border-bottom: 1px solid #f5f9fd; transition: background 0.1s; }
        .msg-conv-item:hover { background: #f5f9fd; }
        .msg-conv-item.active { background: #e6f1fb; }
        .msg-conv-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; background: #e6f1fb; color: #1a5fa8; }
        .msg-conv-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .msg-conv-name { font-size: 13px; font-weight: 500; color: #1a3a5c; }
        .msg-conv-last { font-size: 12px; color: #4a6480; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
        .msg-conv-time { font-size: 10px; color: #9ca3af; margin-left: auto; flex-shrink: 0; }
        .msg-unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #1a5fa8; flex-shrink: 0; }

        /* Chat area */
        .msg-chat { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        .msg-chat-header { padding: 1rem 1.5rem; border-bottom: 1px solid #e0eaf4; background: #fff; display: flex; align-items: center; gap: 12px; }
        .msg-chat-avatar { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; background: #e6f1fb; color: #1a5fa8; flex-shrink: 0; }
        .msg-chat-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .msg-chat-name { font-size: 14px; font-weight: 500; color: #1a3a5c; }
        .msg-chat-role { font-size: 11px; color: #4a6480; }

        .msg-messages { flex: 1; overflow-y: auto; padding: 1.25rem; display: flex; flex-direction: column; gap: 8px; }
        .msg-bubble-wrap { display: flex; }
        .msg-bubble-wrap.mine { justify-content: flex-end; }
        .msg-bubble { max-width: 65%; padding: 10px 14px; border-radius: 18px; font-size: 14px; line-height: 1.5; }
        .msg-bubble.mine { background: #1a5fa8; color: #fff; border-bottom-right-radius: 4px; }
        .msg-bubble.theirs { background: #fff; color: #1a3a5c; border: 1px solid #e0eaf4; border-bottom-left-radius: 4px; }
        .msg-time { font-size: 10px; margin-top: 3px; text-align: right; }
        .msg-time.mine { color: rgba(255,255,255,0.7); }
        .msg-time.theirs { color: #9ca3af; }

        .msg-input-area { padding: 1rem 1.5rem; border-top: 1px solid #e0eaf4; background: #fff; display: flex; gap: 10px; }
        .msg-input { flex: 1; padding: 10px 16px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: #1a3a5c; background: #f5f9fd; border: 1px solid #e0eaf4; border-radius: 99px; outline: none; transition: border 0.15s; }
        .msg-input:focus { border-color: #1a5fa8; background: #fff; }
        .msg-send-btn { padding: 10px 20px; background: #1a5fa8; color: #fff; border: none; border-radius: 99px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; cursor: pointer; transition: background 0.15s; flex-shrink: 0; }
        .msg-send-btn:hover { background: #134a85; }
        .msg-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .msg-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #4a6480; text-align: center; padding: 2rem; }
        .msg-empty-icon { font-size: 48px; margin-bottom: 1rem; }
        .msg-empty h3 { font-size: 18px; color: #1a3a5c; margin: 0 0 0.5rem; }
        .msg-empty p { font-size: 14px; color: #4a6480; margin: 0; }

        .msg-date-divider { text-align: center; font-size: 11px; color: #9ca3af; margin: 8px 0; }

        @media (max-width: 640px) {
          .msg-sidebar { width: 72px; }
          .msg-conv-name, .msg-conv-last, .msg-conv-time { display: none; }
          .msg-conv-item { justify-content: center; padding: 10px; }
        }
      `}</style>

      <div className="msg-wrap">
        {/* Sidebar */}
        <div className="msg-sidebar">
          <div className="msg-sidebar-header">
            <p className="msg-sidebar-title">
              Meddelanden
              {conversations.reduce((sum, c) => sum + c.unread_count, 0) > 0 && (
                <span style={{ marginLeft: 8, background: '#1a5fa8', color: '#fff', fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 99 }}>
                  {conversations.reduce((sum, c) => sum + c.unread_count, 0)}
                </span>
              )}
            </p>
          </div>
          <div className="msg-conv-list">
            {conversations.length === 0 && (
              <div style={{ padding: '1.5rem 1rem', fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
                Inga konversationer ännu
              </div>
            )}
            {conversations.map(conv => (
              <div
                key={conv.other_user_id}
                className={`msg-conv-item ${activeConvId === conv.other_user_id ? 'active' : ''}`}
                onClick={() => {
                  setActiveConvId(conv.other_user_id);
                  setActiveConv(conv);
                  loadMessages(conv.other_user_id);
                }}
              >
                <div className="msg-conv-avatar">
                  {conv.other_avatar
                    ? <img src={conv.other_avatar} alt={conv.other_name} />
                    : conv.other_name.charAt(0).toUpperCase()
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="msg-conv-name">{conv.other_name}</div>
                    <div className="msg-conv-time">{formatTime(conv.last_time)}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="msg-conv-last">{conv.last_message}</div>
                    {conv.unread_count > 0 && <div className="msg-unread-dot" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="msg-chat">
          {activeConvId && activeConv ? (
            <>
              <div className="msg-chat-header">
                <div className="msg-chat-avatar">
                  {activeConv.other_avatar
                    ? <img src={activeConv.other_avatar} alt={activeConv.other_name} />
                    : activeConv.other_name.charAt(0).toUpperCase()
                  }
                </div>
                <div>
                  <div className="msg-chat-name">{activeConv.other_name}</div>
                  <div className="msg-chat-role">{activeConv.other_role === 'employer' ? 'Arbetsgivare' : 'Yrkesperson'}</div>
                </div>
              </div>

              <div className="msg-messages">
                {messages.map((msg, i) => {
                  const isMine = msg.sender_id === userId;
                  const showDateDivider = i === 0 || new Date(msg.created_at).toDateString() !== new Date(messages[i-1].created_at).toDateString();
                  return (
                    <React.Fragment key={msg.id}>
                      {showDateDivider && (
                        <div className="msg-date-divider">
                          {new Date(msg.created_at).toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                      )}
                      <div className={`msg-bubble-wrap ${isMine ? 'mine' : ''}`}>
                        <div>
                          <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>{msg.content}</div>
                          <div className={`msg-time ${isMine ? 'mine' : 'theirs'}`}>{formatTime(msg.created_at)}</div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="msg-input-area">
                <input
                  className="msg-input"
                  type="text"
                  placeholder="Skriv ett meddelande..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                />
                <button className="msg-send-btn" onClick={handleSend} disabled={sending || !newMessage.trim()}>
                  Skicka →
                </button>
              </div>
            </>
          ) : (
            <div className="msg-empty">
              <div className="msg-empty-icon">💬</div>
              <h3>Dina meddelanden</h3>
              <p>
                {userRole === 'employer'
                  ? 'Klicka på "Skicka meddelande" på en kandidats profil för att starta en konversation.'
                  : 'När en arbetsgivare kontaktar dig syns det här.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
