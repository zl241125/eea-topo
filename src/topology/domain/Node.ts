import { NodePosition } from '../../core/domain/valueObjects/NodePosition';

/**
 * 节点接口
 */
export interface INode {
  /**
   * 节点唯一标识符
   */
  readonly id: string;
  
  /**
   * 节点类型
   */
  readonly type: string;
  
  /**
   * 节点位置
   */
  position: NodePosition;
  
  /**
   * 节点标签
   */
  label: string;
  
  /**
   * 节点属性
   */
  properties: Record<string, any>;
}

/**
 * 节点实体
 * 表示拓扑图中的节点
 */
export class Node implements INode {
  /**
   * 节点唯一标识符
   */
  readonly id: string;
  
  /**
   * 节点类型
   */
  readonly type: string;
  
  /**
   * 节点位置
   */
  private _position: NodePosition;
  
  /**
   * 节点标签
   */
  private _label: string;
  
  /**
   * 节点属性
   */
  private _properties: Record<string, any>;

  /**
   * 创建节点
   * @param id 节点ID
   * @param type 节点类型
   * @param position 节点位置
   * @param label 节点标签
   * @param properties 节点属性
   */
  constructor(
    id: string,
    type: string,
    position: NodePosition,
    label: string,
    properties: Record<string, any> = {}
  ) {
    this.id = id;
    this.type = type;
    this._position = position;
    this._label = label;
    this._properties = { ...properties };
  }

  /**
   * 获取节点位置
   */
  get position(): NodePosition {
    return this._position;
  }

  /**
   * 设置节点位置
   */
  set position(value: NodePosition) {
    this._position = value;
  }

  /**
   * 获取节点标签
   */
  get label(): string {
    return this._label;
  }

  /**
   * 设置节点标签
   */
  set label(value: string) {
    this._label = value;
  }

  /**
   * 获取节点属性
   */
  get properties(): Record<string, any> {
    return { ...this._properties };
  }

  /**
   * 设置节点属性
   */
  set properties(value: Record<string, any>) {
    this._properties = { ...value };
  }

  /**
   * 更新节点位置
   * @param x 新的X坐标
   * @param y 新的Y坐标
   */
  public move(x: number, y: number): void {
    this._position = new NodePosition(x, y);
  }

  /**
   * 平移节点
   * @param dx X方向平移距离
   * @param dy Y方向平移距离
   */
  public translate(dx: number, dy: number): void {
    this._position = this._position.translate(dx, dy);
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
      type: this.type,
      position: {
        x: this._position.x,
        y: this._position.y
      },
      label: this._label,
      properties: { ...this._properties }
    };
  }
} 