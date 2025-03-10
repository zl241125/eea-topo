/**
 * 节点位置值对象
 * 不可变对象，表示节点在画布上的位置
 */
export class NodePosition {
  /**
   * 创建一个节点位置对象
   * @param _x X坐标
   * @param _y Y坐标
   */
  constructor(
    private readonly _x: number,
    private readonly _y: number
  ) {
    // 确保不可变性
    Object.freeze(this);
  }

  /**
   * 获取X坐标
   */
  get x(): number { return this._x; }
  
  /**
   * 获取Y坐标
   */
  get y(): number { return this._y; }

  /**
   * 创建一个新的位置，通过当前位置平移指定距离
   * @param dx X方向平移距离
   * @param dy Y方向平移距离
   * @returns 新的位置对象
   */
  public translate(dx: number, dy: number): NodePosition {
    return new NodePosition(this._x + dx, this._y + dy);
  }

  /**
   * 判断两个位置是否相等
   * @param other 另一个位置对象
   * @returns 是否相等
   */
  public equals(other: NodePosition): boolean {
    return this._x === other._x && this._y === other._y;
  }

  /**
   * 计算与另一个位置的距离
   * @param other 另一个位置对象
   * @returns 欧几里得距离
   */
  public distanceTo(other: NodePosition): number {
    const dx = this._x - other._x;
    const dy = this._y - other._y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 将位置对象转换为字符串表示
   */
  public toString(): string {
    return `(${this._x}, ${this._y})`;
  }
} 