import { Navbar } from '@/shared/components/layout/Navbar'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="p-6">{children}</main>
    </>
  )
}
