import puter from '@heyputer/puter.js';
async function test() {
  try {
    const res = await puter.ai.chat("hello");
    console.log("Default model worked:", res);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();
