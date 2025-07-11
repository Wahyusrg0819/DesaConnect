// Test script untuk memverifikasi admin registration flow
// Jalankan di console browser atau Node.js environment

async function testAdminRegistrationFlow() {
  console.log('🧪 Testing Admin Registration Flow...\n');
  
  // Test 1: Email yang sudah ditambahkan SuperAdmin
  console.log('📧 Test 1: Email sudah di admin_list database');
  const testEmail = 'test.admin@example.com';
  
  try {
    const response = await fetch('/api/admin/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        nama: 'Test Admin',
        password: 'TestPassword123',
        phone: '081234567890'
      })
    });
    
    const result = await response.json();
    console.log('✅ Registration result:', result);
  } catch (error) {
    console.error('❌ Registration error:', error);
  }
  
  // Test 2: Email yang belum diauthorize
  console.log('\n📧 Test 2: Email belum diauthorize');
  const unauthorizedEmail = 'unauthorized@example.com';
  
  try {
    const response = await fetch('/api/admin/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: unauthorizedEmail,
        nama: 'Unauthorized User',
        password: 'TestPassword123',
        phone: '081234567890'
      })
    });
    
    const result = await response.json();
    console.log('❌ Should fail:', result);
  } catch (error) {
    console.error('✅ Expected error:', error);
  }
}

// Untuk test manual
console.log(`
🔧 Manual Test Instructions:

1. SuperAdmin Login:
   Email: wahyumuliadisiregar@student.uir.ac.id
   Password: Admin123456

2. Add new admin via Settings dashboard:
   - Go to /admin/settings
   - Add email: newadmin@test.com
   
3. Test registration for new email:
   - Go to /admin/register
   - Use email: newadmin@test.com
   - Fill other details
   - Should succeed ✅

4. Test unauthorized email:
   - Use email: random@notauthorized.com
   - Should fail ❌
`);

// Export untuk penggunaan
if (typeof module !== 'undefined') {
  module.exports = { testAdminRegistrationFlow };
}
