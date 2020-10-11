from django.conf.urls import url
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from diagram import views

app_name = 'diagram'

# router = DefaultRouter()
# router.register(r'diagrams', views.DiagramViewSet)

#
# urlpatterns = [
#     path('', include(router.urls)),
# ]

urlpatterns = [
    path('private', views.DiagramList.as_view(), name='private-diagrams'),
    path('public', views.PublicDiagrams.as_view(), name='public-diagrams'),
    path('<int:pk>', views.DiagramDetail.as_view(), name='my-diagrams')
]
