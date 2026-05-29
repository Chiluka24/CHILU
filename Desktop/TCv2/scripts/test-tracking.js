/**
 * Test Script: Real-Time Tracking System
 * 
 * This script simulates user interactions to test the tracking system.
 * Run with: node scripts/test-tracking.js
 */

const API_URL = process.env.API_URL || 'http://localhost:5000';

// Simulate a profile view
async function simulateProfileView(username) {
  const sessionId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`\n📊 Simulating profile view for: ${username}`);
  console.log(`   Session ID: ${sessionId}`);
  
  try {
    const response = await fetch(`${API_URL}/api/public/track-impression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle: username,
        eventType: 'load',
        sessionId,
        countryCode: 'US',
        countryName: 'United States',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows 10'
      })
    });
    
    const data = await response.json();
    console.log(`   ✅ Profile view tracked:`, data);
    
    return sessionId;
  } catch (error) {
    console.error(`   ❌ Error tracking profile view:`, error.message);
    return null;
  }
}

// Simulate a link click
async function simulateLinkClick(linkId, sessionId) {
  console.log(`\n🖱️  Simulating link click: ${linkId}`);
  console.log(`   Session ID: ${sessionId}`);
  
  try {
    const response = await fetch(`${API_URL}/api/public/click/${linkId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        countryCode: 'US',
        countryName: 'United States'
      })
    });
    
    const data = await response.json();
    console.log(`   ✅ Click tracked:`, data);
  } catch (error) {
    console.error(`   ❌ Error tracking click:`, error.message);
  }
}

// Simulate page unload
async function simulatePageUnload(username, sessionId, timeSpent) {
  console.log(`\n👋 Simulating page unload for: ${username}`);
  console.log(`   Session ID: ${sessionId}`);
  console.log(`   Time spent: ${timeSpent}s`);
  
  try {
    const response = await fetch(`${API_URL}/api/public/track-impression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle: username,
        eventType: 'unload',
        sessionId,
        timeSpent
      })
    });
    
    const data = await response.json();
    console.log(`   ✅ Page unload tracked:`, data);
  } catch (error) {
    console.error(`   ❌ Error tracking page unload:`, error.message);
  }
}

// Test dashboard endpoint
async function testDashboard(token) {
  console.log(`\n📈 Testing dashboard endpoint...`);
  
  try {
    const response = await fetch(`${API_URL}/api/dashboard`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`   ✅ Dashboard data fetched successfully`);
      console.log(`   Stats:`, data.data.stats.map(s => `${s.title}: ${s.value}`).join(', '));
      console.log(`   Top links: ${data.data.topLinks.length}`);
      console.log(`   Chart data points: ${data.data.chartData.length}`);
    } else {
      console.log(`   ❌ Dashboard fetch failed:`, data.error);
    }
  } catch (error) {
    console.error(`   ❌ Error fetching dashboard:`, error.message);
  }
}

// Test analytics endpoint
async function testAnalytics(token) {
  console.log(`\n📊 Testing analytics endpoint...`);
  
  try {
    const response = await fetch(`${API_URL}/api/analytics`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.links) {
      console.log(`   ✅ Analytics data fetched successfully`);
      console.log(`   Links: ${data.links.length}`);
      console.log(`   Countries: ${data.countries?.length || 0}`);
      console.log(`   Devices: ${data.devices?.length || 0}`);
      console.log(`   Browsers: ${data.browsers?.length || 0}`);
      
      if (data.devices && data.devices.length > 0) {
        console.log(`   Device breakdown:`, data.devices.map(d => `${d.device}: ${d.percentage}%`).join(', '));
      }
    } else {
      console.log(`   ❌ Analytics fetch failed:`, data.error);
    }
  } catch (error) {
    console.error(`   ❌ Error fetching analytics:`, error.message);
  }
}

// Main test flow
async function runTests() {
  console.log('🚀 Starting Real-Time Tracking Tests\n');
  console.log(`API URL: ${API_URL}\n`);
  console.log('=' .repeat(60));
  
  // Get test parameters from command line
  const username = process.argv[2] || 'testuser';
  const linkId = process.argv[3];
  const token = process.argv[4];
  
  if (!linkId) {
    console.log('\n⚠️  Usage: node scripts/test-tracking.js <username> <linkId> [token]');
    console.log('   Example: node scripts/test-tracking.js john 507f1f77bcf86cd799439011 eyJhbGc...');
    console.log('\n   To get a linkId:');
    console.log('   1. Log in to your app');
    console.log('   2. Go to Links page');
    console.log('   3. Copy a link ID from the URL or inspect element\n');
    process.exit(1);
  }
  
  // Test 1: Profile view
  const sessionId = await simulateProfileView(username);
  
  if (!sessionId) {
    console.log('\n❌ Profile view tracking failed. Check if server is running.');
    process.exit(1);
  }
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Link click
  await simulateLinkClick(linkId, sessionId);
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Another link click (same session)
  await simulateLinkClick(linkId, sessionId);
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 4: Page unload
  await simulatePageUnload(username, sessionId, 45);
  
  // Test 5: Dashboard (if token provided)
  if (token) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testDashboard(token);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testAnalytics(token);
  } else {
    console.log('\n⚠️  Skipping dashboard/analytics tests (no token provided)');
    console.log('   To test dashboard: node scripts/test-tracking.js <username> <linkId> <token>');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!\n');
  console.log('Next steps:');
  console.log('1. Check MongoDB for new records:');
  console.log('   db.profileviews.find().sort({createdAt:-1}).limit(1)');
  console.log('   db.linkclicks.find().sort({createdAt:-1}).limit(2)');
  console.log('2. Open dashboard and verify data updates');
  console.log('3. Open analytics and check device/browser data\n');
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
});
