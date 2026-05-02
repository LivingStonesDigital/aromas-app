import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface Props {
  code: string;
}

export const useGetRawMaterialByCode = ({ code }: Props) => {
  const data = useQuery(
    api.rawMaterials.getByCode,
    code ? { code } : "skip"
  );
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
};
