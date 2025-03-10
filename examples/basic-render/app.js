/**
 * ECU架构可视化渲染引擎示例应用
 */
(function() {
  // 全局变量
  let nodes = [];
  let edges = [];
  let selectedNodes = [];
  let connectMode = false;
  let connectSource = null;
  
  // 示例渲染引擎实现（实际项目中使用真实渲染引擎）
  class ExampleRenderEngine {
    constructor(container) {
      this.container = container;
      this.nodes = new Map();
      this.edges = new Map();
      
      // 创建SVG容器
      this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.svg.setAttribute('width', '100%');
      this.svg.setAttribute('height', '100%');
      this.container.appendChild(this.svg);
      
      // 创建图层
      this.edgesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      this.nodesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      this.svg.appendChild(this.edgesLayer);
      this.svg.appendChild(this.nodesLayer);
      
      // 初始化视图状态
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.updateTransform();
    }
    
    // 获取容器
    getContainer() {
      return this.container;
    }
    
    // 渲染节点
    renderNode(node) {
      const nodeElement = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeElement.setAttribute('data-id', node.id);
      nodeElement.setAttribute('transform', `translate(${node.x}, ${node.y})`);
      
      let shape;
      if (node.type === 'sensor' || node.type === 'actuator') {
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shape.setAttribute('cx', node.width / 2);
        shape.setAttribute('cy', node.height / 2);
        shape.setAttribute('r', Math.min(node.width, node.height) / 2);
      } else {
        shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shape.setAttribute('x', 0);
        shape.setAttribute('y', 0);
        shape.setAttribute('width', node.width);
        shape.setAttribute('height', node.height);
        shape.setAttribute('rx', 4);
      }
      
      shape.setAttribute('fill', this.getNodeFill(node));
      shape.setAttribute('stroke', this.getNodeStroke(node));
      shape.setAttribute('stroke-width', 2);
      
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', node.width / 2);
      label.setAttribute('y', node.height / 2);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', '#333');
      label.setAttribute('font-size', '12px');
      label.textContent = node.label || node.type;
      
      nodeElement.appendChild(shape);
      nodeElement.appendChild(label);
      this.nodesLayer.appendChild(nodeElement);
      
      this.nodes.set(node.id, {
        element: nodeElement,
        shape,
        label
      });
    }
    
    // 渲染边
    renderEdge(edge) {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('data-id', edge.id);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', this.getEdgeStroke(edge));
      path.setAttribute('stroke-width', 2);
      
      const d = this.calculateEdgePath(edge);
      path.setAttribute('d', d);
      
      this.edgesLayer.appendChild(path);
      this.edges.set(edge.id, {
        element: path
      });
    }
    
    // 更新节点位置
    updateNodePosition(nodeId, x, y) {
      const nodeData = this.nodes.get(nodeId);
      if (nodeData) {
        nodeData.element.setAttribute('transform', `translate(${x}, ${y})`);
      }
    }
    
    // 更新边路径
    updateEdgePath(edgeId) {
      const edgeData = this.edges.get(edgeId);
      if (edgeData) {
        const edge = edges.find(e => e.id === edgeId);
        if (edge) {
          const d = this.calculateEdgePath(edge);
          edgeData.element.setAttribute('d', d);
        }
      }
    }
    
    // 计算边路径
    calculateEdgePath(edge) {
      const sourceNode = nodes.find(n => n.id === edge.sourceId);
      const targetNode = nodes.find(n => n.id === edge.targetId);
      
      if (!sourceNode || !targetNode) {
        return '';
      }
      
      const sourceX = sourceNode.x + sourceNode.width / 2;
      const sourceY = sourceNode.y + sourceNode.height / 2;
      const targetX = targetNode.x + targetNode.width / 2;
      const targetY = targetNode.y + targetNode.height / 2;
      
      // 曲线路径
      const midX = (sourceX + targetX) / 2;
      const midY = (sourceY + targetY) / 2;
      const offsetX = (targetX - sourceX) * 0.2;
      const offsetY = (targetY - sourceY) * 0.2;
      
      return `M ${sourceX} ${sourceY} C ${sourceX + offsetX} ${sourceY + offsetY}, ${targetX - offsetX} ${targetY - offsetY}, ${targetX} ${targetY}`;
    }
    
    // 获取节点填充色
    getNodeFill(node) {
      switch (node.type) {
        case 'domainController': return '#E8F5E9';
        case 'sensor': return '#E3F2FD';
        case 'actuator': return '#FFF3E0';
        case 'gateway': return '#F3E5F5';
        case 'ecu': return '#ECEFF1';
        case 'bus': return '#FFFDE7';
        default: return '#FFFFFF';
      }
    }
    
    // 获取节点描边色
    getNodeStroke(node) {
      if (node.selected) {
        return '#1976D2';
      }
      switch (node.type) {
        case 'domainController': return '#2E7D32';
        case 'sensor': return '#1565C0';
        case 'actuator': return '#E65100';
        case 'gateway': return '#6A1B9A';
        case 'ecu': return '#455A64';
        case 'bus': return '#F57F17';
        default: return '#333333';
      }
    }
    
    // 获取边描边色
    getEdgeStroke(edge) {
      switch (edge.protocol) {
        case 'can': return '#E65100';
        case 'lin': return '#2E7D32';
        case 'flexray': return '#1565C0';
        case 'ethernet': return '#6A1B9A';
        default: return '#333333';
      }
    }
    
    // 更新节点状态
    updateNodeState(nodeId, state) {
      const nodeData = this.nodes.get(nodeId);
      if (nodeData) {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          if (state.selected !== undefined) {
            node.selected = state.selected;
          }
          if (state.hover !== undefined) {
            node.hover = state.hover;
          }
          nodeData.shape.setAttribute('stroke', this.getNodeStroke(node));
          if (node.hover) {
            nodeData.shape.setAttribute('stroke-width', 3);
          } else {
            nodeData.shape.setAttribute('stroke-width', 2);
          }
        }
      }
    }
    
    // 更新边状态
    updateEdgeState(edgeId, state) {
      const edgeData = this.edges.get(edgeId);
      if (edgeData) {
        const edge = edges.find(e => e.id === edgeId);
        if (edge) {
          if (state.selected !== undefined) {
            edge.selected = state.selected;
          }
          if (state.hover !== undefined) {
            edge.hover = state.hover;
          }
          edgeData.element.setAttribute('stroke', this.getEdgeStroke(edge));
          if (edge.selected || edge.hover) {
            edgeData.element.setAttribute('stroke-width', 3);
          } else {
            edgeData.element.setAttribute('stroke-width', 2);
          }
        }
      }
    }
    
    // 移动节点
    moveNode(nodeId, x, y) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        node.x = x;
        node.y = y;
        this.updateNodePosition(nodeId, x, y);
        
        // 更新相关连接
        edges.forEach(edge => {
          if (edge.sourceId === nodeId || edge.targetId === nodeId) {
            this.updateEdgePath(edge.id);
          }
        });
      }
    }
    
    // 移动多个节点
    moveNodes(nodeIds, dx, dy) {
      nodeIds.forEach(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          node.x += dx;
          node.y += dy;
          this.updateNodePosition(nodeId, node.x, node.y);
        }
      });
      
      // 更新相关连接
      edges.forEach(edge => {
        if (nodeIds.includes(edge.sourceId) || nodeIds.includes(edge.targetId)) {
          this.updateEdgePath(edge.id);
        }
      });
    }
    
    // 碰撞测试
    hitTest(x, y) {
      // 转换到SVG坐标系
      const point = this.svg.createSVGPoint();
      point.x = x;
      point.y = y;
      
      const transformedPoint = point.matrixTransform(this.svg.getScreenCTM().inverse());
      
      // 首先检查节点（逆序检查，因为后渲染的在顶部）
      const nodeElements = Array.from(this.nodesLayer.children).reverse();
      for (const element of nodeElements) {
        if (this.isPointInNode(transformedPoint.x, transformedPoint.y, element)) {
          return {
            type: 'node',
            id: element.getAttribute('data-id'),
            x: transformedPoint.x,
            y: transformedPoint.y
          };
        }
      }
      
      // 然后检查边
      const edgeElements = Array.from(this.edgesLayer.children);
      for (const element of edgeElements) {
        if (this.isPointNearEdge(transformedPoint.x, transformedPoint.y, element)) {
          return {
            type: 'edge',
            id: element.getAttribute('data-id'),
            x: transformedPoint.x,
            y: transformedPoint.y
          };
        }
      }
      
      // 最后返回画布
      return {
        type: 'canvas',
        id: 'canvas',
        x: transformedPoint.x,
        y: transformedPoint.y
      };
    }
    
    // 检查点是否在节点内
    isPointInNode(x, y, element) {
      const bbox = element.getBBox();
      const transform = element.getAttribute('transform');
      const translateMatch = /translate\(([^,]+),\s*([^)]+)\)/.exec(transform);
      
      if (translateMatch) {
        const translateX = parseFloat(translateMatch[1]);
        const translateY = parseFloat(translateMatch[2]);
        
        return x >= translateX && x <= translateX + bbox.width &&
               y >= translateY && y <= translateY + bbox.height;
      }
      
      return false;
    }
    
    // 检查点是否在边附近
    isPointNearEdge(x, y, element) {
      const threshold = 5;
      const bbox = element.getBBox();
      
      // 简化判断，实际应该计算到路径的距离
      return x >= bbox.x - threshold && x <= bbox.x + bbox.width + threshold &&
             y >= bbox.y - threshold && y <= bbox.y + bbox.height + threshold;
    }
    
    // 获取节点位置
    getNodePosition(nodeId) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        return { x: node.x, y: node.y };
      }
      return { x: 0, y: 0 };
    }
    
    // 清空画布
    clear() {
      this.nodesLayer.innerHTML = '';
      this.edgesLayer.innerHTML = '';
      this.nodes.clear();
      this.edges.clear();
    }
    
    // 更新变换
    updateTransform() {
      const transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
      this.nodesLayer.style.transform = transform;
      this.edgesLayer.style.transform = transform;
    }
    
    // 缩放视图
    zoom(factor, x, y) {
      const oldScale = this.scale;
      this.scale *= factor;
      this.scale = Math.max(0.1, Math.min(3, this.scale));
      
      // 调整平移以保持缩放中心点
      const scaleChange = this.scale / oldScale;
      this.translateX = x - (x - this.translateX) * scaleChange;
      this.translateY = y - (y - this.translateY) * scaleChange;
      
      this.updateTransform();
    }
    
    // 平移视图
    pan(dx, dy) {
      this.translateX += dx;
      this.translateY += dy;
      this.updateTransform();
    }
    
    // 重置视图
    resetView() {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.updateTransform();
    }
  }
  
  // 当页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas');
    const renderer = new ExampleRenderEngine(container);
    
    // 初始化事件总线和交互管理器
    const eventBus = {
      publish: function(event) {
        console.log('事件发布:', event);
      }
    };
    
    // 简化的交互管理器实现
    const interactionManager = {
      init: function() {
        // 监听添加节点按钮
        document.getElementById('add-node').addEventListener('click', () => {
          const type = document.getElementById('node-type').value;
          createNode(type);
        });
        
        // 监听清空画布按钮
        document.getElementById('clear-canvas').addEventListener('click', () => {
          clearCanvas();
        });
        
        // 监听连接节点按钮
        document.getElementById('connect-nodes').addEventListener('click', () => {
          toggleConnectMode();
        });
        
        // 监听删除选中按钮
        document.getElementById('delete-selected').addEventListener('click', () => {
          deleteSelected();
        });
        
        // 监听布局应用按钮
        document.getElementById('apply-layout').addEventListener('click', () => {
          applyLayout();
        });
        
        // 监听缩放按钮
        document.getElementById('zoom-in').addEventListener('click', () => {
          renderer.zoom(1.2, container.clientWidth / 2, container.clientHeight / 2);
        });
        
        document.getElementById('zoom-out').addEventListener('click', () => {
          renderer.zoom(0.8, container.clientWidth / 2, container.clientHeight / 2);
        });
        
        document.getElementById('reset-view').addEventListener('click', () => {
          renderer.resetView();
        });
        
        // 监听节点点击
        container.addEventListener('click', (event) => {
          const result = renderer.hitTest(event.clientX, event.clientY);
          
          if (result.type === 'node') {
            if (connectMode) {
              handleConnectionCreation(result.id);
            } else {
              selectNode(result.id, event.ctrlKey || event.metaKey);
            }
          } else if (result.type === 'canvas') {
            if (!event.ctrlKey && !event.metaKey) {
              clearSelection();
            }
          }
        });

        // 添加拖拽事件监听
        container.addEventListener('mousedown', (event) => {
          const result = renderer.hitTest(event.clientX, event.clientY);
          
          if (result && result.type === 'node') {
            const nodeId = result.id;
            const node = nodes.find(n => n.id === nodeId);
            
            if (node) {
              // 开始拖拽
              const dragInfo = {
                nodeId: nodeId,
                startX: event.clientX,
                startY: event.clientY,
                initialX: node.x,
                initialY: node.y,
                isDragging: true,
                isMultiSelection: selectedNodes.length > 1 && selectedNodes.includes(nodeId)
              };
              
              // 设置拖拽状态
              container.setAttribute('data-dragging', 'true');
              
              // 鼠标移动处理
              const handleMouseMove = (moveEvent) => {
                if (dragInfo.isDragging) {
                  const dx = moveEvent.clientX - dragInfo.startX;
                  const dy = moveEvent.clientY - dragInfo.startY;
                  
                  let newX = dragInfo.initialX + dx;
                  let newY = dragInfo.initialY + dy;
                  
                  // 获取当前拖拽配置
                  const gridSnapping = container.hasAttribute('data-grid-snapping');
                  const gridSize = parseInt(container.getAttribute('data-grid-size') || '10', 10);
                  
                  // 应用网格吸附
                  if (gridSnapping) {
                    // 计算原始位置和吸附后的位置
                    const originalX = newX;
                    const originalY = newY;
                    
                    // 应用网格吸附
                    newX = Math.round(newX / gridSize) * gridSize;
                    newY = Math.round(newY / gridSize) * gridSize;
                    
                    // 显示吸附指示器
                    showSnapIndicator(newX, newY);
                  }
                  
                  if (dragInfo.isMultiSelection) {
                    // 移动所有选中节点
                    renderer.moveNodes(selectedNodes, dx, dy);
                  } else {
                    // 移动单个节点
                    renderer.moveNode(nodeId, newX, newY);
                  }
                }
              };
              
              // 鼠标释放处理
              const handleMouseUp = () => {
                dragInfo.isDragging = false;
                container.removeAttribute('data-dragging');
                
                // 移除临时事件监听
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              // 添加临时事件监听
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }
          }
        });
      },
      
      // 添加拖拽配置方法
      configureDragDrop: function(options) {
        console.log('配置拖拽选项:', options);
        
        // 实现网格吸附功能
        const originalMoveNode = renderer.moveNode;
        renderer.moveNode = function(nodeId, x, y) {
          let newX = x;
          let newY = y;
          
          // 应用网格吸附
          if (options.gridSnapping && options.gridSize) {
            newX = Math.round(x / options.gridSize) * options.gridSize;
            newY = Math.round(y / options.gridSize) * options.gridSize;
          }
          
          originalMoveNode.call(this, nodeId, newX, newY);
        };
        
        // 实现多节点拖拽的网格吸附
        const originalMoveNodes = renderer.moveNodes;
        renderer.moveNodes = function(nodeIds, dx, dy) {
          if (options.gridSnapping && options.gridSize) {
            // 对位移进行吸附调整
            const snapDx = Math.round(dx / options.gridSize) * options.gridSize;
            const snapDy = Math.round(dy / options.gridSize) * options.gridSize;
            originalMoveNodes.call(this, nodeIds, snapDx, snapDy);
          } else {
            originalMoveNodes.call(this, nodeIds, dx, dy);
          }
        };
      }
    };
    
    // 创建节点
    function createNode(type) {
      const nodeId = 'node-' + Date.now();
      const node = {
        id: nodeId,
        type: type,
        x: 100 + Math.random() * 400,
        y: 100 + Math.random() * 300,
        width: type === 'bus' ? 200 : (type === 'domainController' ? 120 : 80),
        height: type === 'bus' ? 30 : 60,
        label: getNodeLabel(type),
        selected: false,
        hover: false
      };
      
      nodes.push(node);
      renderer.renderNode(node);
      updateNodeList();
    }
    
    // 获取节点标签
    function getNodeLabel(type) {
      switch (type) {
        case 'domainController': return '域控制器';
        case 'sensor': return '传感器';
        case 'actuator': return '执行器';
        case 'gateway': return '网关';
        case 'ecu': return 'ECU';
        case 'bus': return '总线';
        default: return type;
      }
    }
    
    // 创建连接
    function createConnection(sourceId, targetId) {
      const edgeId = `edge-${sourceId}-${targetId}`;
      const edge = {
        id: edgeId,
        sourceId: sourceId,
        targetId: targetId,
        protocol: 'can',
        selected: false,
        hover: false
      };
      
      edges.push(edge);
      renderer.renderEdge(edge);
    }
    
    // 选择节点
    function selectNode(nodeId, addToSelection) {
      if (!addToSelection) {
        clearSelection();
      }
      
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        node.selected = true;
        selectedNodes.push(nodeId);
        renderer.updateNodeState(nodeId, { selected: true });
      }
    }
    
    // 清除选择
    function clearSelection() {
      selectedNodes.forEach(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          node.selected = false;
          renderer.updateNodeState(nodeId, { selected: false });
        }
      });
      selectedNodes = [];
    }
    
    // 切换连接模式
    function toggleConnectMode() {
      connectMode = !connectMode;
      connectSource = null;
      
      const connectButton = document.getElementById('connect-nodes');
      if (connectMode) {
        connectButton.textContent = '取消连接';
        connectButton.style.backgroundColor = '#F44336';
      } else {
        connectButton.textContent = '连接节点';
        connectButton.style.backgroundColor = '#2196F3';
      }
    }
    
    // 处理连接创建
    function handleConnectionCreation(nodeId) {
      if (!connectSource) {
        connectSource = nodeId;
      } else {
        if (connectSource !== nodeId) {
          createConnection(connectSource, nodeId);
        }
        connectSource = null;
        toggleConnectMode();
      }
    }
    
    // 删除选中元素
    function deleteSelected() {
      if (selectedNodes.length === 0) {
        return;
      }
      
      // 删除选中的连接
      edges = edges.filter(edge => {
        const isSelected = selectedNodes.includes(edge.sourceId) || selectedNodes.includes(edge.targetId);
        if (isSelected) {
          const edgeElement = renderer.edges.get(edge.id)?.element;
          if (edgeElement) {
            edgeElement.remove();
          }
        }
        return !isSelected;
      });
      
      // 删除选中的节点
      nodes = nodes.filter(node => {
        const isSelected = selectedNodes.includes(node.id);
        if (isSelected) {
          const nodeElement = renderer.nodes.get(node.id)?.element;
          if (nodeElement) {
            nodeElement.remove();
          }
        }
        return !isSelected;
      });
      
      selectedNodes = [];
      updateNodeList();
    }
    
    // 应用布局
    function applyLayout() {
      const layoutType = document.getElementById('layout-type').value;
      
      if (layoutType === 'hierarchical') {
        applyHierarchicalLayout();
      } else if (layoutType === 'force') {
        applyForceLayout();
      }
    }
    
    // 应用分层布局
    function applyHierarchicalLayout() {
      // 简化的分层布局实现
      const layerMap = new Map();
      
      // 按类型分配层级
      nodes.forEach(node => {
        let layer = 0;
        switch (node.type) {
          case 'domainController': layer = 0; break;
          case 'gateway': layer = 1; break;
          case 'ecu': layer = 2; break;
          case 'sensor': case 'actuator': layer = 3; break;
          case 'bus': layer = 4; break;
        }
        
        if (!layerMap.has(layer)) {
          layerMap.set(layer, []);
        }
        layerMap.get(layer).push(node);
      });
      
      // 排序层级
      const layers = Array.from(layerMap.keys()).sort();
      
      // 设置节点位置
      const padding = 50;
      const nodeDistance = 30;
      const layerDistance = 100;
      
      layers.forEach((layer, layerIndex) => {
        const nodesInLayer = layerMap.get(layer);
        const layerY = padding + layerIndex * layerDistance;
        
        // 计算层宽度
        let totalWidth = 0;
        nodesInLayer.forEach(node => {
          totalWidth += node.width;
        });
        totalWidth += nodeDistance * (nodesInLayer.length - 1);
        
        // 居中布局
        let currentX = padding + (container.clientWidth - totalWidth - padding * 2) / 2;
        
        nodesInLayer.forEach(node => {
          renderer.moveNode(node.id, currentX, layerY);
          currentX += node.width + nodeDistance;
        });
      });
    }
    
    // 应用力导向布局
    function applyForceLayout() {
      // 简化的力导向布局实现
      // 实际项目中应该使用D3或自定义实现
      alert('力导向布局在此示例中尚未实现');
    }
    
    // 清空画布
    function clearCanvas() {
      nodes = [];
      edges = [];
      selectedNodes = [];
      renderer.clear();
      updateNodeList();
    }
    
    // 更新节点列表
    function updateNodeList() {
      const nodeList = document.getElementById('node-list');
      nodeList.innerHTML = '';
      
      nodes.forEach(node => {
        const nodeItem = document.createElement('div');
        nodeItem.className = 'node-item';
        nodeItem.textContent = `${node.label || node.type} (${node.id})`;
        nodeItem.setAttribute('data-id', node.id);
        
        nodeItem.addEventListener('click', () => {
          selectNode(node.id, false);
        });
        
        nodeList.appendChild(nodeItem);
      });
    }
    
    // 创建拖拽选项控制面板
    const createDragDropControls = () => {
      const controlsContainer = document.createElement('div');
      controlsContainer.className = 'drag-controls';
      controlsContainer.style.position = 'absolute';
      controlsContainer.style.top = '60px';
      controlsContainer.style.left = '10px';
      controlsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      controlsContainer.style.padding = '10px';
      controlsContainer.style.borderRadius = '4px';
      controlsContainer.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
      controlsContainer.style.zIndex = '100';
      
      // 网格吸附选项
      const gridSnappingContainer = document.createElement('div');
      
      const gridSnappingCheck = document.createElement('input');
      gridSnappingCheck.type = 'checkbox';
      gridSnappingCheck.id = 'grid-snapping';
      
      const gridSnappingLabel = document.createElement('label');
      gridSnappingLabel.htmlFor = 'grid-snapping';
      gridSnappingLabel.textContent = '启用网格吸附';
      
      gridSnappingContainer.appendChild(gridSnappingCheck);
      gridSnappingContainer.appendChild(gridSnappingLabel);
      
      // 网格大小选项
      const gridSizeContainer = document.createElement('div');
      gridSizeContainer.style.marginTop = '10px';
      
      const gridSizeLabel = document.createElement('label');
      gridSizeLabel.htmlFor = 'grid-size';
      gridSizeLabel.textContent = '网格大小: ';
      
      const gridSizeInput = document.createElement('input');
      gridSizeInput.type = 'range';
      gridSizeInput.id = 'grid-size';
      gridSizeInput.min = '5';
      gridSizeInput.max = '50';
      gridSizeInput.value = '10';
      gridSizeInput.style.width = '100px';
      
      const gridSizeValue = document.createElement('span');
      gridSizeValue.textContent = '10px';
      
      gridSizeInput.addEventListener('input', () => {
        gridSizeValue.textContent = `${gridSizeInput.value}px`;
        updateDragOptions();
      });
      
      gridSizeContainer.appendChild(gridSizeLabel);
      gridSizeContainer.appendChild(gridSizeInput);
      gridSizeContainer.appendChild(gridSizeValue);
      
      // 智能对齐选项
      const smartGuidesContainer = document.createElement('div');
      smartGuidesContainer.style.marginTop = '10px';
      
      const smartGuidesCheck = document.createElement('input');
      smartGuidesCheck.type = 'checkbox';
      smartGuidesCheck.id = 'smart-guides';
      smartGuidesCheck.checked = true;
      
      const smartGuidesLabel = document.createElement('label');
      smartGuidesLabel.htmlFor = 'smart-guides';
      smartGuidesLabel.textContent = '启用智能对齐';
      
      smartGuidesContainer.appendChild(smartGuidesCheck);
      smartGuidesContainer.appendChild(smartGuidesLabel);
      
      // 添加所有控制项
      controlsContainer.appendChild(gridSnappingContainer);
      controlsContainer.appendChild(gridSizeContainer);
      controlsContainer.appendChild(smartGuidesContainer);
      
      // 更新拖拽选项
      const updateDragOptions = () => {
        const options = {
          gridSnapping: gridSnappingCheck.checked,
          gridSize: parseInt(gridSizeInput.value, 10),
          smartGuides: smartGuidesCheck.checked,
          alignmentTolerance: 5
        };
        
        // 保存配置到DOM属性，方便拖拽时访问
        const canvasContainer = document.querySelector('.canvas-container');
        if (options.gridSnapping) {
          canvasContainer.setAttribute('data-grid-snapping', 'true');
          canvasContainer.setAttribute('data-grid-size', options.gridSize.toString());
        } else {
          canvasContainer.removeAttribute('data-grid-snapping');
        }
        
        if (options.smartGuides) {
          canvasContainer.setAttribute('data-smart-guides', 'true');
        } else {
          canvasContainer.removeAttribute('data-smart-guides');
        }
        
        // 调用交互管理器的配置方法
        interactionManager.configureDragDrop(options);
        
        // 更新画布显示网格
        if (options.gridSnapping) {
          canvasContainer.style.backgroundSize = `${options.gridSize}px ${options.gridSize}px`;
        } else {
          canvasContainer.style.backgroundSize = '20px 20px';
        }
      };
      
      // 监听控件变化
      gridSnappingCheck.addEventListener('change', updateDragOptions);
      smartGuidesCheck.addEventListener('change', updateDragOptions);
      
      // 初始化配置
      updateDragOptions();
      
      return controlsContainer;
    };

    // 添加吸附指示器函数
    function showSnapIndicator(x, y) {
      // 移除旧的指示器
      document.querySelectorAll('.snap-indicator').forEach(el => el.remove());
      
      // 创建新的指示器
      const indicator = document.createElement('div');
      indicator.className = 'snap-indicator';
      indicator.style.left = `${x}px`;
      indicator.style.top = `${y}px`;
      
      // 添加到容器并设置自动消失
      container.appendChild(indicator);
      setTimeout(() => {
        indicator.remove();
      }, 300);
    }

    // 初始化程序时添加控制面板
    const initApplication = () => {
      const canvasContainer = document.querySelector('.canvas-container');
      canvasContainer.appendChild(createDragDropControls());
      
      // 初始化应用
      interactionManager.init();
      
      // 创建一些初始节点
      createNode('domainController');
      createNode('sensor');
      createNode('actuator');
      createNode('gateway');
      
      // 创建初始连接
      setTimeout(() => {
        if (nodes.length >= 2) {
          createConnection(nodes[0].id, nodes[1].id);
        }
        if (nodes.length >= 4) {
          createConnection(nodes[0].id, nodes[2].id);
          createConnection(nodes[0].id, nodes[3].id);
        }
      }, 100);
    };
    
    // 调用初始化函数
    initApplication();
  });
})(); 