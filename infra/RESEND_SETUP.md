# Resend Email Service Setup

This project now uses [Resend](https://resend.com) instead of AWS SES for sending emails.

## Why Resend?

- **No sandbox restrictions** - Start sending immediately without AWS approval
- **Simple API** - Clean, modern REST API (no complex AWS SDK configuration)
- **Great deliverability** - Professional email infrastructure
- **Generous free tier** - 3,000 emails/month, 100 emails/day
- **Easy setup** - No IAM policies or AWS console configuration needed

## Setup Instructions

### 1. Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. After logging in, go to **API Keys** in the dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "JPMC Contest Production")
4. Select the appropriate permissions (default "Sending access" is fine)
5. Copy your API key (starts with `re_`)

⚠️ **Important**: Save this key securely - you won't be able to see it again!

### 3. Verify Your Domain (Optional but Recommended)

For production use, you should verify your sending domain:

1. Go to **Domains** in the Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `phili-digital.com`)
4. Add the DNS records shown (TXT, DKIM, etc.)
5. Wait for verification (usually takes a few minutes)

Once verified, you can send from any email address at that domain (e.g., `contest@phili-digital.com`).

### 4. Configure Environment Variables

Add the following environment variables:

```bash
# For CDK deployment
export RESEND_API_KEY="re_your_actual_api_key_here"
export FROM_EMAIL="contest@yourdomain.com"
export LANDING_PAGE_URL="https://your-site.vercel.app"
export DEDUPE_SALT="your-long-random-secret-string"
```

**For deployment:**
```bash
# Development
npm run deploy:dev

# Production
npm run deploy:prod
```

**For sending invitation emails locally:**
```bash
cd infra
RESEND_API_KEY="re_xxx" FROM_EMAIL="contest@yourdomain.com" npm run sendInvitations
```

### 5. Testing Emails

During development, you can use Resend's sandbox mode:

- In sandbox mode, emails are only sent to verified addresses
- To verify an address, go to your Resend dashboard → **Domains** → click on your domain
- Add test email addresses in the "Testing" section

Once your domain is verified, you can send to any email address.

## Email Templates

The following emails are sent by the system:

1. **Invitation Email** (`sendInvitations.ts`) - Initial campaign invitation
2. **Confirmation Email** (`createEntry.ts`) - Sent when user RSVPs
3. **Reminder Email** (`sendScheduledEmail.ts`) - Sent before the event
4. **Draw Day Email** (`sendScheduledEmail.ts`) - Sent on event day

## Rate Limits

Resend free tier includes:
- **3,000 emails per month**
- **100 emails per day**
- Rate limit: ~10 requests per second

For higher volumes, upgrade to a paid plan:
- Pro: $20/month for 50,000 emails
- Business: $80/month for 250,000 emails

## Monitoring

View email delivery status in the Resend dashboard:
- **Emails** - See all sent emails and their status
- **Analytics** - Track opens, clicks, bounces, and spam complaints
- **Logs** - Debug failed deliveries

## Troubleshooting

### Error: "Missing required API key"
- Make sure `RESEND_API_KEY` environment variable is set
- Check that the API key starts with `re_`

### Error: "Invalid from address"
- Verify your domain in Resend dashboard
- Use an email address from your verified domain
- In sandbox mode, use a verified test address

### Email not received
1. Check Resend dashboard for delivery status
2. Check recipient's spam folder
3. Verify domain DNS records are correct
4. Ensure you're within rate limits

## Migration from AWS SES

All previous SES code has been replaced. Key changes:

- ❌ Removed: `@aws-sdk/client-ses` dependency
- ❌ Removed: SES IAM permissions from CDK stack
- ✅ Added: `resend` npm package
- ✅ Added: `RESEND_API_KEY` environment variable

No changes needed to email templates or HTML - the migration is transparent to end users.

## Support

- Resend Documentation: https://resend.com/docs
- Resend Support: https://resend.com/support
- API Reference: https://resend.com/docs/api-reference
