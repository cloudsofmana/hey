import leafwatch from '@hey/db/prisma/leafwatch/client';
import { lRangeRedis, lTrimRedis } from '@hey/db/redisClient';
import logger from '@hey/helpers/logger';

const batchProcessImpressions = async () => {
  try {
    const startTime = Date.now();
    const impressions = (await lRangeRedis('impressions', 0, 999999)) || [];

    if (impressions.length === 0) {
      logger.info('[Cron] batchProcessImpressions - No impressions to process');
      return;
    }

    const parsedImpressions = impressions.flatMap((impression) =>
      JSON.parse(impression)
    );

    await leafwatch.impression.createMany({ data: parsedImpressions });

    const endTime = Date.now();
    const timeTaken = endTime - startTime;

    logger.info(
      `[Cron] batchProcessImpressions - Batch inserted ${parsedImpressions.length} impressions to Leafwatch in ${timeTaken}ms`
    );

    await lTrimRedis('impressions', impressions.length, -1);
  } catch (error) {
    logger.error(
      '[Cron] batchProcessImpressions - Error processing impressions',
      error
    );
  }
};

export default batchProcessImpressions;
