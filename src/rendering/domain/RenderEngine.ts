import { ViewBox } from '../../core/domain/valueObjects/ViewBox';
import { Node } from '../../topology/domain/Node';
import { Edge } from '../../topology/domain/Edge';

/**
 * 节点视图接口
 */
export interface NodeView {
  /**
   * 节点ID
   */
  readonly nodeId: string;
  
  /**
   * DOM元素
   */
  readonly element: Element;
  
  /**
   * 更新节点视图
   * @param node 节点数据
   */
  update(node: Node): void;
}

/**
 * 边视图接口
 */
export interface EdgeView {
  /**
   * 边ID
   */
  readonly edgeId: string;
  
  /**
   * DOM元素
   */
  readonly element: Element;
  
  /**
   * 更新边视图
   * @param edge 边数据
   * @param sourceNode 源节点
   * @param targetNode 目标节点
   */
  update(edge: Edge, sourceNode: Node, targetNode: Node): void;
}

/**
 * 渲染引擎抽象类
 * 定义渲染拓扑图的基本接口
 */
export abstract class RenderEngine {
  /**
   * 容器元素
   */
  protected container: HTMLElement;
  
  /**
   * 视口
   */
  protected viewBox: ViewBox;
  
  /**
   * 节点视图映射
   */
  protected nodes: Map<string, NodeView> = new Map();
  
  /**
   * 边视图映射
   */
  protected edges: Map<string, EdgeView> = new Map();

  /**
   * 创建渲染引擎
   * @param container 容器元素
   * @param viewBox 视口
   */
  constructor(container: HTMLElement, viewBox: ViewBox) {
    this.container = container;
    this.viewBox = viewBox;
  }

  /**
   * 初始化渲染引擎
   */
  public abstract initialize(): void;
  
  /**
   * 渲染节点
   * @param node 节点
   */
  public abstract renderNode(node: Node): void;
  
  /**
   * 渲染边
   * @param edge 边
   * @param sourceNode 源节点
   * @param targetNode 目标节点
   */
  public abstract renderEdge(edge: Edge, sourceNode: Node, targetNode: Node): void;
  
  /**
   * 更新视口
   * @param viewBox 新视口
   */
  public abstract updateViewBox(viewBox: ViewBox): void;
  
  /**
   * 清除所有渲染内容
   */
  public abstract clear(): void;

  /**
   * 移除节点
   * @param nodeId 节点ID
   * @returns 是否成功移除
   */
  public removeNode(nodeId: string): boolean {
    const nodeView = this.nodes.get(nodeId);
    if (!nodeView) {
      return false;
    }
    
    nodeView.element.remove();
    this.nodes.delete(nodeId);
    return true;
  }

  /**
   * 移除边
   * @param edgeId 边ID
   * @returns 是否成功移除
   */
  public removeEdge(edgeId: string): boolean {
    const edgeView = this.edges.get(edgeId);
    if (!edgeView) {
      return false;
    }
    
    edgeView.element.remove();
    this.edges.delete(edgeId);
    return true;
  }

  /**
   * 更新节点
   * @param node 节点
   * @returns 是否成功更新
   */
  public updateNode(node: Node): boolean {
    const nodeView = this.nodes.get(node.id);
    if (!nodeView) {
      return false;
    }
    
    nodeView.update(node);
    return true;
  }

  /**
   * 更新边
   * @param edge 边
   * @param sourceNode 源节点
   * @param targetNode 目标节点
   * @returns 是否成功更新
   */
  public updateEdge(edge: Edge, sourceNode: Node, targetNode: Node): boolean {
    const edgeView = this.edges.get(edge.id);
    if (!edgeView) {
      return false;
    }
    
    edgeView.update(edge, sourceNode, targetNode);
    return true;
  }

  /**
   * 创建渲染引擎
   * @param container 容器元素
   * @param viewBox 视口
   * @returns 渲染引擎实例
   */
  public static create(container: HTMLElement, viewBox: ViewBox): RenderEngine {
    throw new Error('必须由子类实现');
  }
} 