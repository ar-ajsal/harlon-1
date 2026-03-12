/**
 * Harlon — Footer
 * Dark, minimal, premium — consistent with Gold Standard theme
 */
import { Link } from 'react-router-dom'
import { FiInstagram, FiMail, FiArrowUpRight } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { WHATSAPP_NUMBER } from '../config/constants'

const NAV = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop All' },
    { to: '/track-order', label: 'Track Order' },
]

export default function Footer() {
    const year = new Date().getFullYear()
    const phone = WHATSAPP_NUMBER.replace(/^91/, '+91 ')

    return (
        <footer className="app-footer" style={{
            background: '#0A0A0A',
            borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
            <style>{`
                @media (max-width: 768px) {
                    .app-footer { display: none !important; }
                }
            `}</style>
            {/* Top section */}
            <div style={{
                maxWidth: 1280,
                margin: '0 auto',
                padding: '56px 24px 40px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '40px 32px',
            }}>
                {/* Brand column */}
                <div style={{ maxWidth: 300 }}>
                    <p style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 800,
                        fontSize: 22,
                        color: '#fff',
                        letterSpacing: '-0.02em',
                        margin: '0 0 12px',
                    }}>
                        HARLON
                    </p>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        lineHeight: 1.65,
                        color: 'rgba(255,255,255,0.45)',
                        margin: '0 0 20px',
                    }}>
                        India's premier destination for authentic retro football jerseys.
                        Wear the legend.
                    </p>

                    {/* Social icons */}
                    <div style={{ display: 'flex', gap: 10 }}>
                        {[
                            {
                                href: `https://wa.me/${WHATSAPP_NUMBER}`,
                                label: 'WhatsApp',
                                icon: <FaWhatsapp size={16} />,
                                color: '#25D366',
                            },
                            {
                                href: 'https://instagram.com/harlon.india',
                                label: 'Instagram',
                                icon: <FiInstagram size={16} />,
                                color: '#E1306C',
                            },
                            {
                                href: 'mailto:harlonclothing@gmail.com',
                                label: 'Email',
                                icon: <FiMail size={16} />,
                                color: 'hsl(38,65%,55%)',
                            },
                        ].map(({ href, label, icon, color }) => (
                            <a
                                key={label}
                                href={href}
                                target={href.startsWith('http') ? '_blank' : undefined}
                                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                aria-label={label}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 38, height: 38,
                                    borderRadius: '50%',
                                    border: '1px solid rgba(255,255,255,0.12)',
                                    color: 'rgba(255,255,255,0.55)',
                                    textDecoration: 'none',
                                    transition: 'color 0.2s, border-color 0.2s, background 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.color = color
                                    e.currentTarget.style.borderColor = color
                                    e.currentTarget.style.background = `${color}18`
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                                    e.currentTarget.style.background = 'transparent'
                                }}
                            >
                                {icon}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Quick links */}
                <div>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'hsl(38,65%,55%)',
                        margin: '0 0 16px',
                    }}>
                        Navigate
                    </p>
                    <nav aria-label="Footer navigation">
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {NAV.map(({ to, label }) => (
                                <li key={to}>
                                    <Link
                                        to={to}
                                        style={{
                                            fontFamily: "'Inter', sans-serif",
                                            fontSize: 14,
                                            color: 'rgba(255,255,255,0.55)',
                                            textDecoration: 'none',
                                            transition: 'color 0.15s',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 4,
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Contact */}
                <div>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'hsl(38,65%,55%)',
                        margin: '0 0 16px',
                    }}>
                        Contact
                    </p>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <li>
                            <a
                                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Order on WhatsApp"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: 14,
                                    color: '#25D366',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                <FaWhatsapp size={16} aria-hidden="true" /> {phone}
                            </a>
                        </li>
                        <li>
                            <a
                                href="mailto:harlonclothing@gmail.com"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: 13,
                                    color: 'rgba(255,255,255,0.45)',
                                    textDecoration: 'none',
                                    transition: 'color 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
                            >
                                <FiMail size={15} aria-hidden="true" /> harlonclothing@gmail.com
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Trust / policy */}
                <div>
                    <p style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'hsl(38,65%,55%)',
                        margin: '0 0 16px',
                    }}>
                        Trust
                    </p>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                            '🔒 Secure Payments',
                            '🚚 Free Delivery ₹999+',
                            '↩️ 7-Day Returns',
                            '✅ 100% Authentic',
                        ].map(item => (
                            <li key={item} style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.4)',
                            }}>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
                maxWidth: 1280,
                margin: '0 auto',
            }}>
                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.3)',
                    margin: 0,
                }}>
                    © {year} Harlon. All rights reserved. Made in India 🇮🇳
                </p>
                <p style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.2)',
                    margin: 0,
                }}>
                    Retro jerseys for Indian fans
                </p>
            </div>
        </footer>
    )
}
