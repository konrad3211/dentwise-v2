import { getAppointments } from "@/lib/actions/appointments";
import { useQuery } from "@tanstack/react-query";

export const useGetAppointments = () => {
  const res = useQuery({
    queryKey: ["getAppointments"],
    queryFn: getAppointments,
  });
  return res;
};
