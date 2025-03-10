/**
 * 交互管理器
 * 负责处理用户与图形元素的交互
 */
import { EventBus } from '../../../core/domain/events/EventBus';
import { 
  NodeSelectionChanged, 
  NodeHoverEvent, 
  NodeDragStartEvent, 
  NodeDragEvent, 
  NodeDragEndEvent 
} from '../events/NodeEvents';
import { 
  ConnectionSelectedEvent, 
  ConnectionHoverEvent 
} from '../events/ConnectionEvents';
import { Position } from '../edge/EdgePathCalculator';
import { DragDropManager } from './DragDropManager';

/**
 * 渲染引擎接口
 */
export interface RenderEngine {
  getContainer(): HTMLElement;
  hitTest(x: number, y: number): HitTestResult | null;
  getNodePosition(nodeId: string): Position;
  updateNodeState(nodeId: string, state: { selected?: boolean, hover?: boolean }): void;
  updateEdgeState(edgeId: string, state: { selected?: boolean, hover?: boolean }): void;
  moveNode(nodeId: string, x: number, y: number): void;
  moveNodes(nodeIds: string[], dx: number, dy: number): void;
}

/**
 * 碰撞测试结果
 */
export interface HitTestResult {
  type: 'node' | 'edge' | 'canvas';
  id: string;
  x: number;
  y: number;
}

/**
 * 拖拽状态
 */
export interface DragState {
  type: 'node' | 'selection';
  nodeId?: string;
  startX: number;
  startY: number;
  initialPosition?: Position;
  currentX?: number;
  currentY?: number;
  selectedNodes?: string[];
}

/**
 * 选择框状态
 */
export interface SelectionBoxState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  visible: boolean;
}

/**
 * 交互事件类型
 */
export type InteractionEventType = 
  | 'node:click' 
  | 'node:dblclick' 
  | 'node:mousedown' 
  | 'node:mouseup' 
  | 'node:mousemove' 
  | 'node:dragstart' 
  | 'node:drag' 
  | 'node:dragend'
  | 'edge:click'
  | 'edge:dblclick'
  | 'edge:mouseenter'
  | 'edge:mouseleave'
  | 'canvas:click'
  | 'canvas:dblclick'
  | 'canvas:mousedown'
  | 'canvas:mouseup'
  | 'canvas:mousemove'
  | 'canvas:wheel';

/**
 * 事件处理器
 */
export type EventHandler = (event: any) => void;

/**
 * 交互管理器
 */
