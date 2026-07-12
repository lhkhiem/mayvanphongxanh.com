import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const revalidate = 0; // ensure this is not cached

export async function GET(request: Request) {
  const settings = await prisma.setting.findMany();
  const faviconSetting = settings.find(s => s.key === 'site_favicon');
  
  if (faviconSetting?.value) {
    const url = new URL(faviconSetting.value, request.url);
    return NextResponse.redirect(url);
  }
  
  // Fallback
  return NextResponse.redirect(new URL('/favicon.png', request.url));
}
