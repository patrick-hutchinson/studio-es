import './globals.scss'

export const metadata = {
  title: 'Studio Es',
  description: 'Studio Es visual communication practice',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
