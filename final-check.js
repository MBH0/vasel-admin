import 'dotenv/config';

const STRAPI_URL = 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

async function finalCheck() {
  const esRes = await fetch(`${STRAPI_URL}/api/services?locale=es&pagination[pageSize]=100`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      'Cache-Control': 'no-cache'
    }
  });
  const esData = await esRes.json();

  const enRes = await fetch(`${STRAPI_URL}/api/services?locale=en&pagination[pageSize]=100`, {
    headers: {
      'Authorization': `Bearer ${STRAPI_TOKEN}`,
      'Cache-Control': 'no-cache'
    }
  });
  const enData = await enRes.json();

  console.log('✨ FINAL STATE:\n');
  console.log('🇪🇸 SPANISH:');
  esData.data.forEach(s => console.log(`  ✅ ${s.name}`));

  console.log('\n🇬🇧 ENGLISH:');
  enData.data.forEach(s => console.log(`  ✅ ${s.name}`));

  console.log(`\n📊 Total: ${esData.data.length} ES + ${enData.data.length} EN = ${esData.data.length + enData.data.length} services`);
}

finalCheck();
