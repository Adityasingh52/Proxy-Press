'use client';

import { useState } from 'react';
import Link from 'next/link';

const campusEvents = [
  {
    id: 1,
    title: "Annual Tech Fest 2026",
    date: "April 25-27",
    location: "Main Auditorium & Block C",
    category: "Tech",
    description: "The biggest technology fest of the year featuring hackathons, guest lectures, and gaming tournaments.",
    emoji: "🚀",
    color: "#2563EB"
  },
  {
    id: 2,
    title: "Placement Preparation Seminar",
    date: "Tomorrow, 10:00 AM",
    location: "Seminar Hall 2",
    category: "Career",
    description: "Insights from alumni and HR experts on how to crack top-tier company interviews.",
    emoji: "💼",
    color: "#059669"
  },
  {
    id: 3,
    title: "Inter-University Cricket Finals",
    date: "Sunday, 2:00 PM",
    location: "University Sports Ground",
    category: "Sports",
    description: "Support our team as they battle for the championship trophy against City College.",
    emoji: "🏏",
    color: "#D97706"
  },
  {
    id: 4,
    title: "Eco-Drive: Tree Plantation",
    date: "April 30",
    location: "South Campus Gardens",
    category: "Social",
    description: "Join the Green Club to plant 500 saplings around the campus. Refreshments provided.",
    emoji: "🌱",
    color: "#10B981"
  }
];

export default function EventsPage() {
  const [filter, setFilter] = useState('All');

  const filteredEvents = filter === 'All' 
    ? campusEvents 
    : campusEvents.filter(e => e.category === filter);

  return (
    <div className="feed-container animate-fade-in" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 800, 
          color: 'var(--text-primary)', 
          letterSpacing: '-1px',
          marginBottom: '8px'
        }}>
          Campus Events 🗓️
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 500 }}>
          Don't miss out on the latest activities happening around your university.
        </p>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        overflowX: 'auto', 
        paddingBottom: '16px',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border)' 
      }}>
        {['All', 'Tech', 'Career', 'Sports', 'Social'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              background: filter === cat ? 'var(--primary)' : 'var(--surface)',
              color: filter === cat ? '#fff' : 'var(--text-secondary)',
              border: '1.5px solid',
              borderColor: filter === cat ? 'var(--primary)' : 'var(--border)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredEvents.map(event => (
          <div 
            key={event.id} 
            className="card" 
            style={{ 
              display: 'flex', 
              overflow: 'hidden', 
              padding: '0',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            {/* Color Bar */}
            <div style={{ width: '8px', background: event.color }} />
            
            <div style={{ padding: '24px', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <span style={{ 
                    fontSize: '10px', 
                    fontWeight: 800, 
                    textTransform: 'uppercase', 
                    color: event.color,
                    background: `${event.color}15`,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '8px',
                    display: 'inline-block'
                  }}>
                    {event.category}
                  </span>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {event.emoji} {event.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📅 {event.date}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>📍 {event.location}</span>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
                  Register
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested for you */}
      <div style={{ 
        marginTop: '48px', 
        padding: '32px', 
        background: 'var(--surface-2)', 
        borderRadius: 'var(--radius-xl)',
        textAlign: 'center'
      }}>
        <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Organizing an event?</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
          Get your club event featured on the Proxy Dashboard to reach all students.
        </p>
        <button className="btn btn-ghost" style={{ background: 'var(--surface)' }}>
          Submit Event Proposal
        </button>
      </div>
    </div>
  );
}
