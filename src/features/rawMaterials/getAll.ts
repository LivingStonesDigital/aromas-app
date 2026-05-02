import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export const useGetRawMaterials = () => {
  const data = useQuery(api.rawMaterials.getAll);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
};
