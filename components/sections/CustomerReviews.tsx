'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Star, Quote, ChevronLeft, ChevronRight, MessageSquare, PenSquare,
  X, RefreshCw, Send, CheckCircle2, ShieldAlert, User
} from 'lucide-react';
import { toast } from 'sonner';
import { submitPublicTestimonial, getCaptchaChallenge } from '@/app/(public)/testimonials-action';

export function CustomerReviews({ testimonials = [] }: { testimonials?: any[] }) {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;

  // Auto carousel slide
  useEffect(() => {
    if (total <= 1) return;
    const t = setInterval(() => setCurrent(p => (p + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total]);

  // Show 3 at a time on desktop
  const getVisible = () => {
    if (!testimonials || testimonials.length === 0) return [];
    const items = [];
    for (let i = 0; i < Math.min(3, testimonials.length); i++) {
      items.push(testimonials[(current + i) % total]);
    }
    return items;
  };

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');

  // Anti-Spam Captcha State (Server HMAC Signed)
  const [num1, setNum1] = useState<number | null>(null);
  const [num2, setNum2] = useState<number | null>(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Fetch Server-Signed Math Captcha
  const loadCaptcha = useCallback(async () => {
    setLoadingCaptcha(true);
    try {
      const challenge = await getCaptchaChallenge();
      setNum1(challenge.num1);
      setNum2(challenge.num2);
      setCaptchaToken(challenge.token);
      setCaptchaInput('');
    } catch (err) {
      console.error('Lỗi khi tạo CAPTCHA:', err);
    } finally {
      setLoadingCaptcha(false);
    }
  }, []);

  const handleOpenModal = () => {
    loadCaptcha();
    setSubmitSuccessMsg(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side Rate Limit check
    const COOLDOWN_TIME = 2 * 60 * 1000; // 2 phút
    const lastSubmitTime = localStorage.getItem('last_testimonial_submitted_at');
    if (lastSubmitTime) {
      const elapsed = Date.now() - parseInt(lastSubmitTime, 10);
      if (elapsed < COOLDOWN_TIME) {
        const remainingSec = Math.ceil((COOLDOWN_TIME - elapsed) / 1000);
        toast.error(`Bạn thao tác quá nhanh. Vui lòng đợi ${remainingSec} giây trước khi gửi lại.`);
        return;
      }
    }

    if (!name.trim()) return toast.error('Vui lòng nhập Họ và tên!');
    if (!content.trim() || content.trim().length < 10) return toast.error('Nội dung nhận xét phải từ 10 ký tự trở lên!');
    if (!captchaInput.trim() || !captchaToken) return toast.error('Vui lòng nhập kết quả xác minh CAPTCHA!');

    setSubmitting(true);

    const res = await submitPublicTestimonial({
      name,
      role,
      content,
      rating,
      image,
      captchaToken,
      captchaAnswer: captchaInput,
      honeypot,
    });

    setSubmitting(false);

    if (res.error) {
      toast.error(res.error);
      loadCaptcha(); // Reset Captcha khi lỗi
    } else {
      localStorage.setItem('last_testimonial_submitted_at', Date.now().toString());
      setSubmitSuccessMsg(res.message || 'Cảm ơn bạn đã gửi đánh giá! Nhận xét đang chờ Admin phê duyệt.');
      toast.success('Đã gửi nhận xét thành công!');

      // Reset form fields
      setName('');
      setRole('');
      setContent('');
      setImage('');
      setRating(5);
    }
  };

  return (
    <section className="py-8 bg-gradient-to-b from-[#F4F7F6] to-[#E8F0EA] border-t border-gray-100 relative">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="w-1 sm:w-1.5 h-5 sm:h-6 rounded-full bg-primary inline-block" />
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 leading-snug">
              Khách hàng nói gì về chúng tôi
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary text-white text-xs sm:text-sm font-semibold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            >
              <PenSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Viết đánh giá
            </button>

            {total > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrent(p => (p - 1 + total) % total)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => setCurrent(p => (p + 1) % total)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 bg-white flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors shrink-0"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Testimonials Cards */}
        {testimonials && testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getVisible().map((t, i) => (
              <div
                key={`${t.id}-${i}`}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 flex flex-col relative"
              >
                <Quote className="w-8 h-8 text-primary/10 absolute top-4 right-4" />

                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4"
                      fill={j < Math.floor(t.rating) ? '#FFA726' : '#E0E0E0'}
                      color={j < Math.floor(t.rating) ? '#FFA726' : '#E0E0E0'}
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-1.5 font-semibold">{t.rating}</span>
                </div>

                <p className="text-sm text-gray-700 italic leading-relaxed flex-1 mb-4 line-clamp-4">
                  &ldquo;{t.content}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-primary/20 bg-gray-100 flex items-center justify-center">
                    {t.image ? (
                      <Image src={t.image} alt={t.name} fill className="object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{t.name}</p>
                    {t.role && <p className="text-[10px] text-gray-500 line-clamp-1">{t.role}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-200 text-gray-500 text-sm">
            Chưa có đánh giá nào. Hãy là người đầu tiên gửi nhận xét về trải nghiệm của bạn!
          </div>
        )}

        {total > 1 && (
          <div className="flex justify-center gap-1.5 mt-5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? 'w-5 h-2 bg-primary' : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* SUBMISSION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-base text-gray-800 flex items-center gap-2">
                <PenSquare className="w-5 h-5 text-primary" /> Viết nhận xét đánh giá
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {submitSuccessMsg ? (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-800">Cảm ơn đánh giá của bạn!</h4>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed px-4">
                    {submitSuccessMsg}
                  </p>
                  <button
                    onClick={() => setShowModal(false)}
                    className="mt-2 px-5 py-2 bg-primary text-white font-semibold text-sm rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Honeypot field (Bẫy Bot) */}
                  <input
                    type="text"
                    name="website_hp"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Đánh giá trải nghiệm của bạn *
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 bg-amber-50 p-2 rounded-xl border border-amber-200">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className="w-6 h-6"
                              fill={star <= rating ? '#FFA726' : '#E0E0E0'}
                              color={star <= rating ? '#FFA726' : '#E0E0E0'}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="font-bold text-sm text-amber-600">
                        {rating} / 5 sao
                      </span>
                    </div>
                  </div>

                  {/* Name & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="VD: Nguyễn Văn Nam"
                        required
                        maxLength={100}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Chức danh / Công ty (Tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="VD: Anh Nam - Q.3, TP.HCM"
                        maxLength={100}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Lời nhận xét của bạn *
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={3}
                      placeholder="Chia sẻ trải nghiệm sử dụng sản phẩm & dịch vụ của Máy Văn Phòng Xanh..."
                      required
                      minLength={10}
                      maxLength={2000}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Image optional */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Link ảnh đại diện (Tùy chọn)
                    </label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Anti-Spam Server HMAC Signed Math Captcha */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-emerald-600" /> Xác minh bảo mật CAPTCHA *
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-base text-slate-800 shadow-xs flex items-center gap-2 select-none min-w-[120px] justify-between">
                        {loadingCaptcha ? (
                          <span className="text-xs text-gray-400 font-normal">Đang tạo...</span>
                        ) : (
                          <span>{num1} + {num2} = ?</span>
                        )}
                        <button
                          type="button"
                          onClick={loadCaptcha}
                          disabled={loadingCaptcha}
                          className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                          title="Đổi phép tính khác"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loadingCaptcha ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      <input
                        type="number"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        placeholder="Kết quả?"
                        required
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 italic">
                    * Nhận xét sẽ được kiểm duyệt bởi quản trị viên trước khi hiển thị công khai trên website.
                  </p>

                  <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || loadingCaptcha}
                      className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                    >
                      <Send className="w-4 h-4" /> {submitting ? 'Đang gửi...' : 'Gửi nhận xét'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
