// Mock Supabase response data
export const mockSermons = [
  {
    id: 'sermon123',
    title: 'Test Sermon',
    description: 'A test sermon',
    speaker_name: 'Pastor John',
    sermon_date: '2025-01-01',
    series: {
      id: 'series123',
      title: 'Test Series',
      description: 'A test series'
    }
  }
];

// Mock Supabase client
const returnThis = { data: mockSermons };
Object.assign(returnThis, {
  select: jest.fn().mockReturnValue(returnThis),
  eq: jest.fn().mockReturnValue(returnThis),
  range: jest.fn().mockReturnValue(returnThis),
  order: jest.fn().mockReturnValue(returnThis),
  single: jest.fn().mockReturnValue(returnThis)
});

export const mockSupabase = {
  from: jest.fn().mockReturnValue(returnThis)
};
