### Module for generating tokens for password reset feature and confirm account via email feature
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils import six # for compatibility


class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    """ Generation of tokens for email confirmation.
       An  email confirmation will invalidate the token
    """
    def _make_hash_value(self, user, timestamp):
        return (
            six.text_type(user.pk) + six.text_type(timestamp) +
            six.text_type(user.profile.email_confirmed)
        )


class PasswordResetToken(PasswordResetTokenGenerator):
    """Generation of tokens for password reset.
       A password reset will invalidate the token
    """
    def _make_hash_value(self, user, timestamp):
        return (
            six.text_type(user.pk) + six.text_type(timestamp) +
            six.text_type(user.profile.reset_password)
        )



class ValidPassword :
    min_length = Integer()
    max_lenth = Integer()
    permitted_chars = list()

    def __init__(self, permitted_chars=[], min_length=8, max_lenth=28):
        self.max_lenth = max_lenth
        self.min_length = min_length
        self.permitted_chars = permitted_chars

    def check_pass_validity(self, password):
        """Function to check if a password is valid given the requirements """

        if  min_length <= password <= max_lenth:
            for letter in password: # use any(iterable) -> True if one True in the iterable
                if letter not in self.permitted_chars:
                    return False
                return True
        return False 
