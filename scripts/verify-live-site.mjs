
import https from 'https';

const URL = 'https://microjpeg.com/convert/jpg-to-png';
const UA = 'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)';

console.log(`Checking ${URL} as ${UA}...`);

const req = https.get(URL, { headers: { 'User-Agent': UA } }, (res) => {
    let data = '';

    console.log(`Status Code: ${res.statusCode}`);
    const isStatic = res.headers['x-rendered-by'] === 'MicroJPEG-SEO-Static';
    console.log(`X-Rendered-By Header: ${res.headers['x-rendered-by'] || 'MISSING'}`);

    res.on('data', (chunk) => data += chunk);

    res.on('end', () => {
        const hasFooter = data.includes('<footer');
        const hasCanonical = data.includes('rel="canonical"');
        const linkCount = (data.match(/href/g) || []).length;

        console.log('\n--- Content Check ---');
        console.log(`Has Footer: ${hasFooter ? '✅ YES' : '❌ NO'}`);
        console.log(`Has Canonical: ${hasCanonical ? '✅ YES' : '❌ NO'}`);
        console.log(`Link Count: ${linkCount}`);

        if (data.includes('id="root"') && data.length < 5000) {
            console.log('⚠️  Looks like React Shell (Client-side rendering)');
        } else {
            console.log('✅ Looks like Prerendered HTML');
        }

        if (!hasFooter) {
            console.log('\n❌ FAILURE: Footer missing. Bot detection failed or static file is empty.');
        } else {
            console.log('\n✅ SUCCESS: Bot detection working and serving content.');
        }
    });
});

req.on('error', (e) => {
    console.error(e);
});
