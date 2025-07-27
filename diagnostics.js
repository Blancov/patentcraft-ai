// Simplified diagnostics without external dependencies
async function runDiagnostics() {
  console.log('=== Starting Diagnostics ===\n');
  
  // 1. Environment Variables Check
  console.log('[1] Environment Variables:');
  console.log(`DEEPSEEK_API_KEY: ${process.env.DEEPSEEK_API_KEY ? 'Exists' : 'MISSING'}`);
  console.log(`VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL ? 'Exists' : 'MISSING'}`);
  console.log(`VITE_SUPABASE_ANON_KEY: ${process.env.VITE_SUPABASE_ANON_KEY ? 'Exists' : 'MISSING'}\n`);
  
  // 2. Netlify Function Test
  console.log('[2] Testing Netlify Function Locally...');
  try {
    const response = await fetch('http://localhost:8888/.netlify/functions/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    });
    console.log(`Response Status: ${response.status}`);
    console.log(`Response Body: ${await response.text()}\n`);
  } catch (error) {
    console.error(`Function Test Error: ${error.message}\n`);
  }
  
  // 3. DeepSeek API Test
  console.log('[3] Testing DeepSeek API...');
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: { 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` }
      });
      console.log(`API Status: ${response.status}`);
      console.log(`API Response: ${response.status === 200 ? 'Success' : await response.text()}\n`);
    } catch (error) {
      console.error(`API Test Error: ${error.message}\n`);
    }
  } else {
    console.log('Skipped: DEEPSEEK_API_KEY missing\n');
  }
  
  // 4. Supabase Connection Test
  console.log('[4] Testing Supabase Connection...');
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
    try {
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/`, {
        headers: { 'apikey': process.env.VITE_SUPABASE_ANON_KEY }
      });
      console.log(`Supabase Status: ${response.status}`);
      console.log(`Supabase Response: ${response.status === 200 ? 'Success' : await response.text()}\n`);
    } catch (error) {
      console.error(`Supabase Connection Error: ${error.message}\n`);
    }
  } else {
    console.log('Skipped: Supabase credentials missing\n');
  }
  
  console.log('=== Diagnostics Complete ===');
}

// Run diagnostics if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDiagnostics();
}