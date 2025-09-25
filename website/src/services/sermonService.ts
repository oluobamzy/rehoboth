"use client";

import { supabase } from './supabase';
import { posthog } from './posthog';

// Define types based on the schema
export interface SermonSeries {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  sermons?: Sermon[]; // Add this line
}

export interface Sermon {
  id: string;
  title: string;
  description?: string;
  scripture_reference?: string;
  speaker_name: string;
  sermon_date: string;
  duration_seconds?: number;
  audio_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  transcript?: string;
  tags?: string[];
  series_id?: string;
  view_count: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  series?: SermonSeries;
}

export interface UploadResult {
  url: string;
  path: string;
}

export interface PaginatedSermons { 
  sermons: Sermon[];
  count: number | null;
  connectionError?: string;
  debug?: {
    tablesExist?: boolean;
    errorDetails?: any;
    queryInfo?: any;
  };
}

// Helper function to transform sermon data from database response
function transformSermonData(rawSermon: any): Sermon {
  // Map sermon_series to series for backward compatibility
  const sermon = { ...rawSermon };
  if (sermon.sermon_series) {
    sermon.series = sermon.sermon_series;
    delete sermon.sermon_series;
  }
  return sermon as Sermon;
}

// Helper function to check if tables exist
async function checkTablesExist() {
  try {
    // Use a direct query instead of exec function which may have issues
    console.log('Checking if sermons table exists...');
    const { data: sermonCheck, error: sermonError } = await supabase
      .from('sermons')
      .select('id')
      .limit(1);
    
    console.log('Sermon check result:', sermonCheck ? 'Success' : 'Failed', sermonError);
    
    const { data: seriesCheck, error: seriesError } = await supabase
      .from('sermon_series')
      .select('id')
      .limit(1);
    
    console.log('Series check result:', seriesCheck ? 'Success' : 'Failed', seriesError);
    
    // We consider tables to exist if we either get successful queries or get specific errors
    // (like no rows but not table doesn't exist errors)
    const sermonTableExists = sermonCheck !== null || (sermonError && !sermonError.message.includes('does not exist'));
    const seriesTableExists = seriesCheck !== null || (seriesError && !seriesError.message.includes('does not exist'));
    
    return {
      sermonTable: sermonTableExists,
      seriesTable: seriesTableExists,
      errors: {
        sermon: sermonError?.message,
        series: seriesError?.message
      }
    };
  } catch (error) {
    console.error('Error checking tables:', error);
    return {
      sermonTable: false,
      seriesTable: false,
      errors: {
        general: error instanceof Error ? error.message : 'Unknown error checking tables'
      }
    };
  }
}

