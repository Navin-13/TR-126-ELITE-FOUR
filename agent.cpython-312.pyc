"""Configuration for the backend application"""

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Base configuration"""
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    TESTING = False
    
    # API Configuration
    MAX_AGENTS = 1000
    MAX_SIMULATION_STEPS = 5000
    
    # Upload/Download paths
    UPLOAD_FOLDER = 'simulations'
    SIMULATION_RESULTS_PATH = os.path.join(UPLOAD_FOLDER, 'results')
    VISUALIZATION_PATH = os.path.join(UPLOAD_FOLDER, 'visualizations')
    
    # Create folders if they don't exist
    os.makedirs(SIMULATION_RESULTS_PATH, exist_ok=True)
    os.makedirs(VISUALIZATION_PATH, exist_ok=True)

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}