import type { Handler } from 'express';

import prisma from '@hey/db/prisma/db/client';
import logger from '@hey/helpers/logger';
import { noBody } from 'src/helpers/responses';

export const get: Handler = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return noBody(res);
  }

  try {
    const result = await prisma.email.update({
      data: { tokenExpiresAt: null, verificationToken: null, verified: true },
      where: { verificationToken: token as string }
    });

    logger.info(`Email verified for ${result.email}`);

    return res.redirect('https://hey.xyz');
  } catch (error) {
    return res.status(400).send('Something went wrong');
  }
};
