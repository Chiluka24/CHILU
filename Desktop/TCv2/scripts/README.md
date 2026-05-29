# Admin & Maintenance Scripts

⚠️ **These scripts are for local development and maintenance only. They are NOT deployed to production.**

## Database Maintenance

### `npm run optimize-db`
Optimizes database performance and cleans up old data.
```bash
npm run optimize-db
```

### `npm run test-db`
Tests database connection and verifies configuration.
```bash
npm run test-db
```

## User Management

### Approve Monetization
```bash
npm run approve-user
```

### Check Monetization Status
```bash
npm run check-status
```

## Security & Secrets

### Check Secrets Configuration
```bash
npm run check-secrets
```

### Generate New Secrets
```bash
npm run generate-secrets
```

## Database Migrations

### Security Migration
```bash
npm run migrate-security
```

## Development Only

The following scripts are for development/debugging only and should be removed before production:

- `scripts/admin/seed-vivek.ts` - Test data seeding
- `scripts/admin/check-login-issue.ts` - Debug script
- `scripts/admin/check-users.ts` - Debug script
- `scripts/admin/fix-email-verification.ts` - One-time fix
- `scripts/admin/reset-password-now.ts` - Manual password reset
- `scripts/admin/reset-user-password.ts` - Manual password reset
- `scripts/admin/test-upload.ts` - Upload testing
- `scripts/admin/verify-user-email.ts` - Manual email verification

## Best Practices

1. **Never run these in production** - Use proper admin UI instead
2. **Always backup database** before running maintenance scripts
3. **Test in staging first** before running on production data
4. **Use environment variables** for sensitive configuration
5. **Log all admin actions** for audit trail

## Deployment

These scripts are excluded from deployment via `.vercelignore`. They remain in the repository for local maintenance tasks only.


---

## 🆕 Deployment Troubleshooting Scripts

### 🔍 Diagnose Deployment
**Purpose:** Comprehensive diagnostic tool to check your deployment configuration

```bash
# Check local configuration
node scripts/diagnose-deployment.js

# Check production configuration
MONGO_URI="your-production-uri" node scripts/diagnose-deployment.js
```

**What it checks:**
- Environment variables (required and optional)
- JWT secret strength
- MongoDB connection
- Database users and collections
- Password hashing functionality
- Account lockouts

**When to use:**
- After deploying to production
- When login issues occur
- Before going live
- When troubleshooting authentication problems

---

### 🔓 Reset Account Lockout
**Purpose:** Unlock accounts that have been locked due to failed login attempts

```bash
# Reset specific user
node scripts/reset-account-lockout.js user@example.com

# Reset all locked accounts
node scripts/reset-account-lockout.js --all

# With production MongoDB
MONGO_URI="your-prod-uri" node scripts/reset-account-lockout.js user@example.com
```

**When to use:**
- User gets "Account locked" error
- After 5 failed login attempts
- When testing authentication
- To bulk reset all lockouts

---

## 📚 Troubleshooting Guides

For detailed troubleshooting steps, see:
- **[QUICK_FIX_LOGIN_ISSUE.md](../QUICK_FIX_LOGIN_ISSUE.md)** - Fast solutions for common login problems
- **[DEPLOYMENT_TROUBLESHOOTING.md](../DEPLOYMENT_TROUBLESHOOTING.md)** - Comprehensive deployment guide

---

## Common Issues and Scripts

| Issue | Script to Run |
|-------|--------------|
| Login not working after deployment | `node scripts/diagnose-deployment.js` |
| Account locked error | `node scripts/reset-account-lockout.js user@example.com` |
| Need to generate secrets | `npm run generate-secrets` |
| Verify secrets are secure | `npm run check-secrets` |
| Check database connection | `npm run test-db` |
