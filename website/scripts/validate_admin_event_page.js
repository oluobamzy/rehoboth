const fs = require('fs');
const path = require('path');

function validateAdminEventPage() {
  console.log('🔍 Validating Admin Event Edit Page...');
  console.log('=====================================');
  
  try {
    const filePath = path.join(__dirname, '../src/app/admin/events/[id]/page.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for key components we added
    const checks = [
      {
        name: 'Image import from Next.js',
        pattern: /import Image from ['"]next\/image['"];?/,
        required: true
      },
      {
        name: 'Event Preview Section',
        pattern: /Event Preview Section/,
        required: true
      },
      {
        name: 'Image display with error handling',
        pattern: /onError.*console\.error.*Error loading admin event image/s,
        required: true
      },
      {
        name: 'Success logging for image load',
        pattern: /onLoad.*console\.log.*Admin event image loaded successfully/s,
        required: true
      },
      {
        name: 'No image fallback display',
        pattern: /No Image Available/,
        required: true
      },
      {
        name: 'Image container with proper styling',
        pattern: /relative w-full h-48 md:h-64 rounded-lg overflow-hidden/,
        required: true
      },
      {
        name: 'Event basic info grid',
        pattern: /grid grid-cols-1 md:grid-cols-2 gap-4/,
        required: true
      }
    ];
    
    let allPassed = true;
    
    for (const check of checks) {
      const found = check.pattern.test(content);
      const status = found ? '✅' : '❌';
      console.log(`${status} ${check.name}`);
      
      if (check.required && !found) {
        allPassed = false;
      }
    }
    
    console.log('');
    if (allPassed) {
      console.log('🎉 All validation checks passed!');
      console.log('');
      console.log('📝 Summary of added features:');
      console.log('• Event preview section with image display');
      console.log('• Proper error handling for image loading');
      console.log('• Fallback display for events without images');
      console.log('• Event basic information display');
      console.log('• Responsive design with proper styling');
      console.log('');
      console.log('🚀 Next steps:');
      console.log('1. Start the Next.js development server');
      console.log('2. Navigate to /admin/events/{event_id}');
      console.log('3. Verify the preview section displays event images');
      console.log('4. Test with events that have and don\'t have images');
    } else {
      console.log('❌ Some validation checks failed. Please review the code.');
    }
    
  } catch (error) {
    console.error('❌ Error reading admin event page file:', error.message);
  }
}

validateAdminEventPage();