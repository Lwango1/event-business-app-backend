from django.contrib import admin
from .models import Product, Category  # On importe les deux d'un coup

# On enregistre chaque modèle une seule fois
admin.site.register(Product)
admin.site.register(Category)