# Test Setup Instructions

Complete guide for setting up and running the FocusFlow test suite.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `jest` - Test framework
- `supertest` - HTTP assertion library
- `cross-env` - Cross-platform environment variable support

### 2. Create Test Database

```bash
# Create test database
createdb focusflow_test

# Or using SQL
psql -U postgres << EOF
CREATE DATABASE focusflow_test;
CREATE USER focusflow_test WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE focusflow_test TO focusflow_test;
\q
EOF
```

### 3. Run Database Migrations

```bash
# Set test database URL
export TEST_DATABASE_URL=postgresql://focusflow_test:test_password@localhost:5432/focusflow_test

# Run migrations on test database
psql -U focusflow_test -d focusflow_test -f server/db/migrations/001_create_tables.sql
psql -U focusflow_test -d focusflow_test -f server/db/migrations/002_ai_features_tables.sql
psql -U focusflow_test -d focusflow_test -f server/db/migrations/003_production_schema.sql
psql -U focusflow_test -d focusflow_test -f server/db/migrations/004_saas_schema.sql
```

### 4. Configure Environment

The `.env.test` file is already configured with test values. If you need to customize:

```bash
# Copy and edit if needed
cp .env.test .env.test.local
```

Key variables in `.env.test`:
- `DATABASE_URL` - Test database connection string
- `JWT_SECRET` - Test JWT secret (32+ characters)
- `TOKEN_ENCRYPTION_KEY` - Test encryption key (base64)

### 5. Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Running Tests Locally

### Basic Test Run

```bash
npm test
```

### Run Specific Test File

```bash
npm test -- api_health.test.js
npm test -- auth.test.js
npm test -- user_profile.test.js
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="should login"
npm test -- --testNamePattern="health"
```

### Run with Verbose Output

```bash
npm test -- --verbose
```

### Run with Coverage

```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory. Open `coverage/lcov-report/index.html` in browser.

## Running Tests in CI

### GitHub Actions

The CI workflow (`.github/workflows/ci.yml`) automatically runs tests:

```yaml
- name: Run backend tests
  run: npm test
  env:
    NODE_ENV: test
    DATABASE_URL: postgresql://test:test@localhost:5432/test
```

### Docker

If using Docker for tests:

```bash
# Build test image
docker build -t focusflow-test -f Dockerfile.test .

# Run tests
docker run --rm focusflow-test npm test
```

### Environment Variables for CI

Set these in your CI environment:

```bash
NODE_ENV=test
DATABASE_URL=postgresql://user:pass@host:5432/test_db
JWT_SECRET=test-jwt-secret-minimum-32-characters-long
TOKEN_ENCRYPTION_KEY=dGVzdC1lbmNyeXB0aW9uLWtleS1mb3ItdGVzdGluZy1vbmx5
LOG_LEVEL=error
```

## Test Database Setup

### Option 1: Separate Test Database (Recommended)

```bash
# Create test database
createdb focusflow_test

# Run migrations
psql -U postgres -d focusflow_test -f server/db/migrations/001_create_tables.sql
# ... repeat for all migrations
```

### Option 2: Use Test Database URL

```bash
export TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/focusflow_test
npm test
```

### Option 3: Docker Test Database

```bash
# Start PostgreSQL container
docker run --name focusflow-test-db \
  -e POSTGRES_USER=focusflow_test \
  -e POSTGRES_PASSWORD=test_password \
  -e POSTGRES_DB=focusflow_test \
  -p 5433:5432 \
  -d postgres:14-alpine

# Wait for database to be ready
sleep 5

# Run migrations
export TEST_DATABASE_URL=postgresql://focusflow_test:test_password@localhost:5433/focusflow_test
psql $TEST_DATABASE_URL -f server/db/migrations/001_create_tables.sql
# ... repeat for all migrations

# Run tests
npm test
```

## Test Files Overview

### 1. `api_health.test.js`
- Tests `/health` endpoint
- Verifies health check response structure
- Tests status, version, uptime, environment

### 2. `auth.test.js`
- Tests user registration (`POST /auth/register`)
- Tests user login (`POST /auth/login`)
- Tests validation and error cases
- Uses test database

### 3. `user_profile.test.js`
- Tests profile retrieval (`GET /auth/profile`)
- Tests profile update (`PUT /auth/profile`)
- Tests authentication requirements
- Uses JWT tokens

### 4. `security_headers.test.js`
- Tests Helmet security headers
- Verifies X-Content-Type-Options, X-Frame-Options, etc.
- Tests CORS headers

### 5. `rate_limit.test.js`
- Tests rate limiting on general endpoints
- Tests stricter rate limiting on auth endpoints
- Verifies rate limit headers
- Tests health endpoint exclusion

### 6. `e2e_login_flow.test.js`
- End-to-end flow: register → login → profile → refresh → logout
- Tests complete user journey
- Uses test database

## Troubleshooting

### Issue: Database Connection Failed

**Error**: `Connection refused` or `password authentication failed`

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string
echo $TEST_DATABASE_URL

# Test connection manually
psql $TEST_DATABASE_URL -c "SELECT 1;"
```

### Issue: Tests Fail with "User already exists"

**Error**: `User with this email already exists`

**Solution**: Tests use timestamped emails, but if conflicts occur:
```bash
# Clean test database
psql -U focusflow_test -d focusflow_test -c "TRUNCATE TABLE users CASCADE;"
```

### Issue: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::4001`

**Solution**:
```bash
# Change port in .env.test
PORT=4002

# Or kill process using port
lsof -ti:4001 | xargs kill -9
```

### Issue: JWT Secret Too Short

**Error**: `JWT_SECRET must be at least 32 characters`

**Solution**: Ensure `.env.test` has a JWT secret of 32+ characters:
```bash
JWT_SECRET=test-jwt-secret-minimum-32-characters-long
```

### Issue: Migration Errors

**Error**: `relation "users" does not exist`

**Solution**: Run all migrations in order:
```bash
for file in server/db/migrations/*.sql; do
  psql -U focusflow_test -d focusflow_test -f "$file"
done
```

### Issue: Tests Timeout

**Error**: `Timeout - Async callback was not invoked`

**Solution**: Increase timeout in `jest.config.js`:
```javascript
testTimeout: 20000, // 20 seconds
```

## Cleanup

### Clean Test Database

```bash
# Drop and recreate
dropdb focusflow_test
createdb focusflow_test
# Run migrations again
```

### Remove Test Users

```bash
# Clean up test users (if needed)
psql -U focusflow_test -d focusflow_test -c "DELETE FROM users WHERE email LIKE '%@example.com';"
```

## Best Practices

1. **Always use test database** - Never run tests against production
2. **Clean up after tests** - Tests should clean up their own data
3. **Use unique test data** - Timestamp emails/usernames
4. **Test error cases** - Test both success and failure
5. **Keep tests fast** - Use mocks for slow operations if needed
6. **Isolate tests** - Tests should not depend on each other

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Create test database: `createdb focusflow_test`
3. ✅ Run migrations on test database
4. ✅ Run tests: `npm test`
5. ✅ Check coverage: `npm run test:coverage`

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [PostgreSQL Testing Guide](https://www.postgresql.org/docs/current/testing.html)

---

**Note**: Always ensure your test database is separate from development and production databases to avoid data loss.



