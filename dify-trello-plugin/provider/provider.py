"""
Trello Provider Implementation
"""
import requests
from typing import Any, Dict

from core.tools.provider.base_provider import BaseToolProvider
from core.tools.errors import ToolProviderCredentialValidationError


class TrelloProvider(BaseToolProvider):
    """
    Trello provider for DIFY platform
    """
    
    def _validate_credentials(self, credentials: Dict[str, Any]) -> None:
        """
        Validate Trello API credentials
        
        Args:
            credentials: Dictionary containing API key and token
            
        Raises:
            ToolProviderCredentialValidationError: If credentials are invalid
        """
        try:
            api_key = credentials.get('trello_api_key')
            token = credentials.get('trello_token')
            
            if not api_key or not token:
                raise ToolProviderCredentialValidationError('API key and token are required')
            
            # Test API connectivity with a simple call
            url = f"https://api.trello.com/1/members/me"
            params = {
                'key': api_key,
                'token': token
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 401:
                raise ToolProviderCredentialValidationError('Invalid API key or token')
            elif response.status_code == 403:
                raise ToolProviderCredentialValidationError('Access denied. Please check your token permissions')
            elif response.status_code != 200:
                raise ToolProviderCredentialValidationError(f'API validation failed: {response.status_code}')
                
            # Verify the response contains expected user data
            try:
                user_data = response.json()
                if 'id' not in user_data:
                    raise ToolProviderCredentialValidationError('Invalid API response format')
            except ValueError:
                raise ToolProviderCredentialValidationError('Invalid API response format')
                
        except requests.exceptions.Timeout:
            raise ToolProviderCredentialValidationError('API request timeout. Please check your network connection')
        except requests.exceptions.ConnectionError:
            raise ToolProviderCredentialValidationError('Cannot connect to Trello API. Please check your network connection')
        except requests.exceptions.RequestException as e:
            raise ToolProviderCredentialValidationError(f'API request failed: {str(e)}')
        except Exception as e:
            raise ToolProviderCredentialValidationError(f'Credential validation failed: {str(e)}')