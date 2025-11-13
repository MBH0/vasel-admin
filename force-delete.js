import 'dotenv/config';

const STRAPI_URL = 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

const servicesToDelete = [
  { id: 'xodhign8pdscokdrpikw8xqx', name: 'Work Residence Permit' },
  { id: 'm57blih4y3npjvxmebpyl46g', name: 'Spanish Citizenship' },
  { id: 'du9kkcfp6ax398ra2qev3400', name: 'Family Reunification' },
  { id: 'bl5phezho86d68aa67xqwd44', name: 'Social Roots Residence' },
  { id: 'ssooqubswt8l91jum0heam8i', name: 'Visa and Stay Authorization for Studies' },
  { id: 'pza84rknlka1x64f3up4em5s', name: 'Temporary Residence and Work Authorization for Employment' }
];

async function forceDelete() {
  console.log('🗑️  Force deleting services...\n');

  for (const service of servicesToDelete) {
    try {
      const res = await fetch(`${STRAPI_URL}/api/services/${service.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
      });

      const status = res.status;
      console.log(`  ${status === 200 || status === 204 ? '✅' : '❌'} ${service.name} (${status})`);

      if (!res.ok && status !== 404) {
        const text = await res.text();
        console.log(`     Error: ${text.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`  ❌ ${service.name}: ${error.message}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n✨ Done!');
}

forceDelete();
