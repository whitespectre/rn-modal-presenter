export type ModalQueuePriority = 'high' | 'default' | 'low';

export const defaultQueueName = 'default_queue';

export type ModalQueueElement = {
  present: (onDismiss: () => void) => void;
  /**
   * The queue presents the modal with the highest priority first.
   * 
   * Default value is `default`. Possible values are: `'high'` | `'default'` | `'low'`. 
   */
  priority?: ModalQueuePriority;
  /**
   * delay in millisecond before the queue presents this modal. Default value is `0`.
   * 
   * You can also specify a `minimumDelay` to the queue itself, which applies to all modals in that queue.
   */
  delay?: number;
};

interface ModalQueueDelegate {
  onStop: () => void;
}

export class ModalQueue {
  private delegate: ModalQueueDelegate;
  private modals: ModalQueueElement[] = [];
  private running = false;
  
  /**
   * The name of this queue.
   */
  name: string;

  /**
   * A minimum delay in millisecond for all modals in this queue before they are presented.
   * 
   * You can also specify a custom `delay` to a specific modal in the options of `enqueueModal`.
   * 
   * Default value: `0`.
   */
  minimumDelay = 0;

  /**
   * Whether this queue should be preserved by `ModalQueuesManager` after all modals in this queue are dismissed.
   * 
   * Default value: `false`.
   */
  preserveWhenEmpty = false;

  /**
   * If `true`, this queue puases presenting modals. 
   * 
   * Default value: `false`.
   */
  paused = false;

  /**
   * Delay in millisecond before the queue actually starts presenting modals.
   * 
   * This delay allows some time to keep multiple linear `enqueueModal` calls
   * in expected order, based on their priorities.
   * 
   * Default value: `10`.
   */
  delayBeforeFiring = 10;

  /**
   * Whether this queue has any modal being presented or to be presented.
   */
  get isEmpty() {
    return this.modals.length < 1;
  }

  /**
   * Use `addQueue` method of `ModalQueuesManager` to create and add queues.
   */
  constructor(name: string, delegate: ModalQueueDelegate) {
    this.name = name;
    this.delegate = delegate;
  }

  /**
   * Start the queue to present modals if there are modals to be presented and the queue is not paused.
   */
  fire = async () => {
    if (this.running || this.isEmpty || this.paused) {
      return;
    }
    this.running = true;
    while(!this.paused && !this.isEmpty) {
      await this.pop();
    }
    this.running = false;
    this.delegate.onStop();
  };

  /**
   * Add a modal to be presented to this queue.
   * 
   * @param element the modal to be presented.
   */
  push = (element: ModalQueueElement) => {
    const highs: typeof this.modals = [];
    const defaults: typeof this.modals = [];
    const lows: typeof this.modals = [];

    this.modals.forEach(_element => {
      if (_element.priority === 'high') {
        highs.push(_element);
      } else if (_element.priority === 'low') {
        lows.push(_element);
      } else {
        defaults.push(_element);
      }
    });
    if (element.priority === 'high') {
      highs.push(element);
    } else if (element.priority === 'low') {
      lows.push(element);
    } else {
      defaults.push(element);
    }
    this.modals = highs.concat(defaults).concat(lows);

    setTimeout(() => {
      this.fire();
    }, this.delayBeforeFiring);
  };

  /**
   * Remove the modal of highest priority from the queue and present it on screen.
   * 
   * This method waits for the modal to be dismissed before it returns.
   */
  pop = async () => {
    const modal = this.modals.shift();
    if (modal) {
      const finalDelay = Math.max(modal.delay ?? 0, this.minimumDelay);
      if (finalDelay > 0) {
        await (new Promise<void>(resolve => setTimeout(resolve, finalDelay)));
      }
      await (new Promise<void>(resolve => modal.present(resolve)));
    }
  };
}

export class ModalQueuesManager {
  static readonly shared = new ModalQueuesManager();

  private queuesByName: {[queueName: string]: ModalQueue | undefined } = {};

  private constructor() {
    const queue = this.addQueue(defaultQueueName);
    queue.preserveWhenEmpty = true;
  }

  /**
   * Query and returns an existing queue from all queues managed by this class.
   * 
   * This method is optimized for performance. Complexity: O(1).
   * 
   * @param queueName A queue name to query.
   * @returns A `ModalQueue` if it exists, otherwise `undefined`.
   */
  findQueueByName = (queueName: string) => {
    return this.queuesByName[queueName];
  };

  /**
   * Create a new queue and add it to the queues managed by this class.
   * 
   * This method is optimized for performance. Complexity: O(1).
   * 
   * @param queueName the name for the new queue.
   * @returns the new created queue.
   */
  addQueue = (queueName: string) => {
    if (!queueName) {
      throw new Error('queueName cannot be empty.');
    }
    if (this.findQueueByName(queueName)) {
      throw new Error('A queue with the same queueName already exists.');
    }
    const queue = new ModalQueue(queueName, {
      onStop: () => {
        if (queue.isEmpty && !queue.preserveWhenEmpty) {
          this.removeQueue(queueName);
        }
      },
    });
    this.queuesByName[queueName] = queue;
    return queue;
  };

  /**
   * Remove a queue from the queues managed by this class.
   * 
   * This method is optimized for performance. Complexity: O(1).
   * 
   * @param queueName the name for the queue to be removed.
   */
  removeQueue = (queueName: string) => {
    if (!queueName) {
      console.warn('queueName cannot be empty. Call ignored');
      return;
    }
    if (this.queuesByName[queueName]) {
      delete this.queuesByName[queueName];
    }
  };
}
