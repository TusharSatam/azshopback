const sanityClient =require('@sanity/client');
// import imageUrlBuilder from '@sanity/image-url';

export const client = sanityClient({
  projectId: process.env.STRIPE_PROJECTID,
  dataset: 'production',
  apiVersion: '2021-11-16',
  useCdn: true,
  token: process.env.STRIPE_TOKEN,
});

// const builder = imageUrlBuilder(client);