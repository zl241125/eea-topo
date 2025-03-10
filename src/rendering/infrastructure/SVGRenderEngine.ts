import { RenderEngine, NodeView, EdgeView } from '../domain/RenderEngine';
import { ViewBox } from '../../core/domain/valueObjects/ViewBox';
import { Node } from '../../topology/domain/Node';
import { Edge } from '../../topology/domain/Edge';
import { HitTestResult } from '../domain/interaction/InteractionManager';
import { Position } from '../domain/edge/EdgePathCalculator';

/**
 * SVG节点视图
 */
class SVGNodeView implements NodeView {
  /**
   * 节点ID
   */
  readonly nodeId: string;
  
  /**
   * SVG元素
   */
  readonly element: SVGGElement;
  
  /**
   * 矩形元素
   */
  private rect: SVGRectElement;
  
  /**
   * 文本元素
   */
  private text: SVGTextElement;

  /**
   * 创建SVG节点视图
   * @param nodeId 节点ID
   * @param node 节点数据
   */
  constructor(nodeId: string, node: Node) {
    this.nodeId = nodeId;
    
    // 创建节点组
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.element.setAttribute('class', `node node-${node.type}`);
    this.element.setAttribute('data-node-id', nodeId);
    
    // 创建矩形
    this.rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.rect.setAttribute('width', '120');
    this.rect.setAttribute('height', '60');
    this.rect.setAttribute('rx', '5');
    this.rect.setAttribute('ry', '5');
    this.rect.setAttribute('fill', '#ffffff');
    this.rect.setAttribute('stroke', '#333333');
    this.rect.setAttribute('stroke-width', '1');
    
    // 创建文本
    this.text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this.text.setAttribute('x', '60');
    this.text.setAttribute('y', '35');
    this.text.setAttribute('text-anchor', 'middle');
    this.text.setAttribute('dominant-baseline', 'middle');
    this.text.setAttribute('fill', '#333333');
    this.text.textContent = node.label;
    
    // 添加元素到组
    this.element.appendChild(this.rect);
    this.element.appendChild(this.text);
    
    // 更新位置
    this.updatePosition(node);
    
    // 应用自定义样式
    this.applyCustomStyles(node);
  }

  /**
   * 更新节点视图
   * @param node 节点数据
   */
  update(node: Node): void {
    // 更新位置
    this.updatePosition(node);
    
    // 更新标签
    this.text.textContent = node.label;
    
    // 更新自定义样式
    this.applyCustomStyles(node);
  }

  /**
   * 更新节点位置
   * @param node 节点数据
   */
  private updatePosition(node: Node): void {
    const x = node.position.x - 60; // 中心点偏移
    const y = node.position.y - 30; // 中心点偏移
    
    this.element.setAttribute('transform', `translate(${x}, ${y})`);
  }

  /**
   * 应用自定义样式
   * @param node 节点数据
   */
  private applyCustomStyles(node: Node): void {
    // 应用填充颜色
    const fillColor = node.getProperty<string>('fillColor');
    if (fillColor) {
      this.rect.setAttribute('fill', fillColor);
    }
    
    // 应用边框颜色
    const strokeColor = node.getProperty<string>('strokeColor');
    if (strokeColor) {
      this.rect.setAttribute('stroke', strokeColor);
    }
    
    // 应用文本颜色
    const textColor = node.getProperty<string>('textColor');
    if (textColor) {
      this.text.setAttribute('fill', textColor);
    }
  }
}

/**
 * SVG边视图
 */
class SVGEdgeView implements EdgeView {
  /**
   * 边ID
   */
  readonly edgeId: string;
  
  /**
   * SVG元素
   */
  readonly element: SVGGElement;
  
  /**
   * 线条元素
   */
  private path: SVGPathElement;
  
  /**
   * 文本元素
   */
  private text: SVGTextElement;
  
  /**
   * 箭头元素
   */
  private arrow: SVGPathElement;

