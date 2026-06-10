"use client";

import {
  createDoctor,
  getAvailableDoctors,
  getDoctors,
  updateDoctor,
} from "@/lib/actions/doctors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetDoctors = () => {
  const result = useQuery({
    queryKey: ["getDoctors"], //pod tym kluczem przechowujemy dane w cache w przegladarce
    queryFn: getDoctors, // funkcja pobierajaca dane z serwera dokladnie z doctors.ts
  });
  return result;
};

export const useCreateDoctor = () => {
  //useQueryClient() to hook TanStack Query, który daje Ci dostęp do głównego menedżera cache.
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      //"Hej TanStack, dane zapisane pod getDoctors są już nieaktualne."
      queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
    },
    onError: (error) => {
      console.log("Error while creating a doctor");
      toast.error(error.message);
    },
  });
  return res;
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
  const res = useMutation({
    mutationFn: updateDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getDoctors"] });
    },
    onError: (error) => {
      toast.error(error.message);
      console.log("Error while updating a doctor");
    },
  });
  return res;
};

export const useGetAvailableDoctors = () => {
  const res = useQuery({
    queryKey: ["getAvailableDoctors"],
    queryFn: getAvailableDoctors,
  });
  return res;
};
