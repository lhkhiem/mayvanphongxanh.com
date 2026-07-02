'use client';

import { useState } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    category: 'Shipping',
    question: 'What are the shipping options?',
    answer: 'We offer standard shipping (5-7 business days) at $9.99, express shipping (2-3 business days) at $19.99, and free shipping on orders over $100. All orders are shipped via trusted carriers with tracking information.',
  },
  {
    id: 2,
    category: 'Shipping',
    question: 'How long does delivery take?',
    answer: 'Standard shipping typically takes 5-7 business days from the order date. Express shipping takes 2-3 business days. Delivery times may vary based on your location and current order volume.',
  },
  {
    id: 3,
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day hassle-free return policy. Products must be in original condition with all packaging and accessories. Once we receive your return, refunds are processed within 5-7 business days.',
  },
  {
    id: 4,
    category: 'Returns',
    question: 'How do I initiate a return?',
    answer: 'Log into your account, navigate to Order History, select the order you want to return, and click "Return Item". Follow the instructions to print a prepaid shipping label. Ship the item back and we\'ll process your refund once received.',
  },
  {
    id: 5,
    category: 'Products',
    question: 'Are all products covered by warranty?',
    answer: 'Most KEEN products come with a standard 2-year manufacturer\'s warranty covering defects. Some items may have extended warranty options available at checkout. Warranty details are listed on each product page.',
  },
  {
    id: 6,
    category: 'Products',
    question: 'Do you offer bulk discounts?',
    answer: 'Yes! We offer volume discounts for business purchases. Contact our sales team at sales@keen.com or call 1-800-KEEN-OFFICE for bulk orders and custom quotes.',
  },
  {
    id: 7,
    category: 'Account',
    question: 'How do I create an account?',
    answer: 'Click "Sign Up" in the top right corner and enter your email address and password. You\'ll receive a confirmation email to verify your account. Creating an account allows you to save your information and track orders.',
  },
  {
    id: 8,
    category: 'Account',
    question: 'Is my payment information secure?',
    answer: 'Yes, we use industry-standard SSL encryption and comply with PCI DSS standards. Your payment information is never stored on our servers and is processed securely through trusted payment gateways.',
  },
  {
    id: 9,
    category: 'Support',
    question: 'How do I contact customer support?',
    answer: 'You can reach our support team via email at support@keen.com, phone at +1 (555) 123-4567, or through our live chat. We\'re available Monday-Friday, 9am-6pm EST.',
  },
];

export default function FAQPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...new Set(faqData.map((item) => item.category))];
  const filteredFAQ = selectedCategory === 'All' ? faqData : faqData.filter((item) => item.category === selectedCategory);

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">Find answers to common questions about our products and services</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-border'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQ.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted transition-colors"
              >
                <div className="text-left flex-1">
                  <p className="text-xs font-semibold text-primary mb-1">{item.category.toUpperCase()}</p>
                  <h3 className="font-semibold text-foreground text-left">{item.question}</h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 ml-4 transition-transform ${
                    expandedId === item.id ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {expandedId === item.id && (
                <div className="px-6 py-4 bg-muted border-t border-border text-muted-foreground">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still need help? */}
        <div className="mt-16 p-8 bg-primary/5 border border-primary/20 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Didn&apos;t find your answer?</h2>
          <p className="text-muted-foreground mb-6">Our support team is here to help. Get in touch with us directly.</p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>

      <Footer />
    </main>
  );
}
