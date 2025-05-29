"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Re-enabled for cancel button
import { useForm, Controller, SubmitHandler } from 'react-hook-form'; 
import Button from '@/components/common/Button';
import {
  fetchSermonById,
  fetchSermonSeries,
  fetchTags,
  saveSermon,
  uploadSermonMedia,
  Sermon, 
  SermonSeries,
  UploadResult // Added UploadResult import
} from '@/services/sermonService';
import {
  validateFile,
  AUDIO_FILE_CONFIG,
  VIDEO_FILE_CONFIG,
  IMAGE_FILE_CONFIG
} from '@/utils/fileValidation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { posthog } from '@/services/posthog';
import Image from 'next/image'; // Added for next/image

export type SermonFormData = Omit<Sermon, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'audio_url' | 'video_url' | 'thumbnail_url' | 'transcript'> & {
  id?: string; 
  audio_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  transcript?: string;
};

interface AdminSermonFormProps {
  sermonId: string; 
  onSaveSuccess: (sermon: Sermon) => void; 
  onSaveError: (error: Error) => void; 
}

export default function AdminSermonForm({ sermonId, onSaveSuccess, onSaveError }: AdminSermonFormProps) {
  const router = useRouter(); // Re-enabled for cancel button
  const queryClient = useQueryClient();
  const isNewSermon = sermonId === 'new';
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors: formErrors, isDirty }
  } = useForm<SermonFormData>({
    defaultValues: {
      title: '',
      description: '',
      scripture_reference: '',
      speaker_name: '',
      sermon_date: new Date().toISOString().split('T')[0],
      tags: [],
      series_id: undefined,
      is_featured: false,
      is_published: true,
    }
  });
  
  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState<string | null>(null); 
  
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  const { data: sermonDataForEdit, isLoading: isLoadingSermon, error: sermonLoadError } = useQuery<Sermon | null, Error, Sermon | null, [string, string]> ({
    queryKey: ['sermon', sermonId],
    queryFn: async () => {
      if (isNewSermon || !sermonId || sermonId === 'new') return null;
      return fetchSermonById(sermonId);
    },
    enabled: !isNewSermon && !!sermonId && sermonId !== 'new',
  });

  useEffect(() => {
    if (sermonLoadError) {
      setError(`Failed to load sermon data: ${sermonLoadError.message}`);
    }
  }, [sermonLoadError]);

  useEffect(() => {
    if (isNewSermon) {
      reset({
        title: '',
        description: '',
        scripture_reference: '',
        speaker_name: '',
        sermon_date: new Date().toISOString().split('T')[0],
        tags: [],
        series_id: undefined,
        is_featured: false,
        is_published: true,
      });
    } else if (sermonDataForEdit) {
      reset(sermonDataForEdit as SermonFormData);
    }
  }, [sermonId, isNewSermon, sermonDataForEdit, reset]);
  
  const { data: seriesList = [] } = useQuery<SermonSeries[]>({
    queryKey: ['sermonSeries'],
    queryFn: fetchSermonSeries,
  });
  
  const { data: existingTags = [] } = useQuery<string[]>({
    queryKey: ['sermonTags'],
    queryFn: fetchTags,
  });
  
  const mutationFn = async (sermonDataToSave: Partial<SermonFormData>): Promise<Sermon> => {
    const payload: Partial<Sermon> = { ...sermonDataToSave };
    if (isNewSermon && payload.id === 'new') {
      delete payload.id;
    }
    if (!isNewSermon && sermonId && sermonId !== 'new') {
        payload.id = sermonId;
    } else {
        delete payload.id; 
    }
    return saveSermon(payload as Sermon);
  };

  const saveMutation = useMutation<Sermon, Error, Partial<SermonFormData>>({
    mutationFn,
    onSuccess: async (savedSermon /*, _variables*/) => { // _variables was defined but never used
      queryClient.invalidateQueries({ queryKey: ['admin-sermons'] });
      queryClient.invalidateQueries({ queryKey: ['sermon', savedSermon.id] });
      queryClient.setQueryData(['sermon', savedSermon.id], savedSermon);

      const currentSermonIdForFiles = isNewSermon ? savedSermon.id : sermonId;
      let filesUploadedSuccessfully = true;
      let firstFileUploadError: Error | null = null;

      try {
        if (audioFile && currentSermonIdForFiles) {
          await handleFileUpload(audioFile, 'audio', currentSermonIdForFiles);
        }
        if (videoFile && currentSermonIdForFiles) {
          await handleFileUpload(videoFile, 'video', currentSermonIdForFiles);
        }
        if (thumbnailFile && currentSermonIdForFiles) {
          await handleFileUpload(thumbnailFile, 'thumbnail', currentSermonIdForFiles);
        }
      } catch (fileUploadError) {
        filesUploadedSuccessfully = false;
        firstFileUploadError = fileUploadError as Error;
        console.error('File upload failed after sermon save:', fileUploadError);
        setError(`Sermon saved, but file upload failed: ${(fileUploadError as Error).message}`);
      }

      if (!filesUploadedSuccessfully && firstFileUploadError) {
        onSaveError(firstFileUploadError);
        return; 
      }

      if (audioFile || videoFile || thumbnailFile) {
        const freshSermonData = await queryClient.fetchQuery<Sermon, Error, Sermon, [string, string]>({
          queryKey: ['sermon', currentSermonIdForFiles],
          queryFn: () => fetchSermonById(currentSermonIdForFiles),
        });
        if (freshSermonData) {
          reset(freshSermonData as SermonFormData);
          onSaveSuccess(freshSermonData);
        } else {
          onSaveSuccess(savedSermon); 
        }
      } else {
        onSaveSuccess(savedSermon); 
      }

      posthog.capture(isNewSermon ? 'sermon_created' : 'sermon_updated', { sermon_id: savedSermon.id });
    },
    onError: (error: Error /*, _variables?: Partial<SermonFormData>, _context?: unknown*/) => { // _variables and _context were defined but never used
      console.error('Error saving sermon:', error);
      const message = error.message || 'Failed to save sermon.';
      setError(message);
      onSaveError(error);
      posthog.capture('sermon_save_error', { error_message: message });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'video' | 'thumbnail') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const config = type === 'audio' ? AUDIO_FILE_CONFIG : type === 'video' ? VIDEO_FILE_CONFIG : IMAGE_FILE_CONFIG;
      const validationResult = validateFile(file, config);

      if (!validationResult.isValid) {
        setError(validationResult.error || `Invalid ${type} file. Please check type and size.`);
        e.target.value = '';
        return;
      }
      setError(null);

      if (type === 'audio') setAudioFile(file);
      else if (type === 'video') setVideoFile(file);
      else if (type === 'thumbnail') setThumbnailFile(file);
    }
  };

  const handleFileUpload = async (file: File, type: 'audio' | 'video' | 'thumbnail', currentSermonId: string): Promise<string | null> => {
    if (!file || !currentSermonId || currentSermonId === 'new') {
      console.warn('File upload skipped: missing file or sermon ID.');
      return null;
    }

    let setIsUploadingState: React.Dispatch<React.SetStateAction<boolean>>;
    if (type === 'audio') setIsUploadingState = setIsUploadingAudio;
    else if (type === 'video') setIsUploadingState = setIsUploadingVideo;
    else setIsUploadingState = setIsUploadingThumbnail;

    setIsUploadingState(true);
    setError(null);

    try {
      // The uploadSermonMedia function is expected to return Promise<UploadResult>
      // It might not have an 'error' property directly on its result if it resolves successfully.
      // Errors from uploadSermonMedia should be caught by the catch block.
      const result: UploadResult = await uploadSermonMedia(file, currentSermonId, type, undefined, (progress: number) => {
        console.log(`Upload progress for ${type} on sermon ${currentSermonId}: ${progress}%`);
      });

      setValue(`${type}_url` as keyof SermonFormData, result.url); 
      if (type === 'audio') setAudioFile(null);
      else if (type === 'video') setVideoFile(null);
      else if (type === 'thumbnail') setThumbnailFile(null);
      
      queryClient.invalidateQueries({ queryKey: ['sermon', currentSermonId] });
      return result.url;
    } catch (uploadError) {
      console.error(`Error uploading ${type} for sermon ${currentSermonId}:`, uploadError);
      const message = uploadError instanceof Error ? uploadError.message : 'Upload failed';
      setError(`Failed to upload ${type}: ${message}`); 
      throw uploadError; 
    } finally {
      setIsUploadingState(false);
    }
  };

  const onSubmit: SubmitHandler<SermonFormData> = async (formData) => {
    setError(null); 
    
    const dataToSave: Partial<SermonFormData> = { ...formData };
    if (isNewSermon) {
      dataToSave.id = undefined; 
    } else {
      dataToSave.id = sermonId; 
    }

    saveMutation.mutate(dataToSave);
  };
  
  const handleAddTag = () => {
    const currentTags = watch('tags') || [];
    if (tagInput.trim() !== '' && !currentTags.includes(tagInput.trim())) {
      setValue('tags', [...currentTags, tagInput.trim()], { shouldDirty: true });
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = watch('tags') || [];
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove), { shouldDirty: true });
  };
  
  const handleTagSuggestionClick = (tag: string) => {
    const currentTags = watch('tags') || [];
    if (!currentTags.includes(tag)) {
      setValue('tags', [...currentTags, tag], { shouldDirty: true });
    }
  };

  if (isLoadingSermon && !isNewSermon) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        <p className="ml-4 text-gray-600">Loading sermon data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold">
          {isNewSermon ? 'Create New Sermon' : 'Edit Sermon'}
        </h2>
        {sermonDataForEdit && !isNewSermon && <p className="text-sm text-gray-500">Editing: {sermonDataForEdit.title}</p>}
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
            <button type="button" onClick={() => setError(null)} className="mt-2 text-sm text-red-600 hover:text-red-800">Dismiss</button>
          </div>
        )}

        {/* Title */}
        <div className="col-span-1 md:col-span-2 mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Sermon Title*
            </label>
            <input
              id="title"
              type="text"
              className={`w-full border rounded-md py-2 px-3 text-gray-700 ${
                formErrors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter sermon title"
              {...register('title', { required: 'Title is required' })}
            />
            {formErrors.title && (
              <p className="mt-1 text-sm text-red-600">{formErrors.title.message}</p>
            )}
        </div>

        {/* Speaker */}
        <div className="mb-4">
            <label htmlFor="speaker_name" className="block text-sm font-medium text-gray-700 mb-1">
              Speaker*
            </label>
            <input
              id="speaker_name"
              type="text"
              className={`w-full border rounded-md py-2 px-3 text-gray-700 ${
                formErrors.speaker_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Speaker name"
              {...register('speaker_name', { required: 'Speaker name is required' })}
            />
            {formErrors.speaker_name && (
              <p className="mt-1 text-sm text-red-600">{formErrors.speaker_name.message}</p>
            )}
        </div>

        {/* Sermon Date */}
        <div className="mb-4">
            <label htmlFor="sermon_date" className="block text-sm font-medium text-gray-700 mb-1">
              Sermon Date*
            </label>
            <input
              id="sermon_date"
              type="date"
              className={`w-full border rounded-md py-2 px-3 text-gray-700 ${
                formErrors.sermon_date ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('sermon_date', { required: 'Sermon date is required' })}
            />
            {formErrors.sermon_date && (
              <p className="mt-1 text-sm text-red-600">{formErrors.sermon_date.message}</p>
            )}
        </div>
        
        {/* Series */}
        <div className="mb-4">
            <label htmlFor="series_id" className="block text-sm font-medium text-gray-700 mb-1">
              Sermon Series
            </label>
            <Controller
              name="series_id"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="series_id"
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700"
                >
                  <option value="">-- No Series --</option>
                  {seriesList.map((seriesItem: SermonSeries) => (
                    <option key={seriesItem.id} value={seriesItem.id}>
                      {seriesItem.title}
                    </option>
                  ))}
                </select>
              )}
            />
        </div>

        {/* Scripture Reference */}
        <div className="mb-4">
            <label htmlFor="scripture_reference" className="block text-sm font-medium text-gray-700 mb-1">
              Scripture Reference
            </label>
            <input
              id="scripture_reference"
              type="text"
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700"
              placeholder="e.g. John 3:16-21"
              {...register('scripture_reference')}
            />
        </div>

        {/* Duration */}
        <div className="mb-4">
            <label htmlFor="duration_seconds" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (seconds)
            </label>
            <input
              id="duration_seconds"
              type="number"
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700"
              placeholder="e.g. 1800 for 30 minutes"
              {...register('duration_seconds', {
                valueAsNumber: true,
                min: { value: 0, message: 'Duration must be positive' }
              })}
            />
            {formErrors.duration_seconds && (
              <p className="mt-1 text-sm text-red-600">{formErrors.duration_seconds.message}</p>
            )}
        </div>

        {/* Description */}
        <div className="col-span-1 md:col-span-2 mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700"
              placeholder="Enter sermon description"
              {...register('description')}
            ></textarea>
        </div>

        {/* Tags */}
        <div className="col-span-1 md:col-span-2 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-grow border border-gray-300 rounded-md py-2 px-3 text-gray-700"
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" onClick={handleAddTag} variant="outline" size="sm">Add Tag</Button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {(watch('tags') || []).map((tag: string) => (
                <span
                  key={tag}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm flex items-center"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-gray-500 hover:text-red-600 focus:outline-none"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            {existingTags.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Suggestions (click to add):</p>
                <div className="flex flex-wrap gap-1">
                  {existingTags.filter(tag => !(watch('tags') || []).includes(tag)).map((tag: string) => (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => handleTagSuggestionClick(tag)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs hover:bg-blue-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* File Upload Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">Audio File</h4>
            <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} className="w-full mb-2" disabled={isUploadingAudio} />
            {watch('audio_url') && !audioFile && (
              <p className="text-xs text-gray-500 mb-1">Current: <a href={watch('audio_url')} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{watch('audio_url')?.split('/').pop()}</a></p>
            )}
            {audioFile && <p className="text-xs text-gray-500 mb-1">Selected: {audioFile.name}</p>}
            {isUploadingAudio && <p className="text-xs text-blue-500">Uploading audio...</p>}
            {/* Placeholder for progress bar or more detailed status */}
          </div>
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">Video File</h4>
            <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, 'video')} className="w-full mb-2" disabled={isUploadingVideo} />
            {watch('video_url') && !videoFile && (
              <p className="text-xs text-gray-500 mb-1">Current: <a href={watch('video_url')} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{watch('video_url')?.split('/').pop()}</a></p>
            )}
            {videoFile && <p className="text-xs text-gray-500 mb-1">Selected: {videoFile.name}</p>}
            {isUploadingVideo && <p className="text-xs text-blue-500">Uploading video...</p>}
            {/* Placeholder for progress bar or more detailed status */}
          </div>
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-2">Thumbnail Image</h4>
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnail')} className="w-full mb-2" disabled={isUploadingThumbnail} />
            {watch('thumbnail_url') && !thumbnailFile && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Current Thumbnail:</p>
                <Image src={watch('thumbnail_url')!} alt="Current Thumbnail" className="max-w-xs max-h-24 object-contain border rounded" width={100} height={96} />
              </div>
            )}
            {thumbnailFile && <p className="text-xs text-gray-500 mb-1">Selected: {thumbnailFile.name}</p>}
            {isUploadingThumbnail && <p className="text-xs text-blue-500">Uploading thumbnail...</p>}
            {/* Placeholder for progress bar or more detailed status */}
          </div>
        </div>

        {/* Status Flags (Published, Featured) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="is_published" className="flex items-center space-x-2">
              <Controller
                name="is_published"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                )}
              />
              <span className="text-sm font-medium text-gray-700">Published</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">Uncheck to save as a draft.</p>
          </div>
          <div>
            <label htmlFor="is_featured" className="flex items-center space-x-2">
              <Controller
                name="is_featured"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                )}
              />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">Check to mark as featured.</p>
          </div>
        </div>

        {/* Transcript - Basic Textarea for now */}
        <div className="mb-6">
          <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-1">
            Transcript
          </label>
          <textarea
            id="transcript"
            rows={6}
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-gray-700"
            placeholder="Enter or paste sermon transcript here..."
            {...register('transcript')}
          ></textarea>
          <p className="text-xs text-gray-500 mt-1">You can manually enter the transcript or it might be auto-generated for audio/video files in the future.</p>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <Button
            type="button"
            onClick={() => router.back()} // Or router.push('/admin/sermons')
            variant="outline"
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isPending || (!isDirty && isNewSermon)} // Use disabled prop
          >
            {saveMutation.isPending ? (isNewSermon ? 'Creating...' : 'Saving...') : (isNewSermon ? 'Create Sermon' : 'Save Changes')}
          </Button>
        </div>
      </form>
    </div>
  );
}
