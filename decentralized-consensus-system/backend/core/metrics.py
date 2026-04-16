import time

class MetricsTracker:
    def __init__(self):
        self.block_start_times = {}
        self.block_commit_times = {}
        self.throughput = 0
        self.message_count = 0

    def start_block(self, block_id):
        self.block_start_times[block_id] = time.time()

    def record_commit(self, block_id):
        if block_id not in self.block_commit_times:
            self.block_commit_times[block_id] = time.time()

    def log_message(self):
        self.message_count += 1

    def calculate_average_latency(self):
        latencies = []
        for b_id, start_t in self.block_start_times.items():
            if b_id in self.block_commit_times:
                # in ms
                latencies.append((self.block_commit_times[b_id] - start_t) * 1000)
        
        if not latencies:
            return 0.0
        return sum(latencies) / len(latencies)
