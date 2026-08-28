'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { ROUTES } from '@/lib/constants';

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const chaptersRef = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    // Add animation styles to head
    if (typeof document !== 'undefined' && !document.querySelector('#umeed-landing-animations')) {
      const style = document.createElement('style');
      style.id = 'umeed-landing-animations';
      style.textContent = `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .hero-headline {
          animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s backwards;
        }

        .hero-subline {
          animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s backwards;
        }

        .hero-description {
          animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.5s backwards;
        }

        .scroll-indicator {
          animation: bounce 2s infinite;
        }

        .chapter-visible {
          animation: fadeInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-headline,
          .hero-subline,
          .hero-description,
          .chapter-visible,
          .scroll-indicator {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Scroll-triggered animations using IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('chapter-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    chaptersRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const chapters = [
    {
      title: 'Talk',
      urdu: 'گفتگو کریں',
      description: 'Share what is on your mind in a judgment-free space. Umeed listens without rushing, without judgment, adapted to how you prefer support.',
      href: ROUTES.chat,
      emoji: '💬',
    },
    {
      title: 'Plan',
      urdu: 'منصوبہ بنائیں',
      description: 'Build your personal safety plan with warning signs, coping strategies, and trusted contacts. Yours to keep, yours to share.',
      href: ROUTES.safetyPlanBuilder,
      emoji: '📋',
    },
    {
      title: 'Resources',
      urdu: 'وسائل',
      description: 'Crisis hotlines, counselors, and support groups nearby. Available in your language, 24/7.',
      href: ROUTES.resources,
      emoji: '🤝',
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--umeed-beige-50)', minHeight: '100vh' }}>
      {/* Header with Logo and Signup */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid var(--umeed-orange-200)',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Link href={ROUTES.home} style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <Image
            src="/logo.jpg"
            alt="Umeed Logo"
            width={40}
            height={40}
            style={{ borderRadius: '8px' }}
          />
          <span style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--umeed-ink-900)',
            fontFamily: "'Fraunces', Georgia, serif",
          }}>
            Umeed
          </span>
        </Link>
        <Link href={ROUTES.signup} style={{
          backgroundColor: 'var(--umeed-orange-500)',
          color: 'white',
          padding: '12px 28px',
          borderRadius: '9999px',
          fontWeight: 700,
          fontSize: '14px',
          textDecoration: 'none',
          transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: '0 4px 12px rgba(244, 107, 31, 0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(244, 107, 31, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 107, 31, 0.2)';
        }}>
          Sign Up
        </Link>
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: '60px',
          paddingBottom: '80px',
          paddingLeft: '40px',
          paddingRight: '40px',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '900px' }}>
          <h1 className="hero-headline" style={{
            fontSize: '64px',
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 700,
            color: 'var(--umeed-ink-900)',
            marginBottom: '0px',
            lineHeight: 1.2,
          }}>
            Umeed
          </h1>
          <p className="hero-subline" style={{
            fontSize: '20px',
            fontFamily: "'Noto Nastaliq Urdu', serif",
            fontWeight: 700,
            color: 'var(--umeed-orange-500)',
            marginBottom: '32px',
            lineHeight: 1.8,
          }}>
            امید سے بات کریں
          </p>
          <p className="hero-description" style={{
            fontSize: '16px',
            color: 'var(--umeed-ink-500)',
            marginBottom: '32px',
            maxWidth: '600px',
            lineHeight: 1.6,
          }}>
            A warm, judgment-free space to talk about what is on your mind — adapted to how you prefer support. Not a replacement for professional care, but a steady companion during difficult moments.
          </p>
        </div>

        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '12px',
            color: 'var(--umeed-ink-400)',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 600,
          }}>
            Scroll to explore
          </p>
          <div className="scroll-indicator" style={{
            fontSize: '20px',
            color: 'var(--umeed-orange-400)',
          }}>
            ↓
          </div>
        </div>
      </section>

      {/* Chapters: Each Feature as Full-Height Section */}
      {chapters.map((chapter, idx) => (
        <section
          key={chapter.href}
          ref={(el) => {
            if (el) chaptersRef.current[idx] = el;
          }}
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '100px',
            paddingBottom: '100px',
            paddingLeft: '40px',
            paddingRight: '40px',
            opacity: 0,
          }}
        >
          <div style={{ maxWidth: '800px', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>
              {chapter.emoji}
            </div>
            <h2 style={{
              fontSize: '44px',
              fontFamily: "'Fraunces', Georgia, serif",
              fontWeight: 700,
              color: 'var(--umeed-ink-900)',
              marginBottom: '12px',
              lineHeight: 1.2,
            }}>
              {chapter.title}
            </h2>
            <p style={{
              fontSize: '20px',
              fontFamily: "'Noto Nastaliq Urdu', serif",
              fontWeight: 700,
              color: 'var(--umeed-orange-500)',
              marginBottom: '32px',
              lineHeight: 1.8,
            }}>
              {chapter.urdu}
            </p>
            <p style={{
              fontSize: '16px',
              color: 'var(--umeed-ink-500)',
              marginBottom: '40px',
              lineHeight: 1.8,
              maxWidth: '600px',
              margin: '0 auto 40px',
            }}>
              {chapter.description}
            </p>
            <Link
              href={chapter.href}
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--umeed-orange-500)',
                color: 'white',
                padding: '16px 40px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '16px',
                textDecoration: 'none',
                transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
                boxShadow: '0 4px 12px rgba(244, 107, 31, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(244, 107, 31, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 107, 31, 0.2)';
              }}
            >
              Explore {chapter.title}
            </Link>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section
        ref={(el) => {
          if (el) chaptersRef.current[chapters.length] = el;
        }}
        style={{
          minHeight: '60vh',
          backgroundColor: 'var(--umeed-orange-500)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: '40px',
          paddingRight: '40px',
          paddingTop: '60px',
          paddingBottom: '60px',
          textAlign: 'center',
          opacity: 0,
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <h2 style={{
            fontSize: '44px',
            fontFamily: "'Fraunces', Georgia, serif",
            fontWeight: 700,
            marginBottom: '16px',
          }}>
            Ready to start?
          </h2>
          <p style={{
            fontSize: '16px',
            marginBottom: '32px',
            opacity: 0.95,
          }}>
            No account needed. Your privacy is protected. Begin whenever you are ready.
          </p>
          <Link
            href={ROUTES.onboarding}
            style={{
              display: 'inline-block',
              backgroundColor: 'white',
              color: 'var(--umeed-orange-500)',
              padding: '16px 40px',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '16px',
              textDecoration: 'none',
              transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Safety Notice */}
      <section style={{
        backgroundColor: 'var(--umeed-orange-100)',
        borderLeft: '4px solid var(--umeed-orange-700)',
        padding: '24px 32px',
        marginLeft: '40px',
        marginRight: '40px',
        marginTop: '60px',
        marginBottom: '60px',
        borderRadius: '4px',
      }}>
        <p style={{
          fontSize: '14px',
          color: 'var(--umeed-ink-900)',
          margin: 0,
        }}>
          <strong>Important:</strong> This tool is a supportive companion, not a replacement for professional mental health care.
          If you are in crisis, please{' '}
          <Link href={ROUTES.resources} style={{
            color: 'var(--umeed-orange-700)',
            fontWeight: 700,
            textDecoration: 'none',
            borderBottom: '2px solid var(--umeed-orange-700)',
          }}>
            reach out to a crisis hotline immediately
          </Link>.
        </p>
      </section>
    </div>
  );
}
