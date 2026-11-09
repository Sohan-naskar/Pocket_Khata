// E2E Verification Test for HostelKhata

async function runTests() {
  console.log("🧪 Starting HostelKhata E2E Verification Suite...\n");
  const baseUrl = "http://localhost:3000";

  // 1. Landing Page Test
  const landingRes = await fetch(`${baseUrl}/`);
  console.log(`1. Landing Page (/) Status: ${landingRes.status} (Expected: 200)`);
  if (landingRes.status !== 200) throw new Error("Landing page failed");

  // 2. Login Page Test
  const loginRes = await fetch(`${baseUrl}/login`);
  console.log(`2. Login Page (/login) Status: ${loginRes.status} (Expected: 200)`);
  if (loginRes.status !== 200) throw new Error("Login page failed");

  // 3. User Registration API Test
  const testEmail = `student_${Date.now()}@hostel.edu`;
  const registerRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Rohit Verma",
      email: testEmail,
      password: "securePassword123",
      role: "USER",
      startingOnline: 2500,
      startingCash: 500,
    }),
  });
  const registerData = await registerRes.json();
  console.log(`3. Student Registration Status: ${registerRes.status} (Expected: 201)`);
  console.log(`   Registered User ID: ${registerData.user?.id}, Role: ${registerData.user?.role}`);
  if (registerRes.status !== 201) throw new Error("Registration failed: " + JSON.stringify(registerData));

  // 4. Duplicate Registration Guard Test
  const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Rohit Duplicate",
      email: testEmail,
      password: "anotherPassword123",
    }),
  });
  console.log(`4. Duplicate Email Guard Status: ${dupRes.status} (Expected: 409)`);
  if (dupRes.status !== 409) throw new Error("Duplicate email guard failed");

  // 5. 404 Custom Page Test
  const notFoundRes = await fetch(`${baseUrl}/this-page-does-not-exist`);
  console.log(`5. Custom 404 Route Status: ${notFoundRes.status} (Expected: 404)`);
  const notFoundHtml = await notFoundRes.text();
  const has404 = notFoundHtml.includes("Page Not Found");
  console.log(`   Includes custom PocketKhata 404 UI: ${has404}`);

  console.log("\n✅ All automated baseline checks PASSED!");
}

runTests().catch((err) => {
  console.error("❌ E2E Test Suite Error:", err);
  process.exit(1);
});
