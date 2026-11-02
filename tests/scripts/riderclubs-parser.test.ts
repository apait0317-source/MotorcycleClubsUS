import test from 'node:test';
import assert from 'node:assert/strict';

async function parser() {
  const api = await import('@/scripts/lib/riderclubs-parser').catch(() => ({})) as typeof import('@/scripts/lib/riderclubs-parser');
  assert.equal(typeof api.parseRiderClubListings, 'function');
  return api.parseRiderClubListings;
}

const organization = () => ({
  '@type': 'Organization', name: 'Example Ministry',
  description: 'Unlike a Motorcycle Club, this sentence describes the organization.',
  url: 'https://www.riderclubs.com/club/example-ministry',
  location: { '@type': 'Place', address: {
    '@type': 'PostalAddress', streetAddress: '12 Main Street',
    addressLocality: 'Modesto', addressRegion: 'CA', addressCountry: 'US',
  } },
});
const markup = (value: unknown) => `<script type="application/ld+json">${JSON.stringify(value)}</script>`;

test('listing identity and locality come from the ItemList entity, never description prose or the search city', async () => {
  const parse = await parser();
  const html = `<h1>Clubs near San Francisco</h1><p>Unlike a Motorcycle Club</p>${markup({
    '@type': 'ItemList', itemListElement: [{ '@type': 'ListItem', position: 1, item: organization() }],
  })}`;
  const rows = parse(html);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Example Ministry');
  assert.equal(rows[0].city, 'Modesto');
  assert.equal(rows[0].stateCode, 'ca');
  assert.equal(rows[0].state, 'California');
  assert.equal(rows[0].address, '12 Main Street, Modesto, CA');
  assert.equal(rows[0].sourceUrl, 'https://www.riderclubs.com/club/example-ministry');
});

test('page prose, layout headings and publisher metadata cannot create an organization', async () => {
  const parse = await parser();
  assert.deepEqual(parse('<h2>Unlike a Motorcycle Club</h2><p>It was the first American branch of the Norton Owners Club</p>'), []);
  assert.deepEqual(parse(markup({ ...organization(), name: 'Directory Publisher', url: 'https://www.riderclubs.com/' })), []);
});

test('missing or foreign locations and unsafe or unrelated detail URLs are skipped', async () => {
  const parse = await parser();
  const original = organization();
  const address = original.location.address;
  const cases = [
    { ...original, location: undefined },
    { ...original, location: { address: { ...address, addressLocality: '' } } },
    { ...original, location: { address: { ...address, addressCountry: 'CA' } } },
    { ...original, location: { address: { ...address, addressCountry: undefined } } },
    { ...original, location: { address: { ...address, addressRegion: 'ZZ' } } },
    { ...original, url: 'https://unrelated.example/club/example-ministry' },
    { ...original, url: 'https://user:pass@www.riderclubs.com/club/example-ministry' },
    { ...original, url: 'javascript:alert(1)' },
  ];
  for (const value of cases) assert.deepEqual(parse(markup(value)), []);
});

test('graph and array wrappers preserve supported entities with direct postal addresses', async () => {
  const parse = await parser();
  const original = organization();
  const value = { ...original, '@type': ['Organization', 'SportsClub'], location: undefined,
    address: { ...original.location.address, addressRegion: 'ca', addressCountry: { '@type': 'Country', name: 'United States' } } };
  const rows = parse(markup([{ '@graph': [value] }]));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].city, 'Modesto');
  assert.equal(rows[0].stateCode, 'ca');
});

test('repeated detail URLs produce one candidate despite tracking parameters and fragments', async () => {
  const parse = await parser();
  const original = organization();
  const rows = parse(markup([original, { ...original, url: '/club/example-ministry/?source=nearby#details' }]));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].sourceUrl, 'https://www.riderclubs.com/club/example-ministry');
});

test('one malformed JSON-LD block does not discard a separate valid club entity', async () => {
  const parse = await parser();
  const rows = parse('<script type="application/ld+json">{invalid</script>' + markup(organization()));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Example Ministry');
});
