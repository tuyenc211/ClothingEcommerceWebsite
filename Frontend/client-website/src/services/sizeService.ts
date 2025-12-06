import { Size } from "@/types";
import privateClient from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
export const sizeService = {
  getSizes: async (): Promise<Size[]> => {
    const response = await privateClient.get("/sizes");
    return response.data;
  },
};

export const useSizes = () => {
  return useQuery({
    queryKey: ["sizes"],
    queryFn: () => sizeService.getSizes(),
  });
};
