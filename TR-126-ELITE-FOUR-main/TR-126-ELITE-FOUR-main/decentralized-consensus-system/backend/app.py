import os
import sys
import json

# Ensure backend directory is on the path so relative imports work in Vercel serverless
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from flask import Flask, jsonify
from flask_cors import CORS

# Flask app (frontend is served as static files by Vercel; Flask handles /api/* only)
app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Writable temp directory for Vercel (its filesystem is read-only except /tmp)
TMP_DIR = '/tmp'
RESULTS_FILE = os.path.join(TMP_DIR, 'fault_free_run.json')

@app.route('/api/simulation/latest', methods=['GET'])
def get_latest_simulation():
    # Read the simulation data from /tmp (writable on Vercel)
    if not os.path.exists(RESULTS_FILE):
        return jsonify({"error": "No simulation run yet. POST to /api/simulation/run first."}), 404

    try:
        with open(RESULTS_FILE, 'r') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

from run_simulation import run_sim  # noqa: E402 – imported after sys.path is set
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
