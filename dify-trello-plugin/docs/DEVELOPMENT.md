# Development Guide

This guide covers local development setup, testing, and debugging for the DIFY Trello Upload Plugin.

## Development Environment Setup

### Prerequisites

- Python 3.8+
- DIFY development environment
- Git
- Text editor or IDE
- Trello account with API access

### Quick Start

```bash
# 1. Clone the plugin
git clone <repository-url>
cd dify-trello-plugin

# 2. Set up environment
cp .env.example .env
# Edit .env with your credentials

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set development mode
cp .env.development .env.local
# Edit .env.local for local overrides
```

### Environment Files

The plugin uses multiple environment files for different contexts:

- `.env.example` - Template with all available variables
- `.env.development` - Development-specific settings
- `.env.local` - Local overrides (gitignored)
- `.env` - Production environment variables

**Load order:** `.env.local` > `.env.development` > `.env` > `.env.example`

## Development Workflow

### 1. Credential Setup

```bash
# Get your Trello credentials
# Visit: https://trello.com/app-key

# Add to .env.local
echo "TRELLO_API_KEY=your_actual_key" >> .env.local
echo "TRELLO_TOKEN=your_actual_token" >> .env.local
echo "PLUGIN_DEV_MODE=true" >> .env.local
```

### 2. Test Board Setup

Create a dedicated test board in Trello:

```bash
# Create test board via API
curl -X POST \
  "https://api.trello.com/1/boards" \
  -d "key=YOUR_KEY" \
  -d "token=YOUR_TOKEN" \
  -d "name=DIFY Plugin Test Board"

# Add board ID to environment
echo "TEST_BOARD_ID=your_board_id" >> .env.local
echo "TEST_LIST_ID=your_list_id" >> .env.local
```

### 3. Development Tools

#### Credential Validator

```python
# tools/dev/validate_credentials.py
from provider.provider import TrelloProvider
import os

def test_credentials():
    credentials = {
        'trello_api_key': os.getenv('TRELLO_API_KEY'),
        'trello_token': os.getenv('TRELLO_TOKEN')
    }
    
    provider = TrelloProvider()
    try:
        provider._validate_credentials(credentials)
        print("✅ Credentials valid")
    except Exception as e:
        print(f"❌ Credential error: {e}")

if __name__ == "__main__":
    test_credentials()
```

#### API Tester

```python
# tools/dev/test_api.py
from utils.api_client import TrelloAPIClient
import os

def test_api_connectivity():
    client = TrelloAPIClient(
        api_key=os.getenv('TRELLO_API_KEY'),
        token=os.getenv('TRELLO_TOKEN')
    )
    
    try:
        # Test user info
        user = client.get_user_info()
        print(f"✅ Connected as: {user.get('fullName')}")
        
        # Test board access
        board_id = os.getenv('TEST_BOARD_ID')
        if board_id:
            board = client.get_board(board_id)
            print(f"✅ Board access: {board.get('name')}")
        
    except Exception as e:
        print(f"❌ API error: {e}")

if __name__ == "__main__":
    test_api_connectivity()
```

### 4. Testing Framework

#### Unit Tests

```python
# tests/test_provider.py
import unittest
from unittest.mock import patch, MagicMock
from provider.provider import TrelloProvider

class TestTrelloProvider(unittest.TestCase):
    
    def setUp(self):
        self.provider = TrelloProvider()
    
    @patch('requests.get')
    def test_valid_credentials(self, mock_get):
        # Mock successful API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {'id': 'test_user_id'}
        mock_get.return_value = mock_response
        
        credentials = {
            'trello_api_key': 'test_key',
            'trello_token': 'test_token'
        }
        
        # Should not raise an exception
        self.provider._validate_credentials(credentials)
    
    def test_missing_credentials(self):
        with self.assertRaises(Exception):
            self.provider._validate_credentials({})

if __name__ == '__main__':
    unittest.main()
```

#### Integration Tests

```python
# tests/test_integration.py
import unittest
import os
from tools.create_card import CreateTrelloCardTool

class TestTrelloIntegration(unittest.TestCase):
    
    def setUp(self):
        self.tool = CreateTrelloCardTool()
        self.test_board_id = os.getenv('TEST_BOARD_ID')
        self.test_list_id = os.getenv('TEST_LIST_ID')
    
    def test_create_card(self):
        if not self.test_board_id or not self.test_list_id:
            self.skipTest("Test board/list not configured")
        
        parameters = {
            'card_title': 'Test Card from Integration Test',
            'card_description': 'This card was created during integration testing.',
            'board_id': self.test_board_id,
            'list_id': self.test_list_id
        }
        
        result = self.tool._invoke('test_user', parameters)
        self.assertIn('successfully', result.message)

if __name__ == '__main__':
    unittest.main()
```

