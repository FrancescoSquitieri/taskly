import { QUEUE_NAMES } from '@repo/constants/queues';
import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';

import { env } from '@/config/env.js';
import { EmailJobDataSchema } from '@/jobs/queues/email.queue.js';
import { renderEmail } from '@/lib/email-templates.js';
import { logger } from '@/lib/logger.js';
import { redisQueueConnection } from '@/lib/redis.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST ?? 'localhost',
  port: env.SMTP_PORT ?? 1025,
  auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export const emailWorker = new Worker(
  QUEUE_NAMES.EMAIL,
  async (job) => {
    const data = EmailJobDataSchema.parse(job.data);
    const { subject, html, text } = renderEmail(data.template, data.variables);
    logger.info({ jobId: job.id, template: data.template, to: data.to }, 'Sending email');
    await transporter.sendMail({
      from: env.SMTP_FROM ?? 'no-reply@taskly.local',
      to: data.to,
      subject,
      html,
      text,
    });
  },
  { connection: redisQueueConnection, concurrency: 5 },
);

emailWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err, attempt: job?.attemptsMade }, 'Email job failed');
});
