"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

import {
  DEFAULT_ABOUT_HERO,
  DEFAULT_ABOUT_STATS,
  DEFAULT_ABOUT_PROCESS,
  DEFAULT_ABOUT_BRANDS,
  DEFAULT_ABOUT_VALUES,
  DEFAULT_ABOUT_CTA,
} from "./constants"

// ── Keys ────────────────────────────────────────────────────────────────────

const KEYS = {
  hero: "about_hero",
  stats: "about_stats",
  process: "about_process",
  brands: "about_brands",
  values: "about_values",
  cta: "about_cta",
} as const

// ── Read ────────────────────────────────────────────────────────────────────

export async function getAboutSettings() {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { in: Object.values(KEYS) } },
    })

    const map: Record<string, any> = {}
    for (const s of settings) {
      try {
        map[s.key] = JSON.parse(s.value)
      } catch {
        map[s.key] = s.value
      }
    }

    return {
      hero: map[KEYS.hero] ?? DEFAULT_ABOUT_HERO,
      stats: map[KEYS.stats] ?? DEFAULT_ABOUT_STATS,
      process: map[KEYS.process] ?? DEFAULT_ABOUT_PROCESS,
      brands: map[KEYS.brands] ?? DEFAULT_ABOUT_BRANDS,
      values: map[KEYS.values] ?? DEFAULT_ABOUT_VALUES,
      cta: map[KEYS.cta] ?? DEFAULT_ABOUT_CTA,
    }
  } catch (error) {
    console.error("Error fetching about settings:", error)
    return {
      hero: DEFAULT_ABOUT_HERO,
      stats: DEFAULT_ABOUT_STATS,
      process: DEFAULT_ABOUT_PROCESS,
      brands: DEFAULT_ABOUT_BRANDS,
      values: DEFAULT_ABOUT_VALUES,
      cta: DEFAULT_ABOUT_CTA,
    }
  }
}

// ── Write ───────────────────────────────────────────────────────────────────

async function upsertSetting(key: string, value: any) {
  const json = JSON.stringify(value)
  await prisma.setting.upsert({
    where: { key },
    update: { value: json },
    create: { key, value: json },
  })
}

export async function saveAboutHero(data: typeof DEFAULT_ABOUT_HERO) {
  try {
    await upsertSetting(KEYS.hero, data)
    revalidatePath("/gioi-thieu")
    return { success: true }
  } catch (error) {
    console.error("Error saving about hero:", error)
    return { error: "Không thể lưu nội dung Hero." }
  }
}

export async function saveAboutStats(data: typeof DEFAULT_ABOUT_STATS) {
  try {
    await upsertSetting(KEYS.stats, data)
    revalidatePath("/gioi-thieu")
    return { success: true }
  } catch (error) {
    console.error("Error saving about stats:", error)
    return { error: "Không thể lưu số liệu thống kê." }
  }
}

export async function saveAboutProcess(data: typeof DEFAULT_ABOUT_PROCESS) {
  try {
    await upsertSetting(KEYS.process, data)
    revalidatePath("/gioi-thieu")
    return { success: true }
  } catch (error) {
    console.error("Error saving about process:", error)
    return { error: "Không thể lưu quy trình." }
  }
}

export async function saveAboutBrands(data: string[]) {
  try {
    await upsertSetting(KEYS.brands, data)
    revalidatePath("/gioi-thieu")
    return { success: true }
  } catch (error) {
    console.error("Error saving about brands:", error)
    return { error: "Không thể lưu thương hiệu." }
  }
}

export async function saveAboutValues(data: typeof DEFAULT_ABOUT_VALUES) {
  try {
    await upsertSetting(KEYS.values, data)
    revalidatePath("/gioi-thieu")
    return { success: true }
  } catch (error) {
    console.error("Error saving about values:", error)
    return { error: "Không thể lưu năng lực." }
  }
}

export async function saveAboutCta(data: typeof DEFAULT_ABOUT_CTA) {
  try {
    await upsertSetting(KEYS.cta, data)
    revalidatePath("/gioi-thieu")
    return { success: true }
  } catch (error) {
    console.error("Error saving about CTA:", error)
    return { error: "Không thể lưu CTA." }
  }
}
