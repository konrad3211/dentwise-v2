import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

const AdminPage = async () => {
  const user = await currentUser();
  //nie jestes zalogowany to na homepage
  if (!user) redirect("/");
  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = user.emailAddresses[0].emailAddress;
  //jestes zalogowany ale nie admin to na dasza
  if (!adminEmail || userEmail !== adminEmail) redirect("/dashboard");

  return <AdminDashboardClient />;
};

export default AdminPage;
