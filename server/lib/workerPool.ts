// server/lib/workerPool.ts - Complete worker pool implementation
import { Worker } from 'worker_threads';
import { cpus } from 'os';
import path from 'path';

interface Task {
  buffer: Buffer;
  settings: {
    quality: number;
    outputFormat: string;
    resizeWidth?: number;
    resizeHeight?: number;
    compressionAlgorithm?: string;
  };
  originalName: string;
  originalSize: number;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}

class WorkerPool {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: Task[] = [];
  private poolSize: number;
  private isInitialized = false;

  constructor(poolSize?: number) {
    // Default to number of CPU cores, max 4 workers for typical servers
    this.poolSize = poolSize || Math.min(cpus().length, 4);
    console.log(`🔧 Initializing worker pool with ${this.poolSize} workers`);
  }

  // Lazy initialization - only create workers when first used
  private async initializeWorkers() {
    if (this.isInitialized) return;
    
    const workerPath = path.join(__dirname, 'imageWorker.js');
    console.log(`🔧 Worker path: ${workerPath}`);

    for (let i = 0; i < this.poolSize; i++) {
      try {
        const worker = new Worker(workerPath);

        worker.on('message', (message) => {
          if (message.ready) {
            // Worker is ready, add to available pool
            this.availableWorkers.push(worker);
            console.log(`✅ Worker ${i + 1} ready (${this.availableWorkers.length}/${this.poolSize})`);
            this.processNextTask();
            return;
          }

          // Task completed, return worker to pool
          this.availableWorkers.push(worker);
          this.processNextTask();
        });

        worker.on('error', (error) => {
          console.error(`❌ Worker ${i + 1} error:`, error);
          // Remove failed worker
          const index = this.workers.indexOf(worker);
          if (index > -1) {
            this.workers.splice(index, 1);
          }
        });

        worker.on('exit', (code) => {
          if (code !== 0) {
            console.error(`⚠️ Worker stopped with exit code ${code}`);
          }
        });

        this.workers.push(worker);
      } catch (error) {
        console.error(`❌ Failed to create worker ${i + 1}:`, error);
      }
    }

    this.isInitialized = true;
    console.log(`✅ Worker pool initialized with ${this.workers.length} workers`);
  }

  private processNextTask() {
    if (this.taskQueue.length === 0 || this.availableWorkers.length === 0) {
      return;
    }

    const task = this.taskQueue.shift()!;
    const worker = this.availableWorkers.shift()!;

    // Set up one-time message listener for this task
    const messageHandler = (message: any) => {
      if (message.success) {
        task.resolve(message.data);
      } else {
        task.reject(new Error(message.error));
      }
      worker.off('message', messageHandler);
    };

    worker.on('message', messageHandler);

    // Send task to worker
    worker.postMessage({
      buffer: task.buffer,
      settings: task.settings,
      originalName: task.originalName,
      originalSize: task.originalSize
    });
  }

  public async processImage(
    buffer: Buffer,
    settings: any,
    originalName: string,
    originalSize: number
  ): Promise<any> {
    // Initialize workers on first use
    if (!this.isInitialized) {
      await this.initializeWorkers();
    }

    return new Promise((resolve, reject) => {
      this.taskQueue.push({
        buffer,
        settings,
        originalName,
        originalSize,
        resolve,
        reject
      });

      this.processNextTask();
    });
  }

  public async terminate() {
    console.log('🔧 Terminating worker pool...');
    await Promise.all(this.workers.map(worker => worker.terminate()));
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
    this.isInitialized = false;
  }

  public getStats() {
    return {
      poolSize: this.poolSize,
      availableWorkers: this.availableWorkers.length,
      queuedTasks: this.taskQueue.length,
      busyWorkers: this.poolSize - this.availableWorkers.length,
      initialized: this.isInitialized
    };
  }
}

// Export singleton instance
let workerPoolInstance: WorkerPool | null = null;

export function getWorkerPool(): WorkerPool {
  if (!workerPoolInstance) {
    workerPoolInstance = new WorkerPool();
  }
  return workerPoolInstance;
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (workerPoolInstance) {
    await workerPoolInstance.terminate();
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  if (workerPoolInstance) {
    await workerPoolInstance.terminate();
  }
  process.exit(0);
});