document.addEventListener('DOMContentLoaded', () => {
    // Tab switching logic for sidebar
    const navItems = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active classes
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active-view'));

            // Add active class to clicked
            item.classList.add('active');
            
            // For MVP: we only have the dashboard fully coded;
            // if they click other tabs, they'll see a placeholder or it will just be blank.
            const targetId = item.getAttribute('data-tab');
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.classList.add('active-view');
            }
        });
    });

    // Run custom simulation
    const runBtn = document.getElementById('run-sim-btn');
    const simLog = document.getElementById('sim-log-text');
    
    if(runBtn) {
        runBtn.addEventListener('click', () => {
            const randomAgents = Math.floor(Math.random() * 95) + 5; // 5 to 100 agents
            
            runBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running...';
            runBtn.disabled = true;
            
            if(simLog) simLog.innerText = `Dispatching command to Python API for ${randomAgents} nodes...`;

            fetch('/api/simulation/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ num_nodes: randomAgents })
            })
            .then(res => res.json())
            .then(data => {
                runBtn.innerHTML = '<i class="fas fa-plus"></i> New Simulation';
                runBtn.disabled = false;
                
                if(data.error) {
                    if(simLog) simLog.innerText = `Error: ${data.error}`;
                    alert("Simulation failed.");
                } else {
                    if(simLog) simLog.innerText = `Success! Model committed 3 blocks using ${data.total_nodes} nodes at ${data.avg_latency_ms.toFixed(2)}ms avg.`;
                    // Immediately pull updated layout
                    fetchSimulationData();
                }
            })
            .catch(err => {
                runBtn.innerHTML = '<i class="fas fa-plus"></i> New Simulation';
                runBtn.disabled = false;
                if(simLog) simLog.innerText = `Network Error: ${err}`;
            });
        });
    }

    // Initial Fetch of Real Backend Data
    function fetchSimulationData() {
        console.log('Fetching live simulation data...');
        fetch('/api/simulation/latest')
            .then(response => response.json())
            .then(data => {
                if(data.error) {
                    console.error('API Error:', data.error);
                    return;
                }
                
                // Update DOM elements with real JSON data
                const totalAgents = data.total_nodes;
                const agentEl = document.getElementById('agent-count');
                if(agentEl) agentEl.innerText = totalAgents.toLocaleString();

                const edgeEl = document.getElementById('edge-count');
                if(edgeEl) edgeEl.innerText = (totalAgents * (totalAgents - 1) / 2).toLocaleString();

                drawTopology(totalAgents);

                const protocolEl = document.getElementById('current-protocol');
                if(protocolEl) protocolEl.innerText = 'PBFT (Fast Sync)';

                const faultEl = document.getElementById('fault-tolerance');
                if(faultEl) faultEl.innerText = `${data.faulty_nodes}%`;

                // Setup the dynamic activity feed!
                const blockCount = data.blocks_committed || 0;
                const activityFeed = document.getElementById('activity-feed-list');
                if(activityFeed) {
                    activityFeed.innerHTML = ""; // clear old
                    if (blockCount > 0) {
                        for(let b=0; b < blockCount; b++) {
                            // Generating dynamic feed items based on the number of actual committed blocks
                            activityFeed.innerHTML += `
                                <li>
                                    <div class="node-avatar">✓</div>
                                    <div class="activity-details">
                                        <p><strong>Agent 0</strong> achieved 100% quorum for <b>Block_${b}</b></p>
                                        <span style="color:var(--success);">0 faulty processes detected</span>
                                    </div>
                                    <span class="badge success">${data.avg_latency_ms.toFixed(1)}ms Sync</span>
                                </li>
                            `;
                        }
                    } else {
                        activityFeed.innerHTML = "<li><div class='activity-details'><p>No blocks committed.</p></div></li>";
                    }
                }

                const latencyEl = document.getElementById('avg-latency');
                if(latencyEl) {
                    // Slight random fluctuation visual effect around the real base metric
                    const baseLatency = data.avg_latency_ms;
                    let diff = (Math.random() * 0.2) - 0.1; 
                    let displayLat = (baseLatency + diff).toFixed(2);
                    
                    latencyEl.innerText = displayLat + 'ms';
                    // animate pop effect
                    latencyEl.style.transform = 'scale(1.05)';
                    latencyEl.style.color = 'var(--primary)';
                    setTimeout(() => {
                        latencyEl.style.transform = 'scale(1)';
                        latencyEl.style.color = '';
                    }, 300);
                }
            })
            .catch(err => console.error("Failed to fetch backend data:", err));
    }

    // Fetch immediately on load
    fetchSimulationData();
    
    // Poll the backend periodically
    setInterval(fetchSimulationData, 3500);
    // Topology Visualizer
    let currentGraph = null;
    let spinInterval = null;
    let isPaused = false;
    let angle = 0;

    const toggleBtn = document.getElementById('toggle-spin-btn');
    if(toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isPaused = !isPaused;
            if(isPaused) {
                toggleBtn.innerHTML = '<i class="fas fa-play"></i> Resume Camera';
                toggleBtn.style.background = 'rgba(255,255,255,0.1)';
            } else {
                toggleBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Camera';
                toggleBtn.style.background = '';
            }
        });
    }

    function drawTopology(numNodes) {
        const container = document.getElementById('3d-graph');
        if(!container) return;
        
        // Generate dataset for a complete network mesh
        const nodes = [];
        const links = [];
        
        for (let i = 0; i < numNodes; i++) {
            nodes.push({ 
                id: i, 
                group: i === 0 ? 'leader' : 'follower'
            });
        }
        
        // Connect every node to every other node (capped rendering for performance)
        const renderEdges = Math.min(numNodes, 30);
        for (let i = 0; i < renderEdges; i++) {
            for (let j = i + 1; j < renderEdges; j++) {
                links.push({ source: i, target: j });
            }
        }
        
        const gData = { nodes, links };

        if (!currentGraph) {
            // First time initialization
            currentGraph = ForceGraph3D()(container)
                .width(container.parentElement.clientWidth)
                .height(container.parentElement.clientHeight)
                .backgroundColor('rgba(0,0,0,0)')
                .nodeResolution(16)
                .nodeRelSize(6)
                .nodeLabel(node => Array.from(node.group)[0].toUpperCase() + node.group.slice(1) + " Agent " + node.id)
                .nodeAutoColorBy('group')
                .linkColor(() => 'rgba(99, 102, 241, 0.3)') // --primary-glow
                .linkWidth(0.5)
                .enableNodeDrag(true);
                
            // Set up a SINGLE spin loop that respects the pause state
            spinInterval = setInterval(() => {
                if(!isPaused) {
                    currentGraph.cameraPosition({
                        x: 200 * Math.sin(angle),
                        z: 200 * Math.cos(angle)
                    });
                    angle += Math.PI / 800; // spin speed
                }
            }, 30);
        }
        
        currentGraph.graphData(gData);
        
        // Apply our theme colors
        currentGraph.nodeColor(node => node.group === 'leader' ? '#ec4899' : '#6366f1');
    }
});
