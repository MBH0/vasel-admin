import 'dotenv/config';

const STRAPI_URL = 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

async function restartCheck() {
  console.log('Requesting fresh data from Strapi...\n');
  
  // Force fresh data by adding timestamp
  const timestamp = Date.now();
  
  const esRes = await fetch(`${STRAPI_URL}/api/services?locale=es&_t=${timestamp}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  const esData = await esRes.json();
  
  const enRes = await fetch(`${STRAPI_URL}/api/services?locale=en&_t=${timestamp}`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache'
    }
  });
  const enData = await enRes.json();
  
  console.log('🇪🇸 SPANISH:', esData.data.length);
  esData.data.forEach(s => console.log(`  - ${s.name} (${s.documentId})`));
  
  console.log('\n🇬🇧 ENGLISH:', enData.data.length);
  enData.data.forEach(s => console.log(`  - ${s.name} (${s.documentId})`));
}

restartCheck();
