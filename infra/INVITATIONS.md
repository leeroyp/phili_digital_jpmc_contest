# Sending Invitation Emails

## Complete Contest Flow

1. **Initial Invitation Email** → User receives email with link to landing page
2. **User lands on page** → Views RSVP form
3. **User submits form** → Data saved to DynamoDB
4. **Confirmation Email** → Sent immediately (handled by `createEntry` Lambda)
5. **Reminder Email** → Sent 3 days before draw (handled by EventBridge Scheduler)

## Setup

### 1. Verify Your Email in AWS SES

Before sending any emails, you need to verify your sender email address in AWS SES:

```bash
# Verify the FROM_EMAIL address
aws ses verify-email-identity --email-address contest@yourdomain.com

# Check verification status
aws ses get-identity-verification-attributes --identities contest@yourdomain.com
```

You'll receive a verification email - click the link to verify.

### 2. Request SES Production Access (if needed)

By default, SES is in "sandbox mode" and can only send to verified addresses. For production campaigns:

1. Go to AWS Console → SES → Account dashboard
2. Click "Request production access"
3. Fill out the form explaining your use case
4. Wait for approval (usually 24-48 hours)

### 3. Create Your Recipient List

Create a `recipients.json` file with your email list:

```bash
cd infra/scripts
cp recipients.example.json recipients.json
# Edit recipients.json with your actual recipient list
```

Format:

```json
[
  {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
]
```

### 4. Set Environment Variables

```bash
export FROM_EMAIL="contest@yourdomain.com"
export LANDING_PAGE_URL="https://your-site.vercel.app"
export RECIPIENTS_FILE="./recipients.json"
export AWS_REGION="us-east-1"
```

### 5. Send Invitations

```bash
cd infra
npm run sendInvitations
```

## Customizing the Email Template

Edit `infra/scripts/sendInvitations.ts` to customize:

- **Subject line**: Change line with `Subject: { Data: "..." }`
- **HTML content**: Modify the `htmlBody` variable
- **Text fallback**: Update the `textBody` variable
- **Sender name**: Use format `"Contest Team <contest@yourdomain.com>"`

## Rate Limits & Best Practices

### AWS SES Limits (Sandbox)

- 200 emails per day
- 1 email per second
- Only verified email addresses

### AWS SES Limits (Production)

- Default: 50,000 emails per day
- 14 emails per second
- Can request higher limits

### Script Settings

Current batch settings in `sendInvitations.ts`:

- Batch size: 10 emails
- Delay: 1 second between batches
- Max throughput: ~36,000 emails/hour

To adjust for larger campaigns:

```typescript
const BATCH_SIZE = 14; // Match SES rate limit
const DELAY_MS = 1000; // 1 second
```

## Monitoring

### Check email delivery status:

```bash
aws ses get-send-statistics
```

### View bounce/complaint metrics:

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/SES \
  --metric-name Bounce \
  --start-time 2026-02-01T00:00:00Z \
  --end-time 2026-02-04T23:59:59Z \
  --period 86400 \
  --statistics Sum
```

## Testing Before Launch

### 1. Test with verified addresses first:

```json
[{ "email": "your-verified-email@domain.com", "firstName": "Test" }]
```

### 2. Send test batch:

```bash
npm run send-invitations
```

### 3. Check inbox and spam folder

### 4. Verify link works and form submits correctly

## Troubleshooting

### Error: "Email address not verified"

- Verify sender email in SES console
- Wait for verification email and click link

### Error: "Daily sending quota exceeded"

- Request production access (see step 2)
- Or wait 24 hours for quota reset

### Error: "MessageRejected: Missing credentials"

- Run `aws configure` to set up AWS credentials
- Ensure IAM user has `ses:SendEmail` permission

### Emails going to spam

- Set up SPF, DKIM, and DMARC records for your domain
- Verify domain (not just email) in SES
- Use consistent FROM address
- Avoid spam trigger words in subject/content

## Alternative: Lambda-based Invitation Sender

For very large campaigns or recurring invitations, consider creating a Lambda function instead:

1. Store recipients in DynamoDB
2. Create Lambda that reads recipients and sends emails
3. Trigger via EventBridge schedule or API call
4. Implement tracking (opened, clicked, registered)

Would you like me to create that Lambda function version as well?
