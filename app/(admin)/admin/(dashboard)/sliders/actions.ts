"use server";

import { prisma as db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type SliderFormData = {
  image: string;
  badge?: string;
  title?: string;
  description?: string;
  btnPrimaryLabel?: string;
  btnPrimaryUrl?: string;
  btnSecondaryLabel?: string;
  btnSecondaryUrl?: string;
  order: number;
  isActive: boolean;
};

export type BannerFormData = {
  title: string;
  subTitle?: string;
  icon?: string;
  url?: string;
  image?: string;
  order: number;
  isActive: boolean;
};

// ── Slider Actions ────────────────────────────────────────────────────────────

export async function getSliders() {
  try {
    const data = await db.slider.findMany({
      orderBy: { order: "asc" },
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || "Failed to get sliders" };
  }
}

export async function createSlider(data: SliderFormData) {
  try {
    const slider = await db.slider.create({
      data: {
        image: data.image,
        badge: data.badge,
        title: data.title,
        description: data.description,
        btnPrimaryLabel: data.btnPrimaryLabel,
        btnPrimaryUrl: data.btnPrimaryUrl,
        btnSecondaryLabel: data.btnSecondaryLabel,
        btnSecondaryUrl: data.btnSecondaryUrl,
        order: data.order,
        isActive: data.isActive,
      },
    });
    revalidatePath("/");
    return { data: slider };
  } catch (error: any) {
    return { error: error.message || "Failed to create slider" };
  }
}

export async function updateSlider(id: number, data: SliderFormData) {
  try {
    const slider = await db.slider.update({
      where: { id },
      data: {
        image: data.image,
        badge: data.badge,
        title: data.title,
        description: data.description,
        btnPrimaryLabel: data.btnPrimaryLabel,
        btnPrimaryUrl: data.btnPrimaryUrl,
        btnSecondaryLabel: data.btnSecondaryLabel,
        btnSecondaryUrl: data.btnSecondaryUrl,
        order: data.order,
        isActive: data.isActive,
      },
    });
    revalidatePath("/");
    return { data: slider };
  } catch (error: any) {
    return { error: error.message || "Failed to update slider" };
  }
}

export async function deleteSlider(id: number) {
  try {
    await db.slider.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete slider" };
  }
}

export async function toggleSliderActive(id: number, currentStatus: boolean) {
  try {
    await db.slider.update({
      where: { id },
      data: { isActive: !currentStatus },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle slider status" };
  }
}

// ── Banner Actions ────────────────────────────────────────────────────────────

export async function getBanners() {
  try {
    const data = await db.banner.findMany({
      orderBy: { order: "asc" },
    });
    return { data };
  } catch (error: any) {
    return { error: error.message || "Failed to get banners" };
  }
}

export async function createBanner(data: BannerFormData) {
  try {
    const banner = await db.banner.create({
      data: {
        title: data.title,
        subTitle: data.subTitle,
        icon: data.icon,
        url: data.url,
        image: data.image,
        order: data.order,
        isActive: data.isActive,
      },
    });
    revalidatePath("/");
    return { data: banner };
  } catch (error: any) {
    return { error: error.message || "Failed to create banner" };
  }
}

export async function updateBanner(id: number, data: BannerFormData) {
  try {
    const banner = await db.banner.update({
      where: { id },
      data: {
        title: data.title,
        subTitle: data.subTitle,
        icon: data.icon,
        url: data.url,
        image: data.image,
        order: data.order,
        isActive: data.isActive,
      },
    });
    revalidatePath("/");
    return { data: banner };
  } catch (error: any) {
    return { error: error.message || "Failed to update banner" };
  }
}

export async function deleteBanner(id: number) {
  try {
    await db.banner.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete banner" };
  }
}

export async function toggleBannerActive(id: number, currentStatus: boolean) {
  try {
    await db.banner.update({
      where: { id },
      data: { isActive: !currentStatus },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle banner status" };
  }
}
