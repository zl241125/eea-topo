/**
 * 默认主题实现
 * 提供系统默认的视觉风格
 */

import { Theme } from './ThemeEngine';
import { EEANodeType, NodeState, NodeStyle } from './NodeStyle';

export class DefaultTheme implements Theme {
  readonly name: string = 'default';
  readonly description: string = '系统默认主题';

  /**
   * 获取节点样式
   * @param nodeType 节点类型
   * @param state 节点状态
   */
  public getNodeStyle(nodeType: EEANodeType, state: NodeState): NodeStyle {
    // 基础样式
    const baseStyle: NodeStyle = {
      shape: 'rectangle',
      fill: '#FFFFFF',
      stroke: '#333333',
      strokeWidth: 1,
      width: 120,
      height: 60,
      borderRadius: 4,
      opacity: 1
    };

    // 根据节点类型调整基础样式
    const typeStyle = this.getNodeTypeStyle(nodeType, baseStyle);
    
    // 根据节点状态调整样式
    return this.applyNodeState(typeStyle, state);
  }

  /**
   * 获取边样式（占位，将在后续实现）
   */
  public getEdgeStyle(edgeType: string, state: string): any {
    return {
      stroke: '#333333',
      strokeWidth: 1
    };
  }

  /**
   * 根据节点类型获取样式
   * @param nodeType 节点类型
   * @param baseStyle 基础样式
   */
  private getNodeTypeStyle(nodeType: EEANodeType, baseStyle: NodeStyle): NodeStyle {
    switch (nodeType) {
      case EEANodeType.DOMAIN_CONTROLLER:
        return {
          ...baseStyle,
          fill: '#E8F5E9',
          stroke: '#2E7D32',
          strokeWidth: 2,
          width: 160,
          height: 80,
          icon: {
            fontFamily: 'Material Icons',
            content: 'developer_board',
            fontSize: 24,
            color: '#2E7D32',
            position: 'top'
          }
        };
      
      case EEANodeType.SENSOR:
        return {
          ...baseStyle,
          fill: '#E3F2FD',
          stroke: '#1565C0',
          shape: 'circle',
          width: 60,
          height: 60,
          icon: {
            fontFamily: 'Material Icons',
            content: 'sensors',
            fontSize: 20,
            color: '#1565C0'
          }
        };
      
      case EEANodeType.ACTUATOR:
        return {
          ...baseStyle,
          fill: '#FFF3E0',
          stroke: '#E65100',
          width: 100,
          height: 60,
          icon: {
            fontFamily: 'Material Icons',
            content: 'settings_input_component',
            fontSize: 20,
            color: '#E65100'
          }
        };
      
      case EEANodeType.GATEWAY:
        return {
          ...baseStyle,
          fill: '#F3E5F5',
          stroke: '#6A1B9A',
          shape: 'diamond',
          width: 80,
          height: 80,
          icon: {
            fontFamily: 'Material Icons',
            content: 'router',
            fontSize: 22,
            color: '#6A1B9A'
          }
        };
      
      case EEANodeType.ECU:
        return {
          ...baseStyle,
          fill: '#ECEFF1',
          stroke: '#455A64',
          icon: {
            fontFamily: 'Material Icons',
            content: 'memory',
            fontSize: 20,
            color: '#455A64'
          }
        };
      
      case EEANodeType.BUS:
        return {
          ...baseStyle,
          fill: '#FFFDE7',
          stroke: '#F57F17',
          strokeWidth: 2,
          height: 30,
          width: 200,
          icon: {
            fontFamily: 'Material Icons',
            content: 'compare_arrows',
            fontSize: 18,
            color: '#F57F17'
          }
        };
      
      default:
        return baseStyle;
    }
  }

  /**
   * 根据节点状态应用样式变化
   * @param baseStyle 基础样式
   * @param state 节点状态
   */
  private applyNodeState(baseStyle: NodeStyle, state: NodeState): NodeStyle {
    switch (state) {
      case NodeState.HOVER:
        return {
          ...baseStyle,
          strokeWidth: baseStyle.strokeWidth + 1,
          shadow: {
            color: 'rgba(0, 0, 0, 0.2)',
            offsetX: 0,
            offsetY: 2,
            blur: 4
          }
        };
      
      case NodeState.SELECTED:
        return {
          ...baseStyle,
          strokeWidth: baseStyle.strokeWidth + 2,
          stroke: '#1976D2',
          shadow: {
            color: 'rgba(25, 118, 210, 0.4)',
            offsetX: 0,
            offsetY: 3,
            blur: 5
          }
        };
      
      case NodeState.DISABLED:
        return {
          ...baseStyle,
          opacity: 0.5,
          stroke: '#9E9E9E'
        };
      
      case NodeState.ERROR:
        return {
          ...baseStyle,
          stroke: '#D32F2F',
          strokeWidth: baseStyle.strokeWidth + 1,
          shadow: {
            color: 'rgba(211, 47, 47, 0.3)',
            offsetX: 0,
            offsetY: 2,
            blur: 4
          }
        };
      
      case NodeState.ACTIVE:
        return {
          ...baseStyle,
          stroke: '#4CAF50',
          strokeWidth: baseStyle.strokeWidth + 1,
          shadow: {
            color: 'rgba(76, 175, 80, 0.3)',
            offsetX: 0,
            offsetY: 2,
            blur: 4
          }
        };
      
      default:
        return baseStyle;
    }
  }
} 