import 'dotenv/config';

const STRAPI_URL = 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

async function analyzeServices() {
  console.log('📊 Analyzing services in detail...\n');
  
  const esRes = await fetch(`${STRAPI_URL}/api/services?locale=es&pagination[pageSize]=100`, {
    headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
  });
  const esData = await esRes.json();
  
  const enRes = await fetch(`${STRAPI_URL}/api/services?locale=en&pagination[pageSize]=100`, {
    headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
  });
  const enData = await enRes.json();
  
  console.log('🇪🇸 SPANISH SERVICES:');
  esData.data.forEach(s => {
    console.log(`  📄 ${s.name}`);
    console.log(`     ID: ${s.documentId}`);
    console.log(`     Slug: ${s.slug}`);
    console.log(`     Created: ${s.createdAt}`);
    console.log('');
  });
  
  console.log('🇬🇧 ENGLISH SERVICES:');
  enData.data.forEach(s => {
    console.log(`  📄 ${s.name}`);
    console.log(`     ID: ${s.documentId}`);
    console.log(`     Slug: ${s.slug}`);
    console.log(`     Created: ${s.createdAt}`);
    console.log('');
  });
}

analyzeServices();
