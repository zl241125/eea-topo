/**
 * EEA拓扑图库 - 主入口
 * @packageDocumentation
 */

// 从各模块导出公共API
export * from './core/domain/models/EEATopology';
export * from './topology/domain/Node';
export * from './topology/domain/Edge';
export * from './rendering/domain/RenderEngine';
export * from './rendering/infrastructure/SVGRenderEngine';
export * from './core/domain/valueObjects/NodePosition';
export * from './core/domain/valueObjects/ViewBox';
export * from './core/domain/events/DomainEvent';
export * from './core/application/commands/CommandHandler';
export * from './core/application/queries/QueryHandler';

/**
 * ECU架构可视化渲染引擎主入口
 */

// 核心模块导出
export * from './core/domain/events/DomainEvent';
export * from './core/domain/events/EventBus';

// 渲染样式导出
export { 
  NodeStyle, 
  ShadowStyle, 
  IconStyle, 
  LabelStyle,
  NodeState,
  EEANodeType
} from './rendering/domain/styles/NodeStyle';
export { Theme, ThemeEngine } from './rendering/domain/styles/ThemeEngine';
export { DefaultTheme } from './rendering/domain/styles/DefaultTheme';

// 边缘连接导出
export {
  EdgePathCalculator,
  Position,
  Size,
  Rectangle,
  Path,
  PathOptions
} from './rendering/domain/edge/EdgePathCalculator';
export {
  ConnectionService,
  Protocol,
  Edge
} from './rendering/domain/edge/ConnectionService';

// 布局算法导出
export {
  LayoutStrategy,
  LayoutNode,
  LayoutResult,
  NodePosition,
  EdgePath,
  LayoutConfig,
  LayoutService
} from './rendering/domain/layout/LayoutStrategy';
export {
  HierarchicalLayout,
  HierarchicalLayoutConfig
} from './rendering/domain/layout/HierarchicalLayout';
export {
  ForceDirectedLayout,
  ForceLayoutConfig
} from './rendering/domain/layout/ForceDirectedLayout';

// 交互系统导出
export {
  InteractionManager,
  RenderEngine,
  HitTestResult,
  DragState,
  SelectionBoxState,
  InteractionEventType,
  EventHandler
} from './rendering/domain/interaction/InteractionManager';

export {
  DragDropManager,
  DragOptions
} from './rendering/domain/interaction/DragDropManager';

// 事件导出
export * from './rendering/domain/events/ThemeEvents';
export * from './rendering/domain/events/ConnectionEvents';
export * from './rendering/domain/events/NodeEvents'; 