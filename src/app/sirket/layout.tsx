import SidebarSirket from "@/components/SidebarSirket";

export default function SirketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      {/* Sol tarafta sabit Şirket Sidebar */}
      <SidebarSirket />

      {/* Sağ tarafta değişen içerik alanı */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
