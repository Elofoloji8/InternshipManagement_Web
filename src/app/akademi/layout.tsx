import SidebarAkademi from "@/components/SidebarAkademi";

export default function AkademiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8F9FF]">
      <SidebarAkademi />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
