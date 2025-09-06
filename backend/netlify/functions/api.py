import json
import os
import sys
from urllib.parse import unquote

# Add the project root to Python path
sys.path.insert(0, '/opt/build/repo')

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from django.core.handlers.wsgi import WSGIRequest
from django.http import HttpResponse
from django.urls import resolve
from django.core.handlers.base import BaseHandler

def handler(event, context):
    """Netlify serverless function handler for Django"""
    
    # Get request details from Netlify event
    http_method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    query_string = event.get('queryStringParameters') or {}
    headers = event.get('headers', {})
    body = event.get('body', '')
    
    # Remove /api prefix if present (since Netlify redirects handle this)
    if path.startswith('/api'):
        path = path[4:]
    if not path.startswith('/'):
        path = '/' + path
    
    # Build query string
    query_params = []
    for key, value in query_string.items():
        if value is not None:
            query_params.append(f"{key}={value}")
    query_string_final = '&'.join(query_params)
    
    # Create WSGI environ
    environ = {
        'REQUEST_METHOD': http_method,
        'PATH_INFO': unquote(path),
        'QUERY_STRING': query_string_final,
        'CONTENT_TYPE': headers.get('content-type', ''),
        'CONTENT_LENGTH': str(len(body)) if body else '0',
        'SERVER_NAME': 'wrytera.netlify.app',
        'SERVER_PORT': '443',
        'wsgi.version': (1, 0),
        'wsgi.url_scheme': 'https',
        'wsgi.input': None,
        'wsgi.errors': sys.stderr,
        'wsgi.multithread': False,
        'wsgi.multiprocess': True,
        'wsgi.run_once': False,
    }
    
    # Add headers to environ
    for key, value in headers.items():
        key = key.upper().replace('-', '_')
        if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
            environ[f'HTTP_{key}'] = value
    
    # Handle request body
    if body:
        from io import StringIO
        environ['wsgi.input'] = StringIO(body)
    
    # Create Django request
    request = WSGIRequest(environ)
    
    # Get Django response
    from django.core.handlers.wsgi import WSGIHandler
    handler = WSGIHandler()
    response = handler(request)
    
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
