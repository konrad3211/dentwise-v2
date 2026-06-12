import {
  bookAppointment,
  getAppointments,
  getBookedTimeSlots,
  getUserAppointments,
  updateAppointmentStatus,
} from "@/lib/actions/appointments";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetAppointments = () => {
  const res = useQuery({
    queryKey: ["getAppointments"],
    queryFn: getAppointments,
  });
  return res;
};

export const useBookedTimeSlots = (doctorId: string, date: string) => {
  const res = useQuery({
    queryKey: ["getBookedTimeSlots", doctorId, date],
    queryFn: () => getBookedTimeSlots(doctorId, date),
    //to mówi, że jeżeli lekarz i data będzie wyrbana to wtedy wykonaj to query
    enabled: !!doctorId && !!date,
  });
  return res;
};

export const useUserAppointments = () => {
  const res = useQuery({
    queryKey: ["getUserAppointments"],
    queryFn: getUserAppointments,
  });
  return res;
};

export const useBookAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getUserAppointments"] });
    },
    onError: (error) => {
      console.error("Failed to book appointmentsss", error);
    },
  });
};

export const useUpdateAppointmentStatus = () => {
  //daje dostep do glownego managera cache
  const queryClient = useQueryClient();
  //useMutation to odpowiednik useQuery, ale dla operacji, które zmieniają dane.
  //POST PUT PATCH DELETE
  return useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAppointments"] });
    },
    onError: (error) => {
      console.error("Failed to change appointment status", error);
    },
  });
};
