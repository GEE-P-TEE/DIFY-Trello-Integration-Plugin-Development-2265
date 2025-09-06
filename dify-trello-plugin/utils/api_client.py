"""
Trello API Client Utilities
"""
import requests
import time
from typing import Any, Dict, Optional
from urllib.parse import urljoin


class TrelloAPIClient:
    """
    Utility class for Trello API interactions with rate limiting and error handling
    """
    
    BASE_URL = "https://api.trello.com/1/"
    RATE_LIMIT_DELAY = 2  # seconds
    MAX_RETRIES = 3
    
    def __init__(self, api_key: str, token: str):
        """
        Initialize the Trello API client
        
        Args:
            api_key: Trello API key
            token: Trello token
        """
        self.api_key = api_key
        self.token = token
        self.session = requests.Session()
        
    def _get_auth_params(self) -> Dict[str, str]:
        """
        Get authentication parameters for API requests
        
        Returns:
            Dictionary with API key and token
        """
        return {
            'key': self.api_key,
            'token': self.token
        }
    
    def _make_request(self, method: str, endpoint: str, params: Optional[Dict] = None,
                     data: Optional[Dict] = None, retries: int = 0) -> requests.Response:
        """
        Make an authenticated request to the Trello API with retry logic
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint
            params: Query parameters
            data: Request body data
            retries: Current retry count
            
        Returns:
            Response object
            
        Raises:
            requests.RequestException: If request fails after all retries
        """
        url = urljoin(self.BASE_URL, endpoint)
        
        # Merge auth params with request params
        request_params = self._get_auth_params()
        if params:
            request_params.update(params)
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                params=request_params,
                data=data,
                timeout=30
            )
            
            # Handle rate limiting
            if response.status_code == 429 and retries < self.MAX_RETRIES:
                time.sleep(self.RATE_LIMIT_DELAY * (2 ** retries))  # Exponential backoff
                return self._make_request(method, endpoint, params, data, retries + 1)
            
            return response
            
        except requests.exceptions.RequestException as e:
            if retries < self.MAX_RETRIES:
                time.sleep(self.RATE_LIMIT_DELAY)
                return self._make_request(method, endpoint, params, data, retries + 1)
            raise e
    
    def get_user_info(self) -> Dict[str, Any]:
        """
        Get current user information for credential validation
        
        Returns:
            User information dictionary
            
        Raises:
            requests.RequestException: If request fails
        """
        response = self._make_request('GET', 'members/me')
        response.raise_for_status()
        return response.json()
    
    def get_board(self, board_id: str) -> Dict[str, Any]:
        """
        Get board information
        
        Args:
            board_id: Board ID
            
        Returns:
            Board information dictionary
            
        Raises:
            requests.RequestException: If request fails
        """
        response = self._make_request('GET', f'boards/{board_id}')
        response.raise_for_status()
        return response.json()
    
    def get_list(self, list_id: str) -> Dict[str, Any]:
        """
        Get list information
        
        Args:
            list_id: List ID
            
        Returns:
            List information dictionary
            
        Raises:
            requests.RequestException: If request fails
        """
        response = self._make_request('GET', f'lists/{list_id}')
        response.raise_for_status()
        return response.json()
    
    def create_card(self, list_id: str, name: str, desc: str = None,
                   due: str = None, id_members: str = None) -> Dict[str, Any]:
        """
        Create a new card
        
        Args:
            list_id: Target list ID
            name: Card name
            desc: Card description
            due: Due date
            id_members: Member IDs to assign
            
        Returns:
            Created card information
            
        Raises:
            requests.RequestException: If request fails
        """
        data = {
            'idList': list_id,
            'name': name
        }
        
        if desc:
            data['desc'] = desc
        if due:
            data['due'] = due
        if id_members:
            data['idMembers'] = id_members
        
        response = self._make_request('POST', 'cards', data=data)
        response.raise_for_status()
        return response.json()
    
    def get_board_labels(self, board_id: str) -> list:
        """
        Get all labels for a board
        
        Args:
            board_id: Board ID
            
        Returns:
            List of board labels
            
        Raises:
            requests.RequestException: If request fails
        """
        response = self._make_request('GET', f'boards/{board_id}/labels')
        response.raise_for_status()
        return response.json()
    
    def add_label_to_card(self, card_id: str, label_id: str) -> None:
        """
        Add a label to a card
        
        Args:
            card_id: Card ID
            label_id: Label ID
            
        Raises:
            requests.RequestException: If request fails
        """
        data = {'value': label_id}
        response = self._make_request('POST', f'cards/{card_id}/idLabels', data=data)
        response.raise_for_status()