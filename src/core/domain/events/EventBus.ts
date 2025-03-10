/**
 * 事件总线
 * 用于发布和订阅领域事件
 */
import { DomainEvent } from './DomainEvent';

export type EventHandler = (event: DomainEvent) => void;

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * 发布事件
   * @param event 领域事件
   */
  public publish(event: DomainEvent): void {
    const eventType = event.type;
    const eventHandlers = this.handlers.get(eventType);

    if (eventHandlers) {
      eventHandlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`事件处理器执行出错: ${error}`, error);
        }
      });
    }
  }

  /**
   * 订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理器
   */
  public subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);
  }

  /**
   * 取消订阅事件
   * @param eventType 事件类型
   * @param handler 事件处理器
   */
  public unsubscribe(eventType: string, handler: EventHandler): void {
    const eventHandlers = this.handlers.get(eventType);
    
    if (eventHandlers) {
      eventHandlers.delete(handler);
      
      if (eventHandlers.size === 0) {
        this.handlers.delete(eventType);
      }
    }
  }

  /**
   * 清除所有订阅
   */
  public clear(): void {
    this.handlers.clear();
  }
} 