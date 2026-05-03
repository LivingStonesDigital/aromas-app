import { useMutation } from "convex/react";
import { useCallback, useMemo, useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
// Note: frontend normalization/logic moved to backend; no price recomputation on frontend

export interface RecipeMaterialInput {
  materialCode: string;
  name: string;
  unitCost: number;
  qtyUsed: number;
  unit: string;
  itemCost: number;
}

type RequestType = {
  id: Id<"recipes">;
  name: string;
  finalQty: number;
  finalUnit: string;
  materials: RecipeMaterialInput[];
  totalCost: number;
  profitMargin: number;
  suggestedPrice: number;
  preserveSuggestedPrice?: boolean;
};

type ResponseType = string | null;

type Options = {
  onSuccess?: (data: ResponseType) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
  throwError?: boolean;
};

export const useUpdateRecipe = () => {
  const [data, setData] = useState<ResponseType>(null);
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<
    "success" | "error" | "pending" | "settled" | null
  >(null);

  const isPending = useMemo(() => status === "pending", [status]);
  const isSuccess = useMemo(() => status === "success", [status]);
  const isError = useMemo(() => status === "error", [status]);
  const isSettled = useMemo(() => status === "settled", [status]);

  const mutation = useMutation(api.recipes.update);

  const mutate = useCallback(
    async (values: RequestType, options?: Options) => {
      try {
        setData(null);
        setError(null);
        setStatus("pending");

        // Valida inputs antes de enviar
        if (values.totalCost < 0) throw new Error("totalCost não pode ser negativo");
        if (values.profitMargin < 0) throw new Error("profitMargin não pode ser negativo");

        // Envia com preserveSuggestedPrice conforme o usuário tenha informado
        const payload: RequestType = {
          ...values,
          preserveSuggestedPrice: values.preserveSuggestedPrice ?? false,
        } as any;
        const response = await (mutation as any)(payload);
        setStatus("success");
        options?.onSuccess?.(response);
        return response;
      } catch (error) {
        setStatus("error");
        setError(error as Error);
        options?.onError?.(error as Error);
        if (options?.throwError) {
          throw error;
        }
      } finally {
        setStatus("settled");
        options?.onSettled?.();
      }
    },
    [mutation]
  );

  return { mutate, data, error, isPending, isSuccess, isError, isSettled };
};
