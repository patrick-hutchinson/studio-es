import './globals.scss'

export const metadata = {
  metadataBase: new URL('https://www.studio-es.at'),
  title: 'Studio Es',
  description: 'Studio Es visual communication practice',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
