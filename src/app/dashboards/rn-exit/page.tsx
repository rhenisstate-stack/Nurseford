import { redirect } from "next/navigation";

export default function RnExitRedirectPage() {
  redirect("/dashboards/rn-nursing?track=exit");
}
