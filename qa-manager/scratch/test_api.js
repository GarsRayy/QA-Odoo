async function test() {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/tests/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grep: 'HP-01', docMode: false })
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const decoder = new TextDecoder();
    for await (const chunk of res.body) {
      console.log(decoder.decode(chunk));
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}
test();
