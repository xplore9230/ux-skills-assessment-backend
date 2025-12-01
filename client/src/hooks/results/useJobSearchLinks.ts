/**
 * useJobSearchLinks Hook
 * 
 * Generates job search links based on stage.
 * Pure client-side computation using static configuration.
 * Implements simple caching.
 */

import { useMemo } from "react";
import { getNextRoleData } from "@/lib/results/stage-config";
import type { Stage, NextRoleData } from "@/lib/results/types";

/**
 * Hook result type
 */
interface UseJobSearchLinksResult {
  data: NextRoleData;
}

/**
 * Hook options
 */
interface UseJobSearchLinksOptions {
  stage: Stage;
  location?: string;
}

/**
 * Hook for generating job search links
 * 
 * This is a pure client-side hook that doesn't need async loading.
 * It uses static configuration to generate URLs.
 */
export function useJobSearchLinks(
  options: UseJobSearchLinksOptions
): UseJobSearchLinksResult {
  const { stage, location = "Remote" } = options;
  
  const data = useMemo(() => {
    return getNextRoleData(stage, location);
  }, [stage, location]);
  
  return { data };
}

export default useJobSearchLinks;


