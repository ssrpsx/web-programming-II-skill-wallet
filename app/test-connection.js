const BASE = process.env.API_URL || "http://localhost:8080/api";
console.log(`Testing connection to ${BASE}/health`);

async function test() {
  try {
    const res = await fetch(`${BASE}/health`);
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log("Data:", data);
  } catch (e) {
    console.error("Connection failed:", e.message);
  }
}

test();
