# Nexus Consensus Dashboard

A full-stack web application for simulating and visualizing decentralized consensus networks in real-time. The system features a custom Python backend for algorithmic simulations and a sleek, dynamic vanilla HTML/JS/CSS frontend for data visualization.

---

## 🎯 Features

- **Live Simulation Metrics:** Track active agents, latency, XUV scores, and fault tolerance dynamically.
- **Network Topology Visualization:** Interactive 3D/2D node mesh view of the decentralized protocol.
- **Extensible Consensus Algorithms:** Backend architecture supports simulating algorithms like PBFT (Practical Byzantine Fault Tolerance).
- **Responsive Dashboard UI:** Clean, polished design with dark mode aesthetics and micro-animations.

---

## 🛠 Tech Stack

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Font Awesome (Icons)
- Google Fonts (Inter)
- Custom Canvas-based Network Visualization

**Backend:**
- Python 3.x
- Flask / Flask-CORS (REST API)
- NetworkX, NumPy, Pandas (Network simulation and computation)
- Gunicorn (Production server)

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js (Optional, if using Vercel CLI for local dev)

### 1. Set up the Backend

Navigate to the backend directory, install dependencies, and run the server.

```bash
cd backend
python -m venv venv

# Activate Virtual Environment
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
python app.py
```

The Flask API will start running at `http://localhost:5000/`.

### 2. Run the Frontend

Since it's a Vanilla JS frontend, you can simply open the `frontend/index.html` file in your preferred web browser, or use a tool like Live Server in VS Code.

### 3. Alternative: Running via Vercel CLI

To test the production-like setup with Serverless functions locally:

```bash
# Return to the repo root
npm install -g vercel
vercel dev
```

---

## 📂 Project Structure

```text
decentralized-consensus-system/
├── backend/                  # Python Flask API & Simulation Engine
│   ├── api/                  # API routing handling
│   ├── core/                 # Core network logic
│   ├── simulations/          # Consensus simulation modules
│   ├── app.py                # Flask server entry point
│   ├── run_simulation.py     # Execution script for agents
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Static web dashboard
│   ├── index.html            # Main UI
│   ├── script.js             # Canvas logic & API polling
│   └── styles.css            # Theming and responsiveness
├── vercel.json               # Deployment configuration router
└── .vercelignore             # Ignored deployment files
```

---

## ☁️ Deployment

This project is configured out-of-the-box for serverless deployment on **Vercel**.

1. Connect your GitHub repository to Vercel.
2. Vercel will automatically read `vercel.json` to route `/api` traffic to your Python Flask functions and serve your `frontend` directory natively.
3. No build steps are required for the frontend.
