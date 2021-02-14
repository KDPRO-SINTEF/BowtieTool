import re
from django.forms import ValidationError
class LowercaseValidator:
    """Test class for lowercase letter in password """
    def validate(self, password, user=None):
        if not re.findall('[a-z]', password):
            raise ValidationError(
                "The password must contain at least 1 lowercase letter, a-z.",
                code='password_no_lower')
    def get_help_text(self):
        return(
            "Your password must contain at least 1 lowercase letter, a-z."
        )

class UppercaseValidator:
    """Validater for uppercase in password"""
    def validate(self, password, user=None):
        if not re.findall('[A-Z]', password):
            raise ValidationError("The password must contain at least 1 uppercase letter, A-Z.",
                    code='password_no_upper')

    def get_help_text(self):
        """ Help message """
        return(
                "Your password must contain at least 1 uppercase letter, A-Z."
            )

class SymbolValidator:
    """Synbol Validator """
    def validate(self, password, user=None):
        if not re.findall(r'[()[\]{}|\\`~!@#$%^&*_\-+=;:\'",<>./?]', password):
            raise ValidationError(
                "The password must contain at least 1 symbol: " +
                  r"()[]{}|\`~!@#$%^&*_-+=;:'\",<>./?",
                code='password_no_symbol',
            )

    def get_help_text(self):
        return(
            "Your password must contain at least 1 symbol: " +
            r"()[]{}|\`~!@#$%^&*_-+=;:'\",<>./?"
        )