  /**
   * 创建SVG边视图
   * @param edgeId 边ID
   * @param edge 边数据
   * @param sourceNode 源节点
   * @param targetNode 目标节点
   */
  constructor(edgeId: string, edge: Edge, sourceNode: Node, targetNode: Node) {
    this.edgeId = edgeId;
    
    // 创建边组
    this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.element.setAttribute('class', `edge edge-${edge.type}`);
    this.element.setAttribute('data-edge-id', edgeId);
    
    // 创建路径
    this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.path.setAttribute('fill', 'none');
    this.path.setAttribute('stroke', '#999999');
    this.path.setAttribute('stroke-width', '1');
    
    // 创建箭头
    this.arrow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this.arrow.setAttribute('fill', '#999999');
    this.arrow.setAttribute('stroke', 'none');
    
    // 创建文本
    this.text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    this.text.setAttribute('text-anchor', 'middle');
    this.text.setAttribute('dominant-baseline', 'middle');
    this.text.setAttribute('fill', '#666666');
    this.text.setAttribute('font-size', '12');
    this.text.textContent = edge.label;
    
    // 添加元素到组
    this.element.appendChild(this.path);
    this.element.appendChild(this.arrow);
    this.element.appendChild(this.text);
    
    // 更新路径
    this.updatePath(edge, sourceNode, targetNode);
    
    // 应用自定义样式
    this.applyCustomStyles(edge);
  }

  /**
   * 更新边视图
   * @param edge 边数据
   * @param sourceNode 源节点
   * @param targetNode 目标节点
   */
  update(edge: Edge, sourceNode: Node, targetNode: Node): void {
    // 更新路径
    this.updatePath(edge, sourceNode, targetNode);
    
    // 更新标签
    this.text.textContent = edge.label;
    
    // 更新自定义样式
    this.applyCustomStyles(edge);
  }

  /**
   * 更新路径
   * @param edge 边数据
   * @param sourceNode 源节点
   * @param targetNode 目标节点
   */
  private updatePath(edge: Edge, sourceNode: Node, targetNode: Node): void {
    const sourceX = sourceNode.position.x;
    const sourceY = sourceNode.position.y;
    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y;
    
    // 计算方向向量
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // 单位向量
    const udx = dx / length;
    const udy = dy / length;
    
    // 节点边缘点（考虑节点大小）
    const nodeRadius = 60; // 假设节点宽度为120
    const sourceEdgeX = sourceX + udx * nodeRadius;
    const sourceEdgeY = sourceY + udy * nodeRadius;
    const targetEdgeX = targetX - udx * nodeRadius;
    const targetEdgeY = targetY - udy * nodeRadius;
    
    // 设置路径
    this.path.setAttribute('d', `M${sourceEdgeX},${sourceEdgeY} L${targetEdgeX},${targetEdgeY}`);
    
    // 设置箭头位置
    const arrowSize = 10;
    const arrowAngle = Math.atan2(udy, udx);
    const arrowX = targetEdgeX;
    const arrowY = targetEdgeY;
    
    // 创建箭头路径
    const angle1 = arrowAngle + Math.PI * 0.85;
    const angle2 = arrowAngle - Math.PI * 0.85;
    const x1 = arrowX - arrowSize * Math.cos(angle1);
    const y1 = arrowY - arrowSize * Math.sin(angle1);
    const x2 = arrowX - arrowSize * Math.cos(angle2);
    const y2 = arrowY - arrowSize * Math.sin(angle2);
    
    this.arrow.setAttribute('d', `M${arrowX},${arrowY} L${x1},${y1} L${x2},${y2} Z`);
    
    // 设置文本位置（边的中点）
    const textX = (sourceEdgeX + targetEdgeX) / 2;
    const textY = (sourceEdgeY + targetEdgeY) / 2;
    
    this.text.setAttribute('x', String(textX));
    this.text.setAttribute('y', String(textY));
  }

  /**
   * 应用自定义样式
   * @param edge 边数据
   */
  private applyCustomStyles(edge: Edge): void {
    // 应用线条颜色
    const strokeColor = edge.getProperty<string>('strokeColor');
    if (strokeColor) {
      this.path.setAttribute('stroke', strokeColor);
      this.arrow.setAttribute('fill', strokeColor);
    }
    
    // 应用线条宽度
    const strokeWidth = edge.getProperty<string>('strokeWidth');
    if (strokeWidth) {
      this.path.setAttribute('stroke-width', strokeWidth);
    }
    
    // 应用文本颜色
    const textColor = edge.getProperty<string>('textColor');
    if (textColor) {
      this.text.setAttribute('fill', textColor);
    }
  }
}

/**
 * SVG渲染引擎
 * 负责在DOM中使用SVG渲染节点和连接
 */