// Fetch sermons with filters
export async function fetchSermons({
  page = 1,
  pageSize = 10,
  series_id = null,
  speaker = null,
  tags = [],
  query = null,
  start_date = null,
  end_date = null,
  sort_by = 'sermon_date',
  sort_order = 'desc',
  includeUnpublished = false
}: {
  page?: number;
  pageSize?: number;
  series_id?: string | null;
  speaker?: string | null;
  tags?: string[];
  query?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  includeUnpublished?: boolean;
}): Promise<PaginatedSermons> { // Update return type
  try {
    // First check if the tables exist
    console.log('Checking if sermon tables exist...');
    const tablesExist = await checkTablesExist();
    
    if (!tablesExist.sermonTable || !tablesExist.seriesTable) {
      console.error('Sermon tables not found:', tablesExist);
      
      // Try a more aggressive check - just attempt to query directly 
      // and see if we get "relation does not exist" error
      console.log('Attempting direct table query as fallback...');
      
      try {
        const { data, error } = await supabase.from('sermons').select('count(*)', { count: 'exact', head: true });
        console.log('Direct query result:', data ? 'Success' : 'Failed', error);
        
        if (error && error.message && error.message.includes('does not exist')) {
          return { 
            sermons: [], 
            count: 0, 
            connectionError: 'Sermon database tables not found. Please run the setup scripts.',
            debug: {
              tablesExist: false,
              errorDetails: tablesExist.errors
            }
          };
        } else {
          // The table exists, but our check had issues
          console.log('Tables appear to exist despite check result. Proceeding...');
        }
      } catch (directError) {
        console.error('Error in direct check:', directError);
        return { 
          sermons: [], 
          count: 0, 
          connectionError: 'Error checking sermon tables: ' + (directError instanceof Error ? directError.message : String(directError)),
          debug: {
            tablesExist: false,
            errorDetails: tablesExist.errors
          }
        };
      }
    }
    
    console.log('Sermon tables exist, proceeding with query...');
    // Check if Supabase is configured properly
    const usingDefaultCredentials = 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' || 
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';
      
    if (usingDefaultCredentials) {
      console.warn('⚠️ Using default Supabase credentials. Database operations will not work.');
      return { 
        sermons: [], 
        count: 0, 
        connectionError: 'Database not properly configured. Please check your environment variables.'
      };
    }
    
    // Check if tables exist
    const { sermonTable, seriesTable, errors } = await checkTablesExist();
    
    if (!sermonTable || !seriesTable) {
      return {
        sermons: [],
        count: 0,
        connectionError: 'Required tables do not exist in the database.',
        debug: {
          tablesExist: false,
          errorDetails: errors,
        }
      };
    }
    
    // Start with base query
    let sermonsQuery = supabase
      .from('sermons')
      .select('*');
    
    // Only filter by published status if we're not including unpublished sermons
    if (!includeUnpublished) {
      sermonsQuery = sermonsQuery.eq('is_published', true);
    }
    
    // Apply pagination
    sermonsQuery = sermonsQuery.range((page - 1) * pageSize, page * pageSize - 1);

    // Add filters if provided
    if (series_id) {
      sermonsQuery = sermonsQuery.eq('series_id', series_id);
    }

    if (speaker) {
      sermonsQuery = sermonsQuery.eq('speaker_name', speaker);
    }

    if (tags && tags.length > 0) {
      sermonsQuery = sermonsQuery.contains('tags', tags);
    }

    if (start_date) {
      sermonsQuery = sermonsQuery.gte('sermon_date', start_date);
    }

    if (end_date) {
      sermonsQuery = sermonsQuery.lte('sermon_date', end_date);
    }

    // Add search if query is provided
    if (query) {
      sermonsQuery = sermonsQuery.textSearch('search_vector', query);
    }

    // Add sorting
    sermonsQuery = sermonsQuery.order(sort_by, { ascending: sort_order === 'asc' });

    // Execute the query
    console.log('Executing sermon query with filters:', {
      page, pageSize, series_id, speaker, tags, query, 
      start_date, end_date, sort_by, sort_order, includeUnpublished
    });
    
    const { data: sermons, error, count } = await sermonsQuery;

    if (error) {
      console.error('Error fetching sermons:', error);
      // Try a minimal query to diagnose the issue
      console.log('Trying minimal query for diagnostics...');
      const { data: minimalData, error: minimalError } = await supabase
        .from('sermons')
        .select('id, title')
        .limit(1);
      
      return { 
        sermons: [],
        count: 0,
        connectionError: `Database error: ${error.message || 'Unknown error'}`,
        debug: {
          tablesExist: true,
          errorDetails: error,
          queryInfo: {
            minimalQuerySuccess: !minimalError,
            minimalError: minimalError?.message,
            minimalData: minimalData ? 'data found' : 'no data'
          }
        }
      };
    }

    // Fetch series data for sermons that have a series_id
    if (sermons && sermons.length > 0) {
      const sermonIds = sermons.filter(s => s.series_id).map(s => s.series_id);
      const uniqueSeriesIds = [...new Set(sermonIds)];
      
      if (uniqueSeriesIds.length > 0) {
        try {
          const { data: seriesData, error: seriesError } = await supabase
            .from('sermon_series')
            .select('id, title, description, image_url')
            .in('id', uniqueSeriesIds);
          
          if (!seriesError && seriesData) {
            // Map series data to sermons
            sermons.forEach(sermon => {
              if (sermon.series_id) {
                const series = seriesData.find(s => s.id === sermon.series_id);
                if (series) {
                  sermon.sermon_series = series;
                }
              }
            });
          }
        } catch (seriesErr) {
          console.warn('Could not fetch series data for sermons:', seriesErr);
        }
      }
    }

    // Track event in PostHog
    posthog.capture('sermons_viewed', {
      filters: {
        series_id,
        speaker,
        tags,
        query,
        start_date,
        end_date,
      },
      result_count: sermons?.length || 0,
    });

    return { sermons: sermons?.map(transformSermonData) || [], count };
  } catch (error) {
    console.error('Failed to fetch sermons:', error);
    return { 
      sermons: [],
      count: 0,
      connectionError: error instanceof Error ? error.message : 'Unknown database error',
      debug: {
        errorDetails: {
          name: error instanceof Error ? error.name : 'Unknown',
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }
      }
    };
  }
}

