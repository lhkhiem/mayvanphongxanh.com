import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(str: string): string {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .normalize('NFD') // normalize to split characters and their accents
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[đĐ]/g, 'd') // replace đ
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w-]+/g, '') // remove all non-word chars
    .replace(/--+/g, '-') // replace multiple - with single -
    .replace(/^-+/, '') // trim - from start
    .replace(/-+$/, ''); // trim - from end
}

/** Tạo slug thân thiện cho sản phẩm/dự án: {slugify(name)}-{id} */
export function productSlug(name: string, id: number): string {
  return `${slugify(name)}-${id}`;
}

/** Lấy id từ slug dạng {slugify(name)}-{id} */
export function idFromSlug(slug: string): number {
  const parts = slug.split('-');
  return parseInt(parts[parts.length - 1], 10);
}
