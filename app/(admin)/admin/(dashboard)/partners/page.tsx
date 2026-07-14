import { prisma } from "@/lib/db";
import { PartnersForm } from "./partners-form";

export default async function PartnersPage() {
  const settingsData = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          'partner_hero_title',
          'partner_hero_subtitle',
          'partner_hero_btn1_text',
          'partner_hero_btn1_url',
          'partner_hero_btn2_text',
          'partner_hero_btn2_url',
          'partner_cta_title',
          'partner_cta_subtitle',
          'partner_stats'
        ]
      }
    }
  });
  
  const settingsMap: Record<string, string> = {};
  settingsData.forEach(s => {
    settingsMap[s.key] = s.value;
  });

  const certificates = await prisma.partnerCertificate.findMany({
    include: { brand: true },
    orderBy: { order: 'asc' }
  });

  const benefits = await prisma.partnerBenefit.findMany({
    orderBy: { order: 'asc' }
  });

  const allBrands = await prisma.brand.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Quản lý Đối tác</h1>
        </div>
      </div>
      
      <div className="mt-2">
        <PartnersForm 
          initialSettings={settingsMap} 
          certificates={certificates} 
          benefits={benefits} 
          brands={allBrands} 
        />
      </div>
    </div>
  );
}
