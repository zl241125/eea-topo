import { v4 as uuidv4 } from 'uuid';
import { NodeAdded, NodeRemoved } from '../events/TopologyEvents';
import { IEventBus } from '../events/DomainEvent';

/**
 * 拓扑图配置接口
 */
export interface EEATopologyConfig {
  /**
   * 拓扑图ID
   */
  id?: string;
  
  /**
   * 拓扑图名称
   */
  name: string;
  
  /**
   * 拓扑图描述
   */
  description?: string;
}

/**
 * 节点数据接口
 */
export interface NodeData {
  /**
   * 节点类型
   */
  type: string;
  
  /**
   * 节点位置X坐标
   */
  x: number;
  
  /**
   * 节点位置Y坐标
   */
  y: number;
  
  /**
   * 节点标签
   */
  label: string;
  
  /**
   * 节点属性
   */
  properties?: Record<string, any>;
}

/**
 * 边数据接口
 */
export interface EdgeData {
  /**
   * 边类型
   */
  type?: string;
  
  /**
   * 边标签
   */
  label?: string;
  
  /**
   * 边属性
   */
  properties?: Record<string, any>;
}

/**
 * EEA拓扑模型
 * 用于表示汽车电子电气架构的拓扑结构
 */
export class EEATopology {
  private readonly _id: string;
  private _name: string;
  private _description: string;
  private nodes: Map<string, INode> = new Map();
  private connections: Map<string, IConnection> = new Map();
  private _eventBus?: IEventBus;

  /**
   * 创建新的拓扑图实例
   * @param config 拓扑图配置
   * @param eventBus 事件总线(可选)
   */
  constructor(config: EEATopologyConfig, eventBus?: IEventBus) {
    this._id = config.id || uuidv4();
    this._name = config.name;
    this._description = config.description || '';
    this._eventBus = eventBus;
  }

  /**
   * 获取拓扑图ID
   */
  get id(): string {
    return this._id;
  }

  /**
   * 获取拓扑图名称
   */
  get name(): string {
    return this._name;
  }

  /**
   * 设置拓扑图名称
   */
  set name(value: string) {
    this._name = value;
  }

  /**
   * 获取拓扑图描述
   */
  get description(): string {
    return this._description;
  }

  /**
   * 设置拓扑图描述
   */
  set description(value: string) {
    this._description = value;
  }

  /**
   * 添加节点
   * @param node 节点数据
   */
  public addNode(node: Omit<INode, 'id'>): INode {
    const id = uuidv4();
    const newNode: INode = {
      id,
      ...node
    };
    
    this.nodes.set(id, newNode);
    
    // 发布事件
    if (this._eventBus) {
      this._eventBus.publish(new NodeAdded(uuidv4(), this._id, id, node));
    }
    
    return newNode;
  }

  /**
   * 更新节点
   * @param id 节点ID
   * @param data 更新数据
   */
  public updateNode(id: string, data: Partial<Omit<INode, 'id'>>): INode | null {
    const node = this.nodes.get(id);
    if (!node) {
      return null;
    }
    
    const updatedNode = {
      ...node,
      ...data
    };
    
    this.nodes.set(id, updatedNode);
    
    // 发布事件
    if (this._eventBus) {
      this._eventBus.publish(new NodeAdded(uuidv4(), this._id, id, updatedNode));
    }
    
    return updatedNode;
  }

  /**
   * 移除节点
   * @param id 节点ID
   */
  public removeNode(id: string): boolean {
    if (!this.nodes.has(id)) {
      return false;
    }
    
    // 移除相关连接
    this.getNodeConnections(id).forEach(conn => {
      this.connections.delete(conn.id);
    });
    
    // 移除节点
    const removed = this.nodes.delete(id);
    
    // 发布事件
    if (this._eventBus && removed) {
      this._eventBus.publish(new NodeRemoved(uuidv4(), this._id, id));
    }
    
    return removed;
  }

  /**
   * 获取节点
   * @param id 节点ID
   */
  public getNode(id: string): INode | undefined {
    return this.nodes.get(id);
  }

  /**
   * 获取所有节点
   */
  public getAllNodes(): INode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * 添加连接
   * @param connection 连接数据
   */
  public addConnection(connection: Omit<IConnection, 'id'>): IConnection | null {
    // 验证源节点和目标节点是否存在
    if (!this.nodes.has(connection.sourceId) || !this.nodes.has(connection.targetId)) {
      return null;
    }
    
    const id = uuidv4();
    const newConnection: IConnection = {
      id,
      ...connection
    };
    
    this.connections.set(id, newConnection);
    return newConnection;
  }

  /**
   * 更新连接
   * @param id 连接ID
   * @param data 更新数据
   */
  public updateConnection(id: string, data: Partial<Omit<IConnection, 'id'>>): IConnection | null {
    const connection = this.connections.get(id);
    if (!connection) {
      return null;
    }
    
    const updatedConnection = {
      ...connection,
      ...data
    };
    
    this.connections.set(id, updatedConnection);
    return updatedConnection;
  }

  /**
   * 移除连接
   * @param id 连接ID
   */
  public removeConnection(id: string): boolean {
    return this.connections.delete(id);
  }

  /**
   * 获取连接
   * @param id 连接ID
   */
  public getConnection(id: string): IConnection | undefined {
    return this.connections.get(id);
  }

  /**
   * 获取所有连接
   */
  public getAllConnections(): IConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * 获取节点的所有连接
   * @param nodeId 节点ID
   */
  public getNodeConnections(nodeId: string): IConnection[] {
    return this.getAllConnections().filter(
      conn => conn.sourceId === nodeId || conn.targetId === nodeId
    );
  }

  /**
   * 清空拓扑
   */
  public clear(): void {
    this.nodes.clear();
    this.connections.clear();
  }

  /**
   * 导出拓扑数据
   */
  public toJSON(): { nodes: INode[], connections: IConnection[] } {
    return {
      nodes: this.getAllNodes(),
      connections: this.getAllConnections()
    };
  }

  /**
   * 从JSON导入拓扑数据
   * @param data 拓扑数据
   */
  public fromJSON(data: { nodes: INode[], connections: IConnection[] }): void {
    this.clear();
    
    // 导入节点
    data.nodes.forEach(node => {
      this.nodes.set(node.id, node);
    });
    
    // 导入连接
    data.connections.forEach(conn => {
      this.connections.set(conn.id, conn);
    });
  }

  /**
   * 设置事件总线
   * @param eventBus 事件总线
   */
  public setEventBus(eventBus: IEventBus): void {
    this._eventBus = eventBus;
  }

  /**
   * 创建新的拓扑图实例
   * @param config 拓扑图配置
   * @param eventBus 事件总线(可选)
   * @returns 新创建的拓扑图实例
   */
  public static create(config: EEATopologyConfig, eventBus?: IEventBus): EEATopology {
    return new EEATopology(config, eventBus);
  }
} 