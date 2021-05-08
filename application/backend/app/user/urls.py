from django.urls import path
from user import views, totpviews
# Name for reverse function
app_name = 'user'

urlpatterns = [
    path('create', views.CreateUserView.as_view(), name='create'),
    path('confirm/<slug:uidb64>/<slug:token>', views.ActivateAccount.as_view(), name='confirm'),
    path('token', views.CreateTokenView.as_view(), name='token'),
    path('me', views.ManageUserViews.as_view(), name='me'),
    path('password/reset', views.PasswordReset.as_view(), name='reset'),
    path('password/reset/<slug:uidb64>/<slug:token>', views.ValidatePasswordReset.as_view(),
    	name='validate-reset'),
    path('totp/create', totpviews.TOTPCreateAPIView.as_view(), name='totp-create'),
    path('totp/login/<slug:uidb64>/<slug:token>', totpviews.TOTPAuthenticateView.as_view(),
    	name='totp-login'),
    path('totp/verify/<slug:token>', totpviews.VerifyTOTPView.as_view(), name='totp-activate'),
    path('delete', views.DeleteUserView.as_view(), name='delete'),
    path('password/update', views.UpdatePassword.as_view(), name='update-password-view'),
    path('totp/disable', totpviews.DisableTOTP.as_view(), name="reset-2fa"),
]

   