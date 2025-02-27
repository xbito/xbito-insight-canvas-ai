import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Chat AI',
  description: 'AI-powered data visualization and chat application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}