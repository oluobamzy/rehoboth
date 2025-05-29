// scripts/setupSermonSchema.js
// This script will set up the Supabase schema for the sermon management system
// To run this script: node scripts/setupSermonSchema.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSermonTables() {
  try {
    console.log('Creating sermon database tables...');

    // Create the sermon_series table
    const createSermonSeriesSQL = `
      CREATE TABLE IF NOT EXISTS sermon_series (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        start_date DATE,
        end_date DATE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    // Create sermons table
    const createSermonsSQL = `
      CREATE TABLE IF NOT EXISTS sermons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT,
        scripture_reference VARCHAR(255),
        speaker_name VARCHAR(255) NOT NULL,
        sermon_date DATE NOT NULL,
        duration_seconds INTEGER,
        audio_url VARCHAR(500),
        video_url VARCHAR(500),
        thumbnail_url VARCHAR(500),
        transcript TEXT,
        tags TEXT[], -- PostgreSQL array
        series_id UUID REFERENCES sermon_series(id),
        view_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        is_published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create indexes
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_sermons_published_date ON sermons (is_published, sermon_date DESC);
      CREATE INDEX IF NOT EXISTS idx_sermons_series ON sermons (series_id);
      CREATE INDEX IF NOT EXISTS idx_sermons_speaker ON sermons (speaker_name);
      CREATE INDEX IF NOT EXISTS idx_sermons_tags ON sermons USING GIN (tags);
    `;

    // Add search vector for full-text search
    const addSearchVectorSQL = `
      ALTER TABLE sermons ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title,'') || ' ' || 
        coalesce(description,'') || ' ' || 
        coalesce(transcript,'') || ' ' || 
        coalesce(scripture_reference,'') || ' ' ||
        coalesce(speaker_name,''))
      ) STORED;
      
      CREATE INDEX IF NOT EXISTS idx_sermons_search ON sermons USING GIN (search_vector);
    `;

    // Execute the SQL queries (using exec stored procedure that should be created before)
    const { error: sermonSeriesError } = await supabase.rpc('exec', { query: createSermonSeriesSQL });
    if (sermonSeriesError) throw new Error(`Error creating sermon_series table: ${sermonSeriesError.message}`);
    
    const { error: sermonsError } = await supabase.rpc('exec', { query: createSermonsSQL });
    if (sermonsError) throw new Error(`Error creating sermons table: ${sermonsError.message}`);
    
    const { error: indexesError } = await supabase.rpc('exec', { query: createIndexesSQL });
    if (indexesError) throw new Error(`Error creating indexes: ${indexesError.message}`);
    
    const { error: searchVectorError } = await supabase.rpc('exec', { query: addSearchVectorSQL });
    if (searchVectorError) throw new Error(`Error adding search vector: ${searchVectorError.message}`);

    console.log('✅ Sermon tables, indexes, and search vector created successfully');
  } catch (error) {
    console.error('Error creating sermon tables:', error.message);
  }
}

async function insertSampleData() {
  try {
    console.log('Inserting sample sermon data...');

    // Insert some sample sermon series
    const seriesSampleData = [
      {
        title: 'The Beatitudes',
        description: 'A deep dive into the teaching of Jesus in Matthew 5',
        image_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermon_series%2Fbeatitudes.jpg?alt=media',
        start_date: '2025-01-05',
        end_date: '2025-02-25',
        is_active: true
      },
      {
        title: 'Romans: Faith and Grace',
        description: 'Exploring the theology of Paul in the book of Romans',
        image_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermon_series%2Fromans.jpg?alt=media',
        start_date: '2025-03-02',
        end_date: '2025-04-20',
        is_active: true
      },
      {
        title: 'Spiritual Disciplines',
        description: 'Learning practices to grow in faith and maturity',
        image_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermon_series%2Fdisciplines.jpg?alt=media',
        start_date: '2025-05-04',
        end_date: null,
        is_active: true
      }
    ];

    const { data: seriesData, error: seriesError } = await supabase
      .from('sermon_series')
      .upsert(seriesSampleData, { onConflict: 'title' })
      .select();

    if (seriesError) throw new Error(`Error inserting sermon series: ${seriesError.message}`);
    console.log('✅ Sample sermon series data inserted');

    // Get the series IDs for reference
    const beatitudesSeriesId = seriesData.find(series => series.title === 'The Beatitudes')?.id;
    const romansSeriesId = seriesData.find(series => series.title === 'Romans: Faith and Grace')?.id;
    const disciplinesSeriesId = seriesData.find(series => series.title === 'Spiritual Disciplines')?.id;

    // Insert sample sermons
    const sermonSampleData = [
      {
        title: 'Blessed Are the Poor in Spirit',
        description: 'Understanding the foundation of Jesus\' teaching in the Beatitudes',
        scripture_reference: 'Matthew 5:3',
        speaker_name: 'Pastor John Davis',
        sermon_date: '2025-01-05',
        duration_seconds: 2340, // 39 minutes
        audio_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Fbeatitudes_1_audio.mp3?alt=media',
        video_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Fbeatitudes_1_video.mp4?alt=media',
        thumbnail_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Fbeatitudes_1_thumb.jpg?alt=media',
        tags: ['beatitudes', 'matthew', 'humility'],
        series_id: beatitudesSeriesId,
        is_featured: true,
        is_published: true
      },
      {
        title: 'Blessed Are Those Who Mourn',
        description: 'Finding comfort in times of grief and sorrow',
        scripture_reference: 'Matthew 5:4',
        speaker_name: 'Pastor John Davis',
        sermon_date: '2025-01-12',
        duration_seconds: 2520, // 42 minutes
        audio_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Fbeatitudes_2_audio.mp3?alt=media',
        thumbnail_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Fbeatitudes_2_thumb.jpg?alt=media',
        tags: ['beatitudes', 'matthew', 'grief', 'comfort'],
        series_id: beatitudesSeriesId,
        is_published: true
      },
      {
        title: 'Justification by Faith',
        description: 'Paul\'s central argument for salvation by faith alone',
        scripture_reference: 'Romans 3:21-26',
        speaker_name: 'Pastor Sarah Wilson',
        sermon_date: '2025-03-02',
        duration_seconds: 2760, // 46 minutes
        audio_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Fromans_1_audio.mp3?alt=media',
        video_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Fromans_1_video.mp4?alt=media',
        thumbnail_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Fromans_1_thumb.jpg?alt=media',
        tags: ['romans', 'justification', 'faith', 'grace'],
        series_id: romansSeriesId,
        is_featured: true,
        is_published: true
      },
      {
        title: 'The Discipline of Prayer',
        description: 'Developing a consistent prayer life for spiritual growth',
        scripture_reference: '1 Thessalonians 5:16-18',
        speaker_name: 'Pastor Michael Johnson',
        sermon_date: '2025-05-04',
        duration_seconds: 2460, // 41 minutes
        audio_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Fdiscipline_1_audio.mp3?alt=media',
        video_url: null,
        thumbnail_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Fdiscipline_1_thumb.jpg?alt=media',
        tags: ['prayer', 'discipline', 'spiritual growth'],
        series_id: disciplinesSeriesId,
        is_published: true
      },
      {
        title: 'The Discipline of Scripture Study',
        description: 'Methods for effective Bible study and application',
        scripture_reference: '2 Timothy 3:16-17',
        speaker_name: 'Pastor Michael Johnson',
        sermon_date: '2025-05-11',
        duration_seconds: 2580, // 43 minutes
        audio_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Fdiscipline_2_audio.mp3?alt=media',
        video_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Fdiscipline_2_video.mp4?alt=media',
        thumbnail_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Fdiscipline_2_thumb.jpg?alt=media',
        tags: ['bible study', 'scripture', 'discipline'],
        series_id: disciplinesSeriesId,
        is_featured: false,
        is_published: true
      },
      // Archived/unpublished sermon for testing admin functionality
      {
        title: 'Faith in Action',
        description: 'Exploring how faith should be lived out in everyday life',
        scripture_reference: 'James 2:14-26',
        speaker_name: 'Guest Speaker Dr. Lisa Thompson',
        sermon_date: '2025-02-15',
        duration_seconds: 2700, // 45 minutes
        audio_url: 'https://firebasestorage.googleapis.com/v0/b/rehoboth-church.appspot.com/o/sermons%2Ffaith_action_audio.mp3?alt=media',
        tags: ['faith', 'works', 'james'],
        is_published: false
      }
    ];

    const { error: sermonError } = await supabase
      .from('sermons')
      .upsert(sermonSampleData)
      .select();

    if (sermonError) throw new Error(`Error inserting sermons: ${sermonError.message}`);
    console.log('✅ Sample sermon data inserted');

  } catch (error) {
    console.error('Error inserting sample data:', error.message);
  }
}

async function setupSermonSchema() {
  try {
    // First check if tables already exist
    const { data, error } = await supabase
      .from('sermon_series')
      .select('count(*)', { count: 'exact', head: true });
    
    // We'll proceed with setup regardless of the error (which might indicate table doesn't exist yet)
    
    await createSermonTables();
    await insertSampleData();
    
    console.log('✅ Sermon schema setup complete');
  } catch (error) {
    console.error('Error setting up sermon schema:', error.message);
  }
}

setupSermonSchema();
