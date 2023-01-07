const sanityClient =require('@sanity/client');
// import imageUrlBuilder from '@sanity/image-url';

export const client = sanityClient({
  projectId: 'vskyo0km',
  dataset: 'production',
  apiVersion: '2021-11-16',
  useCdn: true,
  token: 'sk71wyNU6LlJtPXVOP1kUNAJ536DPTyEXia88r4zGCBfgv2XMVz6O154b29tPcYq7GlsljhzdbvGYz169um4nuPw5HJEpssrqbVyOuUaVMWVztJOguUfMDhheeYIpT1u6lI6qOMPWpZPjl4hZ1JQyepqOkB4y6MfJamLDD00GC9VJn9S8NAt',
});

// const builder = imageUrlBuilder(client);