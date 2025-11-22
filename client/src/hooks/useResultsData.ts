import { useReducer, useEffect } from "react";
import type { CategoryScore, Resource, DeepDiveTopic, JobLinks, LayoutStrategy, CategoryInsight } from "@/types";
import type { PrecomputedResults } from "./useBackgroundComputation";

interface ResultsDataState {
  stageReadup: string;
  resources: Resource[];
  deepDiveTopics: DeepDiveTopic[];
  jobLinks: JobLinks | null;
  layoutStrategy: LayoutStrategy | null;
  categoryInsights: CategoryInsight[];
  isLoadingResources: boolean;
  isLoadingDeepDive: boolean;
  isLoadingJobs: boolean;
  isLoadingLayout: boolean;
  isLoadingInsights: boolean;
  resourcesError: string | null;
  deepDiveError: string | null;
  jobsError: string | null;
  layoutError: string | null;
  insightsError: string | null;
}

type ResultsDataAction =
  | { type: "SET_RESOURCES"; payload: { readup: string; resources: Resource[] } }
  | { type: "SET_DEEP_DIVE"; payload: DeepDiveTopic[] }
  | { type: "SET_JOBS"; payload: JobLinks }
  | { type: "SET_LAYOUT"; payload: LayoutStrategy }
  | { type: "SET_INSIGHTS"; payload: CategoryInsight[] }
  | { type: "SET_RESOURCES_ERROR"; payload: string }
  | { type: "SET_DEEP_DIVE_ERROR"; payload: string }
  | { type: "SET_JOBS_ERROR"; payload: string }
  | { type: "SET_LAYOUT_ERROR"; payload: string }
  | { type: "SET_INSIGHTS_ERROR"; payload: string }
  | { type: "SET_LOADING_RESOURCES"; payload: boolean }
  | { type: "SET_LOADING_DEEP_DIVE"; payload: boolean }
  | { type: "SET_LOADING_JOBS"; payload: boolean }
  | { type: "SET_LOADING_LAYOUT"; payload: boolean }
  | { type: "SET_LOADING_INSIGHTS"; payload: boolean };

const initialState: ResultsDataState = {
  stageReadup: "",
  resources: [],
  deepDiveTopics: [],
  jobLinks: null,
  layoutStrategy: null,
  categoryInsights: [],
  isLoadingResources: true,
  isLoadingDeepDive: true,
  isLoadingJobs: true,
  isLoadingLayout: true,
  isLoadingInsights: true,
  resourcesError: null,
  deepDiveError: null,
  jobsError: null,
  layoutError: null,
  insightsError: null,
};

function resultsDataReducer(
  state: ResultsDataState,
  action: ResultsDataAction
): ResultsDataState {
  switch (action.type) {
    case "SET_RESOURCES":
      return {
        ...state,
        stageReadup: action.payload.readup,
        resources: action.payload.resources,
        isLoadingResources: false,
        resourcesError: null,
      };
    case "SET_DEEP_DIVE":
      return {
        ...state,
        deepDiveTopics: action.payload,
        isLoadingDeepDive: false,
        deepDiveError: null,
      };
    case "SET_JOBS":
      return {
        ...state,
        jobLinks: action.payload,
        isLoadingJobs: false,
        jobsError: null,
      };
    case "SET_LAYOUT":
      return {
        ...state,
        layoutStrategy: action.payload,
        isLoadingLayout: false,
        layoutError: null,
      };
    case "SET_INSIGHTS":
      return {
        ...state,
        categoryInsights: action.payload,
        isLoadingInsights: false,
        insightsError: null,
      };
    case "SET_RESOURCES_ERROR":
      return {
        ...state,
        resourcesError: action.payload,
        isLoadingResources: false,
      };
    case "SET_DEEP_DIVE_ERROR":
      return {
        ...state,
        deepDiveError: action.payload,
        isLoadingDeepDive: false,
      };
    case "SET_JOBS_ERROR":
      return {
        ...state,
        jobsError: action.payload,
        isLoadingJobs: false,
      };
    case "SET_LAYOUT_ERROR":
      return {
        ...state,
        layoutError: action.payload,
        isLoadingLayout: false,
      };
    case "SET_INSIGHTS_ERROR":
      return {
        ...state,
        insightsError: action.payload,
        isLoadingInsights: false,
      };
    case "SET_LOADING_RESOURCES":
      return {
        ...state,
        isLoadingResources: action.payload,
      };
    case "SET_LOADING_DEEP_DIVE":
      return {
        ...state,
        isLoadingDeepDive: action.payload,
      };
    case "SET_LOADING_JOBS":
      return {
        ...state,
        isLoadingJobs: action.payload,
      };
    case "SET_LOADING_LAYOUT":
      return {
        ...state,
        isLoadingLayout: action.payload,
      };
    case "SET_LOADING_INSIGHTS":
      return {
        ...state,
        isLoadingInsights: action.payload,
      };
    default:
      return state;
  }
}

