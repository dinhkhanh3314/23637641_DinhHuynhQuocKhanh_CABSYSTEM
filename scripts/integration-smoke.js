const services = [
  ["API Gateway", process.env.GATEWAY_URL || "http://localhost:3000/health"],
  ["Auth Service", "http://localhost:3001/health"],
  ["Customer Service", "http://localhost:3002/health"],
  ["Driver Service", "http://localhost:3003/health"],
  ["Booking Service", "http://localhost:3004/health"],
  ["Trip Service", "http://localhost:3005/health"],
  ["Payment Service", "http://localhost:3006/health"],
  ["Notification Service", "http://localhost:3007/health"],
];

async function checkService(name, url) {
  try {
    const response = await fetch(url);
    const body = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${body}`);
    }

    console.log(`[PASS] ${name}: ${response.status}`);
    return true;
  } catch (error) {
    console.error(`[FAIL] ${name}: ${error.message}`);
    return false;
  }
}

async function main() {
  const results = await Promise.all(
    services.map(([name, url]) => checkService(name, url)),
  );

  if (results.some((result) => !result)) {
    process.exitCode = 1;
    console.error("Integration smoke test failed.");
    return;
  }

  console.log("Integration smoke test passed.");
}

main().catch((error) => {
  console.error("Integration smoke test error:", error);
  process.exitCode = 1;
});
