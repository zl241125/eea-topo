/**
 * 力导向布局算法实现
 * 基于物理模拟，适用于展示节点间的整体关系
 */
import { 
  LayoutStrategy, 
  LayoutNode, 
  LayoutResult, 
  NodePosition, 
  EdgePath,
  LayoutConfig 
} from './LayoutStrategy';
import { Edge } from '../edge/ConnectionService';
import { EdgePathCalculator } from '../edge/EdgePathCalculator';

/**
 * 力导向布局配置
 */
export interface ForceLayoutConfig extends LayoutConfig {
  width: number;               // 画布宽度
  height: number;              // 画布高度
  iterations?: number;         // 迭代次数
  repulsionStrength?: number;  // 排斥力强度
  attractionStrength?: number; // 吸引力强度
  linkDistance?: number;       // 理想连线长度
  gravity?: number;            // 向中心的引力
  theta?: number;              // Barnes-Hut 算法参数
  alpha?: number;              // 初始温度
  alphaDecay?: number;         // 温度衰减率
  velocityDecay?: number;      // 速度衰减率
  groupPadding?: number;       // 分组间距
}

/**
 * 模拟粒子
 */
interface ForceNode extends LayoutNode {
  vx: number;   // X方向速度
  vy: number;   // Y方向速度
  fx?: number;  // 固定X坐标
  fy?: number;  // 固定Y坐标
}

/**
 * 模拟连接
 */
interface ForceLink {
  source: ForceNode;
  target: ForceNode;
  distance: number;
  strength: number;
}

/**
 * 力导向布局实现
 */
export class ForceDirectedLayout implements LayoutStrategy {
  private running: boolean = false;
  private shouldStop: boolean = false;
  private pathCalculator: EdgePathCalculator = new EdgePathCalculator();
  private forceNodes: ForceNode[] = [];
  private forceLinks: ForceLink[] = [];
  
  constructor(private config: ForceLayoutConfig) {
    // 设置默认配置
    this.config = {
      width: 800,
      height: 600,
      iterations: 300,
      repulsionStrength: -1000,
      attractionStrength: 0.7,
      linkDistance: 100,
      gravity: 0.1,
      theta: 0.8,
      alpha: 1,
      alphaDecay: 0.0228,
      velocityDecay: 0.4,
      padding: 50,
      ...config
    };
  }

  /**
   * 执行布局计算
   * @param nodes 需要布局的节点
   * @param edges 节点之间的连接
   * @returns 布局计算结果
   */
  public async execute(nodes: LayoutNode[], edges: Edge[]): Promise<LayoutResult> {
    this.running = true;
    this.shouldStop = false;
    
    try {
      // 初始化力导向系统
      this.initializeForceSystem(nodes, edges);
      
      // 运行力导向模拟
      await this.runSimulation();
      
      // 将模拟结果应用到节点位置
      this.applyForceResults();
      
      // 计算边路径
      const edgePaths = this.routeEdges(edges);
      
      // 提取布局结果
      const nodePositions = this.extractNodePositions();
      
      return {
        nodePositions,
        edgePaths
      };
    } finally {
      this.running = false;
    }
  }

  /**
   * 停止布局计算
   */
  public stop(): void {
    this.shouldStop = true;
  }

  /**
   * 判断布局是否正在计算中
   * @returns 布局计算状态
   */
  public isRunning(): boolean {
    return this.running;
  }

  /**
   * 初始化力导向系统
   * @param nodes 节点列表
   * @param edges 连接列表
   */
  private initializeForceSystem(nodes: LayoutNode[], edges: Edge[]): void {
    // 创建力导向节点
    this.forceNodes = nodes.map(node => {
      // 如果节点位置未定义，随机分配初始位置
      if (typeof node.x !== 'number' || typeof node.y !== 'number') {
        return {
          ...node,
          x: Math.random() * this.config.width,
          y: Math.random() * this.config.height,
          vx: 0,
          vy: 0,
          fx: node.fixed ? node.x : undefined,
          fy: node.fixed ? node.y : undefined
        };
      }
      
      return {
        ...node,
        vx: 0,
        vy: 0,
        fx: node.fixed ? node.x : undefined,
        fy: node.fixed ? node.y : undefined
      };
    });
    
    // 创建节点索引映射
    const nodeMap = new Map<string, ForceNode>();
    this.forceNodes.forEach(node => nodeMap.set(node.id, node));
    
    // 创建力导向连接
    this.forceLinks = edges
      .filter(edge => nodeMap.has(edge.sourceId) && nodeMap.has(edge.targetId))
      .map(edge => {
        const source = nodeMap.get(edge.sourceId)!;
        const target = nodeMap.get(edge.targetId)!;
        
        return {
          source,
          target,
          distance: this.config.linkDistance || 100,
          strength: this.config.attractionStrength || 0.7
        };
      });
  }

  /**
   * 运行力导向模拟
   */
  private async runSimulation(): Promise<void> {
    const iterations = this.config.iterations || 300;
    let alpha = this.config.alpha || 1;
    const alphaDecay = this.config.alphaDecay || 0.0228;
    const velocityDecay = this.config.velocityDecay || 0.4;
    
    // 使用 Promise 来异步执行模拟
    return new Promise(resolve => {
      // 创建一个迭代器函数
      const iterate = () => {
        // 检查是否应该停止
        if (this.shouldStop || alpha < 0.001) {
          resolve();
          return;
        }
        
        // 执行一步模拟
        this.simulateStep(alpha);
        
        // 更新 alpha
        alpha *= (1 - alphaDecay);
        
        // 应用速度衰减
        this.forceNodes.forEach(node => {
          node.vx *= velocityDecay;
          node.vy *= velocityDecay;
        });
        
        // 继续下一步模拟，使用 setTimeout 避免阻塞 UI
        if (iterations > 0) {
          setTimeout(iterate, 0);
        } else {
          resolve();
        }
      };
      
      // 开始迭代
      iterate();
    });
  }

