/**
 * 主题引擎实现
 * 负责管理不同的主题并按需应用
 */

import { NodeStyle, NodeState, EEANodeType } from './NodeStyle';
import { EventBus } from '../../../core/domain/events/EventBus';
import { ThemeChangedEvent } from '../events/ThemeEvents';

export interface Theme {
  name: string;
  description?: string;
  getNodeStyle(nodeType: EEANodeType, state: NodeState): NodeStyle;
  getEdgeStyle(edgeType: string, state: string): any; // 边样式将在后续实现
}

/**
 * 主题引擎
 * 管理系统中的主题并提供主题切换能力
 */
export class ThemeEngine {
  private themes: Map<string, Theme> = new Map();
  private activeTheme: string = 'default';

  constructor(private eventBus: EventBus) {}

  /**
   * 注册新主题
   * @param name 主题名称
   * @param theme 主题对象
   */
  public registerTheme(name: string, theme: Theme): void {
    this.themes.set(name, theme);
  }

  /**
   * 应用指定主题
   * @param name 主题名称
   */
  public applyTheme(name: string): void {
    if (!this.themes.has(name)) {
      throw new Error(`主题 ${name} 不存在`);
    }
    this.activeTheme = name;
    this.notifyThemeChanged();
  }

  /**
   * 获取当前活跃主题
   */
  public getActiveTheme(): string {
    return this.activeTheme;
  }

  /**
   * 获取节点样式
   * @param nodeType 节点类型
   * @param state 节点状态
   */
  public getNodeStyle(nodeType: EEANodeType, state: NodeState): NodeStyle {
    const theme = this.themes.get(this.activeTheme);
    if (!theme) {
      throw new Error(`当前主题 ${this.activeTheme} 不存在`);
    }
    return theme.getNodeStyle(nodeType, state);
  }

  /**
   * 通知主题变更事件
   */
  private notifyThemeChanged(): void {
    const theme = this.themes.get(this.activeTheme);
    if (theme) {
      this.eventBus.publish(new ThemeChangedEvent(this.activeTheme, theme));
    }
  }
} 