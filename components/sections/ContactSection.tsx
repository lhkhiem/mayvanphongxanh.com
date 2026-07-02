'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Send } from 'lucide-react';
import { SectionHeader } from '@/components/common/SectionHeader';

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader 
          title="Liên hệ với chúng tôi" 
          centered={true}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7 bg-card rounded-xl p-8 border border-border shadow-sm">
            <h3 className="text-2xl font-bold mb-6 text-foreground">Gửi tin nhắn cho chúng tôi</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  name="name"
                  placeholder="Họ và tên"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email của bạn"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
              </div>

              <input
                type="text"
                name="subject"
                placeholder="Chủ đề"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                required
              />

              <textarea
                name="message"
                placeholder="Nội dung tin nhắn"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                required
              />

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Gửi tin nhắn
              </button>
            </form>
          </div>

          {/* Right Column: Contact Info Stacked */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-all flex items-start gap-4 group">
              <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Phone className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1 text-lg">Điện thoại</h3>
                <p className="text-muted-foreground font-medium">+84 (0) 123 456 789</p>
                <p className="text-muted-foreground text-sm mt-1">Thứ 2 - Thứ 6, 8:00 - 17:30</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-all flex items-start gap-4 group">
              <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Mail className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1 text-lg">Email</h3>
                <p className="text-muted-foreground font-medium">support@mayvanphongxanh.com</p>
                <p className="text-muted-foreground text-sm mt-1">Phản hồi trong vòng 24h</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-all flex items-start gap-4 group">
              <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <MapPin className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1 text-lg">Địa chỉ</h3>
                <p className="text-muted-foreground font-medium">123 Đường Chính</p>
                <p className="text-muted-foreground text-sm mt-1">Quận 1, TP. Hồ Chí Minh</p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Placeholder Full Width */}
        <div className="max-w-6xl mx-auto mt-12 w-full h-[300px] md:h-[400px] bg-secondary/50 rounded-xl border border-border overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground flex-col gap-2">
            <MapPin className="w-10 h-10 opacity-50" />
            <span className="text-base font-medium">Bản đồ (Google Maps)</span>
            <span className="text-sm">Hiển thị full width ở bên dưới</span>
          </div>
        </div>
      </div>
    </section>
  );
}
