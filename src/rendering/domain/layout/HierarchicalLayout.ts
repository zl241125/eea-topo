/**
 * 分层布局算法实现
 * 专为EEA架构设计，根据节点类型自动分配层级
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
 * 分层布局配置
 */
export interface HierarchicalLayoutConfig extends LayoutConfig {
  direction?: 'TB' | 'BT' | 'LR' | 'RL';  // 布局方向
  layerDistance?: number;                 // 层间距
  nodeDistance?: number;                  // 节点间距
  sortMethod?: 'topology' | 'directed';   // 排序方法
  improveRanking?: boolean;               // 是否优化等级分配
  improveHorizontalPosition?: boolean;    // 是否优化水平位置
  improveVerticalPosition?: boolean;      // 是否优化垂直位置
  minimizeCrossings?: boolean;            // 是否最小化交叉数
}

/**
 * 层级信息
 */
interface Layer {
  index: number;                // 层索引
  nodes: LayoutNode[];          // 层中的节点
  minRank: number;              // 最小等级
  maxRank: number;              // 最大等级
  y?: number;                   // 层 Y 坐标
  height?: number;              // 层高度
}

/**
 * 分层布局实现
 */
export class HierarchicalLayout implements LayoutStrategy {
  private running: boolean = false;
  private pathCalculator: EdgePathCalculator = new EdgePathCalculator();
  
