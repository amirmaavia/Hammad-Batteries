import React from 'react';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, MapPin, Mail, Phone } from 'lucide-react';
import { DISPLAY_PHONE_NUMBER } from '../lib/site';
import logo from '../assets/logo/logo.png';

export default function Footer() {
    return (
        <footer style={{ background: 'var(--glass-bg)', padding: '4rem 0 2rem', borderTop: '1px solid var(--glass-border)' }}>
            <div className="container grid grid-cols-4" style={{ gap: '2rem' }}>
                <div>
                    <Image src={logo} alt="Hammad Batteries logo" className="footer-logo" />
                    <p className="subtitle" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                        The most reliable and dynamically updated mobile battery shop. Automatic addition of recent Samsung and Apple models.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <a href="#" style={{ color: 'var(--heading)' }}><Facebook size={20} /></a>
                        <a href="#" style={{ color: 'var(--heading)' }}><Twitter size={20} /></a>
                        <a href="#" style={{ color: 'var(--heading)' }}><Instagram size={20} /></a>
                    </div>
                </div>

                <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--heading)' }}>Categories</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><a href="#" className="nav-link">Samsung Series</a></li>
                        <li><a href="#" className="nav-link">Apple iPhones</a></li>
                        <li><a href="#" className="nav-link">Huawei Options</a></li>
                        <li><a href="#" className="nav-link">Oppo / Vivo</a></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--heading)' }}>Useful Links</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <li><a href="#" className="nav-link">About Us</a></li>
                        <li><a href="#" className="nav-link">Return Policy</a></li>
                        <li><a href="#" className="nav-link">Warranty info</a></li>
                        <li><a href="#" className="nav-link">Contact Support</a></li>
                    </ul>
                </div>

                <div>
                    <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--heading)' }}>Contact Us</h4>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)' }}>
                            <MapPin size={18} color="var(--primary)" />
                            <span>123 Battery St, Tech World</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)' }}>
                            <Phone size={18} color="var(--primary)" />
                            <span>{DISPLAY_PHONE_NUMBER}</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted)' }}>
                            <Mail size={18} color="var(--primary)" />
                            <span>support@hammadbatteries.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="container" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
                <p>&copy; {new Date().getFullYear()} Hammad Batteries. All rights reserved.</p>
            </div>
        </footer>
    );
}
