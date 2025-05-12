/**
 * Mengubah string menjadi format slug (URL-friendly)
 * @param str String yang akan diubah menjadi slug
 * @returns String dalam format slug
 */
export const slugify = (str: string): string => {
  if (!str) return ''

  return str
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, '') // Menghapus diacritics (tanda aksen)
    .replace(/[^\w\s-]/g, '') // Menghapus karakter khusus kecuali spasi, tanda hubung, underscore
    .replace(/[\s_-]+/g, '-') // Mengganti spasi, underscore, dan tanda hubung berurutan dengan satu tanda hubung
    .replace(/^-+|-+$/g, '') // Menghapus tanda hubung di awal dan akhir
}
