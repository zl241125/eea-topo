/**
 * 边接口
 */
export interface IEdge {
  /**
   * 边唯一标识符
   */
  readonly id: string;
  
  /**
   * 源节点ID
   */
  readonly source: string;
  
  /**
   * 目标节点ID
   */
  readonly target: string;
  
  /**
   * 边类型
   */
  readonly type: string;
  
  /**
   * 边标签
   */
  label: string;
  
  /**
   * 边属性
   */
  properties: Record<string, any>;
}

/**
 * 边实体
 * 表示拓扑图中节点之间的连接
 */
export class Edge implements IEdge {
  /**
   * 边唯一标识符
   */
  readonly id: string;
  
  /**
   * 源节点ID
   */
  readonly source: string;
  
  /**
   * 目标节点ID
   */
  readonly target: string;
  
  /**
   * 边类型
   */
  readonly type: string;
  
  /**
   * 边标签
   */
  private _label: string;
  
  /**
   * 边属性
   */
  private _properties: Record<string, any>;

  /**
   * 创建边
   * @param id 边ID
   * @param source 源节点ID
   * @param target 目标节点ID
   * @param type 边类型
   * @param label 边标签
   * @param properties 边属性
   */
  constructor(
    id: string,
    source: string,
    target: string,
    type: string = 'default',
    label: string = '',
    properties: Record<string, any> = {}
  ) {
    this.id = id;
    this.source = source;
    this.target = target;
    this.type = type;
    this._label = label;
    this._properties = { ...properties };
  }

  /**
   * 获取边标签
   */
  get label(): string {
    return this._label;
  }

  /**
   * 设置边标签
   */
  set label(value: string) {
    this._label = value;
  }

  /**
   * 获取边属性
   */
  get properties(): Record<string, any> {
    return { ...this._properties };
  }

  /**
   * 设置边属性
   */
  set properties(value: Record<string, any>) {
    this._properties = { ...value };
  }

  /**
   * 设置属性值
   * @param key 属性键
   * @param value 属性值
   */
  public setProperty(key: string, value: any): void {
    this._properties[key] = value;
  }

  /**
   * 获取属性值
   * @param key 属性键
   * @param defaultValue 默认值(如果属性不存在)
   */
  public getProperty<T>(key: string, defaultValue?: T): T | undefined {
    return key in this._properties ? this._properties[key] : defaultValue;
  }

  /**
   * 移除属性
   * @param key 属性键
   * @returns 是否成功移除
   */
  public removeProperty(key: string): boolean {
    if (key in this._properties) {
      delete this._properties[key];
      return true;
    }
    return false;
  }

  /**
   * 转换为简单对象
   */
  public toObject(): Record<string, any> {
    return {
      id: this.id,
      source: this.source,
      target: this.target,
      type: this.type,
      label: this._label,
      properties: { ...this._properties }
    };
  }
} 