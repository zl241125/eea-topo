/**
 * 查询接口
 * @typeParam R 查询结果类型
 */
export interface IQuery<R> {
  /**
   * 查询唯一标识符
   */
  readonly queryId: string;
}

/**
 * 查询处理器接口
 * @typeParam Q 查询类型
 * @typeParam R 查询结果类型
 */
export interface IQueryHandler<Q extends IQuery<R>, R> {
  /**
   * 执行查询
   * @param query 查询对象
   */
  execute(query: Q): Promise<R>;
}

/**
 * 查询总线接口
 */
export interface IQueryBus {
  /**
   * 注册查询处理器
   * @param queryType 查询类型
   * @param handler 处理器
   */
  register<Q extends IQuery<R>, R>(
    queryType: new (...args: any[]) => Q,
    handler: IQueryHandler<Q, R>
  ): void;
  
  /**
   * 执行查询
   * @param query 查询对象
   */
  execute<Q extends IQuery<R>, R>(query: Q): Promise<R>;
}

/**
 * 查询总线实现
 */
export class QueryBus implements IQueryBus {
  private handlers: Map<string, IQueryHandler<any, any>> = new Map();

  /**
   * 注册查询处理器
   * @param queryType 查询类型
   * @param handler 处理器
   */
  public register<Q extends IQuery<R>, R>(
    queryType: new (...args: any[]) => Q,
    handler: IQueryHandler<Q, R>
  ): void {
    const queryName = queryType.name;
    
    if (this.handlers.has(queryName)) {
      throw new Error(`Query handler for "${queryName}" already registered`);
    }
    
    this.handlers.set(queryName, handler);
  }

  /**
   * 执行查询
   * @param query 查询对象
   */
  public async execute<Q extends IQuery<R>, R>(query: Q): Promise<R> {
    const queryName = query.constructor.name;
    const handler = this.handlers.get(queryName) as IQueryHandler<Q, R>;
    
    if (!handler) {
      throw new Error(`No handler registered for query "${queryName}"`);
    }
    
    return await handler.execute(query);
  }
} 