/**
 * Custom hook to manage results page data fetching and state
 * Consolidates multiple API calls and state updates for better performance
 * Accepts optional cached results from background precomputation
 */
export function useResultsData(
  stage: string,
  categories: CategoryScore[],
  totalScore: number = 0,
  maxScore: number = 100,
  cachedResults?: PrecomputedResults | null
): ResultsDataState {
  const [state, dispatch] = useReducer(resultsDataReducer, initialState);

  // Use cached results immediately if available
  useEffect(() => {
    if (cachedResults) {
      console.log("✅ Using cached precomputed results in useResultsData");
      
      // Populate state with cached data
      if (cachedResults.stageReadup || cachedResults.resources) {
        dispatch({
          type: "SET_RESOURCES",
          payload: {
            readup: cachedResults.stageReadup || "",
            resources: cachedResults.resources || [],
          },
        });
      }
      
      if (cachedResults.deepDiveTopics) {
        dispatch({
          type: "SET_DEEP_DIVE",
          payload: cachedResults.deepDiveTopics,
        });
      }
      
      if (cachedResults.jobLinks) {
        dispatch({
          type: "SET_JOBS",
          payload: cachedResults.jobLinks,
        });
      }
      
      if (cachedResults.layoutStrategy) {
        dispatch({
          type: "SET_LAYOUT",
          payload: cachedResults.layoutStrategy,
        });
      }
      
      if (cachedResults.categoryInsights) {
        dispatch({
          type: "SET_INSIGHTS",
          payload: cachedResults.categoryInsights,
        });
      }
    }
  }, [cachedResults]);

  useEffect(() => {
    let resourcesAborted = false;
    let deepDiveAborted = false;
    let jobsAborted = false;
    let layoutAborted = false;
    let insightsAborted = false;
    
    // Use environment variable for Python API URL, fallback to localhost for dev
    const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL || "http://localhost:8000";

    const generateResources = async () => {
      // Skip if we already have cached resources
      if (cachedResults && (cachedResults.stageReadup || cachedResults.resources)) {
        console.log("⏭️  Skipping resources API call (using cache)");
        return;
      }
      
      try {
        dispatch({ type: "SET_LOADING_RESOURCES", payload: true });
        
        const response = await fetch(`${PYTHON_API_URL}/api/generate-resources`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage, categories }),
        });

        if (resourcesAborted) return;

        if (response.ok) {
          const data = await response.json();
          // Ensure we have valid data before dispatching
          if (data && typeof data === 'object') {
            dispatch({
              type: "SET_RESOURCES",
              payload: {
                readup: data.readup || "",
                resources: Array.isArray(data.resources) ? data.resources : [],
              },
            });
          } else {
            dispatch({
              type: "SET_RESOURCES_ERROR",
              payload: "Invalid response format",
            });
          }
        } else {
          dispatch({
            type: "SET_RESOURCES_ERROR",
            payload: "Failed to load resources",
          });
        }
      } catch (error) {
        if (!resourcesAborted) {
          console.error("Failed to generate resources:", error);
          dispatch({
            type: "SET_RESOURCES_ERROR",
            payload: "Failed to load resources",
          });
        }
      }
    };

    const generateDeepDive = async () => {
      // Deep Dive should always use fresh AI generation, never pre-generated
      try {
        dispatch({ type: "SET_LOADING_DEEP_DIVE", payload: true });
        
        const response = await fetch(`${PYTHON_API_URL}/api/generate-deep-dive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            stage, 
            categories,
            force_ai: true // Flag to bypass pre-generated data
          }),
        });

        if (deepDiveAborted) return;

        if (response.ok) {
          const data = await response.json();
          // Ensure we have valid data before dispatching
          if (data && typeof data === 'object' && Array.isArray(data.topics)) {
            dispatch({
              type: "SET_DEEP_DIVE",
              payload: data.topics,
            });
          } else {
            dispatch({
              type: "SET_DEEP_DIVE_ERROR",
              payload: "Invalid response format",
            });
          }
        } else {
          dispatch({
            type: "SET_DEEP_DIVE_ERROR",
            payload: "Failed to load deep dive topics",
          });
        }
      } catch (error) {
        if (!deepDiveAborted) {
          console.error("Failed to generate deep dive:", error);
          dispatch({
            type: "SET_DEEP_DIVE_ERROR",
            payload: "Failed to load deep dive topics",
          });
        }
      }
    };

    const fetchJobs = async () => {
      // Skip if we already have cached job links
      if (cachedResults && cachedResults.jobLinks) {
        console.log("⏭️  Skipping job links API call (using cache)");
        return;
      }
      
      try {
        dispatch({ type: "SET_LOADING_JOBS", payload: true });
        
        const response = await fetch(`${PYTHON_API_URL}/api/job-search-links?stage=${encodeURIComponent(stage)}&location=Remote`);

        if (jobsAborted) return;

        if (response.ok) {
          const data = await response.json();
          // Ensure we have valid job links data
          if (data && data.job_title && data.linkedin_url && data.google_url) {
            dispatch({
              type: "SET_JOBS",
              payload: data
            });
          } else {
            dispatch({
              type: "SET_JOBS_ERROR",
              payload: "Invalid job links format",
            });
          }
        } else {
          dispatch({
            type: "SET_JOBS_ERROR",
            payload: "Failed to load job recommendations",
          });
        }
      } catch (error) {
        if (!jobsAborted) {
          console.error("Failed to fetch jobs:", error);
          dispatch({
            type: "SET_JOBS_ERROR",
            payload: "Failed to load job recommendations",
          });
        }
      }
    };

    const fetchLayout = async () => {
      // Skip if we already have cached layout strategy
      if (cachedResults && cachedResults.layoutStrategy) {
        console.log("⏭️  Skipping layout API call (using cache)");
        return;
      }
      
      try {
        dispatch({ type: "SET_LOADING_LAYOUT", payload: true });
        
        const response = await fetch(`${PYTHON_API_URL}/api/generate-layout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage, totalScore, maxScore, categories }),
        });

        if (layoutAborted) return;

        if (response.ok) {
          const data = await response.json();
          if (data && data.section_order && data.section_visibility) {
            dispatch({
              type: "SET_LAYOUT",
              payload: data
            });
          } else {
            dispatch({
              type: "SET_LAYOUT_ERROR",
              payload: "Invalid layout format",
            });
          }
        } else {
          dispatch({
            type: "SET_LAYOUT_ERROR",
            payload: "Failed to load layout strategy",
          });
        }
      } catch (error) {
        if (!layoutAborted) {
          console.error("Failed to fetch layout:", error);
          dispatch({
            type: "SET_LAYOUT_ERROR",
            payload: "Failed to load layout strategy",
          });
        }
      }
    };

    const fetchInsights = async () => {
      // Skip if we already have cached category insights
      if (cachedResults && cachedResults.categoryInsights) {
        console.log("⏭️  Skipping insights API call (using cache)");
        return;
      }
      
      try {
        dispatch({ type: "SET_LOADING_INSIGHTS", payload: true });
        
        const response = await fetch(`${PYTHON_API_URL}/api/generate-category-insights`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage, totalScore, maxScore, categories }),
        });

        if (insightsAborted) return;

        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.insights)) {
            dispatch({
              type: "SET_INSIGHTS",
              payload: data.insights
            });
          } else {
            dispatch({
              type: "SET_INSIGHTS_ERROR",
              payload: "Invalid insights format",
            });
          }
        } else {
          dispatch({
            type: "SET_INSIGHTS_ERROR",
            payload: "Failed to load category insights",
          });
        }
      } catch (error) {
        if (!insightsAborted) {
          console.error("Failed to fetch insights:", error);
          dispatch({
            type: "SET_INSIGHTS_ERROR",
            payload: "Failed to load category insights",
          });
        }
      }
    };

    // Fetch all data in parallel
    fetchLayout();
    fetchInsights();
    generateResources();
    generateDeepDive();
    fetchJobs();

    return () => {
      resourcesAborted = true;
      deepDiveAborted = true;
      jobsAborted = true;
      layoutAborted = true;
      insightsAborted = true;
    };
  }, [stage, categories, totalScore, maxScore, cachedResults]);

  return state;
}
