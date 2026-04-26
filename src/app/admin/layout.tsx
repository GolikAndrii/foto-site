import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <>
      <style>{`
        .admin-main {
          flex: 1;
          padding: 32px 36px;
          overflow-y: auto;
        }
        @media (max-width: 767px) {
          .admin-main {
            padding: 20px 16px 80px;
          }
        }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
        <Sidebar />
        <main className="admin-main">
          {children}
        </main>
      </div>
    </>
  );
}
