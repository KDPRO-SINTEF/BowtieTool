"""Password validators module"""
import re
from rest_framework.exceptions import ValidationError
from abc import ABC, abstractmethod


class Validator(ABC):
    """Abstract class for User model attributes validation"""

    def __init__(self):
        super()

    @abstractmethod
    def validate(self, data, user=None):
        """Abstract validation method"""

    @abstractmethod
    def get_help_text(self):
        """Helper message"""


class LowercaseValidator(Validator):
    """Test class for lowercase letter in password """


    def validate(self, data, user=None):
        """Validate password"""
        if not re.findall('[a-z]', data):
            raise ValidationError(dict(password=
                "The password must contain at least 1 lowercase letter, a-z."),
                code='password_no_lower')

    def get_help_text(self):
        """Help message"""
        return(
            "Your password must contain at least 1 lowercase letter, a-z."
        )

class UppercaseValidator(Validator):
    """Validation for uppercase in password"""

    def validate(self, data, user=None):
        """Validate password"""
        if not re.findall('[A-Z]', data):
            raise ValidationError(dict(
                    password="The password must contain at least 1 uppercase letter, A-Z."),
                    code='password_no_upper')

    def get_help_text(self):
        """ Help message """
        return(
                "Your password must contain at least 1 uppercase letter, A-Z."
            )

class SymbolValidator(Validator):
    """Synbol Validator """

    def validate(self, data, user=None):
        """Validation for s4ymbol charecter in password"""
        regex_validator = r"[()[\]{}|\\`~!@#$%^&*_\-+=;:\'\",<>./?]"
        if not re.findall(regex_validator, data):
            raise ValidationError(dict(password=
                r"The password must contain at least 1 symbol: " +
                  "()[]{}|`~!@#$%^&*_-+=;:'\",<>./?"), code='password_no_symbol')

    def get_help_text(self):
        """Helper function"""
        return(
            r"Your password must contain at least 1 symbol: " +
            "()[]{}|`~!@#$%^&*_-+=;:'\",<>./?"
            "Your password must contain at least 1 symbol: " +
            r"()[]{}|\`~!@#$%^&*_-+=;:'\",<>./?")



class DigitValidator(Validator):
    """Validator if password contains one or more digits"""

    def validate(self, data, user=None):
        """Validate password"""
        if not re.findall('[0-9]', data):
            raise ValidationError(dict(password="The password must contain at least 1 digit, 1-9."),
                    code='password_no_digit')

    def get_help_text(self):
        """ Help message """
        return(
                "Your password must contain at least 1 digit"
            )


class UserNameValidator(Validator):

    def validate(self, data, user=None):
        """Validate password"""
        if len(re.findall('[0-9A-Za-z_-]', data)) != len(data):
            raise ValidationError(dict(username="The username must contain only letters, digits and undescores"),
                    code='invalid-username')

    def get_help_text(self):
        """ Help message """
        return(
                "The username must contain only letters, diggits and undescores"
            )

