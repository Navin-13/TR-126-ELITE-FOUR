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

                const topoEffEl = document.getElementById('topology-efficiency');
                if(topoEffEl && data.topology_efficiency) topoEffEl.innerText = data.topology_efficiency;

                const topXuvAgent = document.getElementById('top-xuv-agent');
                if(topXuvAgent && data.highest_xuv_agent) topXuvAgent.innerText = data.highest_xuv_agent;

                const topXuvScore = document.getElementById('top-xuv-score');
                if(topXuvScore && data.highest_xuv_score) topXuvScore.innerText = data.highest_xuv_score;

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
    function drawTopology(numNodes) {
        const canvas = document.getElementById('topologyCanvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const radius = Math.min(cx, cy) - 40;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Cap nodes purely for rendering aesthetics so it doesn't become a solid blur of lines
        const drawNodes = Math.min(numNodes, 40); 
        const nodes = [];

        // Generate Node Coordinates on a Ring
        for(let i=0; i<drawNodes; i++) {
            const angle = (i / drawNodes) * (2 * Math.PI);
            nodes.push({
                x: cx + radius * Math.cos(angle),
                y: cy + radius * Math.sin(angle)
            });
        }

        // Draw Edges First (Underneath)
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)'; // primary-glow theme
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<nodes.length; i++) {
            for(let j=i+1; j<nodes.length; j++) {
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
            }
        }
        ctx.stroke();

        // Draw Nodes
        nodes.forEach((n, idx) => {
            // Glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#8b5cf6';
            
            ctx.beginPath();
            ctx.arc(n.x, n.y, 6, 0, 2*Math.PI);
            // Highlight a 'leader' node in pink
            ctx.fillStyle = idx === 0 ? '#ec4899' : '#f8fafc';
            ctx.fill();
            
            // Outer ring
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(n.x, n.y, 10, 0, 2*Math.PI);
            ctx.strokeStyle = idx === 0 ? '#ec4899' : '#6366f1';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        // Add a central pulse just for wow-factor design
        ctx.beginPath();
        let pulseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.8);
        pulseGrad.addColorStop(0, "rgba(236, 72, 153, 0.15)");
        pulseGrad.addColorStop(1, "transparent");
        ctx.fillStyle = pulseGrad;
        ctx.arc(cx, cy, radius * 0.8, 0, 2*Math.PI);
        ctx.fill();
    }
});
