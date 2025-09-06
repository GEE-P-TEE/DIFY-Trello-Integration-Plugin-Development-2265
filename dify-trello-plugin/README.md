# DIFY Trello Upload Plugin

A comprehensive plugin for the DIFY platform that enables automated uploading of AI-generated outputs as tasks directly to Trello boards, streamlining workflow automation between AI content generation and project management systems.

## Features

- **Seamless Integration**: Direct integration between DIFY AI outputs and Trello boards
- **Manual Execution**: User-triggered tool for precise control over task creation
- **Flexible Configuration**: Support for custom boards, lists, labels, and assignments
- **Content Management**: Automatic truncation of long content to fit Trello limits
- **Secure Authentication**: Safe storage of Trello API credentials using DIFY's credential system
- **Error Handling**: Comprehensive error handling with meaningful feedback
- **Rate Limiting**: Compliant with Trello API rate limits

## Installation

### Production Installation (DIFY Platform)

1. Copy the plugin directory to your DIFY plugins folder
2. Restart DIFY to load the plugin
3. Configure your Trello API credentials in the provider settings

### Local Development Setup

#### Prerequisites

- Python 3.8 or higher
- DIFY development environment
- Trello account with API access

#### Environment Setup

1. **Clone and Setup**
   ```bash
   # Navigate to your DIFY plugins directory
   cd /path/to/dify/plugins
   
   # Copy the plugin
   cp -r dify-trello-plugin ./
   cd dify-trello-plugin
   ```

2. **Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit the .env file with your credentials
   nano .env  # or use your preferred editor
   ```

3. **Required Environment Variables**
   
   Edit your `.env` file and add your Trello credentials:
   
   ```bash
   # Required: Your Trello API credentials
   TRELLO_API_KEY=your_actual_api_key_here
   TRELLO_TOKEN=your_actual_token_here
   
   # Optional: Development settings
   PLUGIN_DEV_MODE=true
   LOG_LEVEL=debug
   
   # Optional: Default test values
   TRELLO_DEFAULT_BOARD_ID=your_test_board_id
   TRELLO_DEFAULT_LIST_ID=your_test_list_id
   ```

4. **Install Dependencies**
   ```bash
   # Install required Python packages (if not in DIFY environment)
   pip install -r requirements.txt
   ```

5. **Plugin Registration**
   ```bash
   # Register the plugin with DIFY (specific to your DIFY setup)
   # Follow your DIFY development documentation for plugin registration
   ```

## Configuration

### Getting Trello API Credentials

1. **Get API Key**
   - Visit [Trello Developer Portal](https://trello.com/app-key)
   - Copy your API Key from the page

2. **Generate Token**
   - On the same page, click the "Token" link
   - Authorize the application with required permissions:
     - ✅ Read access to your boards and lists
     - ✅ Write access to create cards and modify boards
     - ✅ Read access to your member information
   - Copy the generated token

3. **Configure in DIFY**
   - Navigate to DIFY Provider Settings
   - Find "Trello" provider
   - Enter your API Key and Token
   - Test the connection

### Finding Board and List IDs

#### Method 1: Browser JSON (Recommended)
1. Open your Trello board in a web browser
2. Add `.json` to the end of the board URL
3. Find the board ID in the JSON response
4. Locate list IDs in the "lists" array

**Example:**
- Board URL: `https://trello.com/b/abcd1234/my-board`
- JSON URL: `https://trello.com/b/abcd1234/my-board.json`
- Board ID: `abcd1234`
- List ID: Found in `lists[0].id`

#### Method 2: Trello API
```bash
# Get your boards
curl "https://api.trello.com/1/members/me/boards?key=YOUR_API_KEY&token=YOUR_TOKEN"

# Get lists for a specific board
curl "https://api.trello.com/1/boards/BOARD_ID/lists?key=YOUR_API_KEY&token=YOUR_TOKEN"
```

#### Method 3: Browser Developer Tools
1. Open Trello board
2. Press F12 to open Developer Tools
3. Go to Network tab
4. Refresh the page
5. Look for API calls containing board and list IDs

## Usage

### Basic Usage

1. **Configure Provider**: Set up your Trello API credentials
2. **Run Tool**: Use the "Create Trello Card" tool with:
   - Card Title (from AI output)
   - Card Description (AI content)
   - Board ID (required)
   - List ID (required)
   - Optional: Labels, Due Date, Assignee

### Advanced Usage Examples

#### Example 1: Simple Card Creation
```python
# Tool parameters
{
    "card_title": "AI Generated Task: User Onboarding Flow",
    "card_description": "Create a comprehensive user onboarding flow...",
    "board_id": "5f7c8d9e1234567890abcdef",
    "list_id": "5f7c8d9e1234567890abcd00"
}
```

