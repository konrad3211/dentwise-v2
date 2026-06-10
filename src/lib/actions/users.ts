"use server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

export async function syncUser() {
  try {
    const user = await currentUser();
    if (!user) return;
    //findunique sluzy do szukania wartosci ktore maja @id lub @unique
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });
    if (existingUser) return existingUser;
    const dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0].emailAddress,
        phone: user.phoneNumbers[0]?.phoneNumber,
      },
    });
    return dbUser;
  } catch (error) {
    console.log("Error in syncUser server action", error);
  }
}

//gdyby nie byłoby return tego usera z dbs to nie mogłbym poźniej w innych plikach uzyć tych danych, musi byc return
