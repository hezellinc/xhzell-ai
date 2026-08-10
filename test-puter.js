import puter from '@heyputer/puter.js';
async function test() {
  try {
    const res = await puter.ai.chat([{role: "user", content: "Hello"}], { model: 'claude-3-5-sonnet' });
    console.log(JSON.stringify(res));
  } catch(e) {
    console.error(e);
  }
}
test();
