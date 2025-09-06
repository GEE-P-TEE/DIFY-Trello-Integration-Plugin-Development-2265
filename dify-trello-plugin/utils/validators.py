"""
Input validation utilities for Trello plugin
"""
import re
from datetime import datetime
from typing import List, Optional, Tuple


class TrelloValidator:
    """
    Utility class for validating Trello-related inputs
    """
    
    # Trello ID pattern (24 character hexadecimal)
    TRELLO_ID_PATTERN = re.compile(r'^[a-f0-9]{24}$')
    
    # Content limits
    MAX_TITLE_LENGTH = 512
    MAX_DESCRIPTION_LENGTH = 10000
    MAX_LABELS = 10
    
    @classmethod
    def validate_trello_id(cls, trello_id: str, field_name: str = "ID") -> Tuple[bool, str]:
        """
        Validate Trello ID format
        
        Args:
            trello_id: ID to validate
            field_name: Name of the field for error messages
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not trello_id:
            return False, f"{field_name} is required"
        
        if not isinstance(trello_id, str):
            return False, f"{field_name} must be a string"
        
        trello_id = trello_id.strip()
        
        if not cls.TRELLO_ID_PATTERN.match(trello_id):
            return False, f"{field_name} must be a 24-character hexadecimal string"
        
        return True, ""
    
    @classmethod
    def validate_and_clean_title(cls, title: str) -> Tuple[str, Optional[str]]:
        """
        Validate and clean card title
        
        Args:
            title: Card title to validate
            
        Returns:
            Tuple of (cleaned_title, warning_message)
        """
        if not title:
            return "", "Title cannot be empty"
        
        if not isinstance(title, str):
            return "", "Title must be a string"
        
        # Clean and truncate title
        cleaned_title = title.strip()
        warning = None
        
        if len(cleaned_title) > cls.MAX_TITLE_LENGTH:
            cleaned_title = cleaned_title[:cls.MAX_TITLE_LENGTH - 3] + "..."
            warning = f"Title was truncated to {cls.MAX_TITLE_LENGTH} characters"
        
        return cleaned_title, warning
    
    @classmethod
    def validate_and_clean_description(cls, description: str) -> Tuple[str, Optional[str]]:
        """
        Validate and clean card description
        
        Args:
            description: Card description to validate
            
        Returns:
            Tuple of (cleaned_description, warning_message)
        """
        if not description:
            return "", "Description cannot be empty"
        
        if not isinstance(description, str):
            return "", "Description must be a string"
        
        # Clean and truncate description
        cleaned_description = description.strip()
        warning = None
        
        if len(cleaned_description) > cls.MAX_DESCRIPTION_LENGTH:
            cleaned_description = cleaned_description[:cls.MAX_DESCRIPTION_LENGTH - 50]
            cleaned_description += "\n\n[Content truncated due to length limit]"
            warning = f"Description was truncated to {cls.MAX_DESCRIPTION_LENGTH} characters"
        
        return cleaned_description, warning
    
    @classmethod
    def validate_due_date(cls, due_date: str) -> Tuple[bool, str, Optional[str]]:
        """
        Validate due date format
        
        Args:
            due_date: Due date string to validate
            
        Returns:
            Tuple of (is_valid, iso_date_string, error_message)
        """
        if not due_date:
            return True, "", ""  # Due date is optional
        
        if not isinstance(due_date, str):
            return False, "", "Due date must be a string"
        
        due_date = due_date.strip()
        
        # Try to parse different date formats
        date_formats = [
            '%Y-%m-%d',
            '%Y-%m-%d %H:%M:%S',
            '%Y-%m-%dT%H:%M:%S',
            '%Y-%m-%dT%H:%M:%SZ'
        ]
        
        for date_format in date_formats:
            try:
                parsed_date = datetime.strptime(due_date, date_format)
                return True, parsed_date.isoformat(), ""
            except ValueError:
                continue
        
        return False, "", "Due date must be in YYYY-MM-DD format"
    
    @classmethod
    def validate_and_clean_labels(cls, labels: str) -> Tuple[List[str], Optional[str]]:
        """
        Validate and clean labels
        
        Args:
            labels: Comma-separated label names
            
        Returns:
            Tuple of (label_list, warning_message)
        """
        if not labels:
            return [], None
        
        if not isinstance(labels, str):
            return [], "Labels must be a string"
        
        # Split and clean labels
        label_list = [label.strip() for label in labels.split(',')]
        label_list = [label for label in label_list if label]  # Remove empty labels
        
        warning = None
        
        # Limit number of labels
        if len(label_list) > cls.MAX_LABELS:
            label_list = label_list[:cls.MAX_LABELS]
            warning = f"Only the first {cls.MAX_LABELS} labels will be used"
        
        # Clean individual labels (remove special characters, limit length)
        cleaned_labels = []
        for label in label_list:
            # Remove special characters and limit length
            cleaned_label = re.sub(r'[^\w\s-]', '', label)[:50]
            if cleaned_label:
                cleaned_labels.append(cleaned_label)
        
        return cleaned_labels, warning
    
    @classmethod
    def validate_member_id(cls, member_id: str) -> Tuple[bool, str]:
        """
        Validate Trello member ID format
        
        Args:
            member_id: Member ID to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        if not member_id:
            return True, ""  # Member ID is optional
        
        return cls.validate_trello_id(member_id, "Member ID")


class InputSanitizer:
    """
    Utility class for sanitizing user inputs
    """
    
    @staticmethod
    def sanitize_text(text: str) -> str:
        """
        Sanitize text input by removing potentially harmful characters
        
        Args:
            text: Text to sanitize
            
        Returns:
            Sanitized text
        """
        if not isinstance(text, str):
            return ""
        
        # Remove null bytes and control characters
        sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        
        # Normalize whitespace
        sanitized = re.sub(r'\s+', ' ', sanitized)
        
        return sanitized.strip()
    
    @staticmethod
    def sanitize_id(id_string: str) -> str:
        """
        Sanitize ID string by allowing only alphanumeric characters
        
        Args:
            id_string: ID string to sanitize
            
        Returns:
            Sanitized ID string
        """
        if not isinstance(id_string, str):
            return ""
        
        # Allow only alphanumeric characters for IDs
        sanitized = re.sub(r'[^a-f0-9]', '', id_string.lower())
        
        return sanitized.strip()