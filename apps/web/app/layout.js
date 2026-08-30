import './globals.css'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata = {
  title: 'En el agua oscura.',
  description: 'En el agua oscura.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${cormorant.variable} font-sans`}>
        {children}
        <footer className="bg-black text-gray-400 text-xs py-8 px-4 mt-0">
          <div className="max-w-4xl mx-auto space-y-3 text-center">
            <p className="text-gray-300 tracking-widest uppercase text-[0.65rem]">En el Agua Oscura</p>
            <p>© 2026 Gerardo Romeh. Todos los derechos reservados.</p>
            <p className="max-w-xl mx-auto leading-relaxed">
              Prohibida la reproducción parcial o total de esta obra por cualquier medio sin autorización por escrito del autor.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 pt-1">
              <span>ISBN: 978-607-29</span>
              <span>Reg. Derechos de Autor: 03-2026-052512315000-01</span>
            </div>
            <p className="pt-1">
              <a href="mailto:enelaguaoscura@yahoo.com" className="hover:text-gray-200 transition">enelaguaoscura@yahoo.com</a>
            </p>
          </div>
        </footer>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
