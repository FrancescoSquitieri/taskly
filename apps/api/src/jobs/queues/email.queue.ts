import { DEFAULT_JOB_OPTIONS, EMAIL_JOBS, QUEUE_NAMES } from '@repo/constants/queues';
import { Queue } from 'bullmq';
import { z } from 'zod';

import { redisQueueConnection } from '@/lib/redis.js';

export const EmailJobDataSchema = z.object({
  tenantId: z.string().uuid(),
  to: z.string().email(),
  template: z.enum(['welcome', 'password-reset', 'invitation', 'email-verification']),
  variables: z.record(z.string(), z.unknown()).default({}),
});
export type EmailJobData = z.infer<typeof EmailJobDataSchema>;

export const emailQueue = new Queue<EmailJobData>(QUEUE_NAMES.EMAIL, {
  connection: redisQueueConnection,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

const enqueue = (jobName: string, data: EmailJobData) =>
  emailQueue.add(jobName, EmailJobDataSchema.parse(data));

export const enqueueWelcomeEmail = (params: {
  tenantId: string;
  to: string;
  userName: string;
  workspaceName: string;
}) =>
  enqueue(EMAIL_JOBS.SEND_WELCOME, {
    tenantId: params.tenantId,
    to: params.to,
    template: 'welcome',
    variables: { userName: params.userName, workspaceName: params.workspaceName },
  });

export const enqueuePasswordResetEmail = (params: {
  tenantId: string;
  to: string;
  userName: string;
  resetUrl: string;
}) =>
  enqueue(EMAIL_JOBS.SEND_PASSWORD_RESET, {
    tenantId: params.tenantId,
    to: params.to,
    template: 'password-reset',
    variables: { userName: params.userName, resetUrl: params.resetUrl },
  });

export const enqueueInvitationEmail = (params: {
  tenantId: string;
  to: string;
  inviterName: string;
  workspaceName: string;
  role: string;
  acceptUrl: string;
}) =>
  enqueue(EMAIL_JOBS.SEND_INVITATION, {
    tenantId: params.tenantId,
    to: params.to,
    template: 'invitation',
    variables: {
      inviterName: params.inviterName,
      workspaceName: params.workspaceName,
      role: params.role,
      acceptUrl: params.acceptUrl,
    },
  });

export const enqueueEmailVerificationEmail = (params: {
  tenantId: string;
  to: string;
  userName: string;
  verifyUrl: string;
}) =>
  enqueue(EMAIL_JOBS.SEND_EMAIL_VERIFICATION, {
    tenantId: params.tenantId,
    to: params.to,
    template: 'email-verification',
    variables: { userName: params.userName, verifyUrl: params.verifyUrl },
  });
