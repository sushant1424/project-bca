import json
import os
import sys
from io import StringIO

def handler(event, context):
    """Netlify serverless function handler for Django"""
    
    try:
        # Add the project root to Python path
        sys.path.insert(0, '/opt/build/repo')
        
        # Set up Django
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
        
        import django
        from django.conf import settings
        
        if not settings.configured:
            django.setup()
        
        from django.core.handlers.wsgi import WSGIRequest
        from django.core.handlers.wsgi import WSGIHandler
        from django.http import HttpResponse
        
        # Get request details from Netlify event
        http_method = event.get('httpMethod', 'GET')
        path = event.get('path', '/')
        query_string = event.get('queryStringParameters') or {}
        headers = event.get('headers', {})
        body = event.get('body', '') or ''
        
        # Handle CORS preflight
        if http_method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
                    'Access-Control-Max-Age': '86400',
                },
                'body': ''
            }
        
        # Build query string
        query_params = []
        for key, value in query_string.items():
            if value is not None:
                query_params.append(f"{key}={value}")
        query_string_final = '&'.join(query_params)
        
        # Create WSGI environ
        environ = {
            'REQUEST_METHOD': http_method,
            'PATH_INFO': path,
            'QUERY_STRING': query_string_final,
            'CONTENT_TYPE': headers.get('content-type', 'application/json'),
            'CONTENT_LENGTH': str(len(body.encode('utf-8'))) if body else '0',
            'SERVER_NAME': 'wrytera.netlify.app',
            'SERVER_PORT': '443',
            'wsgi.version': (1, 0),
            'wsgi.url_scheme': 'https',
            'wsgi.input': StringIO(body) if body else StringIO(''),
            'wsgi.errors': sys.stderr,
            'wsgi.multithread': False,
            'wsgi.multiprocess': True,
            'wsgi.run_once': False,
            'HTTP_HOST': 'wrytera.netlify.app',
        }
        
        # Add headers to environ
        for key, value in headers.items():
            key = key.upper().replace('-', '_')
            if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
                environ[f'HTTP_{key}'] = value
        
        # Create Django request and get response
        request = WSGIRequest(environ)
        django_handler = WSGIHandler()
        response = django_handler(request)
        
        # Convert Django response to Netlify format
        response_body = b''.join(response).decode('utf-8')
        
        return {
            'statusCode': response.status_code,
            'headers': {
                'Content-Type': response.get('Content-Type', 'application/json'),
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
            },
            'body': response_body
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'Django function handler error'
            })
        }