// Fetch a single sermon by ID
export async function fetchSermonById(id: string) {
  try {
    const { data: sermon, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching sermon:', error);
      throw error;
    }

    // Fetch series data if the sermon has a series_id
    if (sermon.series_id) {
      try {
        const { data: seriesData, error: seriesError } = await supabase
          .from('sermon_series')
          .select('id, title, description, image_url')
          .eq('id', sermon.series_id)
          .single();
        
        if (!seriesError && seriesData) {
          sermon.sermon_series = seriesData;
        }
      } catch (seriesErr) {
        console.warn('Could not fetch series data for sermon:', seriesErr);
      }
    }

    const transformedSermon = transformSermonData(sermon);

    // Increment view count
    await incrementSermonViewCount(id);

    // Track view in PostHog
    posthog.capture('sermon_viewed', {
      sermon_id: id,
      sermon_title: transformedSermon.title,
      speaker: transformedSermon.speaker_name,
      series: transformedSermon.series?.title,
    });

    return transformedSermon;
  } catch (error) {
    console.error('Failed to fetch sermon:', error);
    return null;
  }
}

// Increment view count for a sermon
export async function incrementSermonViewCount(id: string) {
  try {
    // Fetch current view_count
    const { data, error: fetchError } = await supabase
      .from('sermons')
      .select('view_count')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Failed to fetch current view count:', fetchError);
      return;
    }

    const currentViewCount = data?.view_count ?? 0;

    // Update with incremented view_count
    const { error: updateError } = await supabase
      .from('sermons')
      .update({ view_count: currentViewCount + 1 })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to increment view count:', updateError);
    }
  } catch (error) {
    console.error('Failed to increment view count:', error);
  }
}

// Fetch all sermon series
export async function fetchSermonSeries() {
  try {
    // Check if Supabase is configured properly
    const usingDefaultCredentials = 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' || 
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';
      
    if (usingDefaultCredentials) {
      console.warn('⚠️ Using default Supabase credentials. Database operations will not work.');
      return [];
    }
    
    const { data: series, error } = await supabase
      .from('sermon_series')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching sermon series:', error);
      return [];
    }

    return series;
  } catch (error) {
    console.error('Failed to fetch sermon series:', error);
    return [];
  }
}

