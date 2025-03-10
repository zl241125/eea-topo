/**
 * 连接相关事件定义
 */
import { DomainEvent } from '../../../core/domain/events/DomainEvent';
import { Edge } from '../edge/ConnectionService';

/**
 * 连接创建事件
 * 当两个节点之间建立新连接时触发
 */
export class ConnectionCreatedEvent extends DomainEvent {
  static readonly TYPE: string = 'connection.created';

  constructor(public readonly edge: Edge) {
    super(ConnectionCreatedEvent.TYPE);
  }
}

/**
 * 连接更新事件
 * 当连接的路径或属性发生变化时触发
 */
export class ConnectionUpdatedEvent extends DomainEvent {
  static readonly TYPE: string = 'connection.updated';

  constructor(public readonly edge: Edge) {
    super(ConnectionUpdatedEvent.TYPE);
  }
}

/**
 * 连接删除事件
 * 当连接被删除时触发
 */
export class ConnectionRemovedEvent extends DomainEvent {
  static readonly TYPE: string = 'connection.removed';

  constructor(public readonly edgeId: string) {
    super(ConnectionRemovedEvent.TYPE);
  }
}

/**
 * 连接选择事件
 * 当连接被选中时触发
 */
export class ConnectionSelectedEvent extends DomainEvent {
  static readonly TYPE: string = 'connection.selected';

  constructor(public readonly edgeId: string) {
    super(ConnectionSelectedEvent.TYPE);
  }
}

/**
 * 连接悬停事件
 * 当鼠标悬停在连接上时触发
 */
export class ConnectionHoverEvent extends DomainEvent {
  static readonly TYPE: string = 'connection.hover';

  constructor(public readonly edgeId: string, public readonly isHovering: boolean) {
    super(ConnectionHoverEvent.TYPE);
  }
} 