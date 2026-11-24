import DashboardsAccessGate from "@/components/common/dashboards/modals/DashboardsAccessGate";

export default function DashboardsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardsAccessGate />
      {children}
    </>
  );
}
