import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

export const jobAggregationQueue = new Queue('job-aggregation', { connection: connection as any });
export const emailOutreachQueue = new Queue('email-outreach', { connection: connection as any });
