import SidebarAdmin from "@/components/SidebarAdmin";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-light-bg">
      {/* Sol tarafta sabit Admin Sidebar */}
      <SidebarAdmin />
      
      {/* Sağ tarafta değişen içerik alanı */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
