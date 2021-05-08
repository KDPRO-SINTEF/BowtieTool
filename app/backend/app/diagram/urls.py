from django.urls import path, include
from diagram import views
from django.conf import settings
from django.conf.urls.static import static

app_name = 'diagram'

urlpatterns = [
    path('private', views.DiagramList.as_view(), name='private-diagrams'),
    path('public/list', views.PublicDiagrams.as_view(), name='all-public-diagrams'),
    path('<int:pk>', views.DiagramDetail.as_view(), name='my-diagrams'),
    path('private/list', views.PrivateDiagrams.as_view(), name='all-my-private_diagrams'),
    path('stats', views.StatsView.as_view(), name='stats-of-diagrams'),
    path('share/<int:pk>', views.ShareView.as_view(), name='shared-diagram'),
    path('shared', views.SharedWithMe.as_view(), name='shared-with-me'),
    path('versions/<int:pk>', views.DiagramVersions.as_view(), name='diagram-versions')
]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# 'search' to look for a diagram depending on it's tags and/or description
# 'researcher' to give statistical analysis over all the diagrams
