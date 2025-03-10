/**
 * 视口值对象
 * 表示拓扑图的可视区域
 */
export class ViewBox {
  /**
   * 创建视口对象
   * @param _x 视口左上角X坐标
   * @param _y 视口左上角Y坐标
   * @param _width 视口宽度
   * @param _height 视口高度
   */
  constructor(
    private readonly _x: number,
    private readonly _y: number,
    private readonly _width: number,
    private readonly _height: number
  ) {
    // 校验参数
    if (_width <= 0 || _height <= 0) {
      throw new Error('视口宽度和高度必须为正数');
    }
    
    // 确保不可变性
    Object.freeze(this);
  }

  /**
   * 获取视口左上角X坐标
   */
  get x(): number { return this._x; }
  
  /**
   * 获取视口左上角Y坐标
   */
  get y(): number { return this._y; }
  
  /**
   * 获取视口宽度
   */
  get width(): number { return this._width; }
  
  /**
   * 获取视口高度
   */
  get height(): number { return this._height; }

  /**
   * 创建平移后的新视口
   * @param dx X方向平移距离
   * @param dy Y方向平移距离
   */
  public pan(dx: number, dy: number): ViewBox {
    return new ViewBox(
      this._x + dx,
      this._y + dy,
      this._width,
      this._height
    );
  }

  /**
   * 创建缩放后的新视口
   * @param scale 缩放系数
   * @param centerX 缩放中心X坐标
   * @param centerY 缩放中心Y坐标
   */
  public zoom(scale: number, centerX: number, centerY: number): ViewBox {
    if (scale <= 0) {
      throw new Error('缩放系数必须为正数');
    }

    // 计算新的宽高
    const newWidth = this._width / scale;
    const newHeight = this._height / scale;
    
    // 计算新的左上角坐标，保持缩放中心不变
    const centerXRatio = (centerX - this._x) / this._width;
    const centerYRatio = (centerY - this._y) / this._height;
    
    const newX = centerX - centerXRatio * newWidth;
    const newY = centerY - centerYRatio * newHeight;
    
    return new ViewBox(newX, newY, newWidth, newHeight);
  }

  /**
   * 判断点是否在视口内
   * @param x 点的X坐标
   * @param y 点的Y坐标
   */
  public containsPoint(x: number, y: number): boolean {
    return (
      x >= this._x &&
      x <= this._x + this._width &&
      y >= this._y &&
      y <= this._y + this._height
    );
  }

  /**
   * 将视口表示为SVG viewBox属性字符串
   */
  public toSVGViewBox(): string {
    return `${this._x} ${this._y} ${this._width} ${this._height}`;
  }
} 