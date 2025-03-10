/**
 * 拖拽管理器
 * 负责处理节点拖拽逻辑
 */
import { EventBus } from '../../../core/domain/events/EventBus';
import { Position } from '../edge/EdgePathCalculator';
import { NodeDragEvent, NodeDragEndEvent, NodeDragStartEvent } from '../events/NodeEvents';
import { RenderEngine } from './InteractionManager';

/**
 * 拖拽状态接口
 */
export interface DragState {
  nodeId: string;
  startX: number;
  startY: number;
  initialPosition: Position;
  currentX?: number;
  currentY?: number;
  isMultiSelection: boolean;
  selectedNodeIds: string[];
}

/**
 * 拖拽选项
 */
export interface DragOptions {
  // 是否启用网格吸附
  gridSnapping?: boolean;
  // 网格大小
  gridSize?: number;
  // 是否启用智能对齐辅助
  smartGuides?: boolean;
  // 对齐容差
  alignmentTolerance?: number;
}

/**
 * 拖拽管理器
 * 负责所有拖拽相关逻辑
 */
export class DragDropManager {
  private isDragging: boolean = false;
  private dragState: DragState | null = null;
  private options: DragOptions = {
    gridSnapping: false,
    gridSize: 10,
    smartGuides: true,
    alignmentTolerance: 5
  };

  constructor(
    private readonly eventBus: EventBus,
    private readonly renderer: RenderEngine
  ) {}

  /**
   * 配置拖拽选项
   * @param options 拖拽选项
   */
  public configure(options: Partial<DragOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 开始拖拽
   * @param nodeId 节点ID
   * @param x 起始X坐标
   * @param y 起始Y坐标
   * @param selectedNodeIds 选中的节点ID数组
   */
  public startDrag(
    nodeId: string,
    x: number,
    y: number,
    selectedNodeIds: string[] = []
  ): void {
    if (this.isDragging) {
      return;
    }

    const initialPosition = this.renderer.getNodePosition(nodeId);
    const isMultiSelection = selectedNodeIds.length > 1 && selectedNodeIds.includes(nodeId);

    this.dragState = {
      nodeId,
      startX: x,
      startY: y,
      initialPosition,
      isMultiSelection,
      selectedNodeIds: isMultiSelection ? selectedNodeIds : [nodeId]
    };

    this.isDragging = true;

    // 发布拖拽开始事件
    this.eventBus.publish(
      new NodeDragStartEvent(
        nodeId,
        initialPosition.x,
        initialPosition.y
      )
    );
  }

  /**
   * 处理拖拽过程
   * @param x 当前X坐标
   * @param y 当前Y坐标
   */
  public drag(x: number, y: number): void {
    if (!this.isDragging || !this.dragState) {
      return;
    }

    // 更新当前位置
    this.dragState.currentX = x;
    this.dragState.currentY = y;

    // 计算位移
    const dx = x - this.dragState.startX;
    const dy = y - this.dragState.startY;

    // 根据是否多选择处理拖拽逻辑
    if (this.dragState.isMultiSelection) {
      this.dragMultipleNodes(dx, dy);
    } else {
      this.dragSingleNode(dx, dy);
    }
  }

  /**
   * 结束拖拽
   * @param x 结束X坐标
   * @param y 结束Y坐标
   */
  public endDrag(x: number, y: number): void {
    if (!this.isDragging || !this.dragState) {
      return;
    }

    // 计算最终位置
    const dx = x - this.dragState.startX;
    const dy = y - this.dragState.startY;
    const finalX = this.dragState.initialPosition.x + dx;
    const finalY = this.dragState.initialPosition.y + dy;
    
    // 发布拖拽结束事件
    this.eventBus.publish(
      new NodeDragEndEvent(
        this.dragState.nodeId,
        finalX,
        finalY,
        this.dragState.initialPosition.x,
        this.dragState.initialPosition.y
      )
    );

    // 清除拖拽状态
    this.isDragging = false;
    this.dragState = null;
  }

  /**
   * 取消拖拽
   */
  public cancelDrag(): void {
    if (!this.isDragging || !this.dragState) {
      return;
    }

    // 恢复原始位置
    if (this.dragState.isMultiSelection) {
      // 对于多选，可能需要记录并恢复每个节点的初始位置
      // 此处简化处理，仅恢复拖拽起始节点
      this.renderer.moveNode(
        this.dragState.nodeId,
        this.dragState.initialPosition.x,
        this.dragState.initialPosition.y
      );
    } else {
      this.renderer.moveNode(
        this.dragState.nodeId,
        this.dragState.initialPosition.x,
        this.dragState.initialPosition.y
      );
    }

    // 清除拖拽状态
    this.isDragging = false;
    this.dragState = null;
  }

  /**
   * 拖拽单个节点
   * @param dx X方向位移
   * @param dy Y方向位移
   */
  private dragSingleNode(dx: number, dy: number): void {
    if (!this.dragState) return;

    // 计算新位置
    let newX = this.dragState.initialPosition.x + dx;
    let newY = this.dragState.initialPosition.y + dy;

    // 应用网格吸附
    if (this.options.gridSnapping && this.options.gridSize) {
      newX = Math.round(newX / this.options.gridSize) * this.options.gridSize;
      newY = Math.round(newY / this.options.gridSize) * this.options.gridSize;
    }

    // 移动节点
    this.renderer.moveNode(this.dragState.nodeId, newX, newY);

    // 发布拖拽事件
    this.eventBus.publish(
      new NodeDragEvent(
        this.dragState.nodeId,
        newX,
        newY
      )
    );
  }

  /**
   * 拖拽多个节点
   * @param dx X方向位移
   * @param dy Y方向位移
   */
  private dragMultipleNodes(dx: number, dy: number): void {
    if (!this.dragState) return;

    // 移动所有选中的节点
    this.renderer.moveNodes(this.dragState.selectedNodeIds, dx, dy);

    // 为主拖拽节点发布事件
    const mainNode = this.renderer.getNodePosition(this.dragState.nodeId);
    if (mainNode) {
      this.eventBus.publish(
        new NodeDragEvent(
          this.dragState.nodeId,
          mainNode.x,
          mainNode.y
        )
      );
    }
  }

  /**
   * 是否正在拖拽中
   */
  public isDraggingActive(): boolean {
    return this.isDragging;
  }

  /**
   * 获取当前拖拽状态
   */
  public getCurrentDragState(): DragState | null {
    return this.dragState;
  }
} 