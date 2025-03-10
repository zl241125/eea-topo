/**
 * 边缘路径计算器
 * 负责计算节点间的连线路径
 */

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Path = Position[];

export interface PathOptions {
  routingAlgorithm: 'direct' | 'orthogonal' | 'curved' | 'astar';
  gridSize?: number;
  cornerRadius?: number;
  directionOut?: 'auto' | 'top' | 'right' | 'bottom' | 'left';
  directionIn?: 'auto' | 'top' | 'right' | 'bottom' | 'left';
  avoidObstacles?: boolean;
  segmentPadding?: number;
}

/**
 * 边缘路径计算器
 * 实现多种连线算法
 */
export class EdgePathCalculator {
  /**
   * 计算两点间的路径
   * @param source 起点
   * @param target 终点
   * @param obstacles 障碍物列表
   * @param options 路径选项
   */
  public calculatePath(
    source: Position,
    target: Position,
    obstacles: Rectangle[] = [],
    options: PathOptions = { routingAlgorithm: 'direct' }
  ): Path {
    switch (options.routingAlgorithm) {
      case 'direct':
        return this.directPath(source, target);
      case 'orthogonal':
        return this.orthogonalPath(source, target, obstacles);
      case 'curved':
        return this.curvedPath(source, target);
      case 'astar':
        return this.astarPath(source, target, obstacles, options.gridSize || 10);
      default:
        return this.directPath(source, target);
    }
  }

  /**
   * 计算直线路径
   * @param source 起点
   * @param target 终点
   */
  private directPath(source: Position, target: Position): Path {
    return [{ ...source }, { ...target }];
  }

  /**
   * 计算正交路径（直角连线）
   * @param source 起点
   * @param target 终点
   * @param obstacles 障碍物列表
   */
  private orthogonalPath(
    source: Position,
    target: Position, 
    obstacles: Rectangle[]
  ): Path {
    // 简单的正交路径实现，后续可优化
    const path: Path = [];
    path.push({ ...source });

    // 计算中间点 - 简单的"┐"形状路径
    const midX = source.x;
    const midY = target.y;
    
    path.push({ x: midX, y: midY });
    path.push({ ...target });

    return path;
  }

  /**
   * 计算曲线路径
   * @param source 起点
   * @param target 终点
   */
  private curvedPath(source: Position, target: Position): Path {
    // 生成贝塞尔曲线的控制点
    // 注意：实际渲染时需要支持曲线渲染
    const path: Path = [];
    path.push({ ...source });

    // 添加控制点（实际渲染需要支持贝塞尔曲线）
    const controlPoint1 = {
      x: source.x + (target.x - source.x) / 3,
      y: source.y
    };
    
    const controlPoint2 = {
      x: source.x + 2 * (target.x - source.x) / 3,
      y: target.y
    };

    // 为了简化，我们在路径中添加多个点来模拟曲线
    // 在实际渲染中，应该使用SVG路径或Canvas的贝塞尔曲线
    const steps = 10;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const pt = this.bezierPoint(source, controlPoint1, controlPoint2, target, t);
      path.push(pt);
    }

    path.push({ ...target });
    return path;
  }

  /**
   * 计算贝塞尔曲线上的点
   */
  private bezierPoint(
    p0: Position, 
    p1: Position, 
    p2: Position, 
    p3: Position, 
    t: number
  ): Position {
    const cx = 3 * (p1.x - p0.x);
    const cy = 3 * (p1.y - p0.y);
    const bx = 3 * (p2.x - p1.x) - cx;
    const by = 3 * (p2.y - p1.y) - cy;
    const ax = p3.x - p0.x - cx - bx;
    const ay = p3.y - p0.y - cy - by;
    
    const x = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0.x;
    const y = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y;
    
    return { x, y };
  }

  /**
   * 使用A*算法计算路径
   * @param source 起点
   * @param target 终点
   * @param obstacles 障碍物列表
   * @param gridSize 网格大小
   */
  private astarPath(
    source: Position,
    target: Position,
    obstacles: Rectangle[],
    gridSize: number
  ): Path {
    // A*算法实现
    // 1. 创建网格表示
    const grid = this.createGrid(source, target, obstacles, gridSize);
    
    // 2. 执行A*搜索
    const path = this.findPath(grid, source, target, gridSize);
    
    // 3. 优化路径 - 移除冗余点
    return this.smoothPath(path);
  }

  /**
   * 创建用于A*寻路的网格
   */
  private createGrid(
    source: Position,
    target: Position,
    obstacles: Rectangle[],
    gridSize: number
  ): boolean[][] {
    // 确定网格范围
    const minX = Math.min(source.x, target.x) - 100;
    const minY = Math.min(source.y, target.y) - 100;
    const maxX = Math.max(source.x, target.x) + 100;
    const maxY = Math.max(source.y, target.y) + 100;
    
    const cols = Math.ceil((maxX - minX) / gridSize);
    const rows = Math.ceil((maxY - minY) / gridSize);
    
    // 创建网格，初始值都为可通行
    const grid: boolean[][] = Array(rows).fill(0).map(() => Array(cols).fill(true));
    
    // 标记障碍物
    obstacles.forEach(obstacle => {
      // 扩展障碍物一点，确保路径不会太靠近
      const padding = gridSize;
      const left = Math.floor((obstacle.x - minX - padding) / gridSize);
      const top = Math.floor((obstacle.y - minY - padding) / gridSize);
      const right = Math.ceil((obstacle.x + obstacle.width - minX + padding) / gridSize);
      const bottom = Math.ceil((obstacle.y + obstacle.height - minY + padding) / gridSize);
      
      for (let row = Math.max(0, top); row < Math.min(rows, bottom); row++) {
        for (let col = Math.max(0, left); col < Math.min(cols, right); col++) {
          grid[row][col] = false; // 标记为不可通行
        }
      }
    });
    
    return grid;
  }

  /**
   * A*寻路算法实现
   */
  private findPath(
    grid: boolean[][],
    source: Position,
    target: Position,
    gridSize: number
  ): Path {
    // A*算法实现
    // 简化版实现，实际应用中应该有更高效的实现
    return [source, target]; // 占位，实际项目中应该实现完整A*算法
  }

  /**
   * 对路径进行平滑处理
   */
  private smoothPath(path: Path): Path {
    // 路径平滑算法
    // 移除冗余点，减少锯齿
    return path; // 占位，实际项目中应该实现路径平滑算法
  }
} 