from django.urls import path

from user import views

app_name = 'user'

urlpatterns = [
    path('create/', views.CreateUserView.as_view(), name='create'),
    path('confirm/<slug:uidb64>/<slug:token>', views.ActivateAccount.as_view(), name='confirm'),
    # Name for reverse function
    path('token/', views.CreateTokenView.as_view(), name='token'),
    path('me/', views.ManageUserViews.as_view(), name='me'),
    path('reset/', views.PasswordReset.as_view(), name='reset'),
    path('reset/<slug:uidb64>/<slug:token>', views.ValidatePasswordReset.as_view(), name='validate-reset'),
]