import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top_right,rgba(201,100,66,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(94,138,79,0.12),transparent_28%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(232,138,95,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(127,182,104,0.12),transparent_28%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-40 [background-image:linear-gradient(to_right,var(--hairline)_1px,transparent_1px),linear-gradient(to_bottom,var(--hairline)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(circle_at_center,black,transparent_88%)]" />
      <SidebarNav />
      <div className="relative ml-[240px] min-h-screen">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background via-background/88 to-transparent" />
        <div className="relative min-h-screen">{children}</div>
      </div>
    </div>
  );
}
