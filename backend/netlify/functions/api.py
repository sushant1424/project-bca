import os
import sys
import django
from django.core.wsgi import get_wsgi_application

# Add the backend directory to Python path
sys.path.append('/opt/build/repo')

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Initialize Django
django.setup()

# Get WSGI application
application = get_wsgi_application()

def handler(event, context):
    """Netlify function handler for Django"""
    from django.http import HttpRequest
    from django.urls import resolve
    from django.core.handlers.wsgi import WSGIRequest
    
    # Create Django request from Netlify event
    request = HttpRequest()
    request.method = event.get('httpMethod', 'GET')
    request.path = event.get('path', '/')
    
    # Handle the request through Django
    response = application(request.environ, lambda status, headers: None)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        },
        'body': ''.join(response)
    }
