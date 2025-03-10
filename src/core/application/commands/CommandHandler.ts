/**
 * 命令接口
 * 所有命令都应实现此接口
 */
export interface ICommand {}

/**
 * 命令处理器接口
 * @typeParam T 命令类型
 */
export interface ICommandHandler<T extends ICommand> {
  /**
   * 执行命令
   * @param command 命令对象
   */
  execute(command: T): Promise<void>;
}

/**
 * 命令总线接口
 * 负责命令的分发和处理
 */
export interface ICommandBus {
  /**
   * 注册命令处理器
   * @param commandType 命令类型
   * @param handler 处理器
   */
  register<T extends ICommand>(commandType: new (...args: any[]) => T, handler: ICommandHandler<T>): void;
  
  /**
   * 执行命令
   * @param command 命令对象
   */
  execute<T extends ICommand>(command: T): Promise<void>;
}

/**
 * 命令总线实现
 */
export class CommandBus implements ICommandBus {
  private handlers: Map<string, ICommandHandler<any>> = new Map();

  /**
   * 注册命令处理器
   * @param commandType 命令类型
   * @param handler 处理器
   */
  public register<T extends ICommand>(commandType: new (...args: any[]) => T, handler: ICommandHandler<T>): void {
    const commandName = commandType.name;
    
    if (this.handlers.has(commandName)) {
      throw new Error(`Command handler for "${commandName}" already registered`);
    }
    
    this.handlers.set(commandName, handler);
  }

  /**
   * 执行命令
   * @param command 命令对象
   */
  public async execute<T extends ICommand>(command: T): Promise<void> {
    const commandName = command.constructor.name;
    const handler = this.handlers.get(commandName);
    
    if (!handler) {
      throw new Error(`No handler registered for command "${commandName}"`);
    }
    
    await handler.execute(command);
  }
} 