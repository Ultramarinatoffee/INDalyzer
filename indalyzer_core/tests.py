from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .models import Affilie

class AffilieTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.affilie_data = {
            "numero_registre_national": "12345678901",
            "nom": "Chirac",
            "prenom": "Jacques",
            "date_naissance": "1930-01-01",
            "email": "jean.dupont@example.com"
        }
        self.response = self.client.post(
            reverse('affilie-list'),
            self.affilie_data,
            format="json")

    def test_api_can_create_a_affilie(self):
        self.assertEqual(self.response.status_code, status.HTTP_201_CREATED)

    def test_api_can_get_a_affilie(self):
        affilie = Affilie.objects.get()
        response = self.client.get(
            reverse('affilie-detail',
            kwargs={'pk': affilie.id}), format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, affilie.nom)

    def test_api_can_update_affilie(self):
        affilie = Affilie.objects.get()
        change_affilie = {
            'numero_registre_national': "12345678901",
            'nom': 'De Gaulle',  
            'prenom': 'Charles',
            'date_naissance': '1890-11-22',
            'email': 'charles.degaulle@example.com'
        }
        res = self.client.put(
            reverse('affilie-detail', kwargs={'pk': affilie.id}),
            change_affilie, format='json')
        print(res.content)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('De Gaulle', str(res.content))
  