// src/services/posthog.ts
import posthog from 'posthog-js';

// Initialize PostHog for client-side analytics
export const initPostHog = () => {
  if (typeof window !== 'undefined') {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (posthogKey && posthogHost) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        autocapture: true,
        capture_pageview: true,
        loaded: (ph) => {
          if (process.env.NODE_ENV === 'development') {
            // Don't track events in development
            ph.opt_out_capturing();
          }
        },
      });
    }
  }
};

export { posthog };
