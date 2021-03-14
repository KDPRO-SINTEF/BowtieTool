from django.urls import path, include
from diagram import views

app_name = 'diagram'

urlpatterns = [
    path('private', views.DiagramList.as_view(), name='private-diagrams'),
    path('public/list', views.PublicDiagrams.as_view(), name='all-public-diagrams'),
    path('<int:pk>', views.DiagramDetail.as_view(), name='my-diagrams'),
    path('private/list', views.PrivateDiagrams.as_view(), name='all-my-private_diagrams'),
    path('stats', views.StatsView.as_view(), name='stats-of-diagrams')
]
# 'search' to look for a diagram depending on it's tags and/or description
# 'researcher' to give statistical analysis over all the diagrams
