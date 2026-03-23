import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

function queryErrorHandler(error: unknown): void {
  // const id = "react-query-error";
  const title =
    error instanceof Error ? error.message : "error connecting to server";

  toast.error(title);
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: queryErrorHandler,
  }),
  defaultOptions: {
    queries: {
      staleTime: 60000,
      gcTime: 9000,
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  },
});
