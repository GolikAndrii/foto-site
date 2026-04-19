import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAF7F2" }}>
      <AdminHeader />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
