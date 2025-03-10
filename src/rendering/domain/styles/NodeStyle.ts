/**
 * 节点样式定义
 * 包含节点的外观相关属性，如形状、颜色、大小等
 */

export interface ShadowStyle {
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
}

export interface IconStyle {
  url?: string;
  fontFamily?: string;
  content?: string;
  fontSize?: number;
  color?: string;
  position?: 'center' | 'top' | 'left' | 'right' | 'bottom';
}

export interface LabelStyle {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  position: 'center' | 'top' | 'bottom' | 'left' | 'right';
  padding: number;
}

export interface NodeStyle {
  shape: 'rectangle' | 'circle' | 'diamond' | 'custom';
  fill: string;
  stroke: string;
  strokeWidth: number;
  width: number;
  height: number;
  borderRadius?: number;
  shadow?: ShadowStyle;
  icon?: IconStyle;
  label?: LabelStyle;
  opacity?: number;
  zIndex?: number;
}

/**
 * 节点状态枚举
 * 表示节点的各种交互状态
 */
export enum NodeState {
  DEFAULT = 'default',
  HOVER = 'hover',
  SELECTED = 'selected',
  DISABLED = 'disabled',
  ERROR = 'error',
  ACTIVE = 'active'
}

/**
 * ECU节点类型枚举
 * 区分不同类型的ECU节点
 */
export enum EEANodeType {
  DOMAIN_CONTROLLER = 'domainController',
  SENSOR = 'sensor',
  ACTUATOR = 'actuator',
  GATEWAY = 'gateway',
  ECU = 'ecu',
  BUS = 'bus'
} 