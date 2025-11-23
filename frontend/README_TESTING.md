# Frontend Testing Guide

## Setup

Frontend tests use **Vitest** and **React Testing Library**.

### Installation

```bash
cd frontend
npm install
```

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── __tests__/
│   │   │       ├── Button.test.jsx
│   │   │       └── Toast.test.jsx
│   │   └── __tests__/
│   │       └── ErrorBoundary.test.jsx
│   ├── contexts/
│   │   └── __tests__/
│   │       └── ToastContext.test.jsx
│   └── test/
│       ├── setup.js
│       └── utils.jsx
```

## Writing Tests

### Example: Component Test

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### Example: Test with User Interaction

```jsx
import userEvent from '@testing-library/user-event';

it('calls onClick when clicked', async () => {
  const handleClick = vi.fn();
  const user = userEvent.setup();
  
  render(<Button onClick={handleClick}>Click</Button>);
  await user.click(screen.getByRole('button'));
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Example: Test with Providers

```jsx
import { renderWithProviders } from '../../test/utils';

it('renders with toast context', () => {
  renderWithProviders(<MyComponent />);
  // Component has access to ToastContext
});
```

## Test Utilities

### `renderWithProviders`

Renders component with all necessary providers (ToastProvider, etc.)

```jsx
import { renderWithProviders } from '../test/utils';

renderWithProviders(<MyComponent />);
```

### Mock API Responses

```jsx
import { mockApiResponse, mockApiError } from '../test/utils';

const response = mockApiResponse({ data: 'test' });
const error = mockApiError('Not found', 404);
```

## Coverage Goals

- **Target:** 80%+ coverage
- **Current:** ~40% (expanding)
- **Priority:** Critical components first

## Best Practices

1. **Test user behavior, not implementation**
   - ✅ Test what users see and do
   - ❌ Don't test internal state

2. **Use accessible queries**
   - ✅ `getByRole`, `getByLabelText`
   - ❌ Avoid `getByTestId` unless necessary

3. **Keep tests simple**
   - One assertion per test when possible
   - Clear test names

4. **Mock external dependencies**
   - API calls
   - Browser APIs
   - Third-party libraries

## CI Integration

Tests run automatically on:
- Push to main/develop
- Pull requests
- Frontend file changes

Coverage reports are generated and can be uploaded to Codecov.

