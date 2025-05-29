"use client";

import { posthog, isPostHogInitialized } from './posthog';

/**
 * Sermon analytics service to track sermon engagement
 */
export class SermonAnalytics {
  /**
   * Track sermon view
   * @param sermonId - The ID of the sermon being viewed
   * @param title - The title of the sermon
   * @param speaker - The speaker of the sermon
   * @param seriesId - The ID of the series the sermon belongs to (optional)
   */
  static trackSermonView(sermonId: string, title: string, speaker: string, seriesId?: string) {
    posthog.capture('sermon_view', {
      sermon_id: sermonId,
      sermon_title: title,
      speaker,
      series_id: seriesId
    });
  }

  /**
   * Track sermon playback started
   * @param sermonId - The ID of the sermon
   * @param mediaType - The type of media being played (audio or video)
   */
  static trackPlaybackStarted(sermonId: string, mediaType: 'audio' | 'video') {
    posthog.capture('sermon_playback_started', {
      sermon_id: sermonId,
      media_type: mediaType
    });
  }

  /**
   * Track sermon playback progress
   * @param sermonId - The ID of the sermon
   * @param progressPercent - The percentage of the sermon that has been watched/listened to
   * @param currentTime - The current time in seconds
   * @param duration - The total duration in seconds
   * @param metadata - Additional metadata like quality settings
   */
  static trackPlaybackProgress(
    sermonId: string, 
    progressPercent: number, 
    currentTime: number, 
    duration: number,
    metadata?: { quality?: string; bitrate?: number }
  ) {
    // Only track at specific milestones to avoid overwhelming the analytics
    const milestone = Math.floor(progressPercent / 25) * 25;
    
    if (milestone > 0 && milestone <= 100) {
      posthog.capture(`sermon_${milestone}_percent_complete`, { 
        sermon_id: sermonId,
        current_time: currentTime,
        duration,
        ...(metadata || {}) // Include any additional metadata if provided
      });
    }
  }

  /**
   * Track sermon playback completed
   * @param sermonId - The ID of the sermon
   */
  static trackPlaybackCompleted(sermonId: string) {
    posthog.capture('sermon_playback_completed', {
      sermon_id: sermonId
    });
  }

  /**
   * Track sermon sharing
   * @param sermonId - The ID of the sermon
   * @param platform - The platform the sermon was shared to
   */
  static trackSermonShared(sermonId: string, platform: string) {
    posthog.capture('sermon_shared', {
      sermon_id: sermonId,
      platform
    });
  }

  /**
   * Track sermon download
   * @param sermonId - The ID of the sermon
   * @param mediaType - The type of media being downloaded (audio, video, transcript)
   */
  static trackSermonDownload(sermonId: string, mediaType: 'audio' | 'video' | 'transcript') {
    posthog.capture('sermon_downloaded', {
      sermon_id: sermonId,
      media_type: mediaType
    });
  }
  
  /**
   * Track playback speed change
   * @param sermonId - The ID of the sermon
   * @param speed - The playback speed
   */
  static trackPlaybackSpeed(sermonId: string, speed: number) {
    posthog.capture('sermon_playback_speed_change', {
      sermon_id: sermonId,
      speed
    });
  }
  
  /**
   * Track sermon playback quality change
   * @param sermonId - The ID of the sermon
   * @param quality - The quality label (e.g. "720p")
   * @param bitrate - The bitrate in bits per second
   */
  static trackPlaybackQuality(sermonId: string, quality: string, bitrate: number) {
    posthog.capture('sermon_quality_change', {
      sermon_id: sermonId,
      quality,
      bitrate
    });
  }

  /**
   * Track search results for sermons
   * @param query - The search query
   * @param filters - Any filters that were applied
   * @param resultCount - The number of results returned
   */
  static trackSearch(query: string, filters: any, resultCount: number) {
    posthog.capture('sermon_search', {
      query,
      filters,
      result_count: resultCount
    });
  }

  /**
   * Track admin actions
   * @param action - The action being performed (create, edit, delete)
   * @param entityType - The type of entity being acted upon (sermon, series)
   * @param entityId - The ID of the entity
   */
  static trackAdminAction(action: 'create' | 'edit' | 'delete', entityType: 'sermon' | 'series', entityId: string) {
    posthog.capture(`admin_${action}_${entityType}`, {
      entity_id: entityId,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Get engagement metrics for a sermon
   * This would typically call an API endpoint to get analytics data
   * This is a placeholder implementation
   * @param sermonId - The ID of the sermon
   * @returns Engagement metrics for the sermon
   */
  static async getSermonEngagementMetrics(sermonId: string) {
    // In a real implementation, this would call an API endpoint to get analytics data
    // For now, we'll return mock data
    return {
      views: Math.floor(Math.random() * 1000),
      averageWatchTime: Math.floor(Math.random() * 300) + 100,
      completionRate: Math.random() * 0.7 + 0.1,
      engagement: {
        start: 100,
        quarter: Math.floor(Math.random() * 40) + 60,
        half: Math.floor(Math.random() * 30) + 30,
        threeQuarters: Math.floor(Math.random() * 20) + 10,
        complete: Math.floor(Math.random() * 10) + 5
      }
    };
  }
}

export default SermonAnalytics;

/**
 * Track a sermon event
 * @param eventName - The name of the event
 * @param sermonId - The ID of the sermon
 * @param properties - Additional properties for the event
 */
export const trackSermonEvent = (
  eventName: string, 
  sermonId: string, 
  properties?: Record<string, any> // Explicitly type properties as Record<string, any> or a more specific type
) => {
  if (isPostHogInitialized()) {
    posthog.capture(eventName, {
      sermon_id: sermonId,
      ...properties
    });
  }
};

// Example usage (can be removed or adapted)
export const trackSermonView = (sermonId: string) => {
  trackSermonEvent('sermon_viewed', sermonId);
};

export const trackSermonShare = (/*sermonId: string,*/ platform: string) => { // 'sermonId' is defined but never used.
  trackSermonEvent('sermon_shared', 'unknown', { platform }); // Pass 'unknown' or handle sermonId appropriately
};
