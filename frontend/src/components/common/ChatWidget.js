/**
 * ChatWidget
 * Real-time direct messaging between farmer and retailer
 * Uses Socket.io for delivery + REST API for history
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

const ChatWidget = ({ recipientId, recipientName, recipientAvatar, orderId, onClose }) => {
  const { user } = useSelector((s) => s.auth);
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  // Load message history
  useEffect(() => {
    api.get(`/messages/${recipientId}${orderId ? `?orderId=${orderId}` : ''}`)
      .then((data) => { setMessages(data.messages || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [recipientId, orderId]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg) => {
      if (msg.sender._id === recipientId || msg.sender === recipientId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = ({ userName }) => {
      if (userName !== user.name) setIsTyping(true);
    };

    const handleStopTyping = () => setIsTyping(false);

    socket.on('new_message', handleMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stop_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stop_typing', handleStopTyping);
    };
  }, [socket, recipientId, user.name]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = useCallback(() => {
    if (!socket) return;
    const roomId = [user._id, recipientId].sort().join('_');
    socket.emit('typing', { roomId, userName: user.name });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('stop_typing', { roomId });
    }, 2000);
  }, [socket, user, recipientId]);

  const sendMessage = async () => {
    const content = input.trim();
    if (!content || sending) return;

    const optimistic = {
      _id: `temp_${Date.now()}`,
      content,
      sender: { _id: user._id, name: user.name, avatar: user.avatar },
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    setSending(true);

    try {
      const data = await api.post('/messages', { recipientId, content, orderId });
      setMessages((prev) =>
        prev.map((m) => (m._id === optimistic._id ? data.message : m))
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      setInput(content); // restore
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      width: 340, height: 480,
      background: 'var(--clr-white)', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--clr-border)', boxShadow: 'var(--shadow-xl)',
      display: 'flex', flexDirection: 'column', zIndex: 900,
    }}>
      {/* Header */}
      <div style={{
        padding: '0.875rem 1rem', borderBottom: '1px solid var(--clr-border)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: 'var(--clr-earth-dark)', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--clr-forest)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>
          {recipientName?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'white' }}>{recipientName}</div>
          {isTyping && <div style={{ fontSize: '0.72rem', color: 'var(--clr-mint)' }}>typing...</div>}
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--clr-mint)', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
            Start the conversation with {recipientName}
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = (msg.sender?._id || msg.sender) === user._id;
            return (
              <div key={msg._id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '75%', padding: '0.5rem 0.75rem',
                  borderRadius: isMine ? '12px 12px 0 12px' : '12px 12px 12px 0',
                  background: isMine ? 'var(--clr-forest)' : 'var(--clr-surface)',
                  color: isMine ? 'white' : 'var(--clr-text)',
                  fontSize: '0.85rem', lineHeight: 1.5,
                  opacity: msg.isOptimistic ? 0.7 : 1,
                }}>
                  {msg.content}
                  <div style={{ fontSize: '0.65rem', marginTop: 2, opacity: 0.7, textAlign: 'right' }}>
                    {formatTime(msg.createdAt)} {msg.isOptimistic ? '⏳' : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--clr-border)', display: 'flex', gap: '0.5rem' }}>
        <textarea
          style={{
            flex: 1, padding: '0.5rem 0.75rem', border: '1px solid var(--clr-border)',
            borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: '0.85rem',
            resize: 'none', outline: 'none', background: 'var(--clr-white)', color: 'var(--clr-text)',
          }}
          rows={1}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => { setInput(e.target.value); handleTyping(); }}
          onKeyDown={handleKeyDown}
        />
        <button
          className="btn btn-primary btn-sm"
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          style={{ alignSelf: 'flex-end' }}
        >
          ↑
        </button>
      </div>
    </div>
  );
};

export default ChatWidget;
