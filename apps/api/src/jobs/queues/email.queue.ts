import { DEFAULT_JOB_OPTIONS, EMAIL_JOBS, QUEUE_NAMES } from '@repo/constants/queues';
import { Queue } from 'bullmq';
import { z } from 'zod';

import { redisQueueConnection } from '@/lib/redis.js';

export const EmailJobDataSchema = z.object({
  tenantId: z.string().uuid(),
  to: z.string().email(),
  template: z.enum(['welcome', 'password-reset', 'invitation']),
  variables: z.record(z.string(), z.unknown()).default({}),
});
export type EmailJobData = z.infer<typeof EmailJobDataSchema>;

export const emailQueue = new Queue<EmailJobData>(QUEUE_NAMES.EMAIL, {
  connection: redisQueueConnection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

export const enqueueWelcomeEmail = (data: EmailJobData) =>
  emailQueue.add(EMAIL_JOBS.SEND_WELCOME, EmailJobDataSchema.parse(data));
