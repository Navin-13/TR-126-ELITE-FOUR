class Message:
    def __init__(self, sender_id, msg_type, block_id, data=None):
        self.sender_id = sender_id
        self.msg_type = msg_type  # PRE_PREPARE, PREPARE, COMMIT
        self.block_id = block_id
        self.data = data
        
class ConsensusProtocol:
    def __init__(self, agent):
        self.agent = agent
        # block_id -> set of voters
        self.prepare_votes = {}
        self.commit_votes = {}

    def process_message(self, msg, total_nodes):
        required_quorum = (2 * total_nodes) // 3 + 1
        outbox = []

        if msg.msg_type == "PRE_PREPARE":
            # In purely honest simulation, accept the pre-prepare instantly
            outbox.append(Message(self.agent.id, "PREPARE", msg.block_id))
            
            if msg.block_id not in self.prepare_votes:
                self.prepare_votes[msg.block_id] = set()

        elif msg.msg_type == "PREPARE":
            if msg.block_id not in self.prepare_votes:
                self.prepare_votes[msg.block_id] = set()
            
            # Since simulation assumes 0 faulty nodes, they vote honestly
            self.prepare_votes[msg.block_id].add(msg.sender_id)
            
            if len(self.prepare_votes[msg.block_id]) >= required_quorum:
                if msg.block_id not in self.commit_votes:
                    self.commit_votes[msg.block_id] = set()
                    outbox.append(Message(self.agent.id, "COMMIT", msg.block_id))

        elif msg.msg_type == "COMMIT":
            if msg.block_id not in self.commit_votes:
                self.commit_votes[msg.block_id] = set()
            
            self.commit_votes[msg.block_id].add(msg.sender_id)
            
            if len(self.commit_votes[msg.block_id]) >= required_quorum:
                # We reached quorum on commits, agent commits the block
                self.agent.commit_block(msg.block_id)
                self.commit_votes[msg.block_id].clear() # prevent multiple commits for same block

        return outbox
