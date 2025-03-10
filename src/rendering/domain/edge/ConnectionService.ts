/**
 * 连接管理服务
 * 负责创建和管理节点间的连接
 */

import { EdgePathCalculator, Path, Rectangle } from './EdgePathCalculator';
import { EventBus } from '../../../core/domain/events/EventBus';
import { ConnectionCreatedEvent, ConnectionUpdatedEvent } from '../events/ConnectionEvents';

/**
 * 节点接口（简化）
 */
interface Node {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 连接协议枚举
 */
export enum Protocol {
  CAN = 'can',
  LIN = 'lin',
  FLEXRAY = 'flexray',
  ETHERNET = 'ethernet',
  CUSTOM = 'custom'
}

/**
 * 边定义
 */
export interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
  protocol: Protocol;
  path: Path;
  metadata?: Record<string, any>;
}

/**
 * 连接管理服务
 */
export class ConnectionService {
  private edges: Map<string, Edge> = new Map();
  
  constructor(
    private readonly pathCalculator: EdgePathCalculator,
    private readonly eventBus: EventBus
  ) {}

  /**
   * 创建新连接
   * @param sourceNode 源节点
   * @param targetNode 目标节点
   * @param protocol 连接协议
   */
  public createConnection(
    sourceNode: Node,
    targetNode: Node,
    protocol: Protocol
  ): Edge {
    const edgeId = `edge-${sourceNode.id}-${targetNode.id}`;
    
    // 计算连接路径
    const sourceCenterX = sourceNode.x + sourceNode.width / 2;
    const sourceCenterY = sourceNode.y + sourceNode.height / 2;
    const targetCenterX = targetNode.x + targetNode.width / 2;
    const targetCenterY = targetNode.y + targetNode.height / 2;
    
    const path = this.pathCalculator.calculatePath(
      { x: sourceCenterX, y: sourceCenterY },
      { x: targetCenterX, y: targetCenterY },
      [] // 暂无障碍物
    );
    
    // 创建边
    const edge: Edge = {
      id: edgeId,
      sourceId: sourceNode.id,
      targetId: targetNode.id,
      protocol,
      path
    };
    
    // 存储边
    this.edges.set(edgeId, edge);
    
    // 发布事件
    this.eventBus.publish(new ConnectionCreatedEvent(edge));
    
    return edge;
  }

  /**
   * 更新连接路径
   * @param edge 边对象
   * @param obstacles 障碍物列表
   */
  public updateConnectionPath(
    edge: Edge,
    obstacles: Node[]
  ): void {
    // 获取源节点和目标节点
    const sourceNode = this.getNodeById(edge.sourceId);
    const targetNode = this.getNodeById(edge.targetId);
    
    if (!sourceNode || !targetNode) {
      throw new Error(`无法找到源节点或目标节点: ${edge.sourceId}, ${edge.targetId}`);
    }
    
    // 将节点转换为障碍物
    const obstacleRects: Rectangle[] = obstacles.map(node => ({
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height
    }));
    
    // 计算新路径
    const sourceCenterX = sourceNode.x + sourceNode.width / 2;
    const sourceCenterY = sourceNode.y + sourceNode.height / 2;
    const targetCenterX = targetNode.x + targetNode.width / 2;
    const targetCenterY = targetNode.y + targetNode.height / 2;
    
    const newPath = this.pathCalculator.calculatePath(
      { x: sourceCenterX, y: sourceCenterY },
      { x: targetCenterX, y: targetCenterY },
      obstacleRects,
      { routingAlgorithm: 'astar', gridSize: 10 }
    );
    
    // 更新边路径
    edge.path = newPath;
    this.edges.set(edge.id, edge);
    
    // 发布事件
    this.eventBus.publish(new ConnectionUpdatedEvent(edge));
  }

  /**
   * 获取所有连接
   */
  public getAllConnections(): Edge[] {
    return Array.from(this.edges.values());
  }

  /**
   * 获取节点的所有连接
   * @param nodeId 节点ID
   */
  public getNodeConnections(nodeId: string): Edge[] {
    return Array.from(this.edges.values()).filter(
      edge => edge.sourceId === nodeId || edge.targetId === nodeId
    );
  }

  /**
   * 移除连接
   * @param edgeId 边ID
   */
  public removeConnection(edgeId: string): boolean {
    return this.edges.delete(edgeId);
  }

  /**
   * 根据ID获取节点（实际实现需要依赖节点仓库）
   * @param nodeId 节点ID
   */
  private getNodeById(nodeId: string): Node | undefined {
    // 在实际实现中，应该从节点仓库获取节点
    // 这里简单模拟返回一个节点
    return {
      id: nodeId,
      x: 0,
      y: 0,
      width: 100,
      height: 50
    };
  }
} 