import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '../lib/site';
import ThemeToggle from './ThemeToggle';
import logo from '../assets/logo/logo.png';

export default function Navbar() {
    return (
        <header className="header">
            <div className="container header-container">
                <Link href="/" className="logo cursor-pointer">
                    <Image src={logo} alt="Hammad Batteries logo" className="logo-image" priority />
                </Link>

                <nav className="nav-links">
                    <Link href="/#home" className="nav-link">Home</Link>
                    <Link href="/#brands" className="nav-link">Brands & Categories</Link>
                    <Link href="/#recent" className="nav-link">Latest Additions</Link>
                    {/* <Link href="/admin" className="nav-link">Admin Panel</Link> */}
                </nav>

                <div style={{display: "flex", gap: "0.2rem"}}>
                    <ThemeToggle />
                    {/* <Link href="/admin" className="btn btn-admin">
                        Admin
                    </Link> */}
                    <a
                        href={getWhatsAppLink("Assalam o Alaikum, I want to ask about batteries.")}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-whatsapp btn-mobile-icon "
                        aria-label="Contact on WhatsApp"
                        title="Contact on WhatsApp"
                    >
                        <MessageCircle size={18} />
                        <span className="btn-text">Contact on WhatsApp</span>
                    </a>
                </div>
            </div>
        </header>
    );
}