  constructor(private config: HierarchicalLayoutConfig = {}) {
    // 设置默认配置
    this.config = {
      direction: 'TB',
      layerDistance: 100,
      nodeDistance: 50,
      sortMethod: 'topology',
      improveRanking: true,
      improveHorizontalPosition: true,
      improveVerticalPosition: true,
      minimizeCrossings: true,
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
    
    try {
      // 1. 节点分层 - 根据EEA架构特性分配层级
      const layers = this.assignLayers(nodes, edges);
      
      // 2. 层内排序 - 减少边交叉
      if (this.config.minimizeCrossings) {
        this.minimizeCrossings(layers, edges);
      }
      
      // 3. 确定x坐标 - 保持同层节点间距
      this.assignXCoordinates(layers);
      
      // 4. 确定y坐标 - 根据层级分配
      this.assignYCoordinates(layers);
      
      // 5. 边路径路由 - 处理跨层连线
      const edgePaths = this.routeEdges(edges, nodes);
      
      // 提取布局结果
      const nodePositions = this.extractNodePositions(nodes);
      
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
    this.running = false;
  }

  /**
   * 判断布局是否正在计算中
   * @returns 布局计算状态
   */
  public isRunning(): boolean {
    return this.running;
  }

  /**
   * 节点分层
   * 根据节点类型和连接关系确定节点所在层级
   * @param nodes 节点列表
   * @param edges 连接列表
   */
  private assignLayers(nodes: LayoutNode[], edges: Edge[]): Layer[] {
    // 按节点类型分配初始层级
    nodes.forEach(node => {
      switch (node.type) {
        case 'domainController':
          node.level = 0;
          break;
        case 'gateway':
          node.level = 1;
          break;
        case 'ecu':
          node.level = 2;
          break;
        case 'sensor':
          node.level = 3;
          break;
        case 'actuator':
          node.level = 3;
          break;
        case 'bus':
          node.level = 4;
          break;
        default:
          // 如果没有明确类型，根据连接关系推断
          node.level = this.inferNodeLevel(node, edges);
      }
    });

    // 优化层级分配
    if (this.config.improveRanking) {
      this.optimizeLayers(nodes, edges);
    }

    // 收集并分组层级
    const layerMap = new Map<number, LayoutNode[]>();
    nodes.forEach(node => {
      const level = node.level !== undefined ? node.level : 0;
      if (!layerMap.has(level)) {
        layerMap.set(level, []);
      }
      layerMap.get(level)!.push(node);
    });

    // 构建层级对象
    const layers: Layer[] = [];
    layerMap.forEach((nodesInLayer, level) => {
      layers.push({
        index: level,
        nodes: nodesInLayer,
        minRank: level,
        maxRank: level
      });
    });

    // 按层级排序
    layers.sort((a, b) => a.index - b.index);
    
    return layers;
  }

  /**
   * 根据连接关系推断节点层级
   * @param node 待推断层级的节点
   * @param edges 连接列表
   */
  private inferNodeLevel(node: LayoutNode, edges: Edge[]): number {
    // 简单实现：根据与其他节点的连接关系推断层级
    // 在实际实现中，应该更加复杂
    return 2; // 默认为中间层级
  }

  /**
   * 优化层级分配
   * @param nodes 节点列表
   * @param edges 连接列表
   */
  private optimizeLayers(nodes: LayoutNode[], edges: Edge[]): void {
    // 优化层级分配，减少跨层连线
    // 这里的实现会比较复杂，暂用简化逻辑
  }

  /**
   * 减少边交叉
   * @param layers 层级列表
   * @param edges 连接列表
   */
  private minimizeCrossings(layers: Layer[], edges: Edge[]): void {
    // 实现层内排序，减少边交叉
    for (let i = 0; i < layers.length; i++) {
      this.sortNodesInLayer(layers[i], edges);
    }
  }

  /**
   * 对层内节点进行排序，减少边交叉
   * @param layer 层级对象
   * @param edges 连接列表
   */
  private sortNodesInLayer(layer: Layer, edges: Edge[]): void {
    // 简单实现：根据节点的连接数量排序
    layer.nodes.sort((a, b) => {
      const aConnections = edges.filter(e => e.sourceId === a.id || e.targetId === a.id).length;
      const bConnections = edges.filter(e => e.sourceId === b.id || e.targetId === b.id).length;
      return bConnections - aConnections; // 连接多的排前面
    });
  }

  /**
   * 分配节点X坐标
   * @param layers 层级列表
   */
  private assignXCoordinates(layers: Layer[]): void {
    const nodeDistance = this.config.nodeDistance || 50;
    const padding = this.config.padding || 50;
    
    layers.forEach(layer => {
      let xPos = padding;
      
      layer.nodes.forEach(node => {
        node.x = xPos;
        xPos += node.width + nodeDistance;
      });
    });

    if (this.config.improveHorizontalPosition) {
      this.centerNodesInLayers(layers);
    }
  }

  /**
   * 水平居中各层节点
   * @param layers 层级列表
   */
  private centerNodesInLayers(layers: Layer[]): void {
    // 找出最宽的一层
    let maxWidth = 0;
    layers.forEach(layer => {
      let layerWidth = 0;
      layer.nodes.forEach(node => {
        layerWidth += node.width;
      });
      
      // 添加节点间距
      if (layer.nodes.length > 1) {
        layerWidth += (layer.nodes.length - 1) * (this.config.nodeDistance || 50);
      }
      
      maxWidth = Math.max(maxWidth, layerWidth);
    });
    
    // 居中各层
    const padding = this.config.padding || 50;
    layers.forEach(layer => {
      let layerWidth = 0;
      layer.nodes.forEach(node => {
        layerWidth += node.width;
      });
      
      // 添加节点间距
      if (layer.nodes.length > 1) {
        layerWidth += (layer.nodes.length - 1) * (this.config.nodeDistance || 50);
      }
      
      // 计算层的起始X坐标，使其居中
      const startX = padding + (maxWidth - layerWidth) / 2;
      
      // 重新分配节点X坐标
      let xPos = startX;
      layer.nodes.forEach(node => {
        node.x = xPos;
        xPos += node.width + (this.config.nodeDistance || 50);
      });
    });
  }

  /**
   * 分配节点Y坐标
   * @param layers 层级列表
   */
  private assignYCoordinates(layers: Layer[]): void {
    const layerDistance = this.config.layerDistance || 100;
    const padding = this.config.padding || 50;
    
    // 首先计算每层的高度（最高节点）
    layers.forEach(layer => {
      layer.height = Math.max(...layer.nodes.map(node => node.height));
    });
    
    // 根据层级和方向分配Y坐标
    let yPos = padding;
    
    if (this.config.direction === 'TB') {
      // 从上到下布局
      layers.forEach(layer => {
        layer.y = yPos;
        
        // 设置节点Y坐标
        layer.nodes.forEach(node => {
          node.y = yPos + (layer.height - node.height) / 2; // 垂直居中
        });
        
        yPos += layer.height + layerDistance;
      });
    } else if (this.config.direction === 'BT') {
      // 从下到上布局
      // 倒序处理层级
      for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i];
        layer.y = yPos;
        
        // 设置节点Y坐标
        layer.nodes.forEach(node => {
          node.y = yPos + (layer.height - node.height) / 2; // 垂直居中
        });
        
        yPos += layer.height + layerDistance;
      }
    } else {
      // 处理LR和RL方向留给实际项目扩展
    }
  }

  /**
   * 计算边路径
   * @param edges 连接列表
   * @param nodes 节点列表
   */
  private routeEdges(edges: Edge[], nodes: LayoutNode[]): EdgePath[] {
    const nodeMap = new Map<string, LayoutNode>();
    nodes.forEach(node => nodeMap.set(node.id, node));
    
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
        const obstacles = nodes
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
          { routingAlgorithm: 'orthogonal' }
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
   * @param nodes 节点列表
   */
  private extractNodePositions(nodes: LayoutNode[]): NodePosition[] {
    return nodes.map(node => ({
      id: node.id,
      x: node.x,
      y: node.y
    }));
  }
} 