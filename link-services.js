import 'dotenv/config';

const STRAPI_URL = 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

const pairs = [
  {
    name: 'Studies',
    es: 'x238q7nbwg9503furwqgnca1', // Visado/Autorización de Estancia por Estudios
    en: 'ssooqubswt8l91jum0heam8i'  // Visa and Stay Authorization for Studies
  },
  {
    name: 'Work',
    es: 'hvehyseu8fri59jw4gpubp75', // Autorización de Residencia Temporal y Trabajo
    en: 'pza84rknlka1x64f3up4em5s'  // Temporary Residence and Work Authorization
  }
];

async function linkServices() {
  console.log('🔗 Linking services...\n');

  for (const pair of pairs) {
    console.log(`📋 ${pair.name}:`);
    
    // Link ES -> EN
    const linkES = await fetch(`${STRAPI_URL}/api/services/${pair.es}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${STRAPI_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: {
          localizations: {
            connect: [{ documentId: pair.en }]
          }
        }
      })
    });

    const esStatus = linkES.ok ? '✅' : '❌';
    console.log(`  ${esStatus} ES (${pair.es}) -> EN (${pair.en})`);

    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n✨ Done!');
}

linkServices();