// Fetch a single sermon series by ID with its sermons
export async function fetchSermonSeriesById(id: string) {
  try {
    // Check if Supabase is configured properly
    const usingDefaultCredentials = 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' || 
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';
      
    if (usingDefaultCredentials) {
      console.warn('⚠️ Using default Supabase credentials. Database operations will not work.');
      return { 
        connectionError: 'Database not properly configured. Please check your environment variables.'
      };
    }

    const { data: series, error: seriesError } = await supabase
      .from('sermon_series')
      .select('*')
      .eq('id', id)
      .single();

    if (seriesError) {
      console.error('Error fetching sermon series:', seriesError);
      return { 
        connectionError: `Database error: ${seriesError.message || 'Error fetching sermon series'}`
      };
    }

    const { data: sermons, error: sermonsError } = await supabase
      .from('sermons')
      .select('*')
      .eq('series_id', id)
      .eq('is_published', true)
      .order('sermon_date', { ascending: false });

    if (sermonsError) {
      console.error('Error fetching sermons in series:', sermonsError);
      return {
        ...series,
        sermons: [],
        connectionError: `Warning: Could not load sermons in this series. ${sermonsError.message}`
      };
    }

    return { ...series, sermons: sermons?.map(transformSermonData) || [] };
  } catch (error) {
    console.error('Failed to fetch sermon series with sermons:', error);
    return { 
      connectionError: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
}

// Get all unique speakers
export async function fetchSpeakers() {
  try {
    // Check if Supabase is configured properly
    const usingDefaultCredentials = 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' || 
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';
      
    if (usingDefaultCredentials) {
      console.warn('⚠️ Using default Supabase credentials. Database operations will not work.');
      return [];
    }
    
    const { data, error } = await supabase
      .from('sermons')
      .select('speaker_name')
      .eq('is_published', true)
      .order('speaker_name');

    if (error) {
      console.error('Error fetching speakers:', error);
      return [];
    }

    // Extract unique speaker names
    const speakerMap: Record<string, boolean> = {};
    const speakers: string[] = [];
    
    data.forEach(item => {
      if (!speakerMap[item.speaker_name]) {
        speakerMap[item.speaker_name] = true;
        speakers.push(item.speaker_name);
      }
    });
    
    return speakers;
  } catch (error) {
    console.error('Failed to fetch speakers:', error);
    return [];
  }
}

// Get all unique tags
export async function fetchTags() {
  try {
    // Check if Supabase is configured properly
    const usingDefaultCredentials = 
      !process.env.NEXT_PUBLIC_SUPABASE_URL || 
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://example.supabase.co' || 
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key';
      
    if (usingDefaultCredentials) {
      console.warn('⚠️ Using default Supabase credentials. Database operations will not work.');
      return [];
    }
    
    const { data, error } = await supabase
      .from('sermons')
      .select('tags')
      .eq('is_published', true);

    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }

    // Extract and flatten all tags from all sermons
    const allTags = data.reduce((acc: string[], sermon) => {
      if (sermon.tags && Array.isArray(sermon.tags)) {
        return [...acc, ...sermon.tags];
      }
      return acc;
    }, []);

    // Return unique tags using an object to track uniqueness
    const tagMap: Record<string, boolean> = {};
    const uniqueTags: string[] = [];
    
    allTags.forEach(tag => {
      if (!tagMap[tag]) {
        tagMap[tag] = true;
        uniqueTags.push(tag);
      }
    });
    
    return uniqueTags;
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return [];
  }
}

// Upload sermon media (audio, video, thumbnail) using Supabase Storage
export async function uploadSermonMedia(
  file: File,
  sermonId: string,
  type: 'audio' | 'video' | 'thumbnail'
): Promise<UploadResult> {
  try {
    // Check if user is authenticated and has admin role
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to upload files');
    }

    // Check if user has admin role
    const userRole = session.user.app_metadata?.role;
    const isAdmin = userRole === 'admin';
    
    if (!isAdmin) {
      // Also check user_roles table as fallback
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();
      
      if (!userRoles) {
        throw new Error('You must be an admin to upload sermon files');
      }
    }

    console.log('Uploading file:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      sermonId,
      type,
      userId: session.user.id,
      userRole: userRole,
      isAdmin: isAdmin
    });

    const filePath = `${sermonId}/${type}/${file.name}`;
    
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('sermon-media')
      .upload(filePath, file, {
        cacheControl: '3600', // Cache for 1 hour
        upsert: true // Allow overwriting existing files
      });

    if (error) {
      console.error('Supabase upload error:', error);
      console.error('Upload error details:', {
        message: error.message,
        name: error.name || 'StorageError'
      });
      
      // Provide more specific error messages
      if (error.message.includes('new row violates row-level security policy')) {
        throw new Error('Upload failed: new row violates row-level security policy');
      } else if (error.message.includes('403') || error.message.includes('forbidden')) {
        throw new Error('Upload failed: You do not have permission to upload files to this bucket');
      } else if (error.message.includes('400') || error.message.includes('bad request')) {
        throw new Error('Upload failed: Invalid request or file format');
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }

    console.log('Upload successful:', data);

    // Get the public URL for the uploaded file
    const { data: publicData } = supabase.storage
      .from('sermon-media')
      .getPublicUrl(filePath);

    return {
      url: publicData.publicUrl,
      path: filePath
    };

  } catch (error) {
    console.error('Failed to upload sermon media:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Upload failed with unknown error');
  }
}