export class SVGRenderEngine implements RenderEngine {
  private svg!: SVGElement;
  private container: HTMLElement;
  private nodesGroup!: SVGGElement;
  private edgesGroup!: SVGGElement;
  private nodes: Map<string, SVGElement> = new Map();
  private edges: Map<string, SVGElement> = new Map();
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.initSVG();
  }

  /**
   * 初始化SVG元素
   */
  private initSVG(): void {
    // 创建SVG元素
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('width', '100%');
    this.svg.setAttribute('height', '100%');
    this.svg.style.position = 'absolute';
    
    // 创建分组
    this.edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // 添加到SVG
    this.svg.appendChild(this.edgesGroup);
    this.svg.appendChild(this.nodesGroup);
    
    // 添加到容器
    this.container.appendChild(this.svg);
  }

  /**
   * 获取容器元素
   */
  public getContainer(): HTMLElement {
    return this.container;
  }

  /**
   * 碰撞测试
   * @param x 鼠标X坐标
   * @param y 鼠标Y坐标
   */
  public hitTest(x: number, y: number): HitTestResult | null {
    // 转换坐标到SVG坐标系
    const point = this.svg.createSVGPoint();
    point.x = x;
    point.y = y;
    
    // 基于浏览器兼容性获取反转的转换矩阵
    const svgMatrix = this.svg.getScreenCTM();
    if (!svgMatrix) {
      return null;
    }
    
    const transformedPoint = point.matrixTransform(svgMatrix.inverse());
    
    // 检查节点命中
    // 逆序检查以优先选中顶层节点
    const nodeElements = Array.from(this.nodesGroup.children).reverse();
    for (const element of nodeElements) {
      if (this.isPointInElement(transformedPoint.x, transformedPoint.y, element as SVGElement)) {
        const nodeId = element.getAttribute('data-id');
        if (nodeId) {
          return {
            type: 'node',
            id: nodeId,
            x: transformedPoint.x,
            y: transformedPoint.y
          };
        }
      }
    }
    
    // 检查边命中
    const edgeElements = Array.from(this.edgesGroup.children);
    for (const element of edgeElements) {
      if (this.isPointNearElement(transformedPoint.x, transformedPoint.y, element as SVGElement)) {
        const edgeId = element.getAttribute('data-id');
        if (edgeId) {
          return {
            type: 'edge',
            id: edgeId,
            x: transformedPoint.x,
            y: transformedPoint.y
          };
        }
      }
    }
    
    // 如果没有命中，返回画布
    return {
      type: 'canvas',
      id: 'canvas',
      x: transformedPoint.x,
      y: transformedPoint.y
    };
  }

  /**
   * 判断点是否在元素内
   */
  private isPointInElement(x: number, y: number, element: SVGElement): boolean {
    const bbox = element.getBBox();
    return x >= bbox.x && x <= bbox.x + bbox.width &&
           y >= bbox.y && y <= bbox.y + bbox.height;
  }

  /**
   * 判断点是否在元素附近
   */
  private isPointNearElement(x: number, y: number, element: SVGElement): boolean {
    // 对于路径，使用一个容忍度来检测点击
    const TOLERANCE = 5;
    const bbox = element.getBBox();
    
    // 简化的检测 - 真实实现应该计算到路径的精确距离
    return x >= bbox.x - TOLERANCE && x <= bbox.x + bbox.width + TOLERANCE &&
           y >= bbox.y - TOLERANCE && y <= bbox.y + bbox.height + TOLERANCE;
  }

  /**
   * 获取节点位置
   * @param nodeId 节点ID
   */
  public getNodePosition(nodeId: string): Position {
    const element = this.nodes.get(nodeId);
    if (element) {
      const transform = element.getAttribute('transform');
      if (transform) {
        // 从transform属性中提取位置
        const match = /translate\(([^,]+),\s*([^)]+)\)/.exec(transform);
        if (match) {
          return {
            x: parseFloat(match[1]),
            y: parseFloat(match[2])
          };
        }
      }

      // 如果没有transform属性，使用元素的bbox
      const bbox = element.getBBox();
      return {
        x: bbox.x,
        y: bbox.y
      };
    }
    
    // 默认返回原点
    return { x: 0, y: 0 };
  }

  /**
   * 更新节点状态
   * @param nodeId 节点ID
   * @param state 状态对象
   */
  public updateNodeState(nodeId: string, state: { selected?: boolean, hover?: boolean }): void {
    const element = this.nodes.get(nodeId);
    if (element) {
      if (state.selected !== undefined) {
        if (state.selected) {
          element.setAttribute('data-selected', 'true');
          // 更新视觉效果
          const shape = element.querySelector('rect, circle, path');
          if (shape) {
            shape.setAttribute('stroke-width', '3');
            shape.setAttribute('stroke', '#1976D2');
          }
        } else {
          element.removeAttribute('data-selected');
          // 恢复默认视觉效果
          const shape = element.querySelector('rect, circle, path');
          if (shape) {
            shape.setAttribute('stroke-width', '1');
            shape.setAttribute('stroke', '#333333');
          }
        }
      }
      
      if (state.hover !== undefined) {
        if (state.hover) {
          element.setAttribute('data-hover', 'true');
          // 更新视觉效果
        } else {
          element.removeAttribute('data-hover');
          // 恢复默认视觉效果
        }
      }
    }
  }

  /**
   * 更新边状态
   * @param edgeId 边ID
   * @param state 状态对象
   */
  public updateEdgeState(edgeId: string, state: { selected?: boolean, hover?: boolean }): void {
    const element = this.edges.get(edgeId);
    if (element) {
      if (state.selected !== undefined) {
        if (state.selected) {
          element.setAttribute('data-selected', 'true');
          element.setAttribute('stroke-width', '3');
          element.setAttribute('stroke', '#1976D2');
        } else {
          element.removeAttribute('data-selected');
          element.setAttribute('stroke-width', '1');
          element.setAttribute('stroke', '#333333');
        }
      }
      
      if (state.hover !== undefined) {
        if (state.hover) {
          element.setAttribute('data-hover', 'true');
          element.setAttribute('stroke-width', '2');
        } else {
          element.removeAttribute('data-hover');
          if (!element.hasAttribute('data-selected')) {
            element.setAttribute('stroke-width', '1');
          }
        }
      }
    }
  }

  /**
   * 移动节点
   * @param nodeId 节点ID
   * @param x X坐标
   * @param y Y坐标
   */
  public moveNode(nodeId: string, x: number, y: number): void {
    const element = this.nodes.get(nodeId);
    if (element) {
      element.setAttribute('transform', `translate(${x}, ${y})`);
    }
  }

  /**
   * 移动多个节点
   * @param nodeIds 节点ID数组
   * @param dx X方向位移
   * @param dy Y方向位移
   */
  public moveNodes(nodeIds: string[], dx: number, dy: number): void {
    nodeIds.forEach(nodeId => {
      const element = this.nodes.get(nodeId);
      if (element) {
        const currentPos = this.getNodePosition(nodeId);
        this.moveNode(nodeId, currentPos.x + dx, currentPos.y + dy);
      }
    });
  }

  /**
   * 渲染节点
   * @param node 节点
   */
  public renderNode(node: Node): void {
    // 创建节点视图
    const nodeView = new SVGNodeView(node.id, node);
    
    // 添加到DOM
    this.nodesGroup.appendChild(nodeView.element);
    
    // 保存引用
    this.nodes.set(node.id, nodeView.element);
  }

  /**
   * 渲染边
   * @param edge 边
   * @param sourceNode 源节点
   * @param targetNode 目标节点
   */
  public renderEdge(edge: Edge, sourceNode: Node, targetNode: Node): void {
    // 创建边视图
    const edgeView = new SVGEdgeView(edge.id, edge, sourceNode, targetNode);
    
    // 添加到DOM
    this.edgesGroup.appendChild(edgeView.element);
    
    // 保存引用
    this.edges.set(edge.id, edgeView.element);
  }

  /**
   * 更新视口
   * @param viewBox 新视口
   */
  public updateViewBox(viewBox: ViewBox): void {
    this.svg.setAttribute('viewBox', viewBox.toSVGViewBox());
  }

  /**
   * 清除所有渲染内容
   */
  public clear(): void {
    // 清空节点组和边组
    while (this.nodesGroup.firstChild) {
      this.nodesGroup.removeChild(this.nodesGroup.firstChild);
    }
    
    while (this.edgesGroup.firstChild) {
      this.edgesGroup.removeChild(this.edgesGroup.firstChild);
    }
    
    // 清空映射
    this.nodes.clear();
    this.edges.clear();
  }
} 