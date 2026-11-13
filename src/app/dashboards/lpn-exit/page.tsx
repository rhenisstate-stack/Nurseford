import { redirect } from "next/navigation";

export default function LpnExitRedirectPage() {
  redirect("/dashboards/lpn-nursing?track=exit");
}
