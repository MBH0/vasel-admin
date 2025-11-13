import 'dotenv/config';

const STRAPI_URL = 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

const orphanedServices = [
  'xodhign8pdscokdrpikw8xqx', // Work Residence Permit
  'm57blih4y3npjvxmebpyl46g', // Spanish Citizenship
  'du9kkcfp6ax398ra2qev3400', // Family Reunification
  'bl5phezho86d68aa67xqwd44'  // Social Roots Residence
];

async function deleteOrphans() {
  console.log('🗑️  Deleting orphaned English services...\n');
  
  for (const docId of orphanedServices) {
    try {
      const res = await fetch(`${STRAPI_URL}/api/services/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
      });
      
      if (res.ok) {
        console.log(`✅ Deleted ${docId}`);
      } else {
        console.log(`❌ Failed to delete ${docId}: ${res.status}`);
      }
    } catch (error) {
      console.log(`❌ Error deleting ${docId}:`, error.message);
    }
  }
  
  console.log('\n✨ Done!');
}

deleteOrphans();
