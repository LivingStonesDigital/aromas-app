import { useQuery } from "convex/react";
import { Id } from "../../convex/_generated/dataModel";
import { api } from "../../convex/_generated/api";


interface Props {
  workspaceId: Id<"examples">;
}

export const useGetWorkspaceById = ({ workspaceId }: Props) => {
  const data = useQuery(api.examples.getById, { workspaceId });
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
};