import os
import sys

# Ensure local imports inside Vercel's module system work properly
sys.path.append(os.path.dirname(__file__))

from flask import Flask, jsonify, request
from flask_cors import CORS
from run_simulation import run_sim

app = Flask(__name__)
CORS(app)

@app.route('/api/simulation/latest', methods=['GET'])
def get_latest_simulation():
    # Vercel Serverless is read-only, so instead of reading a disk file, 
    # we simulate the base case dynamically in-memory and return it immediately.
    try:
        data = run_sim(num_nodes=10)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/simulation/run', methods=['POST'])
def trigger_simulation():
    try:
        data = request.json or {}
        num_nodes = int(data.get('num_nodes', 10))
        if num_nodes < 3: num_nodes = 3
        if num_nodes > 1000: num_nodes = 1000
        
        result = run_sim(num_nodes)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
