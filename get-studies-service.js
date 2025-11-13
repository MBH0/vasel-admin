import 'dotenv/config';

const STRAPI_URL = 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

async function getService() {
  const res = await fetch(`${STRAPI_URL}/api/services?locale=en&filters[documentId][$eq]=ssooqubswt8l91jum0heam8i`, {
    headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data.data[0], null, 2));
}

getService();
