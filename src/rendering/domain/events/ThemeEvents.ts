/**
 * 主题相关事件定义
 */
import { DomainEvent } from '../../../core/domain/events/DomainEvent';
import { Theme } from '../styles/ThemeEngine';

/**
 * 主题变更事件
 * 当系统切换主题时触发
 */
export class ThemeChangedEvent extends DomainEvent {
  static readonly TYPE: string = 'theme.changed';

  constructor(
    public readonly themeName: string,
    public readonly theme: Theme
  ) {
    super(ThemeChangedEvent.TYPE);
  }
} 