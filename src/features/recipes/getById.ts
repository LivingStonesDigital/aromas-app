import { useQuery } from "convex/react";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

interface Props {
  id: Id<"recipes">;
}

export const useGetRecipeById = ({ id }: Props) => {
  const data = useQuery(api.recipes.getById, id ? { id } : "skip");
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
};
