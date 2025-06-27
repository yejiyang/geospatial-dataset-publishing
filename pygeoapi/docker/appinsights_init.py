# appinsights_init.py - Lightweight Application Insights setup for pygeoapi
import os
import logging
from opencensus.ext.azure.log_exporter import AzureLogHandler
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.ext.flask.flask_middleware import FlaskMiddleware
from opencensus.trace.samplers import ProbabilitySampler


def setup_app_insights(app):
    """
    Setup lightweight Application Insights for pygeoapi
    Only tracks user interactions and basic telemetry
    """
    connection_string = os.environ.get('APPLICATIONINSIGHTS_CONNECTION_STRING')

    if not connection_string:
        print("Application Insights not configured - APPLICATIONINSIGHTS_CONNECTION_STRING not set")
        return

    try:
        # Setup request tracking with low sampling rate for lightweight monitoring
        middleware = FlaskMiddleware(
            app,
            exporter=AzureExporter(connection_string=connection_string),
            sampler=ProbabilitySampler(rate=0.1)  # Sample 10% of requests for lightweight monitoring
        )

        # Setup basic logging for user interactions
        logger = logging.getLogger(__name__)
        logger.addHandler(AzureLogHandler(connection_string=connection_string))
        logger.setLevel(logging.INFO)

        # Add custom properties for better analytics
        @app.before_request
        def before_request():
            from flask import request
            from opencensus.trace import execution_context

            tracer = execution_context.get_opencensus_tracer()
            if tracer:
                span = tracer.current_span()
                if span:
                    # Add custom properties for analytics
                    span.add_attribute('user_agent', request.headers.get('User-Agent', ''))
                    span.add_attribute('referrer', request.headers.get('Referer', ''))
                    span.add_attribute('api_endpoint', request.endpoint or 'unknown')

        print("Application Insights configured successfully")

    except Exception as e:
        print(f"Failed to setup Application Insights: {e}")


# Custom logging function for user interФactions
def log_user_interaction(action, details=None):
    """Log user interactions for analytics"""
    connection_string = os.environ.get('APPLICATIONINSIGHTS_CONNECTION_STRING')
    if connection_string:
        logger = logging.getLogger('user_analytics')
        logger.addHandler(AzureLogHandler(connection_string=connection_string))

        log_data = {'action': action}
        if details:
            log_data.update(details)

        logger.info(f"User interaction: {action}", extra={'custom_dimensions': log_data})
