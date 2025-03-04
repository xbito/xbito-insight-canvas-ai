import './globals.css'
import type { Metadata } from 'next'
import LayoutContent from './components/LayoutContent'
import { AppContextProvider } from './lib/ContextProvider'

export const metadata: Metadata = {
  title: 'Insight Canvas AI',
  description: 'Conversational Analytics for Brand Intelligence',
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