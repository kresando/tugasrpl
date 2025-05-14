import Link from 'next/link'
import React from 'react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background py-10">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold text-primary">Layar18</h3>
            <p className="text-sm text-muted-foreground">
              Platform streaming video dewasa terbaik dan terlengkap di Indonesia.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Tautan</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/tentang"
                  className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link
                  href="/syarat-ketentuan"
                  className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Hubungi Kami</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:support@layar18.com"
                  className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
                >
                  support@layar18.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Layar18. Semua hak dilindungi undang-undang.</p>
          <p className="mt-2">
            Konten di situs ini ditujukan hanya untuk 18+. Semua model berusia minimal 18 tahun.
          </p>
        </div>
      </div>
    </footer>
  )
}