  /**
   * 执行单步模拟
   * @param alpha 当前温度
   */
  private simulateStep(alpha: number): void {
    // 应用排斥力
    this.applyRepulsionForces(alpha);
    
    // 应用引力（连接）
    this.applyAttractionForces(alpha);
    
    // 应用中心引力
    this.applyCenteringForce(alpha);
    
    // 更新位置
    this.updatePositions();
  }

  /**
   * 应用节点间的排斥力
   * @param alpha 当前温度
   */
  private applyRepulsionForces(alpha: number): void {
    const strength = this.config.repulsionStrength || -1000;
    
    // O(n^2) 简单实现，实际应用中应使用四叉树或 Barnes-Hut 算法优化
    for (let i = 0; i < this.forceNodes.length; i++) {
      const nodeA = this.forceNodes[i];
      
      for (let j = i + 1; j < this.forceNodes.length; j++) {
        const nodeB = this.forceNodes[j];
        
        // 计算距离
        const dx = nodeB.x - nodeA.x;
        const dy = nodeB.y - nodeA.y;
        const distanceSquared = dx * dx + dy * dy;
        const distance = Math.sqrt(distanceSquared) || 1;
        
        // 计算排斥力（平方反比）
        const force = (strength * alpha) / distanceSquared;
        
        // 应用力
        const forceX = (dx / distance) * force;
        const forceY = (dy / distance) * force;
        
        // 更新速度（如果不是固定节点）
        if (!nodeA.fixed) {
          nodeA.vx -= forceX;
          nodeA.vy -= forceY;
        }
        
        if (!nodeB.fixed) {
          nodeB.vx += forceX;
          nodeB.vy += forceY;
        }
      }
    }
  }

  /**
   * 应用连接的吸引力
   * @param alpha 当前温度
   */
  private applyAttractionForces(alpha: number): void {
    this.forceLinks.forEach(link => {
      const source = link.source;
      const target = link.target;
      
      // 计算距离
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      
      // 计算偏离理想距离的力（弹簧力）
      const displacement = distance - link.distance;
      const force = displacement * link.strength * alpha;
      
      // 应用力
      const forceX = (dx / distance) * force;
      const forceY = (dy / distance) * force;
      
      // 更新速度（如果不是固定节点）
      if (!source.fixed) {
        source.vx += forceX;
        source.vy += forceY;
      }
      
      if (!target.fixed) {
        target.vx -= forceX;
        target.vy -= forceY;
      }
    });
  }

  /**
   * 应用中心引力
   * @param alpha 当前温度
   */
  private applyCenteringForce(alpha: number): void {
    const centerX = this.config.width / 2;
    const centerY = this.config.height / 2;
    const gravity = this.config.gravity || 0.1;
    
    this.forceNodes.forEach(node => {
      if (!node.fixed) {
        // 计算到中心的距离
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        
        // 应用引力
        node.vx += dx * gravity * alpha;
        node.vy += dy * gravity * alpha;
      }
    });
  }

  /**
   * 更新节点位置
   */
  private updatePositions(): void {
    const padding = this.config.padding || 50;
    const maxX = this.config.width - padding;
    const maxY = this.config.height - padding;
    
    this.forceNodes.forEach(node => {
      if (!node.fixed) {
        // 更新位置
        node.x += node.vx;
        node.y += node.vy;
        
        // 边界约束
        node.x = Math.max(padding, Math.min(maxX, node.x));
        node.y = Math.max(padding, Math.min(maxY, node.y));
      }
    });
  }

  /**
   * 将力导向模拟结果应用到原始节点
   */
  private applyForceResults(): void {
    // 节点已经是引用传递，不需要额外操作
  }

  /**
   * 计算边路径
   * @param edges 连接列表
   */
  private routeEdges(edges: Edge[]): EdgePath[] {
    const nodeMap = new Map<string, ForceNode>();
    this.forceNodes.forEach(node => nodeMap.set(node.id, node));
    
    const edgePaths: EdgePath[] = [];
    
    edges.forEach(edge => {
      const sourceNode = nodeMap.get(edge.sourceId);
      const targetNode = nodeMap.get(edge.targetId);
      
      if (sourceNode && targetNode) {
        // 简单计算源点和目标点
        const sourcePoint = {
          x: sourceNode.x + sourceNode.width / 2,
          y: sourceNode.y + sourceNode.height / 2
        };
        
        const targetPoint = {
          x: targetNode.x + targetNode.width / 2,
          y: targetNode.y + targetNode.height / 2
        };
        
        // 获取所有节点作为可能的障碍物
        const obstacles = this.forceNodes
          .filter(n => n.id !== sourceNode.id && n.id !== targetNode.id)
          .map(n => ({
            x: n.x,
            y: n.y,
            width: n.width,
            height: n.height
          }));
        
        // 计算路径
        const path = this.pathCalculator.calculatePath(
          sourcePoint,
          targetPoint,
          obstacles,
          { routingAlgorithm: 'curved' }
        );
        
        edgePaths.push({
          id: edge.id,
          path
        });
      }
    });
    
    return edgePaths;
  }

  /**
   * 提取节点位置
   */
  private extractNodePositions(): NodePosition[] {
    return this.forceNodes.map(node => ({
      id: node.id,
      x: node.x,
      y: node.y
    }));
  }
} 