### 5. Debugging

#### Enable Debug Logging

```python
# utils/logger.py
import logging
import os

def setup_logger():
    log_level = os.getenv('LOG_LEVEL', 'INFO').upper()
    
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('debug.log') if os.getenv('SAVE_DEBUG_LOGS') else logging.NullHandler()
        ]
    )
    
    return logging.getLogger('trello_plugin')

logger = setup_logger()
```

#### Debug API Calls

```python
# Add to create_card.py
from utils.logger import logger

def _create_trello_card(self, ...):
    if os.getenv('LOG_API_REQUESTS'):
        logger.debug(f"Creating card: {title} in list {list_id}")
    
    try:
        response = requests.post(url, params=params, timeout=30)
        
        if os.getenv('LOG_API_RESPONSES'):
            logger.debug(f"API Response: {response.status_code} - {response.text[:200]}")
        
        # ... rest of method
```

### 6. Performance Monitoring

```python
# utils/performance.py
import time
import functools
import os

def monitor_performance(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if not os.getenv('ENABLE_PERFORMANCE_MONITORING'):
            return func(*args, **kwargs)
        
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        print(f"⏱️ {func.__name__} took {end_time - start_time:.2f}s")
        return result
    
    return wrapper

# Usage
@monitor_performance
def _create_trello_card(self, ...):
    # ... method implementation
```

## Code Quality

### Linting and Formatting

```bash
# Install development tools
pip install black flake8 mypy

# Format code
black provider/ tools/ utils/

# Check style
flake8 provider/ tools/ utils/

# Type checking
mypy provider/ tools/ utils/
```

### Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit

# Set up hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

## Common Development Tasks

### Adding New Parameters

1. Update `tools/create_card.yaml` with new parameter
2. Modify `tools/create_card.py` to handle the parameter
3. Update validation in `utils/validators.py`
4. Add tests for the new parameter
5. Update documentation

### Adding New Tools

1. Create `tools/new_tool.yaml` configuration
2. Implement `tools/new_tool.py` class
3. Add to `tools/__init__.py` if needed
4. Create tests
5. Update provider configuration if needed

### Debugging Common Issues

#### Plugin Not Loading
```bash
# Check DIFY logs
tail -f /path/to/dify/logs/plugin.log

# Validate YAML syntax
python -c "import yaml; yaml.safe_load(open('provider/provider.yaml'))"
```

#### API Errors
```bash
# Test API directly
curl -X GET "https://api.trello.com/1/members/me?key=KEY&token=TOKEN"

# Check rate limits
curl -I -X GET "https://api.trello.com/1/members/me?key=KEY&token=TOKEN"
```

#### Import Errors
```bash
# Check Python path
python -c "import sys; print(sys.path)"

# Test imports
python -c "from provider.provider import TrelloProvider"
```

## Release Process

### Version Management

```bash
# Update version in multiple files
# - provider/provider.yaml
# - CHANGELOG.md
# - setup.py (if applicable)

# Tag release
git tag -a v1.0.1 -m "Release version 1.0.1"
git push origin v1.0.1
```

### Testing Checklist

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Credential validation works
- [ ] Card creation works with all parameters
- [ ] Error handling works correctly
- [ ] Rate limiting is respected
- [ ] Documentation is updated

## Troubleshooting

### Environment Issues

```bash
# Check environment loading
python -c "import os; print(os.getenv('TRELLO_API_KEY', 'NOT_SET'))"

# Verify plugin structure
find . -name "*.py" -o -name "*.yaml" | sort
```

### API Issues

```bash
# Test with minimal curl request
curl "https://api.trello.com/1/members/me?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN"

# Check token permissions
curl "https://api.trello.com/1/tokens/$TRELLO_TOKEN?key=$TRELLO_API_KEY"
```

### Performance Issues

```bash
# Monitor API calls
export LOG_API_REQUESTS=true
export LOG_API_RESPONSES=true
python your_test_script.py
```

## Resources

- [Trello API Documentation](https://developer.atlassian.com/cloud/trello/rest/)
- [DIFY Plugin Development Guide](https://docs.dify.ai)
- [Python Requests Documentation](https://docs.python-requests.org/)
- [YAML Specification](https://yaml.org/spec/)