import { Color } from "@/types";
import privateClient from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export const colorService = {
  getColors: async (): Promise<Color[]> => {
    const response = await privateClient.get("/colors");
    return response.data;
  },
};

export const useColors = () => {
  return useQuery({
    queryKey: ["colors"],
    queryFn: () => colorService.getColors(),
  });
};
