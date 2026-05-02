import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export const useGetRecipes = () => {
  const data = useQuery(api.recipes.getAll);
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
};
