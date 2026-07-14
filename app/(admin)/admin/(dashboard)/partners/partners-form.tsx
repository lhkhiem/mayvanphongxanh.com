"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Settings2, Building2, ShieldCheck, ListChecks, Plus, Trash2, Edit } from "lucide-react";
import { updateSettings } from "../settings/actions";
import { createCertificate, updateCertificate, deleteCertificate, createBenefit, updateBenefit, deleteBenefit, toggleBrandPartner } from "./actions";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MediaPickerInput } from "@/components/admin/media-picker-input";

export function PartnersForm({ 
  initialSettings, 
  certificates, 
  benefits,
  brands 
}: { 
  initialSettings: Record<string, string>;
  certificates: any[];
  benefits: any[];
  brands: any[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(initialSettings['partner_stats'] ? JSON.parse(initialSettings['partner_stats']) : [
    { title: "20+", subtitle: "Thương hiệu", desc: "Hợp tác chiến lược" },
    { title: "100%", subtitle: "Chính hãng", desc: "Đầy đủ CO/CQ" },
    { title: "VAT", subtitle: "Hóa đơn", desc: "Hỗ trợ doanh nghiệp" },
    { title: "63", subtitle: "Tỉnh thành", desc: "Giao hàng toàn quốc" }
  ]);

  // Certificate Modal State
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [editCert, setEditCert] = useState<any>(null);
  const [certImage, setCertImage] = useState<string>('');

  // Benefit Modal State
  const [isBenefitOpen, setIsBenefitOpen] = useState(false);
  const [editBenefit, setEditBenefit] = useState<any>(null);

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.append('partner_stats', JSON.stringify(stats));
    const res = await updateSettings(formData);
    
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Đã lưu các thay đổi cài đặt!");
    }
    setIsLoading(false);
  };

  const handleToggleBrandPartner = async (brandId: number, checked: boolean) => {
    const res = await toggleBrandPartner(brandId, checked);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Đã cập nhật trạng thái thương hiệu!");
    }
  };

  const handleSaveCert = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      brandId: Number(formData.get('brandId')),
      badge: formData.get('badge') as string,
      scope: formData.get('scope') as string,
      region: formData.get('region') as string,
      validDate: formData.get('validDate') as string,
      image: formData.get('image') as string,
    };

    if (editCert) {
      const res = await updateCertificate(editCert.id, data);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Đã cập nhật chứng nhận!");
        setIsCertOpen(false);
      }
    } else {
      const res = await createCertificate(data);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Đã thêm chứng nhận!");
        setIsCertOpen(false);
      }
    }
    setIsLoading(false);
  };

  const handleDeleteCert = async (id: number) => {
    if (confirm('Xóa chứng nhận này?')) {
      const res = await deleteCertificate(id);
      if (res.error) toast.error(res.error);
      else toast.success("Đã xóa!");
    }
  };

  const handleSaveBenefit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      icon: formData.get('icon') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
    };

    if (editBenefit) {
      const res = await updateBenefit(editBenefit.id, data);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Đã cập nhật quyền lợi!");
        setIsBenefitOpen(false);
      }
    } else {
      const res = await createBenefit(data);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Đã thêm quyền lợi!");
        setIsBenefitOpen(false);
      }
    }
    setIsLoading(false);
  };

  const handleDeleteBenefit = async (id: number) => {
    if (confirm('Xóa quyền lợi này?')) {
      const res = await deleteBenefit(id);
      if (res.error) toast.error(res.error);
      else toast.success("Đã xóa!");
    }
  };

  return (
    <div className="bg-white dark:bg-[#2a303d] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <Tabs defaultValue="certificates" orientation="vertical" className="flex flex-col md:flex-row w-full gap-4 md:gap-6 p-4 sm:p-5">
        
        <TabsList variant="line" className="w-full md:w-64 h-fit shrink-0 flex flex-col gap-1 p-0 bg-transparent">
          <TabsTrigger 
            value="general" 
            className="w-full justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:rounded-l-none"
          >
            <Settings2 className="w-4 h-4 mr-3 text-current" /> 
            Cấu hình chung
          </TabsTrigger>
          <TabsTrigger 
            value="brands" 
            className="w-full justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:rounded-l-none"
          >
            <Building2 className="w-4 h-4 mr-3 text-current" /> 
            Thương hiệu phân phối
          </TabsTrigger>
          <TabsTrigger 
            value="certificates" 
            className="w-full justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:rounded-l-none"
          >
            <ShieldCheck className="w-4 h-4 mr-3 text-current" /> 
            Chứng nhận ủy quyền
          </TabsTrigger>
          <TabsTrigger 
            value="benefits" 
            className="w-full justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-l-4 data-[state=active]:border-primary data-[state=active]:rounded-l-none"
          >
            <ListChecks className="w-4 h-4 mr-3 text-current" /> 
            Quyền lợi mua hàng
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 min-w-0">
          <TabsContent value="general" className="space-y-6 mt-0">
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Hero Section</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Tiêu đề chính</label>
                    <Input name="partner_hero_title" defaultValue={initialSettings['partner_hero_title']} placeholder="Hệ sinh thái thương hiệu đẳng cấp quốc tế" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Mô tả phụ</label>
                    <Textarea name="partner_hero_subtitle" defaultValue={initialSettings['partner_hero_subtitle']} placeholder="Máy Văn Phòng Xanh tự hào là đối tác chiến lược..." rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Nút 1 (Text)</label>
                      <Input name="partner_hero_btn1_text" defaultValue={initialSettings['partner_hero_btn1_text']} placeholder="Trở thành đối tác" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold">Nút 1 (Link)</label>
                      <Input name="partner_hero_btn1_url" defaultValue={initialSettings['partner_hero_btn1_url']} placeholder="#contact" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Các chỉ số nổi bật (Stats)</h3>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat: any, index: number) => (
                    <div key={index} className="p-3 border rounded-md space-y-2 bg-gray-50 dark:bg-gray-800">
                      <Input 
                        value={stat.title} 
                        onChange={(e) => {
                          const newStats = [...stats];
                          newStats[index].title = e.target.value;
                          setStats(newStats);
                        }} 
                        placeholder="Số lớn (vd: 20+)" 
                        className="font-bold text-lg"
                      />
                      <Input 
                        value={stat.subtitle} 
                        onChange={(e) => {
                          const newStats = [...stats];
                          newStats[index].subtitle = e.target.value;
                          setStats(newStats);
                        }} 
                        placeholder="Dòng 1 (vd: Thương hiệu)" 
                      />
                      <Input 
                        value={stat.desc} 
                        onChange={(e) => {
                          const newStats = [...stats];
                          newStats[index].desc = e.target.value;
                          setStats(newStats);
                        }} 
                        placeholder="Dòng 2 (vd: Hợp tác chiến lược)" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Call to Action (Dưới cùng)</h3>
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Tiêu đề CTA</label>
                    <Input name="partner_cta_title" defaultValue={initialSettings['partner_cta_title']} placeholder="Bạn cần tư vấn thiết bị cho dự án?" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Mô tả CTA</label>
                    <Input name="partner_cta_subtitle" defaultValue={initialSettings['partner_cta_subtitle']} placeholder="Đội ngũ chuyên gia của chúng tôi sẵn sàng..." />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
                  <Save className="mr-2 h-4 w-4" /> Lưu cấu hình
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="brands" className="space-y-6 mt-0">
            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Thương hiệu phân phối</h3>
            <p className="text-sm text-gray-500 mb-4">Bật công tắc để đánh dấu thương hiệu này là đối tác phân phối (sẽ hiển thị ở dải logo chạy ngang).</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {brands.map(brand => (
                <div key={brand.id} className="flex items-center justify-between p-3 border rounded-md">
                  <span className="font-medium">{brand.name}</span>
                  <Switch 
                    checked={brand.isPartner} 
                    onCheckedChange={(checked) => handleToggleBrandPartner(brand.id, checked)}
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-6 mt-0">
             <div className="flex justify-between items-center border-b pb-2 mb-4">
               <h3 className="text-lg font-semibold">Giấy chứng nhận ủy quyền</h3>
               <Button onClick={() => { setEditCert(null); setCertImage(''); setIsCertOpen(true); }} size="sm">
                 <Plus className="w-4 h-4 mr-2" /> Thêm chứng nhận
               </Button>
             </div>
             
             <div className="grid gap-4">
               {certificates.map(cert => (
                 <div key={cert.id} className="p-4 border rounded-lg flex justify-between items-start hover:shadow-sm transition-shadow">
                   <div>
                     <div className="flex items-center gap-2 mb-2">
                       <h4 className="font-bold text-lg">{cert.brand?.name}</h4>
                       <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">{cert.badge}</span>
                     </div>
                     <p className="text-sm text-gray-600 mb-1"><strong>Phạm vi:</strong> {cert.scope}</p>
                     <p className="text-sm text-gray-600 mb-1"><strong>Khu vực:</strong> {cert.region}</p>
                     <p className="text-sm text-gray-600"><strong>Hiệu lực:</strong> {cert.validDate}</p>
                   </div>
                   <div className="flex gap-2">
                     <Button variant="outline" size="sm" onClick={() => { setEditCert(cert); setCertImage(cert.image || ''); setIsCertOpen(true); }}>
                       <Edit className="w-4 h-4" />
                     </Button>
                     <Button variant="destructive" size="sm" onClick={() => handleDeleteCert(cert.id)}>
                       <Trash2 className="w-4 h-4" />
                     </Button>
                   </div>
                 </div>
               ))}
               {certificates.length === 0 && <p className="text-center text-gray-500 py-8">Chưa có chứng nhận nào.</p>}
             </div>
          </TabsContent>

          <TabsContent value="benefits" className="space-y-6 mt-0">
             <div className="flex justify-between items-center border-b pb-2 mb-4">
               <h3 className="text-lg font-semibold">Quyền lợi mua hàng</h3>
               <Button onClick={() => { setEditBenefit(null); setIsBenefitOpen(true); }} size="sm">
                 <Plus className="w-4 h-4 mr-2" /> Thêm quyền lợi
               </Button>
             </div>

             <div className="grid gap-4 md:grid-cols-2">
               {benefits.map(benefit => (
                 <div key={benefit.id} className="p-4 border rounded-lg flex flex-col justify-between hover:shadow-sm transition-shadow">
                   <div>
                     <div className="flex items-center justify-between mb-2">
                       <h4 className="font-bold text-lg">{benefit.title}</h4>
                       <span className="text-xs px-2 py-1 bg-gray-100 rounded-md font-mono">{benefit.icon}</span>
                     </div>
                     <p className="text-sm text-gray-600 mb-4 leading-relaxed">{benefit.description}</p>
                   </div>
                   <div className="flex gap-2 mt-2 pt-2 border-t">
                     <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditBenefit(benefit); setIsBenefitOpen(true); }}>
                       <Edit className="w-4 h-4 mr-2" /> Sửa
                     </Button>
                     <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDeleteBenefit(benefit.id)}>
                       <Trash2 className="w-4 h-4 mr-2" /> Xóa
                     </Button>
                   </div>
                 </div>
               ))}
               {benefits.length === 0 && <p className="col-span-2 text-center text-gray-500 py-8">Chưa có quyền lợi nào.</p>}
             </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* CERTIFICATE DIALOG */}
      <Dialog open={isCertOpen} onOpenChange={setIsCertOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editCert ? 'Sửa chứng nhận' : 'Thêm chứng nhận mới'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCert} className="space-y-4 mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Thương hiệu</label>
              <select name="brandId" defaultValue={editCert?.brandId || ""} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" required>
                <option value="" disabled>Chọn thương hiệu...</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Huy hiệu (VD: Đối tác Vàng)</label>
              <Input name="badge" defaultValue={editCert?.badge} required placeholder="Đối tác Chiến lược" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Phạm vi (Sản phẩm/Dịch vụ)</label>
              <Input name="scope" defaultValue={editCert?.scope} required placeholder="Máy in laser & Nhãn dán" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Khu vực</label>
                <Input name="region" defaultValue={editCert?.region} required placeholder="Việt Nam" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Hiệu lực</label>
                <Input name="validDate" defaultValue={editCert?.validDate} required placeholder="01/05/2024 - 01/05/2025" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <input type="hidden" name="image" value={certImage} />
              <MediaPickerInput
                label="Ảnh chứng nhận (tùy chọn)"
                value={certImage}
                onChange={(url) => setCertImage(url)}
              />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCertOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isLoading}>{editCert ? 'Lưu thay đổi' : 'Thêm chứng nhận'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* BENEFIT DIALOG */}
      <Dialog open={isBenefitOpen} onOpenChange={setIsBenefitOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editBenefit ? 'Sửa quyền lợi' : 'Thêm quyền lợi mới'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveBenefit} className="space-y-4 mt-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Tên Icon (Lucide React)</label>
              <select name="icon" defaultValue={editBenefit?.icon || "CheckCircle"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="CheckCircle">CheckCircle (Tích xanh)</option>
                <option value="ShieldCheck">ShieldCheck (Bảo vệ)</option>
                <option value="Users">Users (Người dùng)</option>
                <option value="MapPin">MapPin (Bản đồ)</option>
                <option value="Zap">Zap (Tia chớp)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Tiêu đề quyền lợi</label>
              <Input name="title" defaultValue={editBenefit?.title} required placeholder="Hàng chính hãng 100%" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Mô tả chi tiết</label>
              <Textarea name="description" defaultValue={editBenefit?.description} required placeholder="Cam kết bồi thường..." rows={4} />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsBenefitOpen(false)}>Hủy</Button>
              <Button type="submit" disabled={isLoading}>{editBenefit ? 'Lưu thay đổi' : 'Thêm quyền lợi'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
