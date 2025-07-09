# appinsights_init.py - Lightweight Application Insights setup for pygeoapi

import os
import logging
from opencensus.ext.azure.log_exporter import AzureLogHandler
from opencensus.ext.azure.trace_exporter import AzureExporter
from opencensus.ext.flask.flask_middleware import FlaskMiddleware
from opencensus.trace.samplers import ProbabilitySampler

# Global logger for reuse
_insights_logger = None


def setup_app_insights(app):
    """
    Setup lightweight Application Insights for pygeoapi
    Tracks user interactions and basic telemetry
    """
    connection_string = os.environ.get('APPLICATIONINSIGHTS_CONNECTION_STRING')

    if not connection_string:
        print("Application Insights not configured - APPLICATIONINSIGHTS_CONNECTION_STRING not set")
        return

    try:
        print("[appinsights] Setting up Application Insights with connection string")

        # Initialize OpenCensus Flask middleware
        middleware = FlaskMiddleware(
            app,
            exporter=AzureExporter(connection_string=connection_string),
            sampler=ProbabilitySampler(rate=0.1)  # Sample 10% of requests
        )

        # Setup base logging
        logging.basicConfig(level=logging.INFO)
        logger = logging.getLogger('pygeoapi_insights')

        if not any(isinstance(h, AzureLogHandler) for h in logger.handlers):
            handler = AzureLogHandler(connection_string=connection_string)
            logger.addHandler(handler)

        logger.setLevel(logging.INFO)

        global _insights_logger
        _insights_logger = logger  # Store globally for reuse in log_user_interaction

        # Add request attributes to spans
        @app.before_request
        def before_request():
            from flask import request
            from opencensus.trace import execution_context

            tracer = execution_context.get_opencensus_tracer()
            if tracer:
                span = tracer.current_span()
                if span:
                    span.add_attribute('user_agent', request.headers.get('User-Agent', ''))
                    span.add_attribute('referrer', request.headers.get('Referer', ''))
                    span.add_attribute('api_endpoint', request.endpoint or 'unknown')

        print("[appinsights] Application Insights configured successfully")

    except Exception as e:
        print(f"[appinsights] Failed to setup Application Insights: {e}")
        import traceback
        traceback.print_exc()


def log_user_interaction(action, details=None):
    """
    Log user interactions for analytics
    """
    if _insights_logger is None:
        print("[appinsights] Telemetry not initialized, skipping interaction log")
        return

    log_data = {'action': action}
    if details:
        log_data.update(details)

    _insights_logger.info(
        f"User interaction: {action}",
        extra={'custom_dimensions': log_data}
    )
