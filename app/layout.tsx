import './globals.css'
import type { Metadata } from 'next'
import LayoutContent from './components/LayoutContent'
import { AppContextProvider } from './lib/ContextProvider'

export const metadata: Metadata = {
  title: 'Data Insights Platform',
  description: 'AI-powered data visualization, dashboarding and chat application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <AppContextProvider>
          <LayoutContent>
            {children}
          </LayoutContent>
        </AppContextProvider>
      </body>
    </html>
  )
}