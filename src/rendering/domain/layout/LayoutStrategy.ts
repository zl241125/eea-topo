/**
 * 布局算法接口与相关类型定义
 */
import { Edge } from '../edge/ConnectionService';

/**
 * 节点接口（简化）
 */
export interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  group?: string;  // 节点分组标识
  level?: number;  // 节点层级
  type: string;    // 节点类型
  fixed?: boolean; // 是否固定位置
}

/**
 * 节点位置信息
 */
export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

/**
 * 边路径信息
 */
export interface EdgePath {
  id: string;
  path: { x: number, y: number }[];
}

/**
 * 布局结果
 */
export interface LayoutResult {
  nodePositions: NodePosition[];
  edgePaths: EdgePath[];
}

/**
 * 布局策略接口
 * 所有布局算法需要实现此接口
 */
export interface LayoutStrategy {
  /**
   * 执行布局计算
   * @param nodes 需要布局的节点
   * @param edges 节点之间的连接
   * @returns 布局计算结果
   */
  execute(nodes: LayoutNode[], edges: Edge[]): Promise<LayoutResult>;

  /**
   * 停止布局计算
   * 对于迭代式布局算法，可以中断计算过程
   */
  stop(): void;

  /**
   * 判断布局是否正在计算中
   * @returns 布局计算状态
   */
  isRunning(): boolean;
}

/**
 * 布局配置基础接口
 */
export interface LayoutConfig {
  padding?: number;      // 边缘填充
  nodeSpacing?: number;  // 节点间距
  animate?: boolean;     // 是否动画过渡
  animationDuration?: number; // 动画持续时间
}

/**
 * 布局服务
 * 管理布局策略的注册与应用
 */
export class LayoutService {
  private strategies: Map<string, LayoutStrategy> = new Map();
  private currentStrategy: string | null = null;
  private running: boolean = false;

  /**
   * 注册布局策略
   * @param name 布局策略名称
   * @param strategy 布局策略实现
   */
  public registerStrategy(name: string, strategy: LayoutStrategy): void {
    this.strategies.set(name, strategy);
  }

  /**
   * 应用布局
   * @param strategyName 布局策略名称
   * @param nodes 需要布局的节点
   * @param edges 节点之间的连接
   * @returns 布局计算结果
   */
  public async applyLayout(
    strategyName: string,
    nodes: LayoutNode[],
    edges: Edge[]
  ): Promise<LayoutResult> {
    if (!this.strategies.has(strategyName)) {
      throw new Error(`布局策略 ${strategyName} 不存在`);
    }

    if (this.running) {
      this.stopCurrentLayout();
    }

    const strategy = this.strategies.get(strategyName)!;
    this.currentStrategy = strategyName;
    this.running = true;

    try {
      const result = await strategy.execute(nodes, edges);
      return result;
    } finally {
      this.running = false;
    }
  }

  /**
   * 停止当前布局计算
   */
  public stopCurrentLayout(): void {
    if (this.currentStrategy && this.strategies.has(this.currentStrategy)) {
      this.strategies.get(this.currentStrategy)!.stop();
    }
    this.running = false;
  }

  /**
   * 判断是否有布局正在计算
   * @returns 布局计算状态
   */
  public isLayoutRunning(): boolean {
    return this.running;
  }
} 