// Server-safe helpers. Kept out of ui.js because that module is 'use client',
// and a plain function exported from a client module cannot be called on the server.
export const money = (n) => n.toLocaleString('en-US');

export const Jsonld = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': [].concat(data) }) }}
  />
);
