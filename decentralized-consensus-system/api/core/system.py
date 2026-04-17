import networkx as nx
from core.agent import Agent
from core.metrics import MetricsTracker

class SimulationSystem:
    def __init__(self, num_nodes=10):
        self.num_nodes = num_nodes
        self.agents = [Agent(i) for i in range(num_nodes)]
        self.metrics = MetricsTracker()
        
        # Perfect connectivity for 0-fault ideal scenario
        self.network = nx.complete_graph(num_nodes)
        
    def route_messages(self):
        # Gather all outboxes
        all_messages = []
        for agent in self.agents:
            msgs = agent.get_outbox_and_clear()
            all_messages.extend(msgs)
            
        # Route to destinations (broadcast to everyone in complete graph)
        for msg in all_messages:
            self.metrics.log_message() # Track throughput
            for neighbor in self.network.neighbors(msg.sender_id):
                # Ensure we don't route back to sender for efficiency
                if neighbor != msg.sender_id:
                    self.agents[neighbor].receive_message(msg)

    def step(self):
        # 1. Process messages currently in inbox
        for agent in self.agents:
            agent.process_step(self.num_nodes)
            
        # 2. Route generated messages to neighbors
        self.route_messages()

    def check_consensus_reached(self, block_id):
        # Check if all honest nodes have committed the block (0 faults)
        for agent in self.agents:
            if block_id not in agent.committed_blocks:
                return False
        return True