// ADMIN FUNCTIONS

// Create or update a sermon
export async function saveSermon(
  sermon: Partial<Sermon>,
  audioFile?: File | null,
  videoFile?: File | null,
  thumbnailFile?: File | null
): Promise<Sermon> {
  console.log('saveSermon called with:');
  console.log('- Sermon data:', JSON.stringify(sermon, null, 2));
  console.log('- Audio file:', audioFile?.name || 'none');
  console.log('- Video file:', videoFile?.name || 'none');
  console.log('- Thumbnail file:', thumbnailFile?.name || 'none');
  
  const sermonData: Partial<Sermon> = { ...sermon };
  
  // Sanitize series_id: convert empty string or null to undefined to avoid database constraint errors
  if (sermonData.series_id === '' || sermonData.series_id === null) {
    sermonData.series_id = undefined;
  }
  
  let newSermonId = sermon.id; // This could be undefined if it's a new sermon

  try {
    // If it's a new sermon (no ID), create it first to get an ID for file uploads
    if (!newSermonId) {
      const { data: newSermon, error: createError } = await supabase
        .from('sermons')
        .insert([{
          title: sermonData.title || 'Untitled Sermon',
          speaker_name: sermonData.speaker_name || 'Unknown Speaker',
          sermon_date: sermonData.sermon_date || new Date().toISOString(),
          series_id: sermonData.series_id || null, // Explicitly handle series_id
          description: sermonData.description || null,
          scripture_reference: sermonData.scripture_reference || null,
          duration_seconds: sermonData.duration_seconds || null,
          tags: sermonData.tags || [],
          is_published: sermonData.is_published || false,
          is_featured: sermonData.is_featured || false,
          view_count: 0,
        }])
        .select('*')
        .single();

      if (createError) {
        console.error('Error creating sermon:', createError);
        throw createError;
      }
      if (!newSermon || !newSermon.id) { // Check if newSermon and its id are defined
        console.error('Failed to create sermon or get new sermon ID');
        throw new Error('Failed to create sermon or get new sermon ID');
      }
      
      // If the new sermon has a series_id, fetch the series data separately
      if (newSermon.series_id) {
        try {
          const { data: seriesData, error: seriesError } = await supabase
            .from('sermon_series')
            .select('id, title, description, image_url')
            .eq('id', newSermon.series_id)
            .single();
          
          if (!seriesError && seriesData) {
            newSermon.sermon_series = seriesData;
          }
        } catch (seriesErr) {
          // Don't fail the entire operation if series fetch fails
          console.warn('Could not fetch series data for new sermon:', seriesErr);
        }
      }
      
      newSermonId = newSermon.id;
      sermonData.id = newSermonId; // Set the ID for subsequent operations
    }

    // At this point, newSermonId should be defined, whether it was an existing or new sermon.
    // However, to satisfy TypeScript, we ensure it is defined before using it for uploads.
    if (!newSermonId) {
      console.error('Sermon ID is still undefined after creation/check. This should not happen.');
      throw new Error('Sermon ID is undefined');
    }

    // Upload files if they exist, using the now-guaranteed newSermonId
    if (audioFile) {
      const { url: audio_url } = await uploadSermonMedia(audioFile, newSermonId, 'audio');
      sermonData.audio_url = audio_url;
    }
    if (videoFile) {
      const { url: video_url } = await uploadSermonMedia(videoFile, newSermonId, 'video');
      sermonData.video_url = video_url;
    }
    if (thumbnailFile) {
      const { url: thumbnail_url } = await uploadSermonMedia(thumbnailFile, newSermonId, 'thumbnail');
      sermonData.thumbnail_url = thumbnail_url;
    }

    // Update sermon with all data (including file URLs if any were uploaded or changed)
    // For new sermons, this updates the record created earlier.
    // For existing sermons, this updates with any new file URLs or other changed data.
    console.log('Updating sermon with data:', JSON.stringify(sermonData, null, 2));
    console.log('Sermon ID:', newSermonId);
    
    // Filter out fields that shouldn't be updated (generated columns, database-managed fields)
    const updateData = {
      title: sermonData.title,
      description: sermonData.description,
      scripture_reference: sermonData.scripture_reference,
      speaker_name: sermonData.speaker_name,
      sermon_date: sermonData.sermon_date,
      duration_seconds: sermonData.duration_seconds,
      audio_url: sermonData.audio_url,
      video_url: sermonData.video_url,
      thumbnail_url: sermonData.thumbnail_url,
      transcript: sermonData.transcript,
      tags: sermonData.tags,
      series_id: sermonData.series_id,
      view_count: sermonData.view_count,
      is_featured: sermonData.is_featured,
      is_published: sermonData.is_published,
      updated_at: new Date().toISOString(), // Explicitly set updated_at
    };
    
    // Remove undefined values to avoid unnecessary updates
    Object.keys(updateData).forEach(key => {
      if ((updateData as any)[key] === undefined) {
        delete (updateData as any)[key];
      }
    });
    
    const { data: finalSermon, error: updateError } = await supabase
      .from('sermons')
      .update(updateData) // Use filtered data instead of sermonData
      .eq('id', newSermonId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating sermon details:');
      console.error('- Error object:', updateError);
      console.error('- Error message:', updateError?.message);
      console.error('- Error details:', updateError?.details);
      console.error('- Error hint:', updateError?.hint);
      console.error('- Error code:', updateError?.code);
      console.error('- Full error JSON:', JSON.stringify(updateError, null, 2));
      throw updateError;
    }
    
    // If the sermon has a series_id, fetch the series data separately
    if (finalSermon.series_id) {
      try {
        const { data: seriesData, error: seriesError } = await supabase
          .from('sermon_series')
          .select('id, title, description, image_url')
          .eq('id', finalSermon.series_id)
          .single();
        
        if (!seriesError && seriesData) {
          finalSermon.sermon_series = seriesData;
        }
      } catch (seriesErr) {
        // Don't fail the entire operation if series fetch fails
        console.warn('Could not fetch series data for sermon:', seriesErr);
      }
    }
    
    return transformSermonData(finalSermon);

  } catch (error: any) {
    console.error('Failed to save sermon:');
    console.error('- Error object:', error);
    console.error('- Error message:', error?.message);
    console.error('- Error name:', error?.name);
    console.error('- Error stack:', error?.stack);
    console.error('- Error details:', error?.details);
    console.error('- Error hint:', error?.hint);
    console.error('- Error code:', error?.code);
    console.error('- Full error JSON:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    throw error;
  }
}

// Create or update a sermon series
export async function saveSermonSeries(series: Partial<SermonSeries>) {
  try {
    if (series.id) {
      // Update existing series
      const { data, error } = await supabase
        .from('sermon_series')
        .update({
          title: series.title,
          description: series.description,
          image_url: series.image_url,
          start_date: series.start_date,
          end_date: series.end_date,
          is_active: series.is_active,
        })
        .eq('id', series.id)
        .select();

      if (error) {
        console.error('Error updating sermon series:', error);
        throw error;
      }

      return data[0];
    } else {
      // Create new series
      const { data, error } = await supabase
        .from('sermon_series')
        .insert({
          title: series.title,
          description: series.description,
          image_url: series.image_url,
          start_date: series.start_date,
          end_date: series.end_date,
          is_active: series.is_active !== undefined ? series.is_active : true,
        })
        .select();

      if (error) {
        console.error('Error creating sermon series:', error);
        throw error;
      }

      return data[0];
    }
  } catch (error) {
    console.error('Failed to save sermon series:', error);
    throw error;
  }
}

// Delete a sermon (soft delete by unpublishing)
export async function deleteSermon(id: string) {
  try {
    const { error } = await supabase
      .from('sermons')
      .update({ is_published: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting sermon:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete sermon:', error);
    return false;
  }
}

// Delete a sermon series (set to inactive)
export async function deleteSermonSeries(id: string) {
  try {
    const { error } = await supabase
      .from('sermon_series')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting sermon series:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete sermon series:', error);
    return false;
  }
}
