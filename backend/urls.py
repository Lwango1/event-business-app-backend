from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
# On importe les ViewSets pour les produits et catégories
from ventes.views import ProduitViewSet, CategoryViewSet
from django.conf import settings
from django.conf.urls.static import static

# 1. Configuration du routeur pour l'API
router = DefaultRouter()
router.register(r'produits', ProduitViewSet, basename='produit')
router.register(r'categories', CategoryViewSet, basename='category')

# 2. Définition des chemins (Routes)
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

# 3. ACTIVATION DES IMAGES (C'est ce qui débloque tes photos importées)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)