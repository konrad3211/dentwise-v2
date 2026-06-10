"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../prisma";
import { Gender } from "@prisma/client";
import { generateAvatar } from "../utils";
import { toast } from "sonner";

export const getDoctors = async () => {
  try {
    //     Weź wszystkich Doctor
    // + policz ile każdy ma appointments
    // + posortuj od najnowszego
    const doctors = await prisma.doctor.findMany({
      include: {
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    //czyli przerabiasz wynik na wygodniejszy format:
    return doctors.map((doctor) => ({
      ...doctor,
      appointmentCount: doctor._count.appointments,
    }));
  } catch (error) {
    console.log("Error fetching doctors:", error);
    throw new Error("Failed to fetch doctors");
  }
};

//Finalnie każdy doctor będzie wyglądał mniej więcej tak:

// {
//   id: "doc_123",
//   name: "Jan Kowalski",
//   speciality: "Dentist",
//   appointmentCount: 5
// }

interface CreateDoctorInput {
  name: string;
  email: string;
  phone: string;
  speciality: string;
  gender: Gender;
  isActive: boolean;
}

export const createDoctor = async (input: CreateDoctorInput) => {
  try {
    if (!input.name || !input.email)
      throw new Error("Name and email are required");
    if (input.phone) {
      const existingDoctor = await prisma.doctor.findUnique({
        where: { phone: input.phone },
      });
      if (existingDoctor)
        throw new Error("Doctor with this phone number already exists");
    }

    if (input.email) {
      const existingDoctor = await prisma.doctor.findUnique({
        where: { email: input.email },
      });
      if (existingDoctor)
        throw new Error("Doctor with this email already exists");
    }

    const doctor = prisma.doctor.create({
      data: {
        ...input,
        imageUrl: generateAvatar(input.name, input.gender),
      },
    });
    // to Next.js usuwa swój cache dla strony /admin.
    revalidatePath("/admin");
    return doctor;
  } catch (error: any) {
    if (error.message === "Doctor with this phone number already exists")
      throw new Error("Doctor with this phone number already exists");
    if (error.message === "Doctor with this email already exists")
      throw new Error("Doctor with this email already exists");
  }
};

interface UpdateDoctorInput extends Partial<CreateDoctorInput> {
  id: string;
}

export const updateDoctor = async (input: UpdateDoctorInput) => {
  try {
    if (!input.name || !input.email || !input.speciality)
      throw new Error("All inputs with * are required");
    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: input.id },
      select: { email: true, phone: true },
    });
    if (!currentDoctor) throw new Error("Doctor not found");
    if (input.email !== currentDoctor.email) {
      const exitisngDoctor = await prisma.doctor.findUnique({
        where: { email: input.email },
      });
      if (exitisngDoctor)
        throw new Error("Doctor with this email already exists");
    }
    if (input.phone !== currentDoctor.phone) {
      const exitisngDoctor = await prisma.doctor.findUnique({
        where: { phone: input.phone },
      });
      if (exitisngDoctor) {
        throw new Error("Doctor with this phone number already exists");
      }
    }
    const updatedDoctor = await prisma.doctor.update({
      where: { id: input.id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        speciality: input.speciality,
        gender: input.gender,
        isActive: input.isActive,
      },
    });
    return updatedDoctor;
  } catch (error: any) {
    console.log("Error updating doctor:", error);

    if (error.message === "Doctor with this email already exists") {
      throw error;
    }
    if (error.message === "Doctor with this phone number already exists") {
      throw error;
    }

    if (error.message === "Doctor not found") {
      throw error;
    }
    throw new Error("Failed to update doctor");
  }
};

export const getAvailableDoctors = async () => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
      //sortuje alfabetycznie lekarzy
      orderBy: { name: "asc" },
    });
    return doctors.map((doctor) => ({
      ...doctor,
      appointmentCount: doctor._count.appointments,
    }));
  } catch (error) {
    console.error("Error fetching available doctors", error);
    throw new Error("Error fetching availbale doctors");
  }
};
