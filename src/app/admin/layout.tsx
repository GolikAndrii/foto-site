import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-[#0C0C0C]">
      <AdminHeader />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
