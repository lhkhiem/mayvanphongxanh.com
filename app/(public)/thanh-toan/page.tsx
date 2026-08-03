'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { ShieldCheck, Truck, ArrowLeft, AlertCircle, CheckCircle2, User, Phone, Mail, MapPin, FileText, CreditCard, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const VN_PHONE_REGEX = /^(0[35789])\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface PendingOrderData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  notes: string;
  payment: string;
}

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<PendingOrderData | null>(null);

  const validatePhone = (phoneStr: string) => {
    const cleaned = phoneStr.replace(/[\s\-\.]/g, '');
    if (!cleaned) return 'Vui lòng nhập số điện thoại.';
    if (!VN_PHONE_REGEX.test(cleaned)) {
      return 'Số điện thoại không hợp lệ. Vui lòng nhập đúng 10 số di động Việt Nam (ví dụ: 0912345678, 0389998888).';
    }
    return '';
  };

  const validateEmail = (emailStr: string) => {
    if (!emailStr) return '';
    if (!emailStr.includes('@')) {
      return "Email phải chứa ký tự '@' (ví dụ: khachhang@gmail.com).";
    }
    if (!EMAIL_REGEX.test(emailStr)) {
      return 'Email không đúng định dạng (ví dụ: khachhang@gmail.com).';
    }
    return '';
  };

  const handlePhoneBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      setPhoneError(validatePhone(val));
    } else {
      setPhoneError('');
    }
  };

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      setEmailError(validateEmail(val));
    } else {
      setEmailError('');
    }
  };

  const handlePreSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOrderError('');

    const formData = new FormData(e.currentTarget);
    const customerName = String(formData.get('customerName') || '').trim();
    const customerPhone = String(formData.get('customerPhone') || '').trim();
    const customerEmail = String(formData.get('customerEmail') || '').trim();
    const shippingAddress = String(formData.get('shippingAddress') || '').trim();
    const notes = String(formData.get('notes') || '').trim();
    const payment = String(formData.get('payment') || 'cod');

    const phoneErr = validatePhone(customerPhone);
    const emailErr = validateEmail(customerEmail);

    if (phoneErr || emailErr) {
      setPhoneError(phoneErr);
      setEmailError(emailErr);
      return;
    }
    setPhoneError('');
    setEmailError('');

    setPendingOrder({
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      notes,
      payment,
    });
    setShowConfirmModal(true);
  };

  const executeOrderSubmission = async () => {
    if (!pendingOrder) return;
    setIsSubmitting(true);
    setOrderError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: pendingOrder.customerName,
          customerPhone: pendingOrder.customerPhone,
          customerEmail: pendingOrder.customerEmail,
          shippingAddress: pendingOrder.shippingAddress,
          notes: pendingOrder.notes,
          payment: pendingOrder.payment,
          items: items.map((item) => ({
            id: item.id,
            variantId: item.variantId,
            quantity: item.quantity,
            customOptions: item.customOptions,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Không thể tạo đơn hàng.');
      }

      clearCart();
      setShowConfirmModal(false);
      router.push(`/thanh-toan/thanh-cong?orderId=${encodeURIComponent(data.orderId)}`);
    } catch (error) {
      setOrderError(error instanceof Error ? error.message : 'Không thể tạo đơn hàng.');
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && !isSubmitting) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <h2 className="text-2xl font-bold text-foreground mb-4">Giỏ hàng của bạn đang trống!</h2>
          <p className="text-muted-foreground mb-8">Vui lòng chọn thêm sản phẩm để tiến hành thanh toán.</p>
          <Link href="/san-pham" className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Quay lại Cửa hàng
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <div className="flex-1 mx-auto max-w-7xl px-4 py-8 w-full">
        <Link href="/san-pham" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lại mua sắm
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-8">Thanh toán & Giao hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <form id="checkout-form" onSubmit={handlePreSubmit} className="space-y-8">
              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Thông tin Giao hàng
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Họ và tên *</label>
                    <input
                      required
                      name="customerName"
                      type="text"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="Nhập họ tên đầy đủ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Số điện thoại *</label>
                    <input
                      required
                      name="customerPhone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneError('');
                      }}
                      onBlur={handlePhoneBlur}
                      onChange={() => setPhoneError('')}
                      className={`w-full px-4 py-3 bg-background border rounded-lg text-foreground focus:ring-2 focus:ring-primary outline-none transition-all ${
                        phoneError ? 'border-red-500 bg-red-50/20' : 'border-border focus:border-primary'
                      }`}
                      placeholder="VD: 0912345678 (10 số)"
                    />
                    {phoneError && (
                      <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    name="customerEmail"
                    type="email"
                    onBlur={handleEmailBlur}
                    onChange={() => setEmailError('')}
                    className={`w-full px-4 py-3 bg-background border rounded-lg text-foreground focus:ring-2 focus:ring-primary outline-none transition-all ${
                      emailError ? 'border-red-500 bg-red-50/20' : 'border-border focus:border-primary'
                    }`}
                    placeholder="Để nhận thông tin xác nhận đơn hàng"
                  />
                  {emailError && (
                    <p className="mt-1.5 text-xs font-medium text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">Địa chỉ giao hàng chi tiết *</label>
                  <input
                    required
                    name="shippingAddress"
                    type="text"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Ghi chú thêm (Tùy chọn)</label>
                  <textarea
                    name="notes"
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                    placeholder="Lưu ý giao hàng, giờ nhận hàng..."
                  ></textarea>
                </div>
              </div>

              {orderError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold mb-0.5">Đặt hàng không thành công</strong>
                    <span>{orderError}</span>
                  </div>
                </div>
              )}

              <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Phương thức Thanh toán
                </h2>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-secondary/30">
                    <input type="radio" name="payment" value="cod" defaultChecked className="w-5 h-5 text-primary focus:ring-primary border-border" />
                    <div>
                      <h4 className="font-semibold text-foreground">Thanh toán khi nhận hàng (COD)</h4>
                      <p className="text-sm text-muted-foreground">Kiểm tra hàng trước khi thanh toán</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-4 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <input type="radio" name="payment" value="transfer" className="w-5 h-5 text-primary focus:ring-primary border-border" />
                    <div>
                      <h4 className="font-semibold text-foreground">Chuyển khoản ngân hàng</h4>
                      <p className="text-sm text-muted-foreground">Chuyển khoản qua mã QR / STK sau khi đặt hàng</p>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-28">
              <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Tóm tắt Đơn hàng
              </h2>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-secondary">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-2 -right-2 bg-primary text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground line-clamp-2">{item.name}</h4>
                      {item.variantName && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.variantName}</p>
                      )}
                      <p className="text-sm font-semibold text-primary mt-1">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính</span>
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí giao hàng</span>
                  <span className="text-green-600 font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
                  <span className="text-foreground">Tổng cộng</span>
                  <span className="text-primary">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}</span>
                </div>
              </div>

              <button 
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-bold text-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg cursor-pointer"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'}
              </button>

              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>Bảo mật thông tin 100%</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>Giao hàng tận nơi toàn quốc</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Xác nhận Thông tin trước khi Đặt hàng */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              Xác Nhận Thông Tin Đơn Hàng
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Vui lòng kiểm tra lại thông tin giao hàng và danh sách sản phẩm trước khi tiến hành đặt hàng.
            </DialogDescription>
          </DialogHeader>

          {pendingOrder && (
            <div className="space-y-6 my-2">
              {/* Thông tin người nhận */}
              <div className="bg-secondary/40 border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider text-muted-foreground mb-2">
                  Thông tin người nhận
                </h3>
                
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-muted-foreground">Họ tên: </span>
                      <strong className="text-foreground">{pendingOrder.customerName}</strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-muted-foreground">Số điện thoại: </span>
                      <strong className="text-green-600 font-semibold">{pendingOrder.customerPhone}</strong>
                    </div>
                  </div>

                  {pendingOrder.customerEmail && (
                    <div className="flex items-start gap-2">
                      <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-muted-foreground">Email: </span>
                        <span className="text-foreground">{pendingOrder.customerEmail}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-muted-foreground">Địa chỉ nhận hàng: </span>
                      <span className="text-foreground font-medium">{pendingOrder.shippingAddress}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CreditCard className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-muted-foreground">Phương thức thanh toán: </span>
                      <strong className="text-foreground">
                        {pendingOrder.payment === 'transfer' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)'}
                      </strong>
                    </div>
                  </div>

                  {pendingOrder.notes && (
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-muted-foreground">Ghi chú: </span>
                        <span className="text-amber-700 italic">{pendingOrder.notes}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Danh sách sản phẩm xác nhận */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider text-muted-foreground mb-2">
                  Sản phẩm đặt mua ({items.length})
                </h3>
                
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.cartItemId} className="flex justify-between items-center text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <div className="flex-1 pr-4">
                        <p className="font-medium text-foreground line-clamp-1">{item.name}</p>
                        {item.variantName && (
                          <p className="text-xs text-muted-foreground">{item.variantName}</p>
                        )}
                        <span className="text-xs text-muted-foreground">SL: x{item.quantity}</span>
                      </div>
                      <span className="font-semibold text-primary">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3 flex justify-between items-center text-base font-bold">
                  <span className="text-foreground">Tổng tiền thanh toán:</span>
                  <span className="text-primary text-lg">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowConfirmModal(false)}
              className="px-5 py-2.5 rounded-lg border border-border text-foreground text-sm font-semibold hover:bg-secondary transition-colors cursor-pointer disabled:opacity-50"
            >
              Chỉnh sửa lại
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={executeOrderSubmission}
              className="px-6 py-2.5 rounded-lg bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Đang xử lý đơn hàng...
                </>
              ) : (
                'Xác Nhận & Đặt Hàng'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </main>
  );
}

