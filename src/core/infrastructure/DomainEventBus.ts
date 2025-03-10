import { DomainEvent, IEventBus } from '../domain/events/DomainEvent';

/**
 * 领域事件总线实现
 * 负责事件的发布和订阅
 */
export class DomainEventBus implements IEventBus {
  private handlers: Map<string, Array<(event: DomainEvent) => void>> = new Map();

  /**
   * 发布事件
   * @param event 要发布的领域事件
   */
  public publish<T extends DomainEvent>(event: T): void {
    const eventType = event.eventName;
    const eventHandlers = this.handlers.get(eventType) || [];
    
    eventHandlers.forEach(handler => handler(event));
  }

  /**
   * 订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理函数
   * @returns 取消订阅的函数
   */
  public subscribe<T extends DomainEvent>(
    eventType: { new(...args: any[]): T },
    handler: (event: T) => void
  ): () => void {
    // 创建临时实例以获取事件名称
    const tempInstance = new eventType('temp');
    const eventName = tempInstance.eventName;
    
    const handlers = this.handlers.get(eventName) || [];
    handlers.push(handler as any);
    this.handlers.set(eventName, handlers);
    
    // 返回取消订阅函数
    return () => {
      const currentHandlers = this.handlers.get(eventName) || [];
      this.handlers.set(
        eventName,
        currentHandlers.filter(h => h !== handler)
      );
    };
  }
} 