# Changelog

All notable changes to the DIFY Trello Upload Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-XX

### Added
- Initial release of DIFY Trello Upload Plugin
- Core functionality for creating Trello cards from AI-generated content
- Secure credential management for Trello API key and token
- Comprehensive input validation and sanitization
- Support for optional card metadata (labels, due dates, assignees)
- Automatic content truncation for long descriptions
- Rate limiting compliance with exponential backoff
- Error handling with meaningful user feedback
- Board and list access verification
- Label management and assignment
- Comprehensive documentation and setup guides

### Features
- **Card Creation**: Create Trello cards with AI-generated titles and descriptions
- **Flexible Configuration**: Support for custom boards, lists, and metadata
- **Security**: Secure credential storage using DIFY's credential system
- **Validation**: Input validation and content sanitization
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Rate Limiting**: API rate limit compliance with retry logic
- **Content Management**: Automatic truncation of long content

### Technical Details
- Python 3.8+ compatible
- Follows DIFY plugin architecture standards
- Uses Trello REST API v1
- Implements proper YAML configuration files
- Includes comprehensive test coverage
- Provides utility classes for API interaction and validation

### Documentation
- Complete setup and configuration guide
- API credential acquisition instructions
- Troubleshooting section for common issues
- Character limit and rate limiting guidelines
- Security best practices documentation