export class InteractionManager {
  private eventHandlers: Map<InteractionEventType, Set<EventHandler>> = new Map();
  private selectedNodes: Set<string> = new Set();
  private selectedEdges: Set<string> = new Set();
  private dragState: DragState | null = null;
  private selectionBox: SelectionBoxState = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    visible: false
  };
  private lastHoverTarget: HitTestResult | null = null;
  private keyState: Record<string, boolean> = {};
  private dragDropManager: DragDropManager;
  
  constructor(
    private readonly domainEventBus: EventBus,
    private readonly renderer: RenderEngine
  ) {
    this.dragDropManager = new DragDropManager(domainEventBus, renderer);
    this.initDOMEventListeners();
  }
  
  /**
   * 初始化DOM事件监听
   */
  private initDOMEventListeners(): void {
    // 监听容器DOM事件
    const container = this.renderer.getContainer();
    
    container.addEventListener('mousedown', this.handleMouseDown.bind(this));
    container.addEventListener('mousemove', this.handleMouseMove.bind(this));
    container.addEventListener('mouseup', this.handleMouseUp.bind(this));
    container.addEventListener('click', this.handleClick.bind(this));
    container.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    container.addEventListener('wheel', this.handleWheel.bind(this));
    
    // 键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // 确保拖拽结束
    window.addEventListener('mouseup', this.handleWindowMouseUp.bind(this));
  }
  
  /**
   * 注册事件处理器
   * @param eventType 事件类型
   * @param handler 处理函数
   */
  public on(eventType: InteractionEventType, handler: EventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    
    this.eventHandlers.get(eventType)!.add(handler);
  }
  
  /**
   * 移除事件处理器
   * @param eventType 事件类型
   * @param handler 处理函数
   */
  public off(eventType: InteractionEventType, handler: EventHandler): void {
    if (this.eventHandlers.has(eventType)) {
      this.eventHandlers.get(eventType)!.delete(handler);
    }
  }
  
  /**
   * 触发事件
   * @param eventType 事件类型
   * @param event 事件数据
   */
  private trigger(eventType: InteractionEventType, event: any): void {
    if (this.eventHandlers.has(eventType)) {
      this.eventHandlers.get(eventType)!.forEach(handler => handler(event));
    }
  }
  
  /**
   * 处理鼠标按下事件
   * @param event 鼠标事件
   */
  private handleMouseDown(event: MouseEvent): void {
    const target = this.renderer.hitTest(event.clientX, event.clientY);
    
    if (target && target.type === 'node') {
      // 触发节点鼠标按下事件
      this.trigger('node:mousedown', {
        originalEvent: event,
        target
      });
      
      // 处理节点选择
      if (!this.selectedNodes.has(target.id)) {
        this.selectNode(target.id, event.ctrlKey || event.metaKey);
      } else if (event.ctrlKey || event.metaKey) {
        // Ctrl+点击已选中的节点，取消选择
        this.deselectNode(target.id);
      }
      
      // 开始节点拖拽
      this.dragDropManager.startDrag(
        target.id,
        event.clientX,
        event.clientY,
        Array.from(this.selectedNodes)
      );
      
      // 设置拖拽状态用于兼容现有系统
      this.dragState = {
        type: 'node',
        nodeId: target.id,
        startX: event.clientX,
        startY: event.clientY,
        initialPosition: this.renderer.getNodePosition(target.id),
        selectedNodes: [...this.selectedNodes]
      };
    } else if (target && target.type === 'edge') {
      // 触发边鼠标按下事件
      this.trigger('edge:mousedown', {
        originalEvent: event,
        target
      });
      
      // 处理边选择
      if (!event.ctrlKey && !event.metaKey) {
        this.clearSelection();
      }
      
      this.selectEdge(target.id);
    } else {
      // 触发画布鼠标按下事件
      this.trigger('canvas:mousedown', {
        originalEvent: event,
        x: event.clientX,
        y: event.clientY
      });
      
      // 可能是框选开始
      this.dragState = {
        type: 'selection',
        startX: event.clientX,
        startY: event.clientY,
        currentX: event.clientX,
        currentY: event.clientY
      };
      
      this.selectionBox = {
        startX: event.clientX,
        startY: event.clientY,
        endX: event.clientX,
        endY: event.clientY,
        visible: true
      };
      
      // 如果不是按住Ctrl，清除当前选择
      if (!event.ctrlKey && !event.metaKey) {
        this.clearSelection();
      }
    }
  }
  
  /**
   * 处理鼠标移动事件
   * @param event 鼠标事件
   */
  private handleMouseMove(event: MouseEvent): void {
    // 检查是否正在拖拽
    if (this.dragState) {
      if (this.dragState.type === 'node') {
        // 使用新的拖拽管理器处理节点拖拽
        this.dragDropManager.drag(event.clientX, event.clientY);
        return;
      } else if (this.dragState.type === 'selection') {
        // 处理框选
        this.handleSelectionDrag(event);
        return;
      }
    }
    
    // 处理悬停
    const target = this.renderer.hitTest(event.clientX, event.clientY);
    
    // 检查是否悬停目标改变
    if (this.lastHoverTarget) {
      if (!target || target.type !== this.lastHoverTarget.type || target.id !== this.lastHoverTarget.id) {
        // 离开之前的目标
        this.handleMouseLeave(this.lastHoverTarget);
        this.lastHoverTarget = null;
      }
    }
    
    if (target && (!this.lastHoverTarget || target.id !== this.lastHoverTarget.id)) {
      // 进入新目标
      this.handleMouseEnter(target);
      this.lastHoverTarget = target;
    }
    
    // 触发相应的mousemove事件
    if (target) {
      if (target.type === 'node') {
        this.trigger('node:mousemove', {
          originalEvent: event,
          target
        });
      } else if (target.type === 'edge') {
        this.trigger('edge:mousemove', {
          originalEvent: event,
          target
        });
      }
    } else {
      this.trigger('canvas:mousemove', {
        originalEvent: event,
        x: event.clientX,
        y: event.clientY
      });
    }
  }
  
  /**
   * 处理鼠标进入元素
   * @param target 碰撞目标
   */
  private handleMouseEnter(target: HitTestResult): void {
    if (target.type === 'node') {
      // 更新节点悬停状态
      this.renderer.updateNodeState(target.id, { hover: true });
      
      // 发布悬停事件
      this.domainEventBus.publish(new NodeHoverEvent(target.id, true));
    } else if (target.type === 'edge') {
      // 更新边悬停状态
      this.renderer.updateEdgeState(target.id, { hover: true });
      
      // 发布悬停事件
      this.domainEventBus.publish(new ConnectionHoverEvent(target.id, true));
    }
  }
  
  /**
   * 处理鼠标离开元素
   * @param target 碰撞目标
   */
  private handleMouseLeave(target: HitTestResult): void {
    if (target.type === 'node') {
      // 更新节点悬停状态
      this.renderer.updateNodeState(target.id, { hover: false });
      
      // 发布悬停事件
      this.domainEventBus.publish(new NodeHoverEvent(target.id, false));
    } else if (target.type === 'edge') {
      // 更新边悬停状态
      this.renderer.updateEdgeState(target.id, { hover: false });
      
      // 发布悬停事件
      this.domainEventBus.publish(new ConnectionHoverEvent(target.id, false));
    }
  }
  
  /**
   * 处理框选拖拽
   * @param event 鼠标事件
   */
  private handleSelectionDrag(event: MouseEvent): void {
    if (!this.dragState || this.dragState.type !== 'selection') {
      return;
    }
    
    // 更新框选区域
    this.selectionBox.endX = event.clientX;
    this.selectionBox.endY = event.clientY;
    
    // 更新框选视觉效果（实际实现中需要调用渲染引擎）
    // this.renderer.updateSelectionBox(this.selectionBox);
    
    // 执行框选节点
    // this.performAreaSelection();
  }
  
  /**
   * 处理鼠标释放事件
   * @param event 鼠标事件
   */
  private handleMouseUp(event: MouseEvent): void {
    // 检查是否有拖拽
    if (this.dragState) {
      if (this.dragState.type === 'node' && this.dragState.nodeId) {
        // 结束节点拖拽
        this.dragDropManager.endDrag(event.clientX, event.clientY);
        
        // 清除拖拽状态
        this.dragState = null;
      } else if (this.dragState.type === 'selection') {
        // 结束框选
        this.selectionBox.visible = false;
        // this.renderer.updateSelectionBox(this.selectionBox);
        
        // 执行最终选择
        // this.finalizeAreaSelection();
      }
    }
    
    // 获取鼠标下的元素
    const target = this.renderer.hitTest(event.clientX, event.clientY);
    
    // 触发相应的mouseup事件
    if (target) {
      if (target.type === 'node') {
        this.trigger('node:mouseup', {
          originalEvent: event,
          target
        });
      } else if (target.type === 'edge') {
        this.trigger('edge:mouseup', {
          originalEvent: event,
          target
        });
      }
    } else {
      this.trigger('canvas:mouseup', {
        originalEvent: event,
        x: event.clientX,
        y: event.clientY
      });
    }
  }
  
  /**
   * 处理全局鼠标释放
   * @param event 鼠标事件
   */
  private handleWindowMouseUp(event: MouseEvent): void {
    // 确保拖拽状态在鼠标释放时被清理，即使鼠标不在容器内
    if (this.dragState) {
      this.handleMouseUp(event);
    }
  }
  
  /**
   * 处理点击事件
   * @param event 鼠标事件
   */
  private handleClick(event: MouseEvent): void {
    // 获取鼠标下的元素
    const target = this.renderer.hitTest(event.clientX, event.clientY);
    
    // 触发相应的click事件
    if (target) {
      if (target.type === 'node') {
        this.trigger('node:click', {
          originalEvent: event,
          target
        });
      } else if (target.type === 'edge') {
        this.trigger('edge:click', {
          originalEvent: event,
          target
        });
      }
    } else {
      this.trigger('canvas:click', {
        originalEvent: event,
        x: event.clientX,
        y: event.clientY
      });
    }
  }
  
  /**
   * 处理双击事件
   * @param event 鼠标事件
   */
  private handleDoubleClick(event: MouseEvent): void {
    // 获取鼠标下的元素
    const target = this.renderer.hitTest(event.clientX, event.clientY);
    
    // 触发相应的dblclick事件
    if (target) {
      if (target.type === 'node') {
        this.trigger('node:dblclick', {
          originalEvent: event,
          target
        });
      } else if (target.type === 'edge') {
        this.trigger('edge:dblclick', {
          originalEvent: event,
          target
        });
      }
    } else {
      this.trigger('canvas:dblclick', {
        originalEvent: event,
        x: event.clientX,
        y: event.clientY
      });
    }
  }
  
  /**
   * 处理滚轮事件（缩放）
   * @param event 滚轮事件
   */
  private handleWheel(event: WheelEvent): void {
    // 阻止默认行为（页面滚动）
    event.preventDefault();
    
    // 触发画布滚轮事件
    this.trigger('canvas:wheel', {
      originalEvent: event,
      x: event.clientX,
      y: event.clientY,
      deltaX: event.deltaX,
      deltaY: event.deltaY
    });
  }
  
  /**
   * 处理键盘按下事件
   * @param event 键盘事件
   */
  private handleKeyDown(event: KeyboardEvent): void {
    this.keyState[event.key] = true;
    
    // 处理Delete/Backspace键删除选中元素
    if (event.key === 'Delete' || event.key === 'Backspace') {
      // 删除选中的元素
      // this.deleteSelectedItems();
    }
    
    // 处理Esc键取消拖拽
    if (event.key === 'Escape' && this.dragDropManager.isDraggingActive()) {
      this.dragDropManager.cancelDrag();
      this.dragState = null;
    }
    
    // 处理Ctrl+A全选
    if (event.key === 'a' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      // this.selectAll();
    }
  }
  
  /**
   * 处理键盘释放事件
   * @param event 键盘事件
   */
  private handleKeyUp(event: KeyboardEvent): void {
    this.keyState[event.key] = false;
  }
  
  /**
   * 选择节点
   * @param nodeId 节点ID
   * @param addToSelection 是否添加到已有选择
   */
  public selectNode(nodeId: string, addToSelection: boolean = false): void {
    if (!addToSelection) {
      // 清除已有选择
      this.clearSelection();
    }
    
    // 添加到选择集合
    this.selectedNodes.add(nodeId);
    
    // 更新节点状态
    this.renderer.updateNodeState(nodeId, { selected: true });
    
    // 发布选择变更事件
    this.domainEventBus.publish(new NodeSelectionChanged(Array.from(this.selectedNodes)));
  }
  
  /**
   * 取消选择节点
   * @param nodeId 节点ID
   */
  public deselectNode(nodeId: string): void {
    // 从选择集合移除
    this.selectedNodes.delete(nodeId);
    
    // 更新节点状态
    this.renderer.updateNodeState(nodeId, { selected: false });
    
    // 发布选择变更事件
    this.domainEventBus.publish(new NodeSelectionChanged(Array.from(this.selectedNodes)));
  }
  
  /**
   * 选择边
   * @param edgeId 边ID
   */
  public selectEdge(edgeId: string): void {
    // 添加到选择集合
    this.selectedEdges.add(edgeId);
    
    // 更新边状态
    this.renderer.updateEdgeState(edgeId, { selected: true });
    
    // 发布选择变更事件
    this.domainEventBus.publish(new ConnectionSelectedEvent(edgeId));
  }
  
  /**
   * 取消选择边
   * @param edgeId 边ID
   */
  public deselectEdge(edgeId: string): void {
    // 从选择集合移除
    this.selectedEdges.delete(edgeId);
    
    // 更新边状态
    this.renderer.updateEdgeState(edgeId, { selected: false });
  }
  
  /**
   * 清除所有选择
   */
  public clearSelection(): void {
    // 清除节点选择
    this.selectedNodes.forEach(nodeId => {
      this.renderer.updateNodeState(nodeId, { selected: false });
    });
    this.selectedNodes.clear();
    
    // 清除边选择
    this.selectedEdges.forEach(edgeId => {
      this.renderer.updateEdgeState(edgeId, { selected: false });
    });
    this.selectedEdges.clear();
    
    // 发布节点选择变更事件
    this.domainEventBus.publish(new NodeSelectionChanged([]));
  }
  
  /**
   * 获取选中的节点ID集合
   */
  public getSelectedNodes(): string[] {
    return Array.from(this.selectedNodes);
  }
  
  /**
   * 获取选中的边ID集合
   */
  public getSelectedEdges(): string[] {
    return Array.from(this.selectedEdges);
  }
  
  /**
   * 配置拖拽选项
   * @param options 拖拽选项
   */
  public configureDragDrop(options: any): void {
    this.dragDropManager.configure(options);
  }
} 