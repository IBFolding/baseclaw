// Manual Cookie Helper for Twitter
// Run this in your browser console AFTER logging into Twitter

(function exportTwitterCookies() {
  const cookies = document.cookie.split(';').map(c => {
    const [name, ...valueParts] = c.trim().split('=');
    return {
      name: name,
      value: valueParts.join('='),
      domain: '.twitter.com',
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: true,
      sameSite: 'None'
    };
  });
  
  // Also get localStorage
  const storage = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    storage[key] = localStorage.getItem(key);
  }
  
  const data = {
    cookies: cookies,
    localStorage: storage,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
  
  // Copy to clipboard
  const json = JSON.stringify(data, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    console.log('✅ Twitter session copied to clipboard!');
    console.log('Paste this into twitter-session.json file');
  });
  
  // Also log it
  console.log('\n=== TWITTER SESSION DATA ===\n');
  console.log(json);
  console.log('\n===========================\n');
  
  return json;
})();