'use client';

import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { HelpCircle, BookOpen, LifeBuoy, MessageSquare } from 'lucide-react';

export default function HelpPage() {
  const helpCategories = [
    {
      icon: ShoppingIcon,
      title: 'Getting Started',
      description: 'Learn how to browse products, create an account, and place your first order.',
      links: [
        { text: 'Create Account', href: '#' },
        { text: 'Browse Products', href: '/products' },
        { text: 'How to Order', href: '#' },
      ],
    },
    {
      icon: PackageIcon,
      title: 'Orders & Shipping',
      description: 'Track your order, manage shipping, and understand delivery timelines.',
      links: [
        { text: 'Track Order', href: '#' },
        { text: 'Shipping Info', href: '#' },
        { text: 'Delivery FAQ', href: '/faq' },
      ],
    },
    {
      icon: RotateIcon,
      title: 'Returns & Refunds',
      description: 'Initiate a return, check refund status, and understand our return policy.',
      links: [
        { text: 'Start a Return', href: '#' },
        { text: 'Return Policy', href: '/faq' },
        { text: 'Refund Status', href: '#' },
      ],
    },
    {
      icon: CreditCardIcon,
      title: 'Payment & Billing',
      description: 'Manage payment methods, invoices, and understand billing questions.',
      links: [
        { text: 'Payment Methods', href: '#' },
        { text: 'Billing Issues', href: '#' },
        { text: 'Download Invoice', href: '#' },
      ],
    },
    {
      icon: ShieldIcon,
      title: 'Account & Security',
      description: 'Manage your profile, passwords, and keep your account secure.',
      links: [
        { text: 'Update Profile', href: '/account' },
        { text: 'Change Password', href: '#' },
        { text: 'Security Tips', href: '#' },
      ],
    },
    {
      icon: HeadphoneIcon,
      title: 'Technical Support',
      description: 'Get help with product setup, troubleshooting, and technical issues.',
      links: [
        { text: 'Product Manuals', href: '#' },
        { text: 'Troubleshooting', href: '#' },
        { text: 'Contact Support', href: '/contact' },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">How Can We Help?</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers, guides, and support for all your questions about KEEN Office Solutions
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* Search Help Topics */}
        <div className="mb-12">
          <input
            type="text"
            placeholder="Search help articles..."
            className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Help Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {helpCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title} className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
                <Icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">{category.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                <div className="space-y-2">
                  {category.links.map((link) => (
                    <Link
                      key={link.text}
                      href={link.href}
                      className="block text-sm text-primary hover:text-primary/80 transition-colors font-semibold"
                    >
                      → {link.text}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link href="/faq" className="bg-primary/5 border border-primary/20 rounded-lg p-6 hover:border-primary transition-colors">
            <BookOpen className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold text-foreground mb-2">FAQ</h3>
            <p className="text-sm text-muted-foreground">Browse frequently asked questions</p>
          </Link>

          <Link href="/contact" className="bg-primary/5 border border-primary/20 rounded-lg p-6 hover:border-primary transition-colors">
            <LifeBuoy className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold text-foreground mb-2">Contact Support</h3>
            <p className="text-sm text-muted-foreground">Reach our support team directly</p>
          </Link>

          <Link href="/contact" className="bg-primary/5 border border-primary/20 rounded-lg p-6 hover:border-primary transition-colors">
            <MessageSquare className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold text-foreground mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground">Chat with our support team</p>
          </Link>
        </div>

        {/* Popular Articles */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Popular Articles</h2>
          <div className="space-y-3">
            {[
              'How to Track Your Order',
              'Understanding Our Warranty Coverage',
              'How to Return an Item',
              'Troubleshooting Printer Connection Issues',
              'Comparing Our Printer Models',
            ].map((article) => (
              <Link
                key={article}
                href="#"
                className="block p-4 bg-card border border-border rounded-lg hover:border-primary hover:bg-muted transition-colors"
              >
                <p className="font-semibold text-foreground">{article}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

// Icon components
function ShoppingIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function PackageIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  );
}

function RotateIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function CreditCardIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 10a2 2 0 00-2 2v6a2 2 0 002 2h18a2 2 0 002-2v-6a2 2 0 00-2-2m-9-4h6a2 2 0 012 2v2H7V8a2 2 0 012-2z" />
    </svg>
  );
}

function ShieldIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function HeadphoneIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
