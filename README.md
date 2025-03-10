# ECU架构可视化渲染引擎

ECU架构可视化渲染引擎是一个专为汽车电子电气架构(EEA)设计的高性能可视化组件库，提供丰富的节点渲染、连接路径计算、布局算法和交互功能。

## 项目概述

本项目旨在提供一个完整的解决方案，用于可视化展示和编辑汽车ECU网络拓扑结构。该引擎基于领域驱动设计，实现了一系列核心功能：

- 丰富的节点渲染与样式系统
- 高效的边缘连接与路径算法
- 专为EEA设计的布局算法
- 完整的用户交互系统

## 核心特性

### 节点渲染与样式系统

- 支持多种ECU节点类型的视觉表现
- 可配置的主题引擎，支持主题切换
- 完整的样式继承与覆盖机制
- 节点状态与样式映射关系

### 边缘连接与路径算法

- 支持直线、折线、曲线三种连接样式
- 实现A*算法避障连线
- 优化的节点间路径计算
- 灵活的连线样式配置

### 布局算法实现

- 专为EEA架构设计的分层布局
- 基于物理模型的力导向布局
- 优化的层内节点排列
- 跨层连线处理策略

### 交互系统实现

- 完整的事件系统架构
- 单选/多选节点功能
- 拖拽与编辑交互
- 键盘辅助操作

## 开始使用

### 安装

```bash
npm install eea-renderer
```

### 基本使用

```javascript
import { 
  ThemeEngine, 
  DefaultTheme, 
  ConnectionService,
  EdgePathCalculator,
  ForceDirectedLayout
} from 'eea-renderer';

// 初始化主题引擎
const eventBus = new EventBus();
const themeEngine = new ThemeEngine(eventBus);
themeEngine.registerTheme('default', new DefaultTheme());

// 创建连接服务
const pathCalculator = new EdgePathCalculator();
const connectionService = new ConnectionService(pathCalculator, eventBus);

// 使用力导向布局
const layoutConfig = {
  width: 800,
  height: 600,
  repulsionStrength: -1000,
  linkDistance: 100
};
const forceLayout = new ForceDirectedLayout(layoutConfig);
```

## 示例

本项目包含多个示例，演示引擎的核心功能：

1. 基础渲染示例 - 展示节点渲染和样式
2. 布局算法示例 - 展示分层和力导向布局算法
3. 交互功能示例 - 展示用户交互系统

运行示例：

```bash
npm run build
npm run serve
```

然后在浏览器中访问 `http://localhost:8080/examples/`

## 架构设计

该项目基于领域驱动设计，遵循清晰的分层架构：

- **领域层**：包含核心业务逻辑和领域模型
- **应用层**：协调领域对象和服务
- **基础设施层**：提供技术支持，如渲染和事件处理

## 开发计划

该项目按以下阶段开发：

1. **基础框架搭建**：实现领域模型、事件系统和基础渲染
2. **核心功能开发**：实现节点渲染、路径算法、布局算法和交互系统
3. **高级功能扩展**：实现分组、导航、历史记录和性能优化
4. **集成与部署**：完成测试、文档和部署流程

## 贡献指南

欢迎贡献代码、报告问题或提供改进建议。请遵循以下步骤：

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT

## 联系方式

如有任何问题或建议，请通过Issue系统联系我们。 