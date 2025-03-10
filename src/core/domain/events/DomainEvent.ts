/**
 * 领域事件基类
 * 所有特定领域事件都应继承自此类
 */
export class DomainEvent {
  public readonly timestamp: number;
  public readonly type: string;

  constructor(type: string) {
    this.type = type;
    this.timestamp = Date.now();
  }
}

/**
 * 事件总线接口
 * 负责事件的发布和订阅
 */
export interface IEventBus {
  /**
   * 发布事件
   * @param event 要发布的领域事件
   */
  publish<T extends DomainEvent>(event: T): void;
  
  /**
   * 订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理函数
   * @returns 取消订阅的函数
   */
  subscribe<T extends DomainEvent>(
    eventType: { new(...args: any[]): T },
    handler: (event: T) => void
  ): () => void;
} 