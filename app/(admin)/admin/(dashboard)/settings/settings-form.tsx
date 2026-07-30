"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateSettings, sendTestEmailAction } from "./actions"
import { toast } from "sonner"
import { Save, Building2, Phone, LineChart, CreditCard, Mail, Send, Loader2, CheckCircle2, Printer } from "lucide-react"
import { MediaPickerInput } from "@/components/admin/media-picker-input"

export function SettingsForm({ initialData }: { initialData: Record<string, string> }) {
  const [isLoading, setIsLoading] = useState(false)
  const [companyLogo, setCompanyLogo] = useState(initialData['company_logo'] || initialData['site_logo'] || '')
  const [companyFavicon, setCompanyFavicon] = useState(initialData['company_favicon'] || initialData['site_favicon'] || '')
  const [seoImage, setSeoImage] = useState(initialData['seo_image'] || '')

  // State cho Test Email
  const [testEmail, setTestEmail] = useState(initialData['admin_receive_email'] || initialData['contact_email'] || '')
  const [isTestingEmail, setIsTestingEmail] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const res = await updateSettings(formData)
    
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Đã lưu các thay đổi!")
    }
    setIsLoading(false)
  }

  const handleTestEmail = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ email nhận kiểm tra hợp lệ.")
      return
    }

    setIsTestingEmail(true)
    toast.info("Đang gửi email thử nghiệm...")
    const res = await sendTestEmailAction(testEmail)
    setIsTestingEmail(false)

    if (res && 'success' in res && res.success) {
      toast.success("Gửi email thử nghiệm thành công! Vui lòng kiểm tra hộp thư của bạn.")
    } else {
      toast.error(`Gửi email thử nghiệm thất bại: ${(res && 'error' in res && res.error) || "Không xác định"}`)
    }
  }

  return (
    <div className="bg-white dark:bg-[#2a303d] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="p-4 sm:p-5">
        <Tabs defaultValue="general" orientation="vertical" className="flex flex-col md:flex-row w-full gap-4 md:gap-6">
          
          <TabsList variant="line" className="w-full md:w-64 h-fit shrink-0 flex flex-col gap-1 p-0 bg-transparent">
            <TabsTrigger 
              value="general" 
              className="w-full justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:rounded-l-none"
            >
              <Building2 className="w-4 h-4 mr-3 text-current" /> 
              Thông tin Công ty
            </TabsTrigger>
            <TabsTrigger 
              value="contact" 
              className="w-full justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:rounded-l-none"
            >
              <Phone className="w-4 h-4 mr-3 text-current" /> 
              Liên hệ & MXH
            </TabsTrigger>
            <TabsTrigger 
              value="email" 
              className="w-full justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:rounded-l-none"
            >
              <Mail className="w-4 h-4 mr-3 text-current" /> 
              Cấu hình Email (SMTP)
            </TabsTrigger>
            <TabsTrigger 
              value="seo" 
              className="w-full justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:rounded-l-none"
            >
              <LineChart className="w-4 h-4 mr-3 text-current" /> 
              SEO & Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="payment" 
              className="w-full justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:rounded-l-none"
            >
              <CreditCard className="w-4 h-4 mr-3 text-current" /> 
              Thanh toán & Hỗ trợ
            </TabsTrigger>
            <TabsTrigger 
              value="quote" 
              className="w-full justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:rounded-l-none"
            >
              <Printer className="w-4 h-4 mr-3 text-current" /> 
              Cấu hình Báo Giá
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 min-w-0">
            <TabsContent value="general" className="space-y-4 max-w-2xl mt-0">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tên Công ty</label>
                <Input name="company_name" defaultValue={initialData['company_name']} placeholder="Máy Văn Phòng Xanh" className="shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Slogan</label>
                <Input name="company_tagline" defaultValue={initialData['company_tagline']} placeholder="Giải pháp in ấn toàn diện" className="shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mô tả ngắn</label>
                <Textarea name="company_description" defaultValue={initialData['company_description']} rows={4} className="shadow-sm resize-none" />
              </div>
              <MediaPickerInput
                name="company_logo"
                label="Logo"
                value={companyLogo}
                onChange={setCompanyLogo}
                placeholder="Click để chọn logo"
              />
              <MediaPickerInput
                name="company_favicon"
                label="Favicon"
                value={companyFavicon}
                onChange={setCompanyFavicon}
                placeholder="Click để chọn favicon"
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Giờ làm việc</label>
                <Input name="work_time" defaultValue={initialData['work_time']} placeholder="Thứ 2 - Thứ 7: 8h00 - 17h30" className="shadow-sm" />
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 max-w-2xl mt-0">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hotline</label>
                <Input name="contact_phone" defaultValue={initialData['contact_phone']} placeholder="0909..." className="shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email liên hệ</label>
                <Input type="email" name="contact_email" defaultValue={initialData['contact_email']} placeholder="hotro@mvpx.vn" className="shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Địa chỉ trụ sở</label>
                <Textarea name="contact_address" defaultValue={initialData['contact_address']} rows={3} className="shadow-sm resize-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Zalo (Số điện thoại hoặc Link)</label>
                <Input name="contact_zalo" defaultValue={initialData['contact_zalo']} placeholder="0909... hoặc https://zalo.me/..." className="shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Fanpage Facebook URL</label>
                <Input name="social_facebook" defaultValue={initialData['social_facebook']} placeholder="https://facebook.com/..." className="shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Youtube Channel URL</label>
                <Input name="social_youtube" defaultValue={initialData['social_youtube']} placeholder="https://youtube.com/..." className="shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Google Maps URL</label>
                <Input name="contact_maps_url" defaultValue={initialData['contact_maps_url']} placeholder="https://goo.gl/maps/..." className="shadow-sm" />
              </div>
            </TabsContent>

            <TabsContent value="email" className="space-y-5 max-w-2xl mt-0">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-md p-4 text-xs sm:text-sm text-amber-800 dark:text-amber-300">
                <p className="font-semibold mb-1">💡 Hướng dẫn cấu hình Email gửi tự động (SMTP):</p>
                <p>Nên sử dụng dịch vụ Gmail (tạo Mật khẩu ứng dụng - App Password) hoặc các dịch vụ mail máy chủ như SMTP cPanel, SendGrid, Amazon SES.</p>
              </div>

              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 border-b pb-2">1. Thông số Máy chủ SMTP</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">SMTP Host</label>
                  <Input name="smtp_host" defaultValue={initialData['smtp_host'] || 'smtp.gmail.com'} placeholder="smtp.gmail.com" className="shadow-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">SMTP Port</label>
                  <Input name="smtp_port" defaultValue={initialData['smtp_port'] || '587'} placeholder="587" className="shadow-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tên đăng nhập / Email gửi</label>
                  <Input type="email" name="smtp_user" defaultValue={initialData['smtp_user']} placeholder="your-email@gmail.com" className="shadow-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mã hóa (TLS/SSL)</label>
                  <select name="smtp_secure" defaultValue={initialData['smtp_secure'] || 'tls'} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="tls">STARTTLS (Port 587)</option>
                    <option value="ssl">SSL / TLS (Port 465)</option>
                    <option value="none">Không mã hóa</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mật khẩu SMTP / App Password</label>
                <Input type="password" name="smtp_pass" defaultValue={initialData['smtp_pass']} placeholder="••••••••••••••••" className="shadow-sm" />
              </div>

              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 pt-2">2. Địa chỉ Người gửi & Người nhận thông báo</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tên hiển thị người gửi</label>
                  <Input name="smtp_from_name" defaultValue={initialData['smtp_from_name'] || initialData['company_name'] || 'Máy Văn Phòng Xanh'} placeholder="Máy Văn Phòng Xanh" className="shadow-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email người gửi (Tùy chọn)</label>
                  <Input type="email" name="smtp_from_email" defaultValue={initialData['smtp_from_email']} placeholder="Để trống nếu trùng Email đăng nhập" className="shadow-sm" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Admin nhận thông báo (Khi có liên hệ/đăng ký)</label>
                <Input type="email" name="admin_receive_email" defaultValue={initialData['admin_receive_email'] || initialData['contact_email']} placeholder="admin@mayvanphongxanh.com" className="shadow-sm" />
              </div>

              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 pt-2">3. Tùy chọn Bật/Tắt Gửi Email</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gửi mail khi có Liên hệ mới</label>
                  <select name="email_notify_contact" defaultValue={initialData['email_notify_contact'] ?? 'true'} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="true">Bật (Tự động gửi mail)</option>
                    <option value="false">Tắt (Không gửi mail)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gửi mail khi có Đăng ký tài khoản</label>
                  <select name="email_notify_register" defaultValue={initialData['email_notify_register'] ?? 'true'} className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="true">Bật (Tự động gửi mail)</option>
                    <option value="false">Tắt (Không gửi mail)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-primary" />
                  Kiểm tra kết nối gửi email thử nghiệm
                </h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input 
                    type="email" 
                    value={testEmail} 
                    onChange={(e) => setTestEmail(e.target.value)} 
                    placeholder="Nhập email của bạn để nhận mail thử..." 
                    className="flex-1 shadow-sm" 
                  />
                  <Button 
                    type="button" 
                    onClick={handleTestEmail} 
                    disabled={isTestingEmail} 
                    variant="outline" 
                    className="shrink-0 border-primary text-primary hover:bg-primary/10"
                  >
                    {isTestingEmail ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    {isTestingEmail ? 'Đang gửi test...' : 'Gửi email thử'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="space-y-4 max-w-2xl mt-0">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tiêu đề (Title Tag)</label>
                <Input name="seo_title" defaultValue={initialData['seo_title']} placeholder="Trang chủ - Máy Văn Phòng Xanh" className="shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mô tả (Meta Description)</label>
                <Textarea name="seo_description" defaultValue={initialData['seo_description']} rows={4} className="shadow-sm resize-none" />
              </div>
              <MediaPickerInput
                name="seo_image"
                label="Ảnh chia sẻ (Open Graph Image)"
                value={seoImage}
                onChange={setSeoImage}
                placeholder="Click để chọn ảnh"
              />
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mã Google Analytics (Tùy chọn)</label>
                <Input name="seo_google_analytics" defaultValue={initialData['seo_google_analytics']} placeholder="G-XXXXXXXXXX" className="shadow-sm" />
              </div>
            </TabsContent>

            <TabsContent value="payment" className="space-y-4 max-w-2xl mt-0">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4">Tổng đài hỗ trợ</h3>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hotline CSKH & Bảo hành</label>
                <Input name="cskh_phone" defaultValue={initialData['cskh_phone']} placeholder="1900 1234 (Nhánh 1)" className="shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hotline Hỗ trợ Kỹ thuật</label>
                <Input name="technical_phone" defaultValue={initialData['technical_phone']} placeholder="1900 1234 (Nhánh 2)" className="shadow-sm" />
              </div>

              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mt-8 mb-4">Thông tin chuyển khoản</h3>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Số tài khoản</label>
                <Input name="bank_account" defaultValue={initialData['bank_account']} placeholder="1023456789" className="shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Chủ tài khoản</label>
                <Input name="bank_owner" defaultValue={initialData['bank_owner']} placeholder="CÔNG TY TNHH MÁY VĂN PHÒNG XANH" className="shadow-sm uppercase" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ngân hàng & Chi nhánh</label>
                <Input name="bank_name" defaultValue={initialData['bank_name']} placeholder="Vietcombank – Chi nhánh Sở Giao Dịch" className="shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Mã số thuế</label>
                <Input name="tax_code" defaultValue={initialData['tax_code']} placeholder="0101234567" className="shadow-sm" />
              </div>
            </TabsContent>

            <TabsContent value="quote" className="space-y-4 max-w-2xl mt-0">
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 border-b pb-2">1. Địa chỉ trên phiếu báo giá</h3>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Địa chỉ Trụ sở chính (Dòng A)</label>
                <Input name="contact_address" defaultValue={initialData['contact_address'] || '118 Cộng Hòa, Phường 4, Quận Tân Bình, Thành phố Hồ Chí Minh'} className="shadow-sm" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Địa chỉ Chi nhánh (Dòng C - Nếu có)</label>
                <Input name="quote_address_c" defaultValue={initialData['quote_address_c'] || ''} placeholder="Để trống nếu không có chi nhánh" className="shadow-sm" />
              </div>

              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 pt-2">2. Điều khoản thương mại</h3>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nội dung Điều khoản thương mại (Mỗi dòng là 1 điều khoản)</label>
                <Textarea 
                  name="quote_terms" 
                  defaultValue={initialData['quote_terms'] || `• Đơn giá trên đã bao gồm VAT.
• Hình thức thanh toán: Tiền mặt hoặc chuyển khoản sau khi xác nhận đơn hàng.
• Thời gian bảo hành: Theo quy định của nhà sản xuất.
• Quy cách: Hàng mới 100%, nguyên đai, nguyên kiện, Chính hãng.
• Báo giá trên có giá trị 10 ngày, kể từ ngày phát hành báo giá.`} 
                  rows={6} 
                  className="shadow-sm resize-none text-sm font-sans" 
                />
              </div>

              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 pt-2">3. Ghi chú ngân hàng</h3>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dòng ghi chú tài khoản ngân hàng</label>
                <Input name="quote_bank_note" defaultValue={initialData['quote_bank_note'] || '*LƯU Ý: Công ty MPX không chịu bất cứ chi phí phát sinh nào trong quá trình chuyển khoản.'} className="shadow-sm" />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white shadow-sm px-6">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Đang lưu...' : 'Lưu tất cả cấu hình'}
          </Button>
        </div>
      </form>
    </div>
  )
}

