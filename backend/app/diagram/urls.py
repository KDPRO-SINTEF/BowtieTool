from django.urls import path, include
from diagram import views

app_name = 'diagram'

urlpatterns = [
    path('private', views.DiagramList.as_view(), name='private-diagrams'),
    path('public', views.PublicDiagrams.as_view(), name='public-diagrams'),
    path('<int:pk>', views.DiagramDetail.as_view(), name='my-diagrams')
]
