from django.urls import path

from user import views

app_name = 'user'

urlpatterns = [
    path('create/', views.CreateUserView.as_view(), name='create'),
    # Name for reverse function
    path('token/', views.CreateTokenView.as_view(), name='token'),
    path('me/', views.ManageUserViews.as_view(), name='me'),
]