#### Example 2: Card with Metadata
```python
# Tool parameters with optional fields
{
    "card_title": "Bug Fix: Login Authentication",
    "card_description": "Investigate and fix the authentication timeout issue...",
    "board_id": "5f7c8d9e1234567890abcdef",
    "list_id": "5f7c8d9e1234567890abcd00",
    "labels": "bug,high-priority,backend",
    "due_date": "2024-02-15",
    "assignee_id": "5f7c8d9e1234567890abcd11"
}
```

## Input Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `card_title` | String | ✅ | Title for the Trello card |
| `card_description` | Text | ✅ | Content for the card description (auto-truncated if >10,000 chars) |
| `board_id` | String | ✅ | Trello board identifier |
| `list_id` | String | ✅ | Trello list identifier |
| `labels` | String | ❌ | Comma-separated label names |
| `due_date` | String | ❌ | Due date in YYYY-MM-DD format |
| `assignee_id` | String | ❌ | Trello member ID |

## Development

### Local Testing

1. **Environment Setup**
   ```bash
   # Set development mode
   export PLUGIN_DEV_MODE=true
   export LOG_LEVEL=debug
   ```

2. **Test Credentials**
   ```python
   # Test your credentials
   from provider.provider import TrelloProvider
   
   credentials = {
       'trello_api_key': 'your_key',
       'trello_token': 'your_token'
   }
   
   provider = TrelloProvider()
   provider._validate_credentials(credentials)
   ```

3. **Test Card Creation**
   ```python
   # Test card creation
   from tools.create_card import CreateTrelloCardTool
   
   tool = CreateTrelloCardTool()
   # ... test implementation
   ```

### Debugging

#### Enable Debug Logging
```bash
# In your .env file
LOG_LEVEL=debug
PLUGIN_DEV_MODE=true
```

#### Common Debug Steps
1. Check API credentials with a simple curl request
2. Verify board and list IDs exist and are accessible
3. Test with minimal card data first
4. Check DIFY logs for detailed error messages

## Error Handling

The plugin handles various error scenarios:

- **Invalid API credentials** → Clear credential validation errors
- **Non-existent board or list IDs** → Specific resource not found messages
- **Network connectivity issues** → Timeout and connection error handling
- **API rate limiting** → Automatic retry with exponential backoff
- **Content validation errors** → Input sanitization and format validation

### Common Error Solutions

| Error | Solution |
|-------|----------|
| "Invalid API key or token" | Verify credentials at [trello.com/app-key](https://trello.com/app-key) |
| "Board not found" | Check board ID format and access permissions |
| "List not found" | Verify list exists in the specified board |
| "Rate limited" | Wait and retry - handled automatically |
| "Content too long" | Content is auto-truncated, check warnings |

## Rate Limiting

The plugin respects Trello's rate limits:

- **300 requests per 10 seconds** per API key
- **Automatic retry** with exponential backoff
- **Graceful handling** of rate limit errors
- **Request optimization** to minimize API calls

## Security

### Production Security

- ✅ Credentials stored securely using DIFY's credential system
- ✅ All inputs validated before API calls
- ✅ No sensitive data exposed in error messages
- ✅ Follows DIFY security best practices

### Development Security

- ✅ Use environment variables for credentials
- ✅ Never commit `.env` file to version control
- ✅ Rotate API tokens regularly
- ✅ Use minimal required permissions
- ✅ Test with non-production boards when possible

### Token Permissions

Your Trello token needs these permissions:
- **Read** access to boards and lists
- **Write** access to create cards
- **Read** access to members (for assignments)
- **Read** access to labels (for label management)

## Troubleshooting

### Environment Issues

```bash
# Check if environment variables are loaded
echo $TRELLO_API_KEY
echo $TRELLO_TOKEN

# Verify Python environment
python --version
pip list | grep requests
```

### API Connectivity

```bash
# Test API connectivity
curl -X GET \
  "https://api.trello.com/1/members/me?key=YOUR_KEY&token=YOUR_TOKEN"
```

### Common Issues

1. **Plugin Not Loading**
   - Check DIFY plugin directory structure
   - Verify all required files are present
   - Check DIFY logs for loading errors

2. **Credential Validation Fails**
   - Verify API key and token are correct
   - Check token hasn't expired
   - Ensure token has required permissions

3. **Board/List Access Issues**
   - Confirm board ID format (24-character hex)
   - Verify you have access to the board
   - Check if board is private and token has access

4. **Card Creation Fails**
   - Test with minimal required parameters first
   - Check for content length issues
   - Verify list exists and is not archived

### Character Limits

- **Card titles**: 16,384 characters maximum (plugin limits to 512)
- **Card descriptions**: 16,384 characters maximum (plugin limits to 10,000)
- **Labels**: 50 characters per label, maximum 10 labels

## Support

For issues or feature requests:

1. **Check Documentation**: Review this README and troubleshooting section
2. **DIFY Community**: Refer to DIFY documentation and community forums
3. **GitHub Issues**: Create an issue in the project repository
4. **API Documentation**: Consult [Trello API Documentation](https://developer.atlassian.com/cloud/trello/rest/api-group-actions/)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.