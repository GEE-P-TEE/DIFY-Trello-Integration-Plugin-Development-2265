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

1. Copy the plugin directory to your DIFY plugins folder
2. Restart DIFY to load the plugin
3. Configure your Trello API credentials in the provider settings

## Configuration

### Getting Trello API Credentials

1. Visit [Trello Developer Portal](https://trello.com/app-key)
2. Get your API Key
3. Generate a Token by clicking the "Token" link
4. Copy both credentials to DIFY provider settings

### Finding Board and List IDs

1. Open your Trello board in a web browser
2. Add `.json` to the end of the board URL
3. Find the board ID in the JSON response
4. Locate list IDs in the "lists" array

Example:
- Board URL: `https://trello.com/b/abcd1234/my-board`
- JSON URL: `https://trello.com/b/abcd1234/my-board.json`
- Board ID: `abcd1234`

## Usage

1. **Configure Provider**: Set up your Trello API credentials
2. **Run Tool**: Use the "Create Trello Card" tool with:
   - Card Title (from AI output)
   - Card Description (AI content)
   - Board ID (required)
   - List ID (required)
   - Optional: Labels, Due Date, Assignee

## Input Parameters

- **Card Title**: String - Title for the Trello card
- **Card Description**: Text - Content for the card description (auto-truncated if >10,000 chars)
- **Board ID**: Required - Trello board identifier
- **List ID**: Required - Trello list identifier
- **Labels**: Optional - Array of label names
- **Due Date**: Optional - Due date in YYYY-MM-DD format
- **Assignee**: Optional - Trello member ID

## Error Handling

The plugin handles various error scenarios:
- Invalid API credentials
- Non-existent board or list IDs
- Network connectivity issues
- API rate limiting
- Content validation errors

## Rate Limiting

The plugin respects Trello's rate limits:
- 300 requests per 10 seconds
- Automatic retry with exponential backoff
- Graceful handling of rate limit errors

## Troubleshooting

### Common Issues

1. **Invalid Credentials**: Verify API key and token are correct
2. **Board Not Found**: Ensure board ID is valid and accessible
3. **List Not Found**: Verify list ID exists in the specified board
4. **Permission Denied**: Check if API token has write access to the board

### Character Limits

- Card titles: 16,384 characters maximum
- Card descriptions: 16,384 characters maximum (plugin auto-truncates at 10,000)

## Security

- Credentials are stored securely using DIFY's credential system
- All inputs are validated before API calls
- No sensitive data is exposed in error messages
- Follows DIFY security best practices

## Support

For issues or feature requests, please refer to the DIFY documentation or create an issue in the project repository.