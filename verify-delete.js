import 'dotenv/config';

const STRAPI_URL = 'https://strapivasel.diegosalazarvl.com';
const STRAPI_TOKEN = process.env.STRAPI_FULL_TOKEN;

const toCheck = [
  'xodhign8pdscokdrpikw8xqx',
  'm57blih4y3npjvxmebpyl46g',
  'du9kkcfp6ax398ra2qev3400',
  'bl5phezho86d68aa67xqwd44'
];

async function verify() {
  for (const id of toCheck) {
    const res = await fetch(`${STRAPI_URL}/api/services/${id}`, {
      headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
    });
    console.log(`${id}: ${res.status} ${res.ok ? 'EXISTS' : 'NOT FOUND'}`);
  }
}

verify();
