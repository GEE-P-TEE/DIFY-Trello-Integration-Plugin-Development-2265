"""
Trello Card Creation Tool
"""
import json
import requests
import time
from datetime import datetime
from typing import Any, Dict, List, Union

from core.tools.entities.tool_entities import ToolInvokeMessage
from core.tools.tool.base_tool import BaseTool


class CreateTrelloCardTool(BaseTool):
    """
    Tool for creating Trello cards with AI-generated content
    """
    
    def _invoke(self, user_id: str, tool_parameters: Dict[str, Any]) -> Union[ToolInvokeMessage, List[ToolInvokeMessage]]:
        """
        Invoke the Trello card creation tool
        
        Args:
            user_id: The user ID
            tool_parameters: Parameters for card creation
            
        Returns:
            ToolInvokeMessage with creation result
        """
        try:
            # Get credentials
            credentials = self.runtime.credentials
            api_key = credentials.get('trello_api_key')
            token = credentials.get('trello_token')
            
            if not api_key or not token:
                return self.create_text_message('Error: Trello API credentials not configured')
            
            # Extract and validate parameters
            card_title = tool_parameters.get('card_title', '').strip()
            card_description = tool_parameters.get('card_description', '').strip()
            board_id = tool_parameters.get('board_id', '').strip()
            list_id = tool_parameters.get('list_id', '').strip()
            labels = tool_parameters.get('labels', '').strip()
            due_date = tool_parameters.get('due_date', '').strip()
            assignee_id = tool_parameters.get('assignee_id', '').strip()
            
            # Validate required parameters
            if not card_title:
                return self.create_text_message('Error: Card title is required')
            if not card_description:
                return self.create_text_message('Error: Card description is required')
            if not board_id:
                return self.create_text_message('Error: Board ID is required')
            if not list_id:
                return self.create_text_message('Error: List ID is required')
            
            # Validate and truncate content
            card_title = self._validate_and_truncate_title(card_title)
            card_description = self._validate_and_truncate_description(card_description)
            
            # Validate due date format if provided
            if due_date:
                due_date = self._validate_due_date(due_date)
                if not due_date:
                    return self.create_text_message('Error: Due date must be in YYYY-MM-DD format')
            
            # Process labels
            label_list = self._process_labels(labels)
            
            # Create the card
            result = self._create_trello_card(
                api_key=api_key,
                token=token,
                title=card_title,
                description=card_description,
                board_id=board_id,
                list_id=list_id,
                labels=label_list,
                due_date=due_date,
                assignee_id=assignee_id
            )
            
            if result['success']:
                card_url = result['card_url']
                message = f"✅ Trello card created successfully!\n\n"
                message += f"📋 Title: {card_title}\n"
                message += f"🔗 URL: {card_url}\n"
                message += f"📍 Board ID: {board_id}\n"
                message += f"📝 List ID: {list_id}"
                
                if label_list:
                    message += f"\n🏷️ Labels: {', '.join(label_list)}"
                if due_date:
                    message += f"\n📅 Due Date: {due_date}"
                if assignee_id:
                    message += f"\n👤 Assigned to: {assignee_id}"
                    
                return self.create_text_message(message)
            else:
                return self.create_text_message(f"❌ Failed to create Trello card: {result['error']}")
                
        except Exception as e:
            return self.create_text_message(f"❌ Unexpected error: {str(e)}")
    
    def _validate_and_truncate_title(self, title: str) -> str:
        """
        Validate and truncate title if necessary
        
        Args:
            title: The card title
            
        Returns:
            Validated and potentially truncated title
        """
        # Trello card titles have a limit of 16,384 characters, but we'll be more conservative
        max_length = 512
        if len(title) > max_length:
            title = title[:max_length-3] + "..."
        return title.strip()
    
    def _validate_and_truncate_description(self, description: str) -> str:
        """
        Validate and truncate description if necessary
        
        Args:
            description: The card description
            
        Returns:
            Validated and potentially truncated description
        """
        # Trello descriptions can be up to 16,384 characters, but we'll limit to 10,000 for performance
        max_length = 10000
        if len(description) > max_length:
            description = description[:max_length-50] + "\n\n[Content truncated due to length limit]"
        return description.strip()
    
    def _validate_due_date(self, due_date: str) -> str:
        """
        Validate due date format
        
        Args:
            due_date: Date string in YYYY-MM-DD format
            
        Returns:
            Validated date string or empty string if invalid
        """
        try:
            # Parse the date to validate format
            parsed_date = datetime.strptime(due_date, '%Y-%m-%d')
            # Return ISO format for Trello API
            return parsed_date.isoformat()
        except ValueError:
            return ""
    
    def _process_labels(self, labels: str) -> List[str]:
        """
        Process comma-separated labels into a list
        
        Args:
            labels: Comma-separated label names
            
        Returns:
            List of label names
        """
        if not labels:
            return []
        
        label_list = [label.strip() for label in labels.split(',')]
        # Filter out empty labels and limit to reasonable number
        label_list = [label for label in label_list if label][:10]
        return label_list
    
    def _create_trello_card(self, api_key: str, token: str, title: str, description: str,
                           board_id: str, list_id: str, labels: List[str] = None,
                           due_date: str = None, assignee_id: str = None) -> Dict[str, Any]:
        """
        Create a Trello card using the API
        
        Args:
            api_key: Trello API key
            token: Trello token
            title: Card title
            description: Card description
            board_id: Target board ID
            list_id: Target list ID
            labels: Optional list of label names
            due_date: Optional due date
            assignee_id: Optional assignee member ID
            
        Returns:
            Dictionary with success status and result
        """
        try:
            # Verify board and list exist
            board_check = self._verify_board_access(api_key, token, board_id)
            if not board_check['success']:
                return board_check
            
            list_check = self._verify_list_access(api_key, token, board_id, list_id)
            if not list_check['success']:
                return list_check
            
            # Prepare card data
            url = "https://api.trello.com/1/cards"
            params = {
                'key': api_key,
                'token': token,
                'idList': list_id,
                'name': title,
                'desc': description
            }
            
            # Add optional parameters
            if due_date:
                params['due'] = due_date
            
            if assignee_id:
                params['idMembers'] = assignee_id
            
            # Create the card
            response = requests.post(url, params=params, timeout=30)
            
            if response.status_code == 429:
                # Rate limited, wait and retry
                time.sleep(2)
                response = requests.post(url, params=params, timeout=30)
            
            if response.status_code == 200:
                card_data = response.json()
                card_id = card_data['id']
                card_url = card_data['url']
                
                # Add labels if specified
                if labels:
                    self._add_labels_to_card(api_key, token, card_id, labels, board_id)
                
                return {
                    'success': True,
                    'card_id': card_id,
                    'card_url': card_url
                }
            else:
                error_msg = f"HTTP {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg = error_data.get('message', error_msg)
                except:
                    pass
                return {
                    'success': False,
                    'error': f"Failed to create card: {error_msg}"
                }
                
        except requests.exceptions.Timeout:
            return {
                'success': False,
                'error': "Request timeout. Please try again."
            }
        except requests.exceptions.ConnectionError:
            return {
                'success': False,
                'error': "Connection error. Please check your network."
            }
        except Exception as e:
            return {
                'success': False,
                'error': f"Unexpected error: {str(e)}"
            }
    
    def _verify_board_access(self, api_key: str, token: str, board_id: str) -> Dict[str, Any]:
        """
        Verify access to the specified board
        
        Args:
            api_key: Trello API key
            token: Trello token
            board_id: Board ID to verify
            
        Returns:
            Dictionary with verification result
        """
        try:
            url = f"https://api.trello.com/1/boards/{board_id}"
            params = {
                'key': api_key,
                'token': token,
                'fields': 'id,name'
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                return {'success': True}
            elif response.status_code == 404:
                return {
                    'success': False,
                    'error': f"Board not found or access denied. Please check the board ID: {board_id}"
                }
            else:
                return {
                    'success': False,
                    'error': f"Cannot access board: HTTP {response.status_code}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Board verification failed: {str(e)}"
            }
    
    def _verify_list_access(self, api_key: str, token: str, board_id: str, list_id: str) -> Dict[str, Any]:
        """
        Verify access to the specified list
        
        Args:
            api_key: Trello API key
            token: Trello token
            board_id: Board ID
            list_id: List ID to verify
            
        Returns:
            Dictionary with verification result
        """
        try:
            url = f"https://api.trello.com/1/lists/{list_id}"
            params = {
                'key': api_key,
                'token': token,
                'fields': 'id,name,idBoard'
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                list_data = response.json()
                if list_data.get('idBoard') != board_id:
                    return {
                        'success': False,
                        'error': f"List {list_id} does not belong to board {board_id}"
                    }
                return {'success': True}
            elif response.status_code == 404:
                return {
                    'success': False,
                    'error': f"List not found or access denied. Please check the list ID: {list_id}"
                }
            else:
                return {
                    'success': False,
                    'error': f"Cannot access list: HTTP {response.status_code}"
                }
                
        except Exception as e:
            return {
                'success': False,
                'error': f"List verification failed: {str(e)}"
            }
    
    def _add_labels_to_card(self, api_key: str, token: str, card_id: str, labels: List[str], board_id: str):
        """
        Add labels to a card
        
        Args:
            api_key: Trello API key
            token: Trello token
            card_id: Card ID
            labels: List of label names
            board_id: Board ID for label lookup
        """
        try:
            # Get board labels
            board_labels = self._get_board_labels(api_key, token, board_id)
            
            for label_name in labels:
                # Find matching label
                matching_label = None
                for board_label in board_labels:
                    if board_label.get('name', '').lower() == label_name.lower():
                        matching_label = board_label
                        break
                
                if matching_label:
                    # Add existing label to card
                    url = f"https://api.trello.com/1/cards/{card_id}/idLabels"
                    params = {
                        'key': api_key,
                        'token': token,
                        'value': matching_label['id']
                    }
                    requests.post(url, params=params, timeout=10)
                    
        except Exception:
            # Labels are optional, so we don't fail the entire operation
            pass
    
    def _get_board_labels(self, api_key: str, token: str, board_id: str) -> List[Dict]:
        """
        Get all labels for a board
        
        Args:
            api_key: Trello API key
            token: Trello token
            board_id: Board ID
            
        Returns:
            List of board labels
        """
        try:
            url = f"https://api.trello.com/1/boards/{board_id}/labels"
            params = {
                'key': api_key,
                'token': token
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                return []
                
        except Exception:
            return []