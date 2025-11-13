import 'dotenv/config';

const STRAPI_URL = 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

// SOLO los servicios VIEJOS del 11 de noviembre (NO tocar los del 13)
const oldOrphans = [
  { id: 'xodhign8pdscokdrpikw8xqx', name: 'Work Residence Permit', date: '2025-11-11' },
  { id: 'm57blih4y3npjvxmebpyl46g', name: 'Spanish Citizenship', date: '2025-11-11' },
  { id: 'du9kkcfp6ax398ra2qev3400', name: 'Family Reunification', date: '2025-11-11' },
  { id: 'bl5phezho86d68aa67xqwd44', name: 'Social Roots Residence', date: '2025-11-11' }
];

async function deleteOldOrphans() {
  console.log('🗑️  Deleting OLD orphaned services from Nov 11...\n');
  console.log('⚠️  KEEPING these services (Nov 13):');
  console.log('   - ssooqubswt8l91jum0heam8i (Visa and Stay - EN)');
  console.log('   - pza84rknlka1x64f3up4em5s (Work Authorization - EN)');
  console.log('   - x238q7nbwg9503furwqgnca1 (Estudios - ES)');
  console.log('   - hvehyseu8fri59jw4gpubp75 (Trabajo - ES)\n');

  for (const service of oldOrphans) {
    const res = await fetch(`${STRAPI_URL}/api/services/${service.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
    });

    console.log(`  ${res.ok ? '✅' : '❌'} ${service.name} (${service.date})`);
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n✨ Done!');
}

deleteOldOrphans();
