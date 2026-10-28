import { redirect } from "next/navigation";

export default function LogoutRedirect() {
  redirect("/auth/logout");
}
