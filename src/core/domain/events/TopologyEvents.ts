import { DomainEvent } from './DomainEvent';
import { NodeData, EdgeData } from '../models/EEATopology';

/**
 * 节点添加事件
 */
export class NodeAdded extends DomainEvent {
  constructor(
    eventId: string,
    readonly topologyId: string,
    readonly nodeId: string,
    readonly nodeData: NodeData
  ) {
    super(eventId);
  }

  get eventName(): string {
    return 'NodeAdded';
  }
}

/**
 * 节点移除事件
 */
export class NodeRemoved extends DomainEvent {
  constructor(
    eventId: string,
    readonly topologyId: string,
    readonly nodeId: string
  ) {
    super(eventId);
  }

  get eventName(): string {
    return 'NodeRemoved';
  }
}

/**
 * 节点更新事件
 */
export class NodeUpdated extends DomainEvent {
  constructor(
    eventId: string,
    readonly topologyId: string,
    readonly nodeId: string,
    readonly nodeData: Partial<NodeData>
  ) {
    super(eventId);
  }

  get eventName(): string {
    return 'NodeUpdated';
  }
}

/**
 * 边添加事件
 */
export class EdgeAdded extends DomainEvent {
  constructor(
    eventId: string,
    readonly topologyId: string,
    readonly edgeId: string,
    readonly sourceId: string,
    readonly targetId: string,
    readonly edgeData: EdgeData
  ) {
    super(eventId);
  }

  get eventName(): string {
    return 'EdgeAdded';
  }
}

/**
 * 边移除事件
 */
export class EdgeRemoved extends DomainEvent {
  constructor(
    eventId: string,
    readonly topologyId: string,
    readonly edgeId: string
  ) {
    super(eventId);
  }

  get eventName(): string {
    return 'EdgeRemoved';
  }
}

/**
 * 边更新事件
 */
export class EdgeUpdated extends DomainEvent {
  constructor(
    eventId: string,
    readonly topologyId: string,
    readonly edgeId: string,
    readonly edgeData: Partial<EdgeData>
  ) {
    super(eventId);
  }

  get eventName(): string {
    return 'EdgeUpdated';
  }
} 