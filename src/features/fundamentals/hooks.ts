import useSWR from "swr";
import { getFundamentals } from "@/data/repository";
import type { Analysis } from "@/models/fundamentals";

const FUNDAMENTALS_KEY = (ticker: string) => `fundamentals:${ticker.toUpperCase()}`;

async function fetchFundamentals(ticker: string): Promise<Analysis> {
  return getFundamentals(ticker);
}

export function useFundamentals(ticker: string) {
  const shouldFetch = Boolean(ticker);
  const { data, error, isLoading, mutate } = useSWR(shouldFetch ? FUNDAMENTALS_KEY(ticker) : null, () =>
    fetchFundamentals(ticker),
  );

  return {
    data,
    error,
    isLoading,
    refresh: () => mutate(),
  };
}

