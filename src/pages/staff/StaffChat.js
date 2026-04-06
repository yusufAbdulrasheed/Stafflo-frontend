import React, { useEffect, useState, useRef } from 'react';
import API from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function StaffChat() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null); // null = dept chat
  const [messages, setMessages] = useState([]);
  const [deptMessages, setDeptMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState('dept'); // 'dept' | 'direct'
  const msgEnd = useRef(null);

  useEffect(() => {
    API.get('/messages/conversations').then(r => setContacts(r.data));
    API.get('/messages/department').then(r => setDeptMessages(r.data));
  }, []);

  useEffect(() => {
    if (activeChat) {
      API.get(`/messages/direct/${activeChat._id}`).then(r => setMessages(r.data));
    }
  }, [activeChat]);

  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, deptMessages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    try {
      const payload = tab === 'dept'
        ? { content: input, chatType: 'department' }
        : { content: input, receiverId: activeChat._id, chatType: 'direct' };
      const r = await API.post('/messages', payload);
      if (tab === 'dept') setDeptMessages(m => [...m, r.data]);
      else setMessages(m => [...m, r.data]);
      setInput('');
    } catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const fmt = (d) => new Date(d).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
  const getInit = (u) => `${u?.firstName?.[0] || ''}${u?.lastName?.[0] || ''}`.toUpperCase();

  const renderMessages = (msgs) => msgs.map((m, i) => {
    const isMe = m.sender?._id === user?._id || m.sender === user?._id;
    return (
      <div key={m._id || i} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end' }}>
        {!isMe && (
          <div className="avatar avatar-sm" style={{ background: '#8b5cf6', flexShrink: 0 }}>{getInit(m.sender)}</div>
        )}
        <div>
          {!isMe && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{m.sender?.firstName} {m.sender?.lastName}</div>}
          <div className={`msg-bubble ${isMe ? 'mine' : 'other'}`}>
            {m.content}
            <div className="msg-meta">{fmt(m.createdAt)}</div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div>
      <div className="page-header">
        <div><h2>Team Chat</h2><p>Chat with your team and department members</p></div>
      </div>
      <div className="chat-layout card">
        {/* Left: Contacts */}
        <div className="chat-sidebar">
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6 }}>
            <button className={`btn btn-sm ${tab === 'dept' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => { setTab('dept'); setActiveChat(null); }}>
              🏢 Team
            </button>
            <button className={`btn btn-sm ${tab === 'direct' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }} onClick={() => setTab('direct')}>
              💬 Direct
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {tab === 'dept' ? (
              <div className={`chat-contact ${!activeChat ? 'active' : ''}`} onClick={() => setActiveChat(null)}>
                <div className="avatar" style={{ background: 'var(--primary)', width: 34, height: 34, fontSize: 14 }}>🏢</div>
                <div>
                  <div className="fw-700" style={{ fontSize: 13 }}>{user?.department?.name || 'Department'}</div>
                  <div className="text-muted text-sm">Team channel</div>
                </div>
              </div>
            ) : (
              contacts.map(c => (
                <div key={c._id} className={`chat-contact ${activeChat?._id === c._id ? 'active' : ''}`} onClick={() => { setActiveChat(c); setTab('direct'); }}>
                  <div className="avatar" style={{ background: c.role === 'manager' ? '#8b5cf6' : 'var(--success)', width: 34, height: 34, fontSize: 13 }}>{getInit(c)}</div>
                  <div style={{ flex: 1 }}>
                    <div className="fw-700" style={{ fontSize: 13 }}>{c.firstName} {c.lastName}</div>
                    <div className="text-muted text-sm" style={{ textTransform: 'capitalize' }}>{c.role}</div>
                  </div>
                  <div className="online-dot" />
                </div>
              ))
            )}
            {tab === 'direct' && contacts.length === 0 && <div className="empty-state" style={{ padding: 20 }}><p>No teammates found</p></div>}
          </div>
        </div>

        {/* Right: Messages */}
        <div className="chat-main">
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            {tab === 'dept' ? (
              <><div className="avatar" style={{ background: 'var(--primary)', width: 34, height: 34, fontSize: 16 }}>🏢</div>
                <div><div className="fw-700">{user?.department?.name || 'Department'} Chat</div><div className="text-muted text-sm">Team channel · {contacts.length + 1} members</div></div></>
            ) : activeChat ? (
              <><div className="avatar" style={{ background: '#8b5cf6', width: 34, height: 34, fontSize: 13 }}>{getInit(activeChat)}</div>
                <div><div className="fw-700">{activeChat.firstName} {activeChat.lastName}</div><div className="text-muted text-sm" style={{ textTransform: 'capitalize' }}>{activeChat.role}</div></div></>
            ) : <div className="text-muted">Select a contact to start chatting</div>}
          </div>

          <div className="chat-messages">
            {tab === 'dept' ? renderMessages(deptMessages) : (activeChat ? renderMessages(messages) : (
              <div className="empty-state"><p>Select a contact to start a conversation</p></div>
            ))}
            <div ref={msgEnd} />
          </div>

          {(tab === 'dept' || activeChat) && (
            <form className="chat-input-bar" onSubmit={sendMessage}>
              <input className="form-control" value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1 }} />
              <button type="submit" className="btn btn-primary" disabled={sending || !input.trim()}>
                {sending ? '...' : '➤ Send'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
