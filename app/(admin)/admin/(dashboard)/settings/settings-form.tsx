"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateSettings } from "./actions"
import { toast } from "sonner"
import { Save, Building2, Phone, LineChart } from "lucide-react"
import { MediaPickerInput } from "@/components/admin/media-picker-input"

export function SettingsForm({ initialData }: { initialData: Record<string, string> }) {
  const [isLoading, setIsLoading] = useState(false)
  const [companyLogo, setCompanyLogo] = useState(initialData['company_logo'] || '')
  const [companyFavicon, setCompanyFavicon] = useState(initialData['company_favicon'] || '')
  const [seoImage, setSeoImage] = useState(initialData['seo_image'] || '')

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
              value="seo" 
              className="w-full justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:rounded-l-none"
            >
              <LineChart className="w-4 h-4 mr-3 text-current" /> 
              SEO & Analytics
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
                <Input name="company_working_hours" defaultValue={initialData['company_working_hours']} placeholder="Thứ 2 - Thứ 7: 8h00 - 17h30" className="shadow-sm" />
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
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Google Maps URL</label>
                <Input name="contact_maps_url" defaultValue={initialData['contact_maps_url']} placeholder="https://goo.gl/maps/..." className="shadow-sm" />
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
