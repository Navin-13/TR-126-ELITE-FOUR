import os
import json
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS

# Define paths relative to the backend folder
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
FRONTEND_3D_DIR = os.path.join(BASE_DIR, 'frontend-3d')

app = Flask(__name__, static_folder=FRONTEND_DIR)
CORS(app)  # Allow cross-origin if needed

@app.route('/')
def serve_index():
    # Serve the main index.html from the frontend folder
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Serve JS, CSS, and other static assets
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/3d/')
def serve_3d_index():
    return send_from_directory(FRONTEND_3D_DIR, 'index.html')

@app.route('/3d/<path:path>')
def serve_3d_static(path):
    if path != "" and os.path.exists(os.path.join(FRONTEND_3D_DIR, path)):
        return send_from_directory(FRONTEND_3D_DIR, path)
    else:
        return send_from_directory(FRONTEND_3D_DIR, 'index.html')

@app.route('/api/simulation/latest', methods=['GET'])
def get_latest_simulation():
    # Read the simulation data from the runs
    results_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'simulations', 'results', 'fault_free_run.json')
    
    if not os.path.exists(results_file):
        return jsonify({"error": "Simulation data not found. Please run backend/run_simulation.py first."}), 404
        
    try:
        with open(results_file, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from run_simulation import run_sim
from flask import request

@app.route('/api/simulation/run', methods=['POST'])
def trigger_simulation():
    try:
        data = request.json or {}
        num_nodes = int(data.get('num_nodes', 10))
        # Add basic safeguards
        if num_nodes < 3: num_nodes = 3
        if num_nodes > 1000: num_nodes = 1000
        
        # Run the simulation directly
        result = run_sim(num_nodes)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Run the server on port 5000
    print(f"Serving Original Website from: {FRONTEND_DIR}")
    print(f"Serving 3D Clone Website from: {FRONTEND_3D_DIR}")
    print("Dashboard available at: http://localhost:5000/")
    print("3D Dashboard available at: http://localhost:5000/3d/")
    app.run(host='0.0.0.0', port=5000, debug=True)
