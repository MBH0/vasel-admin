import 'dotenv/config';

const STRAPI_URL = 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

async function checkAllDetails() {
  console.log('📋 Checking ALL services (including drafts)...\n');

  const res = await fetch(`${STRAPI_URL}/api/services?locale=all&status=draft&status=published&pagination[pageSize]=100`, {
    headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
  });

  const data = await res.json();

  console.log(`Found ${data.data.length} total services\n`);

  data.data.forEach(s => {
    const flag = s.locale === 'es' ? '🇪🇸' : '🇬🇧';
    console.log(`${flag} ${s.name}`);
    console.log(`   ID: ${s.documentId}`);
    console.log(`   Locale: ${s.locale}`);
    console.log(`   Published: ${s.publishedAt ? 'YES' : 'DRAFT'}`);
    console.log(`   Created: ${s.createdAt}`);
    console.log('');
  });
}

checkAllDetails();
