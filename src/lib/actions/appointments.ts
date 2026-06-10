import { Appointment } from "./../../../node_modules/.prisma/client/index.d";
("use server");

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

const transformAppointment = (appointment: any) => {
  return {
    ...appointment,
    patientName:
      `${appointment.user.firstName || ""} ${appointment.user.lastName || ""}`.trim(),
    patientEmail: appointment.user.email,
    doctorName: appointment.doctor.name,
    doctorImageUrl: appointment.doctor.imageUrl || "",
    date: appointment.data.toISOString().split("T")[0],
  };
};

export const getAppointments = async () => {
  try {
    //tutaj jest fajny bajer bo juz nie musze importowac modelu appointment bo juz prisma zna wszystkie
    const appointments = await prisma.appointment.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return appointments;
  } catch (error) {
    console.log("Error fetching appointments:", error);
    //ten blad zostanie wylapany w hook use-appointments dzieki tanstack
    throw new Error("Failed to fetch appointments");
  }
};

export async function getUserAppointmentStats() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be authenticated");
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) throw new Error("User not found");

    const [totalCount, completedCount] = await Promise.all([
      prisma.appointment.count({
        where: { userId: user.id },
      }),
      prisma.appointment.count({
        where: {
          userId: user.id,
          status: "COMPLETED",
        },
      }),
    ]);
    return {
      totalAppointments: totalCount,
      completedAppointments: completedCount,
    };
  } catch (error) {
    console.error("Error fetching user appointment stats:", error);
    return { totalAppointments: 0, completedAppointments: 0 };
  }
}

//

export async function getUserAppointments() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be authenticated");
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) throw new Error("User not found");
    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        doctor: { select: { name: true, imageUrl: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
    return appointments.map(transformAppointment);
  } catch (error) {
    console.error("Error fetching user appointments");
    throw new Error("Failed to fetch user appointments");
  }
}

export const getBookedTimeSlots = async (doctorId: string, date: string) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        //doctorId: doctorId
        doctorId,
        date: new Date(date),
        //jezeli bedziemy chcieli dodac canceled to bedzie to mialo wtedy sens, na razie mamy tylko te dwa takze to nie ma wiekszego wplywu
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
      select: { time: true },
    });
    return appointments.map((appointment) => appointment.time);
  } catch (error) {
    console.log("Error fetching booked time slots", error);
    return [];
  }
};
