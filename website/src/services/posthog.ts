// src/services/posthog.ts
import posthog, { PostHog } from 'posthog-js';

let posthogInstance: PostHog | null = null;

// Initialize PostHog for client-side analytics
export const initPostHog = (): void => {
  if (typeof window !== 'undefined') {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (posthogKey && posthogHost) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        autocapture: true,
        capture_pageview: true,
        loaded: (ph) => {
          posthogInstance = ph; // Set the instance variable

          if (process.env.NODE_ENV === 'development') {
            // Don't track events in development
            ph.opt_out_capturing();
          }
        },
      });
    }
  }
};

export const isPostHogInitialized = (): boolean => {
  return !!posthogInstance;
};

export { posthog };
