/**
 * 节点相关事件定义
 */
import { DomainEvent } from '../../../core/domain/events/DomainEvent';

/**
 * 节点选择变更事件
 * 当节点的选择状态发生变化时触发
 */
export class NodeSelectionChanged extends DomainEvent {
  static readonly TYPE: string = 'node.selection.changed';

  constructor(public readonly selectedNodeIds: string[]) {
    super(NodeSelectionChanged.TYPE);
  }
}

/**
 * 节点悬停事件
 * 当鼠标悬停在节点上或离开节点时触发
 */
export class NodeHoverEvent extends DomainEvent {
  static readonly TYPE: string = 'node.hover';

  constructor(
    public readonly nodeId: string,
    public readonly isHovering: boolean
  ) {
    super(NodeHoverEvent.TYPE);
  }
}

/**
 * 节点拖拽开始事件
 * 当开始拖拽节点时触发
 */
export class NodeDragStartEvent extends DomainEvent {
  static readonly TYPE: string = 'node.drag.start';

  constructor(
    public readonly nodeId: string,
    public readonly x: number,
    public readonly y: number
  ) {
    super(NodeDragStartEvent.TYPE);
  }
}

/**
 * 节点拖拽事件
 * 当节点正在被拖拽时持续触发
 */
export class NodeDragEvent extends DomainEvent {
  static readonly TYPE: string = 'node.drag';

  constructor(
    public readonly nodeId: string,
    public readonly x: number,
    public readonly y: number
  ) {
    super(NodeDragEvent.TYPE);
  }
}

/**
 * 节点拖拽结束事件
 * 当节点拖拽结束时触发
 */
export class NodeDragEndEvent extends DomainEvent {
  static readonly TYPE: string = 'node.drag.end';

  constructor(
    public readonly nodeId: string,
    public readonly x: number,
    public readonly y: number,
    public readonly initialX: number,
    public readonly initialY: number
  ) {
    super(NodeDragEndEvent.TYPE);
  }
}

/**
 * 节点创建事件
 * 当新节点被创建时触发
 */
export class NodeCreatedEvent extends DomainEvent {
  static readonly TYPE: string = 'node.created';

  constructor(public readonly nodeId: string) {
    super(NodeCreatedEvent.TYPE);
  }
}

/**
 * 节点更新事件
 * 当节点属性被更新时触发
 */
export class NodeUpdatedEvent extends DomainEvent {
  static readonly TYPE: string = 'node.updated';

  constructor(
    public readonly nodeId: string,
    public readonly properties: Record<string, any>
  ) {
    super(NodeUpdatedEvent.TYPE);
  }
}

/**
 * 节点删除事件
 * 当节点被删除时触发
 */
export class NodeRemovedEvent extends DomainEvent {
  static readonly TYPE: string = 'node.removed';

  constructor(public readonly nodeId: string) {
    super(NodeRemovedEvent.TYPE);
  }
} 