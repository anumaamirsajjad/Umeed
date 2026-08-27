'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES, CRISIS_ALERT_STORAGE_KEY } from '@/lib/constants';
import { ACTIVE_EMERGENCY_CONTACT, ACTIVE_CRISIS_HELPLINE, type EmergencyContact } from '@/lib/emergencyContacts';
import type { CrisisAlert } from '@/lib/types';

export default function CrisisSafetyModePage() {
  const [alert, setAlert] = useState<CrisisAlert | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CRISIS_ALERT_STORAGE_KEY);
      if (raw) {
        setAlert(JSON.parse(raw));
        sessionStorage.removeItem(CRISIS_ALERT_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Could not read crisis alert:', err);
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--umeed-crisis-600)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px',
    }}>
      {/* Back button */}
      <div style={{ marginBottom: '40px' }}>
        <Link
          href={ROUTES.chat}
          style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 700,
            opacity: 0.9,
            display: 'inline-block',
            padding: '8px 0',
          }}
        >
          ← Back to chat
        </Link>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        gap: '40px',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        {/* Message */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <h1 style={{
            fontSize: '56px',
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
          }}>
            You're here.
          </h1>
          <p style={{
            fontSize: '20px',
            margin: 0,
            opacity: 0.95,
            lineHeight: 1.6,
          }}>
            That matters. This is a safe space. You don't have to figure everything out right now.
          </p>
          {alert?.message && (
            <p style={{
              fontSize: '18px',
              margin: '16px 0 0 0',
              opacity: 0.9,
              fontWeight: 500,
            }}>
              {alert.message}
            </p>
          )}
        </div>

        {/* Emergency contacts - oversized for touch */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <p style={{
            fontSize: '14px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.8,
            margin: 0,
          }}>
            Call now if in danger
          </p>

          {/* Emergency contact button - 48px minimum */}
          <a
            href={`tel:${ACTIVE_EMERGENCY_CONTACT.tel}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '32px 24px',
              backgroundColor: 'white',
              color: 'var(--umeed-crisis-600)',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 700,
              transition: 'all 300ms',
              minHeight: '80px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '28px', marginBottom: '8px' }}>
              {ACTIVE_EMERGENCY_CONTACT.label}
            </span>
            <span style={{ fontSize: '32px', fontWeight: 700 }}>
              {ACTIVE_EMERGENCY_CONTACT.number}
            </span>
          </a>

          {/* Crisis helpline button */}
          <a
            href={`tel:${ACTIVE_CRISIS_HELPLINE.tel}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '32px 24px',
              backgroundColor: 'white',
              color: 'var(--umeed-crisis-600)',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 700,
              transition: 'all 300ms',
              minHeight: '80px',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '28px', marginBottom: '8px' }}>
              {ACTIVE_CRISIS_HELPLINE.label}
            </span>
            <span style={{ fontSize: '32px', fontWeight: 700 }}>
              {ACTIVE_CRISIS_HELPLINE.number}
            </span>
          </a>
        </div>

        {/* Other resources */}
        {alert?.resources && alert.resources.length > 0 && (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.8,
              margin: 0,
            }}>
              Other resources
            </p>
            {alert.resources.slice(0, 3).map((resource) => (
              <a
                key={resource.id}
                href={`tel:${resource.phone}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '20px 24px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'all 300ms',
                  minHeight: '60px',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>
                    {resource.name}
                  </div>
                  {resource.description && (
                    <div style={{ fontSize: '12px', opacity: 0.8 }}>
                      {resource.description}
                    </div>
                  )}
                </div>
                {resource.phone && (
                  <div style={{ fontSize: '18px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {resource.phone}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginTop: '40px',
      }}>
        <Link
          href={ROUTES.resources}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '16px 24px',
            backgroundColor: 'white',
            color: 'var(--umeed-crisis-600)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: '16px',
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 300ms',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          View all support resources
        </Link>
      </div>
    </div>
  );
}
