import 'dotenv/config';

const STRAPI_URL = process.env.STRAPI_URL || 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

async function checkServices() {
  console.log('📋 Fetching services from Strapi...\n');
  
  // Fetch Spanish services
  const esRes = await fetch(`${STRAPI_URL}/api/services?locale=es&pagination[pageSize]=100`, {
    headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
  });
  const esData = await esRes.json();
  
  // Fetch English services
  const enRes = await fetch(`${STRAPI_URL}/api/services?locale=en&pagination[pageSize]=100`, {
    headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
  });
  const enData = await enRes.json();
  
  console.log('🇪🇸 SPANISH SERVICES:');
  esData.data.forEach(s => console.log(`  - ${s.name} (${s.documentId})`));
  
  console.log('\n🇬🇧 ENGLISH SERVICES:');
  enData.data.forEach(s => console.log(`  - ${s.name} (${s.documentId})`));
  
  console.log(`\nTotal: ${esData.data.length} Spanish, ${enData.data.length} English`);
}

checkServices();
