import { app } from './index.js'

import {
    createNextHandler,
    bootstrapExpress,
    bootstrapNest,
  } from 'create-vercel-http-server-handler';

  export default createNextHandler({
    bootstrap: bootstrapExpress({ app }),
  });

  export const config = {
    api: {
      bodyParser: false,
    },
  };
