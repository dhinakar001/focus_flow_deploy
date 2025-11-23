# FocusFlow Test Suite

This directory contains the test suite for the FocusFlow backend API.

## Test Files

- **`api_health.test.js`** - Health check endpoint tests
- **`auth.test.js`** - User registration and login tests
- **`user_profile.test.js`** - User profile creation and update tests
- **`security_headers.test.js`** - Security headers verification tests
- **`rate_limit.test.js`** - Rate limiting enforcement tests
- **`e2e_login_flow.test.js`** - End-to-end login flow tests

## Setup

### 1. Install Dependencies

```bash
npm install
```

This will install Jest, Supertest, and other test dependencies.

### 2. Set Up Test Database

Create a separate PostgreSQL database for testing:

```bash
# Using psql
createdb focusflow_test

# Or using SQL
psql -U postgres -c "CREATE DATABASE focusflow_test;"
psql -U postgres -c "CREATE USER focusflow_test WITH PASSWORD 'test_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE focusflow_test TO focusflow_test;"
```

### 3. Run Database Migrations

```bash
# Set test database URL
export TEST_DATABASE_URL=postgresql://focusflow_test:test_password@localhost:5432/focusflow_test

# Run migrations (you may need to create a migration script)
# Or manually run SQL files:
psql -U focusflow_test -d focusflow_test -f server/db/migrations/001_create_tables.sql
psql -U focusflow_test -d focusflow_test -f server/db/migrations/002_ai_features_tables.sql
psql -U focusflow_test -d focusflow_test -f server/db/migrations/003_production_schema.sql
psql -U focusflow_test -d focusflow_test -f server/db/migrations/004_saas_schema.sql
```

### 4. Configure Environment

Copy `.env.test` and update if needed:

```bash
cp .env.test .env.test.local
# Edit .env.test.local with your test database credentials
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Specific Test File

```bash
npm test -- api_health.test.js
npm test -- auth.test.js
```

### Run Tests Matching a Pattern

```bash
npm test -- --testNamePattern="should login"
```

## Test Structure

### Test Database

Tests use a separate test database (`focusflow_test`) to avoid affecting development data.

### Test Isolation

Each test file:
- Sets up test data before tests
- Cleans up test data after tests
- Uses unique test user data (timestamped emails/usernames)

### Mocking

Currently, tests use the actual database. For faster tests, you can:
- Use an in-memory database
- Mock database calls
- Use test fixtures

## CI/CD Integration

Tests are configured to run in CI/CD pipelines:

```bash
# In GitHub Actions or CI
npm run test:ci
```

This command:
- Runs tests in CI mode
- Generates coverage reports
- Uses limited workers for resource efficiency

## Environment Variables

Tests use environment variables from `.env.test`:

- `NODE_ENV=test` - Test environment
- `DATABASE_URL` - Test database connection
- `JWT_SECRET` - Test JWT secret
- `TOKEN_ENCRYPTION_KEY` - Test encryption key
- `LOG_LEVEL=error` - Suppress logs during tests

## Troubleshooting

### Database Connection Issues

```bash
# Check database is running
pg_isready -U focusflow_test -d focusflow_test

# Check connection string
echo $TEST_DATABASE_URL
```

### Tests Failing

1. **Check database migrations**: Ensure all migrations are run
2. **Check environment variables**: Verify `.env.test` is correct
3. **Check database permissions**: Ensure test user has proper permissions
4. **Clean test database**: Drop and recreate if needed

```bash
# Drop and recreate test database
dropdb focusflow_test
createdb focusflow_test
# Run migrations again
```

### Port Conflicts

Tests use port 4001 by default. If there's a conflict:

```bash
# Update PORT in .env.test
PORT=4002
```

### Timeout Issues

If tests timeout, increase timeout in `jest.config.js`:

```javascript
testTimeout: 20000, // 20 seconds
```

## Writing New Tests

### Test Template

```javascript
const request = require('supertest');
const { initializeApp } = require('../server/index');

describe('Feature Name', () => {
  let app;

  beforeAll(() => {
    app = initializeApp();
  });

  it('should do something', async () => {
    const response = await request(app)
      .get('/endpoint')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

### Best Practices

1. **Use descriptive test names**: "should login with valid credentials"
2. **Test one thing per test**: Don't combine multiple assertions
3. **Clean up test data**: Remove test users/data after tests
4. **Use unique test data**: Timestamp emails/usernames to avoid conflicts
5. **Test error cases**: Test both success and failure scenarios

## Coverage Goals

- **Statements**: > 70%
- **Branches**: > 60%
- **Functions**: > 70%
- **Lines**: > 70%

View coverage report:

```bash
npm run test:coverage
# Open coverage/lcov-report/index.html in browser
```

## Notes

- Tests use real database connections (not mocks)
- Test database should be separate from development database
- Tests clean up after themselves, but manual cleanup may be needed
- Some tests may require specific database state



