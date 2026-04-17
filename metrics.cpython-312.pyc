from core.consensus import ConsensusProtocol, Message

class Agent:
    def __init__(self, agent_id):
        self.id = agent_id
        self.inbox = []
        self.outbox = []
        self.committed_blocks = []
        self.protocol = ConsensusProtocol(self)

    def receive_message(self, msg):
        self.inbox.append(msg)

    def process_step(self, total_nodes):
        current_inbox = self.inbox.copy()
        self.inbox.clear()

        for msg in current_inbox:
            broadcast_msgs = self.protocol.process_message(msg, total_nodes)
            self.outbox.extend(broadcast_msgs)
            
    def propose_block(self, block_id):
        # The leader proposes a block
        msg = Message(self.id, "PRE_PREPARE", block_id, data="Block_Data")
        self.outbox.append(msg)

    def commit_block(self, block_id):
        if block_id not in self.committed_blocks:
            self.committed_blocks.append(block_id)

    def get_outbox_and_clear(self):
        msgs = self.outbox.copy()
        self.outbox.clear()
        return msgs
