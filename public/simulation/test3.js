var svg, g1, links, places, transitions, all_tokens;
var transition_id = []; var place_id = []; var time = 0;//记录宏库所折叠次数
var place_json = []; var transition_json = []; var connections = []; var temp_s = []; var temp_t = [];
var token_json = [];
var group = []
var currentState = [];
var temp_transitions = [];//可激发便签id
var temp_transition = []; //所有自动激发的变迁
var position_json = []; var distance_row = 150; var distance_col = 100;
var colors;
var Place_r = 35;
var tk_r = 20;

var trans_w = 12;
var trans_h = 50;
var width = 100000;
var height = 100000;
var initialTranslateX = width / 2;  // 2500
var initialTranslateY = height / 2; // 1500
var translate = `translate(${initialTranslateX}, ${initialTranslateY}) scale(1)`;
var token_v = 600;
var delay_time = 1;
var marksize = 40;
var simulation;
var simulationIsEnable = true;
var allplace_color = ["raw", "robot", "robot+raw", "robot+processed_D_task1", "robot+processed_D_task2", "control", "port1_raw", "port2_raw", "port3_raw", "port4_raw", "processed_D", "port1_processed_1", "port2_processed_1", "port1_processed_2", "port2_processed_2", "port1_processed_3", "port2_processed_3", "port1_processed_4", "port2_processed_4", "port1_processed_A", "port2_processed_A", "port1_processed_B", "port2_processed_B", "port1_processed_C", "port2_processed_C", "port1_processed_D", "port2_processed_D", "port1_processed_E", "port2_processed_E", "port3_processed_D", "port4_processed_D", "port1_processed_task1", "port2_processed_task1", "port1_processed_task2", "port2_processed_task2"];
var macro_place = [];
var group_place = [];
var group_trans = [];
var subnet;
var lastClickedElement; // 用于存储上一个点击的元素状态
var ws;




// 1. 先读取位置 (position)
//$.getJSON("position.json", function (data) {
$.getJSON("position.json?t=" + new Date().getTime(), function (data) {
  position_json = data;
  console.log('position_json loaded');

  // 2. 再读取变迁 (trans)
  /*$.getJSON("trans.json", function (data) {
    for (var key in data) {
      transition_id.push(key);
      var temp = data[key];
      temp["id"] = key;
      transition_json.push(temp);
    }
    console.log('transition_json loaded');*/


    // 2. 再读取变迁 (trans)
  $.getJSON("trans.json", function (data) {
    for (var key in data) {
      transition_id.push(key);
      var temp = data[key];
      temp["id"] = key;

      // ==========================================
      // 【核心修复】：将普通 Petri 网的数组，转换为底层引擎期望的有色对象格式
      if (Array.isArray(temp.pre_arcs)) {
        var new_pre = {};
        // 赋予一个默认的托肯颜色 "raw"，让底层的颜色匹配逻辑能顺利跑通
        temp.pre_arcs.forEach(function(p) { new_pre[p] = ["raw"]; }); 
        temp.pre_arcs = new_pre;
      }
      
      if (Array.isArray(temp.post_arcs)) {
        var new_post = {};
        temp.post_arcs.forEach(function(p) { new_post[p] = ["raw"]; });
        temp.post_arcs = new_post;
      }
      // ==========================================

      transition_json.push(temp);
    }
    console.log('transition_json loaded');

    // ... 下面读取 place.json 的代码保持完全不变 ...

    // 3. 再读取库所 (place) —— 必须在 Token 之前！
    $.getJSON("place.json", function (data) {
      for (var key in data) {
        place_id.push(key);
        var temp1 = data[key];
        temp1["id"] = key;
        var pre_arcs = temp1.pre_arcs || []; // 防止 undefined 报错
        var post_arcs = temp1.post_arcs || [];
        post_arcs.forEach(function (d) {
          connections.push({ "source": key, "target": d });
        });
        pre_arcs.forEach(function (d) {
          connections.push({ "source": d, "target": key });
        });
        place_json.push(temp1);
      }
      console.log('place_json loaded');

      // 4. 最后读取 Token —— 此时 place_json 才有数据
      $.getJSON("token.json", function (data) {
        place_json.forEach(function (d) {
          d.token = [];
        });
        if (data && data["original_state"]) {
          for (var key in data["original_state"]) {
            var targetID = data["original_state"][key].inplace;
            var token_place = place_json.find(function (d) { return d.id == targetID; });
            
            if (token_place) {
              token_place.token.push({ [data["original_state"][key].token_attribute]: 1 });
              token_json.push({ 
                "r": 7, 
                "tk_color": data["original_state"][key].token_attribute.slice(0, -1), 
                "mark": data["original_state"][key].token_attribute.slice(-1), 
                "inplace": targetID 
              });
            } else {
              console.warn("警告: Token 对应的库所ID不存在: " + targetID);
            }
          }
        }
        console.log('token_json loaded');

        // 5. 所有数据准备完毕，启动主程序
        main(); 
      });
    });
  });
});

//读取子网信息/宏库所
// $.getJSON("colored_pn.json", function (data) {
//   macro_place = Object.keys(data[1]) //宏库所名称
//   subnet = Object.values(data[1])
//   console.log('macro_place', macro_place);
//   console.log('subnet', subnet);
// });
// console.log('macro_place', macro_place);

//setTimeout(function () {
  // alert("iiii");
 // main();
//}, 500); //500为等待时间
//console.log("place_id", place_id)
var svg, g1, transitions, places, links, connections; // 确保这些是全局的

function main() {
  colors = d3.scaleOrdinal()//所有可能出现的颜色
    .domain(allplace_color)
    .range(d3.schemeCategory10);
  //console.log('place_json', place_json)
  simulationIsEnable = false;


 
  
  

  //applySavedPositions();

  nodes = place_json.concat(transition_json);
  console.log('nodes', nodes);

  // 【新增】：调用 Dagre 进行智能排版
  //applyDagreLayout();

  applyIncrementalLayout();

  drag = d3.drag().on("start", started).on("end", ended).on("drag", dragged);//拖拽开始，结束，持续拖拽
  createSVG();//创建矢量图
  createLayout();//创建演化过程
  ticked();
  start(svg, transitions, links, connections);
  update(svg, g1);
  creatLegend(colors)
  //freezeNode(position_json)
  //console.log(d3.selectAll("rect").filter(function (d) { return d.id == 't22' }).attr("x"))
  //WebSocketTest();
}

function applyDagreLayout() {
  // 【新增】防呆检查：如果没有引入库，直接弹出提醒
  if (typeof dagre === "undefined") {
    alert("找不到 Dagre 算法库！请检查 HTML 中是否引入了 dagre.min.js");
    return;
  }

  var g = new dagre.graphlib.Graph();
  
  g.setGraph({
    rankdir: "TB", // 【关键修改】改成从上到下的树状排版
    nodesep: 60,   
    ranksep: 100,  
    marginx: 0,    
    marginy: 0
  });
  
  /*g.setGraph({
    rankdir: "LR", 
    nodesep: 80,   // 上下库所之间的间距（如果觉得挤可以改大）
    ranksep: 200,  // 左右连线的长度（变迁和库所的距离）
    marginx: 0,    // 【修改】因为 g1 画布自带居中偏移，这里直接从 0 开始算坐标即可
    marginy: 0
  });*/
  g.setDefaultEdgeLabel(function() { return {}; });

  // 记录所有有效的节点 ID，防止后面连线找不到节点报错
  var validNodeIds = new Set(nodes.map(n => n.id));

  // 载入节点尺寸
  nodes.forEach(function(d) {
    var isPlace = place_id.includes(d.id); // 检查是不是库所
    var nodeWidth = isPlace ? Place_r * 2 : trans_w;
    var nodeHeight = isPlace ? Place_r * 2 : trans_h;
    
    g.setNode(d.id, { width: nodeWidth, height: nodeHeight });
  });

  // 载入连线
  connections.forEach(function(link) {
    var sourceId = typeof link.source === "object" ? link.source.id : link.source;
    var targetId = typeof link.target === "object" ? link.target.id : link.target;
    
    // 【新增】安全检查：只给真实存在的节点连线，防止死循环或报错
    if (validNodeIds.has(sourceId) && validNodeIds.has(targetId)) {
      g.setEdge(sourceId, targetId);
    }
  });

  // 开始计算
  dagre.layout(g);

  // 赋值给 D3
  nodes.forEach(function(d) {
    var dagreNode = g.node(d.id);
    if (dagreNode) {
      d.x = dagreNode.x;
      d.y = dagreNode.y;
      d.fx = d.x; // 彻底锁死
      d.fy = d.y;
    }
  });
  
  console.log("Dagre 排版完成！快看看图出来了没！");
}


/*function applySavedPositions() {
  if (!position_json || !position_json.places || !position_json.transitions) return;

  var placePosMap = {};
  position_json.places.forEach(function(p) { placePosMap[p.id] = p; });
  place_json.forEach(function(d) {
    if (placePosMap[d.id]) {
      d.x = placePosMap[d.id].cx;  
      d.y = placePosMap[d.id].cy;  
      d.fx = d.x; // 彻底锁死坐标                 
      d.fy = d.y;
    }
  });

  

  var transPosMap = {};
  position_json.transitions.forEach(function(t) { transPosMap[t.id] = t; });
  transition_json.forEach(function(d) {
    if (transPosMap[d.id]) {
      d.x = transPosMap[d.id].x || transPosMap[d.id].cx; // 兼容你的不同命名
      d.y = transPosMap[d.id].y || transPosMap[d.id].cy;
      d.fx = d.x; // 彻底锁死坐标
      d.fy = d.y;
    }
  });
}*/

function applyIncrementalLayout() {
  // 1. 获取已经保存过的位置信息
  var savedPlaces = {};
  var savedTrans = {};
  if (position_json && position_json.places) {
    position_json.places.forEach(p => savedPlaces[p.id] = p);
  }
  if (position_json && position_json.transitions) {
    position_json.transitions.forEach(t => savedTrans[t.id] = t);
  }

  // 2. 统计哪些是“新来的”
  var newNodes = [];
  nodes.forEach(function(d) {
    var isPlace = place_id.includes(d.id);
    var savedData = isPlace ? savedPlaces[d.id] : savedTrans[d.id];

    if (savedData) {
      // 【老节点】：直接锁定在原来的位置，雷打不动
      d.x = isPlace ? savedData.cx : savedData.x;
      d.y = isPlace ? savedData.cy : savedData.y;
      d.fx = d.x;
      d.fy = d.y;
    } else {
      // 【新节点】：暂时标记出来，准备统一发配
      newNodes.push(d);
    }
  });

  // 3. 对新节点进行“发牌式”网格排版，放在你原有图表的右边
  // 假设你原来的图表大概占据了 0-2000 的坐标范围
  var startX = 0; // 这里的数值可以根据你老图的边界来定
  var startY = 6000;
  var nodesPerRow = 10;
  var spacing = 500;

  newNodes.forEach(function(d, i) {
    var col = i % nodesPerRow;
    var row = Math.floor(i / nodesPerRow);
    
    d.x = startX + (col * spacing);
    d.y = startY + (row * spacing);
    d.fx = d.x; 
    d.fy = d.y;
  });

  console.log("增量布局完成：保留了老节点，整理了 " + newNodes.length + " 个新节点。");
}


function createSVG() {
  console.log('调用createSVG')

  svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
  g1 = svg.append("g")
    .attr("transform", translate);

  //monitor_selection()//监听框选事件及对框选元素操作
  //creatLegend(colors)

  var zoom = d3.zoom()
    .scaleExtent([0.1, 10]) //设置缩放比例
    .on("zoom", zoomed);
  svg.call(zoom);
  function zoomed() {
    transformed = d3.event.transform
    //console.log(transformed.k)
    g1.attr("transform", transformed);
    // 调用函数获取<g>组中所有元素改变后的位置
    //getGroupElementsPositions(svg.select("g"), transformed);
  }
  //创建箭头
  defs = svg.append('defs')
  createdefs(defs);
  function createdefs(defs) {
    arrowMarker = defs.append("marker") //这个表示指的是箭头
      .attr("id", "arrow") //标识的id号
      .attr("markerUnits", "strokeWidth") //	标识大小的基准，有两个值：strokeWidth（线的宽度）和userSpaceOnUse（图形最前端的大小）
      .attr("markerWidth", "10") //标识的大小  设置箭头的大小
      .attr("markerHeight", "10") //标识的大小
      .attr("viewBox", "0 0 12 12") //坐标系的区域
      .attr("refX", "6") //在 viewBox 内的基准点，绘制时此点在直线端点上（要注意大小写）
      .attr("refY", "5")
      .attr("orient", "auto"); //绘制方向，可设定为：auto（自动确认方向）和 角度值

    //var arrow_path = "M2,2 L10,5 L2,8 L6,5 L2,2"; //定义箭头形状
    var arrow_path = "M0,0 L10,5 L0,10 Z"; //定义箭头形状
    arrowMarker.append("path")
      .attr("d", arrow_path)
      .attr("fill", "black");
  }

}


function ticked() {
  console.log('调用ticked')
  var remo = svg.selectAll("circle").filter(function (d, i) {
    return d3.select(this).attr("class") == "node"
  });//选中所有托肯 
  var temp = svg.selectAll("text").filter(function (d, i) {
    return d3.select(this).attr("class") == "text1"
  });//选中所有托肯 
  // console.log(remo);
  // console.log(temp)
  var nodesNum = 0;
  var token = [];

  for (var i = 0; i < connections.length; i++) { //判断end是不是变迁，有没有激发的能力
    for (var j = 0; j < transition_json.length; j++) {
      if (connections[i].target == transition_json[j]) {
        connections[i].isEnabled_transition = true;
        break;
      }
    }
    if (connections[i].isEnabled_transition != true)
      connections[i].isEnabled_transition = false;
  }
  //console.log(links)
  links.attr("x1", function (d) { return d.source.x; })
    .attr("y1", function (d) { return d.source.y; })
    .attr("x2", function (d, i) {
      //console.log('d.target.x',d.target.x)
      //console.log('d.source.x',d.source.x)
      //console.log('isEnabled_transition',d.isEnabled_transition)
      var x2Value;
      if (d.target.x == d.source.x) {
        return d.target.x;
      }
      else {
        var sita = Math.atan((d.target.y - d.source.y) / (d.target.x - d.source.x))
        //console.log('x2sita',sita)
        if (d.target.x > d.source.x) {
          if (d.isEnabled_transition == false)
            x2Value = d.target.x - 30 * Math.cos(sita)
          //console.log('wrongx2Value',x2Value)}
          else if (d.isEnabled_transition == true && (sita > Math.atan(2) || sita < Math.atan(-2)))
            x2Value = d.target.x - 30 * Math.cos(sita)
          else
            x2Value = d.target.x - 14
        }
        else {
          if (d.isEnabled_transition == true && (sita > Math.atan(2) || sita < Math.atan(-2)))
            x2Value = d.target.x + 30 * Math.cos(sita)
          else if (d.isEnabled_transition == false)
            x2Value = d.target.x + 30 * Math.cos(sita)
          else
            x2Value = d.target.x + 14
        }
        //console.log('x2Value',x2Value)
        return x2Value
      }

    })
    .attr("y2", function (d, i) {
      //console.log('y2')
      var y2Value;
      if (d.target.x == d.source.x) {
        return d.target.y;
      }
      else {
        var sita = Math.atan((d.target.y - d.source.y) / (d.target.x - d.source.x) + 0.1)
        //console.log('y2sita',sita)
        if (d.target.x > d.source.x) {
          if (d.isEnabled_transition == true && sita > Math.atan(2))
            y2Value = d.target.y - 30;
          else if (d.isEnabled_transition == true && sita < Math.atan(-2))
            y2Value = d.target.y + 30;
          else
            y2Value = d.target.y - 30 * Math.sin(sita)
        }
        else {
          if (d.isEnabled_transition == true && sita > Math.atan(2))
            y2Value = d.target.y + 30;
          else if (d.isEnabled_transition == true && sita < Math.atan(-2))
            y2Value = d.target.y - 30;
          else
            y2Value = d.target.y + 30 * Math.sin(sita)
        }
        //console.log('y2Value',y2Value)
        return y2Value

      }

    })
  // .attr("x2", function (d) { return d.target.x; })
  // .attr("y2", function (d) { return d.target.y; });

  places.attr("cx", function (d) { return d.x })
    .attr("cy", function (d) { return d.y })

  places.each(function (d, i) {//为库所托肯确定位置
    // console.log(d3.select(this).property("token_color"))
    nodesNum = d3.sum(d3.select(this).property("token_color_num"))
    // console.log(nodesNum)
    if (nodesNum > 0) {
      if (nodesNum == 1) {
        for (i = 0; i < d3.select(this).property("token_color_num").length; i++) {
          if (d3.select(this).property("token_color_num")[i] != 0) {
            token.push({
              cx: Number(d3.select(this).attr("cx")), cy: Number(d3.select(this).attr("cy")),
              r: tk_r, tk_color: d3.select(this).property("token_color")[i], mark: d3.select(this).property("token_color_mark")[i]
            })
            // console.log('token',token)
          }
        }
      }
      if (nodesNum > 1) {
        var pp = 0;
        for (m = 0; m < d3.select(this).property("token_color").length; m++) {
          var num = d3.select(this).property("token_color_num")[m]
          if (num > 0) {
            for (n = 0; n < num; n++) {
              pp++;
              var cx1 = Number(d3.select(this).attr("cx")) + 5 * Math.cos(pp * 2 * Math.PI / nodesNum)//
              var cy1 = Number(d3.select(this).attr("cy")) + 5 * Math.sin(pp * 2 * Math.PI / nodesNum)
              token.push({
                cx: cx1, cy: cy1, r: tk_r, tk_color: d3.select(this).property("token_color")[m], mark: d3.select(this).property("token_color_mark")[i]
              })
            }
          }
        }
      }
    }
  });
  // console.log("token",token)

  remo.data(token) //重新绑定元素，更改位置
    .attr("class", "node")
    .attr("cx", function (d) { return d.cx; })
    .attr("cy", function (d) { return d.cy; })
    .attr("r", function (d) { return d.r; })
    .attr("fill", function (d, i) { return colors(d.tk_color) })
    .attr("id", function (d) { return d.token_color + d.mark })
  temp.data(token) //重新绑定元素，更改位置
    .attr("class", "text1")
    .attr("x", function (d) { return d.cx; })
    .attr("y", function (d) { return d.cy + 28; })
    //.attr("fill", function(d, i){return colors(d.tk_color)})
    .style("font-size", "150%");

  transitions.attr("x", function (d, i) { return d.x - 6 }) //变迁的位置
    .attr("y", function (d, i) { return d.y - 25 });

  txt.attr("x", function (d) { return d.x })
    .attr("y", function (d) { return d.y - 45 })
    .attr("text-anchor", "middle") // 设置水平居中对齐
    .attr("dominant-baseline", "middle") // 设置垂直居中对齐
    .style("font-size", "200%");

}

function freezeNode(position_json) {
  for (m = 0; m < position_json.places.length; m++) {//读取要固定的库所的个数和信息
    svg.selectAll("circle").filter(function (d) {
      return d3.select(this).attr("id") == position_json.places[m].id
    })
      .each(function (d) {
        d.fx = position_json.places[m].cx, d.fy = position_json.places[m].cy
        //console.log(d.fx, d.fy)
      })
  }
  for (n = 0; n < position_json.transitions.length; n++) {//读取要固定的变迁的个数和信息
    // console.log(position_json[i].id)
    svg.selectAll("rect")
      .filter(function (d) {
        return d3.select(this).attr("id") == position_json.transitions[n].id
      })
      .each(function (d) {
        d.fx = position_json.transitions[n].x, d.fy = position_json.transitions[n].y
      })
  }
}

function creatLegend(colors) {
  console.log(allplace_color)
  //console.log(colors)
  var legend = svg.selectAll(".legend")
    .data(allplace_color)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

  // 添加图例矩形
  legend.append("circle")
    .attr("r", 10)
    .attr("cx", 2850)
    .attr("cy", 29)
    .style("fill", function (d, i) { return d3.schemeCategory10[i] });

  // 添加图例文本
  legend.append("text")
    .attr("x", 2900)
    .attr("y", 35)
    //.attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function (d, i) { return allplace_color[i]; });
}

function createLayout() {
  console.log('调用createLayout')

  /*simulation = d3.forceSimulation(nodes)
  // 加大距离，比如 distance(100)
  .force("link", d3.forceLink(connections).id(d => d.id).distance(100)) 
  // 加大斥力，防止重叠
  .force("charge", d3.forceManyBody().strength(-300))
  .force("collide", d3.forceCollide(60))
  // 增加一个向中心的引力，防止节点飞出屏幕
  .force("center", d3.forceCenter(initialTranslateX, initialTranslateY));*/
  
  
  
  
  simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(connections).id(function (d, i) { return d.id }).strength(0.1).distance(50))
    .force("charge", d3.forceManyBody().strength(-200))
    //.force("center", d3.forceCenter(width / 2, height / 2))
    .force("collide", d3.forceCollide(50))
    .on("tick", ticked)

  links = g1.selectAll("line").data(connections).enter().append("line") //设置连接线的属性
    .attr("class", "links")
    .attr("stroke", "black")
    .attr("stroke-width", 3)//
    .attr("source", function (d, i) { return d.source.id })
    .attr("target", function (d, i) { return d.target.id })
    .attr("marker-end", "url(#arrow)")

  places = g1.selectAll("circle").data(place_json).enter().append("circle") //设置库所属性
    .attr("class", "circle")
    .attr("id", function (d, i) { return place_id[i] })
    .attr("r", Place_r)
    .attr("fill", "white")
    .attr("stroke-width", 3)
    .attr("stroke", "black")//cx cy
    .property("token_color", function (d, i) { return place_json[i].token.map(function (d) { return Object.keys(d)[0].slice(0, -1) }) })
    .property("token_color_mark", function (d, i) { return place_json[i].token.map(function (d) { return Object.keys(d)[0].slice(-1) }) })
    .property("token_color_num", function (d, i) { return place_json[i].token.map(function (d) { return Object.values(d)[0] }) })
    .call(drag);
  //console.log("places",place_json[0].token[0]["workpiece1"])
  console.log("places", places)
  // changePlaces = g1.selectAll("circle")
  //   .on("click", fold_function)

  transitions = g1.selectAll("rect").data(transition_json).enter().append("rect") //设置变迁属性
    .attr("class", "rect")
    .attr("id", function (d, i) { return transition_id[i] })
    .attr("fill", "white")
    .attr("stroke-width", 3)
    .attr("stroke", "black")
    .attr("width", trans_w)
    .attr("height", trans_h)
    .call(drag);

  txt = g1.selectAll(".text2").data(nodes).enter().append("text") //设置属性名的文本属性//
    .attr("class", "text2")
    // .attr("x", function (d) { return d.x })
    // .attr("y", function (d) { return d.y + 20 })
    .text(function (d) { return d.id })
  // txt1 = g1.selectAll(".text1").data(token).enter().append("text") //设置属性名的文本属性//
  //   .attr("class","text1")
  // .attr("x", function (d) { return d.x })
  // .attr("y", function (d) { return d.y + 20 })
  //.text(function (d) { return d.tk_color })



  console.log(txt)
  transitions.on("click", evolution_function)
  start(svg, transitions, links, connections);
}
//折叠函数（点击库所实现折叠,折叠成为宏库所，展开为子网）


function started(d) {

  console.log("开始拖拽")
  if (simulationIsEnable) {
    simulation.alphaTarget(0.2).restart()
  }
  d.fx = d.x
  // fx fy 表示下次节点被固定的位置
  // 每次tick结束node.x都会被设置为node.fx，node.vx设置为0
  d.fy = d.y
  //console.log('start')
}
//****************************************拖拽过程************************************************
function dragged(d) {
  if (simulationIsEnable) {
    d.fx = d3.event.x
    d.fy = d3.event.y

  }
  else {
    d.x = d3.event.x
    d.y = d3.event.y
    ticked();
  }
  //console.log('during')
}
//****************************************拖拽结束************************************************
function ended(d) {
  if (!d3.event.active) {
    // 设置为0直接停止，如果大于alphaMin则会逐渐停止
    simulation.alphaTarget(0)
  }
  
  d.fx = d.x;
  d.fy = d.y;
  
  //d.fx = null
  //d.fy = null
  console.log('end')
}

function inputplaces_Togreen(input_places) {
  for (q = 0; q < input_places.length; q++) {
    g1.selectAll("circle").filter(function (d, i) {
      return d3.select(this).attr("id") == input_places[q]
    }).attr("fill", "green")
  }
}
function inputplaces_Towhite(input_places) {
  for (q = 0; q < input_places.length; q++) {
    g1.selectAll("circle").filter(function (d, i) {
      return d3.select(this).attr("id") == input_places[q]
    }).attr("fill", "white")
  }
}

function outputplaces_Togreen(output_places) {
  for (p = 0; p < output_places.length; p++) {
    g1.selectAll("circle").filter(function (d, i) {
      return d3.select(this).attr("id") == output_places[p]
    }).attr("fill", "green")
  }
}
function outputplaces_Towhite(output_places) {
  for (p = 0; p < output_places.length; p++) {
    g1.selectAll("circle").filter(function (d, i) {
      return d3.select(this).attr("id") == output_places[p]
    }).attr("fill", "white")
  }
}

/*function 激发变迁_前后库所_标识处理(input_places, output_places, firable_color_need_token, cursorId, select_trans) {//
  // 本函数将改变DOM树
  function IndexOf(arr, item) {
    return arr.indexOf(item)
  }
  for (w = 0; w < t_pre_arcs_keys.length; w++) {
    //若激发，则每个终点是this的connection的起点对应的库所mark值减一
    /*var current_place = d3.selectAll("circle").filter(function (d, i) {
      return d3.select(this).attr("id") == t_pre_arcs_keys[w]
    })
    var input_token_color = d3.selectAll("circle").filter(function (d, i) {
      return d3.select(this).attr("id") == t_pre_arcs_keys[w]
    }).property("token_color")
    var input_token_color_mark = d3.selectAll("circle").filter(function (d, i) {
      return d3.select(this).attr("id") == t_pre_arcs_keys[w]
    }).property("token_color_mark")
    var input_token_color_num = svg.selectAll("circle").filter(function (d, i) {
      return d3.select(this).attr("id") == t_pre_arcs_keys[w]
    }).property("token_color_num")*/


    /*var current_place = d3.selectAll("circle.circle").filter(function(d){ return d3.select(this).attr("id") == t_pre_arcs_keys[w] });
    if(current_place.empty()) continue; // 找不到节点直接跳过，防止死机

    var input_token_color = current_place.property("token_color") || [];
    var input_token_color_mark = current_place.property("token_color_mark") || [];
    var input_token_color_num = current_place.property("token_color_num") || [];


    //console.log(input_token_color)//输入库所含有的托肯
    //console.log(input_token_color_num)//输入库所含有的托肯数量
    //console.log(input_token_color_mark)//输入库所含有的托肯标号

    var temp = []
    for (i = 0; i < input_token_color.length; i++) {//
      temp.push(input_token_color[i] + input_token_color_mark[i])
    }
    //console.log(temp)
    //for (i = 0; i < firable_color_need_token.length; i++) {//
    var temp1 = d3.keys(firable_color_need_token[w])[0] + d3.values(firable_color_need_token[w])[0]
    //console.log(temp1)
    if (temp.includes(temp1)) {
      var a = IndexOf(input_token_color_mark, d3.values(firable_color_need_token[w])[0])
      //console.log(a)            
      //console.log(input_token_color_num)
      input_token_color_num[a] = input_token_color_num[a] - 1;
    }
    //}

    //console.log(input_token_color_num)
    //console.log(input_token_color)
    for (p = 0; p < input_token_color_num.length; p++) {//    
      if (input_token_color_num[p] == 0) {
        input_token_color.splice(p, 1)
        input_token_color_mark.splice(p, 1)
        input_token_color_num.splice(p, 1)
      }
    }
    current_place.property("token_color", input_token_color)
    current_place.property("token_color_num", input_token_color_num)
    current_place.property("token_color_mark", input_token_color_mark)

    console.log(current_place.property("token_color"))
    console.log(current_place.property("token_color_num"))
  }

  var t_post_values = transition_json.filter((item, index) => {//变迁后向弧值
    return item.id == cursorId
  }).map(item => d3.values(item.post_arcs)).reduce((acc, val) => acc.concat(val), [])
  var t_post_keys = transition_json.filter((item, index) => {//输出库所
    return item.id == cursorId
  }).map(item => d3.keys(item.post_arcs)).reduce((acc, val) => acc.concat(val), [])
  console.log(t_post_values)//[['robot']]
  console.log(t_post_keys)//['p5']

  //   markerToChangeNode.attr("mark"/, parseInt(markerToChangeNode.attr("mark")) - 1)   
  setTimeout(function () {
    //var temp3 = [];
    console.log(select_trans[cursorId])///////////////////
    for (k = 0; k < t_post_keys.length; k++) {
      //temp3.push()//后置库所产生的托肯
      console.log(t_post_values[k][select_trans[cursorId]])
      /*var markerToChangeNode1 = d3.selectAll("circle").filter(function (d, i) {
        return d3.select(this).attr("id") == t_post_keys[k]
      })
      var output_place_token = markerToChangeNode1.property("token_color")
      var output_place_token_mark = markerToChangeNode1.property("token_color_mark")
      var output_place_token_num = markerToChangeNode1.property("token_color_num")*/



      /*var markerToChangeNode1 = d3.selectAll("circle.circle").filter(function(d){ return d3.select(this).attr("id") == t_post_keys[k] });
      if(markerToChangeNode1.empty()) continue; // 找不到节点直接跳过

      var output_place_token = markerToChangeNode1.property("token_color") || [];
      var output_place_token_mark = markerToChangeNode1.property("token_color_mark") || [];
      var output_place_token_num = markerToChangeNode1.property("token_color_num") || [];



    

      //console.log(output_place_token_num)
      //console.log(output_place_token_mark)
      //console.log(t_post_values[k][select_trans[cursorId]])
      //console.log(d3.keys(firable_color_need_token[0])[0])
      if (t_post_values[k][select_trans[cursorId]] == d3.keys(firable_color_need_token[0])[0]) {
        //output_place_token_num.push(1)                      
        output_place_token_mark.push(d3.values(firable_color_need_token[0])[0])
        console.log(d3.values(firable_color_need_token[0])[0])
      }
      else if (t_post_values[k][select_trans[cursorId]] == "action_in") {
        var temp1 = []
        for (i = 0; i < firable_color_need_token.length; i++) {
          if (d3.keys(firable_color_need_token[i])[0] == "agv_workpiece") {
            temp1.push(d3.values(firable_color_need_token[i])[0])
          }
        }
        for (i = 0; i < firable_color_need_token.length; i++) {
          if (d3.keys(firable_color_need_token[i])[0] == "robot") {
            temp1.push(d3.values(firable_color_need_token[i])[0])
          }
        }
        output_place_token_mark.push(temp1.join(""))
      }
      else if (t_post_values[k][select_trans[cursorId]] == "action_out") {
        var temp = []
        for (i = 0; i < firable_color_need_token.length; i++) {
          if (d3.keys(firable_color_need_token[i])[0] == "agv") {
            temp.push(d3.values(firable_color_need_token[i])[0])
          }
        }
        for (i = 0; i < firable_color_need_token.length; i++) {
          if (d3.keys(firable_color_need_token[i])[0] == "workpiece") {
            temp.push(d3.values(firable_color_need_token[i])[0])
          }
        }
        for (i = 0; i < firable_color_need_token.length; i++) {
          if (d3.keys(firable_color_need_token[i])[0] == "robot") {
            temp.push(d3.values(firable_color_need_token[i])[0])
          }
        }

        //output_place_token_mark=temp.push(output_place_token_mark.toString())
        output_place_token_mark.push(temp.join(""))
        console.log(output_place_token_mark)
      }
      else if (t_post_values.length == 2) {
        if (t_post_values[k][select_trans[cursorId]] == "agv_workpiece") {
          output_place_token_mark.push(d3.values(firable_color_need_token[0])[0].slice(0, 2))
          console.log(output_place_token_mark)
        }
        else {
          output_place_token_mark.push(d3.values(firable_color_need_token[0])[0].slice(-1))
          console.log(output_place_token_mark)
        }
      }
      else {
        console.log(output_place_token_mark)
        if (t_post_values[k][select_trans[cursorId]] == "avg") {
          output_place_token_mark.push(d3.values(firable_color_need_token[0])[0].slice(0, 1))
        }
        else if (t_post_values[k][select_trans[cursorId]] == "workpiece") {
          output_place_token_mark.push(d3.values(firable_color_need_token[0])[0].slice(1, 2))
        }
        else {
          output_place_token_mark.push(d3.values(firable_color_need_token[0])[0].slice(-1))
        }
      }
      if (output_place_token_num.length == 0) {
        output_place_token.push(t_post_values[k][select_trans[cursorId]])
        output_place_token_num.push(1)
        //console.log(output_place_token)
        //console.log(output_place_token_num)
      }
      else if (output_place_token_num.length != 0) {
        var temp = []
        for (i = 0; i < output_place_token.length; i++) {
          temp.push(output_place_token[i] + output_place_token_mark[i])
        }
        //console.log(temp)
        var temp1 = []
        temp1.push(t_post_values[k][select_trans[cursorId]] + output_place_token_mark[output_place_token_mark.length - 1])
        //console.log(temp1)
        //console.log(output_place_token_mark)            
        if (temp.includes(temp1)) {
          var b = IndexOf(output_token_color_mark, output_place_token_mark[output_place_token_mark.length - 1])
          output_place_token_num[b] = output_place_token_num[b] + 1
        }
        else {
          output_place_token.push(t_post_values[k][select_trans[cursorId]])
          console.log(output_place_token)
          //var e = IndexOf(output_token_color, temp3[k])
          output_place_token_num.push(1);

          console.log(output_place_token_num);
        }
      }
      markerToChangeNode1.property("token_color", output_place_token)
      markerToChangeNode1.property("token_color_num", output_place_token_num)
      markerToChangeNode1.property("token_color_mark", output_place_token_mark)
      console.log(markerToChangeNode1.property("token_color"))
      console.log(markerToChangeNode1.property("token_color_num"));
    }
  }, token_v * 2)
}*/


function 激发变迁_前后库所_标识处理(input_places, output_places, firable_color_need_token, cursorId, select_trans) {
  function IndexOf(arr, item) {
    return arr.indexOf(item);
  }

  // 1. 处理输入库所的托肯消耗
  for (var w = 0; w < t_pre_arcs_keys.length; w++) {
    var current_place = d3.selectAll("circle.circle").filter(function (d, i) {
      return d3.select(this).attr("id") == t_pre_arcs_keys[w]
    });
    
    if (current_place.empty()) continue; // 防空指针

    var input_token_color = current_place.property("token_color") || [];
    var input_token_color_mark = current_place.property("token_color_mark") || [];
    var input_token_color_num = current_place.property("token_color_num") || [];

    var temp = [];
    for (var i = 0; i < input_token_color.length; i++) {
      temp.push(input_token_color[i] + input_token_color_mark[i]);
    }

    if (firable_color_need_token.length > 0 && firable_color_need_token[w]) {
       var need_color = d3.keys(firable_color_need_token[w])[0];
       var need_mark = d3.values(firable_color_need_token[w])[0];
       var temp1 = need_color + need_mark;
       
       if (temp.includes(temp1)) {
         var a = IndexOf(input_token_color_mark, need_mark);
         input_token_color_num[a] = input_token_color_num[a] - 1;
       }
    }

    for (var p = input_token_color_num.length - 1; p >= 0; p--) {
      if (input_token_color_num[p] <= 0) {
        input_token_color.splice(p, 1);
        input_token_color_mark.splice(p, 1);
        input_token_color_num.splice(p, 1);
      }
    }
    current_place.property("token_color", input_token_color);
    current_place.property("token_color_num", input_token_color_num);
    current_place.property("token_color_mark", input_token_color_mark);
  }

  // 获取变迁的输出
  var t_post_values = transition_json.filter((item) => item.id == cursorId)
    .map(item => d3.values(item.post_arcs)).reduce((acc, val) => acc.concat(val), []);
  var t_post_keys = transition_json.filter((item) => item.id == cursorId)
    .map(item => d3.keys(item.post_arcs)).reduce((acc, val) => acc.concat(val), []);

  setTimeout(function () {
    // 【防弹核心】：提取安全的标识，确保它绝对是个字符串，绝不让 slice 报错
    var safe_color = "raw";
    var safe_mark = "a";
    if (firable_color_need_token && firable_color_need_token.length > 0 && firable_color_need_token[0]) {
        safe_color = d3.keys(firable_color_need_token[0])[0] || "raw";
        safe_mark = String(d3.values(firable_color_need_token[0])[0] || "a");
    }

    for (var k = 0; k < t_post_keys.length; k++) {
      var markerToChangeNode1 = d3.selectAll("circle.circle").filter(function (d, i) {
        return d3.select(this).attr("id") == t_post_keys[k]
      });
      
      if (markerToChangeNode1.empty()) continue; // 找不到图形直接跳过

      var output_place_token = markerToChangeNode1.property("token_color") || [];
      var output_place_token_mark = markerToChangeNode1.property("token_color_mark") || [];
      var output_place_token_num = markerToChangeNode1.property("token_color_num") || [];

      // 为了安全，获取当前的 post_value，没有就给默认
      var current_post_value = "raw";
      if (t_post_values[k] && t_post_values[k][select_trans[cursorId]]) {
          current_post_value = t_post_values[k][select_trans[cursorId]];
      }

      // 下面的所有 slice 操作前，全部使用 safe_mark 替代，确保不会崩溃
      if (current_post_value == safe_color) {
        output_place_token_mark.push(safe_mark);
      }
      else if (current_post_value == "action_in") {
        output_place_token_mark.push(safe_mark + safe_mark); // 简化拼接防错
      }
      else if (current_post_value == "action_out") {
        output_place_token_mark.push(safe_mark + safe_mark); // 简化拼接防错
      }
      else if (t_post_values.length == 2) {
        if (current_post_value == "agv_workpiece") {
          output_place_token_mark.push(safe_mark.slice(0, 2));
        } else {
          output_place_token_mark.push(safe_mark.slice(-1));
        }
      }
      else {
        if (current_post_value == "avg") {
          output_place_token_mark.push(safe_mark.slice(0, 1));
        }
        else if (current_post_value == "workpiece") {
          output_place_token_mark.push(safe_mark.slice(1, 2));
        }
        else {
          output_place_token_mark.push(safe_mark.slice(-1));
        }
      }

      // 最后的标识更新写入
      if (output_place_token_num.length == 0) {
        output_place_token.push(current_post_value);
        output_place_token_num.push(1);
      } else {
        var temp_check = [];
        for (var i = 0; i < output_place_token.length; i++) {
          temp_check.push(output_place_token[i] + output_place_token_mark[i]);
        }
        var current_full_mark = current_post_value + output_place_token_mark[output_place_token_mark.length - 1];
        
        if (temp_check.includes(current_full_mark)) {
          var b = IndexOf(output_place_token_mark, output_place_token_mark[output_place_token_mark.length - 1]);
          if(b !== -1) {
             output_place_token_num[b] = output_place_token_num[b] + 1;
          }
        } else {
          output_place_token.push(current_post_value);
          output_place_token_num.push(1);
        }
      }
      
      markerToChangeNode1.property("token_color", output_place_token);
      markerToChangeNode1.property("token_color_num", output_place_token_num);
      markerToChangeNode1.property("token_color_mark", output_place_token_mark);
    }
  }, token_v * 2);
}



//点击变迁，执行函数

function evolution_function(d) {
  var firable_transition = []; var firable_color_need_token = [];
  console.log("click");           //console.log()用于输出普通信息
  var cursorId = d3.select(this).attr("id");

  console.log(cursorId)
  var xymid = [];//变迁当前的位置用于token移动
  xymid.push({
    "cx": d3.select(this).attr("x"),
    "cy": d3.select(this).attr("y")
  });   //变迁的位置，用xy轴表示

  var input_places = connections.filter((item, index) => {
    return item.target.id == cursorId
  }).map(item => item.source.id)
  console.log(input_places, '输入库所')//['p4','p5']

  var output_places = connections.filter((item, index) => {
    return item.source.id == cursorId
  }).map(item => item.target.id)
  console.log(output_places, '输出库所')//['p1']

  var possible_trans = transition_json.filter((item, index) => {//该变迁有几种激发方式
    return item.id == cursorId
  }).map(item => item["pre_arcs"][input_places[0]]).reduce((acc, val) => acc.concat(val), []);
  //console.log('possible_trans', possible_trans.length)//[["agv_workpiece"]["robot"]]

  // function trans_towhite() {//
  //   d3.selectAll("rect").filter(function (d, i) {
  //     return d3.select(this).attr("id") == cursorId
  //   }).attr("fill", "white")
  // }

  // var t_colors = transition_json.filter((item, index) => {//变迁所有可能出现颜色
  //   return item.id == cursorId
  // }).map(item => item.colors, this)
  // console.log(t_colors[0])

  t_pre_arcs_keys = transition_json.filter((item, index) => {//变迁前向弧键(即输入库所)
    return item.id == cursorId
  }).map(item => d3.keys(item.pre_arcs)).reduce((acc, val) => acc.concat(val), []);

  t_pre_arcs_values = transition_json.filter((item, index) => {//变迁前向弧值
    return item.id == cursorId
  }).map(item => d3.values(item.pre_arcs)).reduce((acc, val) => acc.concat(val), []);
  console.log(t_pre_arcs_keys)
  console.log(t_pre_arcs_values)//[["agv_workpiece"],["robot"]]
  //console.log("可激发变迁的个数", t_pre_arcs_values[0].length)

  var c = 0;//记录后置库所是否都满足条件
  for (m = 0; m < output_places.length; m++) {//输出库所是否有托肯  输出库所容量是否为1
    var output_token_color_num = d3.selectAll("circle").filter(function (d, i) {
      return d3.select(this).attr("id") == output_places[m]
    }).property("token_color_num")
    var output_places_capacity = place_json.filter((item, index) => {//变迁后向弧值
      return item.id == output_places[m]
    }).map(item => item.capacity).reduce((acc, val) => acc.concat(val), []);
    console.log(output_token_color_num)
    console.log(output_places_capacity)
    if (!output_token_color_num[0] == 0) {//输出库所含有托肯
      if (output_places_capacity[0] > output_token_color_num[0]) {//输出库所容量大于输出库所中的托肯数
        c++;
      }
    }
    else {
      c++;
    }
  }
  //输入库所是否含有激发某个颜色变迁所需要的托肯
  for (i = 0; i < possible_trans.length; i++) {
    var need_token = []; var b = 0; var diff_mark_trans = []//记录输入库所是否都符合条件
    for (j = 0; j < t_pre_arcs_keys.length; j++) {
      var temp3 = []
      var temp = t_pre_arcs_values[j][i]//
      console.log(temp)
      need_token.push(temp)//需要从前向库所获取托肯颜色     
      console.log(need_token)
      var temp1 = d3.selectAll("circle").filter(function (d, i) { //判断前向库所是否含有该颜色托肯
        return d3.select(this).attr("id") == t_pre_arcs_keys[j]
      }).property("token_color")
      var temp2 = d3.selectAll("circle").filter(function (d, i) { //判断前向库所是否含有该颜色托肯
        return d3.select(this).attr("id") == t_pre_arcs_keys[j]
      }).property("token_color_mark")
      //console.log(temp1)
      //console.log(temp2)
      if (temp1.includes(need_token[j])) {
        b++;
      }
      for (k = 0; k < temp1.length; k++) {
        if (temp1[k] == need_token[j]) {
          //console.log(temp1[k])
          //console.log(temp2[k])
          temp3.push({ [temp1[k]]: temp2[k] })
        }
      }
      diff_mark_trans.push(temp3)
      console.log(diff_mark_trans)
    }
    //console.log(b,c)
    if (b == t_pre_arcs_keys.length && c == output_places.length) {//容量为1且输出库所托肯为0
      //console.log(t_colors[0][i], "颜色可激发")
      //console.log(cursorId)
      firable_transition.push({ [cursorId]: i, "possible_mark": diff_mark_trans })//激发哪个变迁的哪种变迁（同种变迁的不同激发？）
    }

  }
  // console.log(b)
  // console.log(c)

  console.log(firable_transition)
  if (firable_transition.length == 0) {
    console.log("该变迁不可激发")
  }
  else {

    inputplaces_Togreen(input_places)
    setTimeout(() => { inputplaces_Towhite(input_places) }, token_v * 2)
    setTimeout(() => { outputplaces_Togreen(output_places) }, token_v * 2)
    setTimeout(() => { outputplaces_Towhite(output_places) }, token_v * 3)


    var select_trans = firable_transition[Math.round(Math.random() * (firable_transition.length - 1))]//随机选择变迁颜色进行激发
    console.log(select_trans)
    for (m = 0; m < t_pre_arcs_keys.length; m++) {//
      // var temp = t_pre_arcs_values[m][select_trans[cursorId]]
      // console.log(temp)
      var select_input_token = d3.keys(select_trans.possible_mark[m][Math.round(Math.random() * (firable_transition.length - 1))])[0]
      var select_input_token_mark = d3.values(select_trans.possible_mark[m][Math.round(Math.random() * (firable_transition.length - 1))])[0]
      firable_color_need_token.push({ [select_input_token]: select_input_token_mark })//需要从前向库所获取托肯颜色（可能有多个满足的托肯）     

    }
    console.log(firable_color_need_token)

    //var trans_color = colors(select_color)
    //console.log(trans_color)
    //d3.select(this).attr("fill", trans_color)
    //setTimeout(trans_towhite, token_v * 2)
    TK_Move(input_places, xymid, output_places, g1, places, firable_color_need_token); //计算托肯移动位置
    激发变迁_前后库所_标识处理(t_pre_arcs_keys, output_places, firable_color_need_token, cursorId, select_trans)
  }
  start(svg, transitions, links, connections);
  update(svg, g1);
  setTimeout(function () {
    start(svg, transitions, links, connections);
    update(svg, g1);
  }, token_v * 2);
  //ws.send([cursorId,select_color])
}

//先将原有托肯删除，遍历所有库所，计算库所中托肯的个数分配位置，将所有托肯信息放入token中，绑定该数据，添加图形和文本元素
//现将托肯信息放入token_json中，给托肯分配位置，通过属性确定托肯所在库所
function update(svg, g1) {//更新标识，计算标识位置。
  console.log('调用update')
  var token = [];
  var nodesNum = 0;
  var remo = svg.selectAll("circle").filter(function (d, i) {
    return d3.select(this).attr("class") == "node" //this代表当前变量，选择有属性node的变量//
  });
  var temp = svg.selectAll("text").filter(function (d, i) {
    return d3.select(this).attr("class") == "text1" //this代表当前变量，选择有属性node的变量//
  });
  //console.log("remo", remo);//将之前的托肯去掉
  //console.log("temp", temp);
  remo.remove();
  temp.remove();
  g1.selectAll("circle").filter(function (d, i) {
    return d3.select(this).attr("r") == Place_r//
  })
    .each(function (d, i) {//判断库所标识个数，计算标识位置
      //console.log(d3.select(this).attr("id")+""+d3.select(this).attr("cx"))
      // 计算托肯的半径，以便绘制在库所中       
      nodesNum = d3.sum(d3.select(this).property("token_color_num"))
      //console.log(nodesNum)
      if (nodesNum > 0) {
        if (nodesNum == 1) {
          for (i = 0; i < d3.select(this).property("token_color_num").length; i++) {
            if (d3.select(this).property("token_color_num")[i] != 0) {
              token.push({
                cx: Number(d3.select(this).attr("cx")), cy: Number(d3.select(this).attr("cy")),
                r: tk_r, tk_color: d3.select(this).property("token_color")[i], mark: d3.select(this).property("token_color_mark")[i]
              })
            }
          }
        }
        if (nodesNum > 1) {
          var pp = 0;
          for (m = 0; m < d3.select(this).property("token_color").length; m++) {
            var num = d3.select(this).property("token_color_num")[m]
            if (num > 0) {
              for (n = 0; n < num; n++) {
                pp++;
                var cx1 = Number(d3.select(this).attr("cx")) + 5 * Math.cos(pp * 2 * Math.PI / nodesNum)//
                var cy1 = Number(d3.select(this).attr("cy")) + 5 * Math.sin(pp * 2 * Math.PI / nodesNum)
                token.push({
                  cx: cx1, cy: cy1, r: tk_r, tk_color: d3.select(this).property("token_color")[m], mark: d3.select(this).property("token_color_mark")[m]
                })
              }
            }
          }
        }
      }
    })
  //console.log(token)
  g1.selectAll(".text1").data(token).enter().append("text") //设置属性名的文本属性//
    .attr("class", "text1")
    .attr("x", function (d) { return d.cx })
    .attr("y", function (d) { return d.cy + 30 })
    .text(function (d) { return d.tk_color + d.mark })
    .attr("text-anchor", "middle") // 设置水平居中对齐
    .attr("dominant-baseline", "middle") // 设置垂直居中对齐
    //.attr("fill", function(d, i){return colors(d.tk_color)})
    .style("font-size", "150%");
  //console.log("txt1",txt1)
  g1.selectAll(".node").data(token)//标识为node类
    .enter().append("circle")
    .attr("class", "node")
    .attr("cx", function (d) { return d.cx; })
    .attr("cy", function (d) { return d.cy; })
    .attr("r", tk_r)
    .attr("fill", function (d, i) { return colors(d.tk_color) })
    .attr("id", function (d, i) { return d.tk_color })
  //console.log(temp)

  //console.log(color[link_json[0]["mark"]])
  g1.selectAll(".text1").data(token).exit().remove();//
  g1.selectAll(".node").data(token).exit().remove();//
  var tokens = new Array;
  places.each(function (d, i) { tokens.push({ "token_color_num": d3.select(this).property("token_color_num") }) });
  //currentState.push(tokens)//更新当前状态标识
  //console.log(currentState)
}

function start(svg) {//判断所有可激发变迁，
  var firable_transition = []
  svg.selectAll("rect").each(function (d, i) {
    var nowId = d3.select(this).attr("id")
    //console.log(nowId)
    var input_places = connections.filter((item, index) => {
      return item.target.id == nowId
    }).map(item => item.source.id)
    //console.log(input_places, '输入库所')

    var output_places = connections.filter((item, index) => {
      return item.source.id == nowId
    }).map(item => item.target.id)
    //console.log(output_places, '输出库所')

    var possible_trans = transition_json.filter((item, index) => {//该变迁有几种激发方式
      return item.id == nowId
    }).map(item => item["pre_arcs"][input_places[0]]).reduce((acc, val) => acc.concat(val), []);
    //console.log('possible_trans', possible_trans.length)//[["agv_workpiece"]["robot"]]

    // function trans_towhite() {//
    //   d3.selectAll("rect").filter(function (d, i) {
    //     return d3.select(this).attr("id") == cursorId
    //   }).attr("fill", "white")
    // }

    t_pre_arcs_keys = transition_json.filter((item, index) => {//变迁前向弧键(即输入库所)
      return item.id == nowId
    }).map(item => d3.keys(item.pre_arcs)).reduce((acc, val) => acc.concat(val), []);

    t_pre_arcs_values = transition_json.filter((item, index) => {//变迁前向弧值
      return item.id == nowId
    }).map(item => d3.values(item.pre_arcs)).reduce((acc, val) => acc.concat(val), []);
    //console.log(t_pre_arcs_keys)
    //console.log(t_pre_arcs_values)//[["agv_workpiece"],["robot"]]
    //console.log("可激发变迁的个数", t_pre_arcs_values[0].length)

    var c = 0;//记录后置库所是否都满足条件
      for (m = 0; m < output_places.length; m++) {//输出库所是否有托肯  输出库所容量是否为1
        // 【新增安全机制】：精确寻找带有 .circle 类的库所节点
        var targetOutPlace = d3.selectAll("circle.circle").filter(function (d, i) {
          return d3.select(this).attr("id") == output_places[m]
        });
        
        // 如果找不到节点，在控制台报错并跳过，防止程序崩溃
        if (targetOutPlace.empty()) {
          console.error("⚠️严重警告：数据存在断链，找不到输出库所节点 ->", output_places[m]);
          continue; 
        }

        var output_token_color_num = targetOutPlace.property("token_color_num");
        // ... 下面保留你原有的获取容量的代码
    
    /*var c = 0;//记录后置库所是否都满足条件
    for (m = 0; m < output_places.length; m++) {//输出库所是否有托肯  输出库所容量是否为1
      var output_token_color_num = d3.selectAll("circle").filter(function (d, i) {
        return d3.select(this).attr("id") == output_places[m]
      }).property("token_color_num")*/
      var output_places_capacity = place_json.filter((item, index) => {//变迁后向弧值
        return item.id == output_places[m]
      }).map(item => item.capacity).reduce((acc, val) => acc.concat(val), []);
      //console.log(output_token_color_num)
      //console.log(output_places_capacity)
      if (!output_token_color_num[0] == 0) {//输出库所含有托肯
        if (output_places_capacity[0] > output_token_color_num[0]) {//输出库所容量大于输出库所中的托肯数
          c++;
        }
      }
      else {
        c++;
      }
    }
    //输入库所是否含有激发某个颜色变迁所需要的托肯
    var diff_mark_trans = []//记录输入库所是否都符合条件,不同标号同一种变迁   
    for (i = 0; i < possible_trans.length; i++) {
      var need_token = []; var b = 0;
      for (j = 0; j < t_pre_arcs_keys.length; j++) {
        var temp3 = []
        var temp = t_pre_arcs_values[j][i]//
        //console.log(temp)
        need_token.push(temp)//需要从前向库所获取托肯颜色     
        //console.log(need_token)
        var targetInPlace = d3.selectAll("circle.circle").filter(function (d, i) {
            return d3.select(this).attr("id") == t_pre_arcs_keys[j]
        });

        // 如果找不到节点，在控制台报错并跳过
          if (targetInPlace.empty()) {
            console.error("⚠️严重警告：数据存在断链，找不到输入库所节点 ->", t_pre_arcs_keys[j]);
            continue;
          }

        var temp1 = targetInPlace.property("token_color") || [];
        var temp2 = targetInPlace.property("token_color_mark") || [];
        /*var temp1 = d3.selectAll("circle").filter(function (d, i) { //判断前向库所是否含有该颜色托肯
          return d3.select(this).attr("id") == t_pre_arcs_keys[j]
        }).property("token_color")
        var temp2 = d3.selectAll("circle").filter(function (d, i) { //判断前向库所是否含有该颜色托肯
          return d3.select(this).attr("id") == t_pre_arcs_keys[j]
        }).property("token_color_mark")*/
        //console.log(temp1)
        //console.log(temp2)
        if (temp1.includes(need_token[j])) {
          b++;
        }
        for (k = 0; k < temp1.length; k++) {
          if (temp1[k] == need_token[j]) {
            //console.log(temp1[k])
            //console.log(temp2[k])
            temp3.push({ [temp1[k]]: temp2[k] })
          }
        }
        if (!temp3.length == 0) {
          diff_mark_trans.push(temp3)
        }
        //console.log(diff_mark_trans)         
      }
      //console.log(b,c)
      if (b == t_pre_arcs_keys.length && c == output_places.length) {//容量为1且输出库所托肯为0
        //console.log(t_colors[0][i], "颜色可激发")
        //console.log(cursorId)
        firable_transition.push({ [nowId]: i, "possible_mark": diff_mark_trans })//激发哪个变迁的哪种变迁（同种变迁的不同激发？）
      }
    }
  })

  console.log(firable_transition)//当前状态下所有可激发变迁颜色
  temp_transitions = firable_transition;

}

function play() {//auto play，模拟Petri网的演化
  start(svg, transitions, links, connections);
  update(svg, g1);

  console.log(temp_transitions)
  var select_trans = temp_transitions[Math.round(Math.random() * (temp_transitions.length - 1))]
  console.log(select_trans)
  var cursorId = d3.keys(select_trans)[0];//随机选择一个id
  //var cursorId_color = temp[1];
  console.log(cursorId)
  // console.log(cursorId_color)

  var xymid = [];//变迁当前的位置用于token移动
  xymid.push({
    "cx": g1.selectAll("rect").filter(function (d) { return d.id == cursorId }).attr("x"),
    "cy": g1.selectAll("rect").filter(function (d) { return d.id == cursorId }).attr("y")
  });

  var input_places = connections.filter((item, index) => {
    return item.target.id == cursorId
  }).map(item => item.source.id)
  console.log(input_places, '输入库所')//['p4','p5']

  var output_places = connections.filter((item, index) => {
    return item.source.id == cursorId
  }).map(item => item.target.id)
  console.log(output_places, '输出库所')//['p1']

  var possible_trans = transition_json.filter((item, index) => {//该变迁有几种激发方式
    return item.id == cursorId
  }).map(item => item["pre_arcs"][input_places[0]]).reduce((acc, val) => acc.concat(val), []);
  //console.log('possible_trans', possible_trans.length)//[["agv_workpiece"]["robot"]]

  inputplaces_Togreen(input_places)
  setTimeout(() => { inputplaces_Towhite(input_places) }, token_v * 2)
  setTimeout(() => { outputplaces_Togreen(output_places) }, token_v * 2)
  setTimeout(() => { outputplaces_Towhite(output_places) }, token_v * 3)

  t_pre_arcs_keys = transition_json.filter((item, index) => {//变迁前向弧键(即输入库所)
    return item.id == cursorId
  }).map(item => d3.keys(item.pre_arcs)).reduce((acc, val) => acc.concat(val), []);
  //.filter(key => isNaN(key)); // 【拦截器】：剔除 "0", "1" 这种因为 JSON 格式错误产生的纯数字假 ID

  t_pre_arcs_values = transition_json.filter((item, index) => {//变迁前向弧值
    return item.id == cursorId
  }).map(item => d3.values(item.pre_arcs)).reduce((acc, val) => acc.concat(val), []);
  console.log(t_pre_arcs_keys)
  console.log(t_pre_arcs_values)//[["agv_workpiece"],["robot"]]
  //console.log("可激发变迁的个数", t_pre_arcs_values[0].length)
  var firable_color_need_token = []

  for (m = 0; m < t_pre_arcs_keys.length; m++) {
    // 1. 安全获取当前前置库所对应的标识数组（用短路运算防空指针）
    var current_marks = (select_trans.possible_mark && select_trans.possible_mark[m]) ? select_trans.possible_mark[m] : [];

    // 2. 如果因为某些原因数组真的是空的，给个默认兜底值，避免后续的 .length 报错
    if (current_marks.length === 0) {
      console.warn("警告: 缺失可用的 possible_mark，使用默认托肯颜色 raw");
      firable_color_need_token.push({ "raw": "1" }); // 兜底保护
      continue;
    }

    // 3. 【极度关键】：安全生成随机索引，用 Math.floor 替代 Math.round，绝不会越界！
    var random_idx = Math.floor(Math.random() * current_marks.length);

    // 4. 安全提取托肯颜色和标记
    var safe_mark = current_marks[random_idx] || { "raw": "1" };
    var select_input_token = d3.keys(safe_mark)[0];
    var select_input_token_mark = d3.values(safe_mark)[0];

    firable_color_need_token.push({ [select_input_token]: select_input_token_mark });
  }
  /*for (m = 0; m < t_pre_arcs_keys.length; m++) {//
    // var temp = t_pre_arcs_values[m][select_trans[cursorId]]
    // console.log(temp)
    var select_input_token = d3.keys(select_trans.possible_mark[m][Math.round(Math.random() * (select_trans.possible_mark[m].length - 1))])[0]
    var select_input_token_mark = d3.values(select_trans.possible_mark[m][Math.round(Math.random() * (select_trans.possible_mark[m].length - 1))])[0]
    firable_color_need_token.push({ [select_input_token]: select_input_token_mark })//需要从前向库所获取托肯颜色（可能有多个满足的托肯）     

  }*/
  for (m = 0; m < t_pre_arcs_keys.length; m++) {
    // 【新增安全检查】：确保 possible_mark 真的有数据，防止空指针崩溃
    var current_marks = select_trans.possible_mark[m];
    if (!current_marks || current_marks.length === 0) {
      continue; // 如果没有标记数据，直接跳过这次循环
    }
    
    var random_idx = Math.floor(Math.random() * current_marks.length);
    var select_input_token = d3.keys(current_marks[random_idx])[0];
    var select_input_token_mark = d3.values(current_marks[random_idx])[0];
    firable_color_need_token.push({ [select_input_token]: select_input_token_mark });
  }
  console.log(firable_color_need_token)
  // setTimeout(changeColor, token_v)
  // function changeColor() {
  //   g1.selectAll("rect").filter(function (d, i) {
  //     return d3.select(this).attr("id") == cursorId
  //   }).attr("fill", trans_color)
  // }
  // setTimeout(trans_towhite, token_v * 2)
  // function trans_towhite() {//
  //   g1.selectAll("rect").filter(function (d, i) {
  //     return d3.select(this).attr("id") == cursorId
  //   }).attr("fill", "white")
  // }
  TK_Move(input_places, xymid, output_places, g1, places, firable_color_need_token); //计算托肯移动位置

  激发变迁_前后库所_标识处理(input_places, output_places, firable_color_need_token, cursorId, select_trans)

  //temp_transition = g1.selectAll("rect").filter(function (d) { return d.id == cursorId });//所有激发的变迁
  temp_transition.push(cursorId);
  console.log(temp_transition);
  start(svg, transitions, links, connections);
  update(svg, g1);
  timer = setTimeout(play, token_v * 2)//自动激发变迁定时器
}


/*****************************待修改*******************************/
function received_trans(received_msg) {
  /*
  var firable_transition = []; var firable_color_need_token = [];
  //if(received_msg.length==3){
  var cursorId = received_msg;//随机选择一个id
  //var cursorId_color = received_msg[1];
  console.log(cursorId)

  var xymid = [];//变迁当前的位置用于token移动
  xymid.push({
    "cx": g1.select(`rect#${CSS.escape(cursorId)}`).attr("x"),
    "cy": g1.select(`rect#${CSS.escape(cursorId)}`).attr("y")
  });   //变迁的位置，用xy轴表示
  console.log(xymid)
  var input_places = connections.filter((item, index) => {
    return item.target.id == cursorId
  }).map(item => item.source.id)
  console.log(input_places, '输入库所')//['p4','p5']

  var output_places = connections.filter((item, index) => {
    return item.source.id == cursorId
  }).map(item => item.target.id)
  console.log(output_places, '输出库所')//['p1']

  var possible_trans = transition_json.filter((item, index) => {//该变迁有几种激发方式
    return item.id == cursorId
  }).map(item => item["pre_arcs"][input_places[0]]).reduce((acc, val) => acc.concat(val), []);
  console.log('possible_trans', possible_trans.length)//[["agv_workpiece"]["robot"]]

  function trans_towhite() {//
    d3.selectAll("rect").filter(function (d, i) {
      return d3.select(this).attr("id") == cursorId
    }).attr("fill", "white")
  }

  t_pre_arcs_keys = transition_json.filter((item, index) => {//变迁前向弧键(即输入库所)
    return item.id == cursorId
  }).map(item => d3.keys(item.pre_arcs)).reduce((acc, val) => acc.concat(val), []);

  t_pre_arcs_values = transition_json.filter((item, index) => {//变迁前向弧值
    return item.id == cursorId
  }).map(item => d3.values(item.pre_arcs)).reduce((acc, val) => acc.concat(val), []);
  console.log(t_pre_arcs_keys)
  console.log(t_pre_arcs_values)//[["agv_workpiece"],["robot"]]
  console.log("可激发变迁的个数", t_pre_arcs_values[0].length)

  var c = 0;//记录后置库所是否都满足条件
  for (m = 0; m < output_places.length; m++) {//输出库所是否有托肯  输出库所容量是否为1
    var output_token_color_num = d3.selectAll("circle").filter(function (d, i) {
      return d3.select(this).attr("id") == output_places[m]
    }).property("token_color_num")
    var output_places_capacity = place_json.filter((item, index) => {//变迁后向弧值
      return item.id == output_places[m]
    }).map(item => item.capacity).reduce((acc, val) => acc.concat(val), []);
    console.log(output_token_color_num)
    console.log(output_places_capacity)
    if (!output_token_color_num[0] == 0) {//输出库所含有托肯
      if (output_places_capacity[0] > output_token_color_num[0]) {//输出库所容量大于输出库所中的托肯数
        c++;
      }
    }
    else {
      c++;
    }
  }
  //输入库所是否含有激发某个颜色变迁所需要的托肯
  for (i = 0; i < possible_trans.length; i++) {
    var need_token = []; var b = 0; var diff_mark_trans = []//记录输入库所是否都符合条件
    for (j = 0; j < t_pre_arcs_keys.length; j++) {
      var temp3 = []
      var temp = t_pre_arcs_values[j][i]//
      console.log(temp)
      need_token.push(temp)//需要从前向库所获取托肯颜色     
      console.log(need_token)
      var temp1 = d3.selectAll("circle").filter(function (d, i) { //判断前向库所是否含有该颜色托肯
        return d3.select(this).attr("id") == t_pre_arcs_keys[j]
      }).property("token_color")
      var temp2 = d3.selectAll("circle").filter(function (d, i) { //判断前向库所是否含有该颜色托肯
        return d3.select(this).attr("id") == t_pre_arcs_keys[j]
      }).property("token_color_mark")
      console.log(temp1)
      console.log(temp2)
      if (temp1.includes(need_token[j])) {
        b++;
      }
      for (k = 0; k < temp1.length; k++) {
        if (temp1[k] == need_token[j]) {
          console.log(temp1[k])
          console.log(temp2[k])
          temp3.push({ [temp1[k]]: temp2[k] })
        }
      }
      diff_mark_trans.push(temp3)
      console.log(diff_mark_trans)
    }
    //console.log(b,c)
    if (b == t_pre_arcs_keys.length && c == output_places.length) {//容量为1且输出库所托肯为0
      //console.log(t_colors[0][i], "颜色可激发")
      //console.log(cursorId)
      firable_transition.push({ [cursorId]: i, "possible_mark": diff_mark_trans })//激发哪个变迁的哪种变迁（同种变迁的不同激发？）
    }
  }
  if (firable_transition.length == 0) {
    console.log("该变迁不可激发")
  }
  else {
    inputplaces_Togreen(input_places)
    setTimeout(() => { inputplaces_Towhite(input_places) }, token_v * 2)
    setTimeout(() => { outputplaces_Togreen(output_places) }, token_v * 2)
    setTimeout(() => { outputplaces_Towhite(output_places) }, token_v * 3)

    var select_trans = firable_transition[Math.round(Math.random() * (firable_transition.length - 1))]//随机选择变迁颜色进行激发
    console.log(select_trans)
    for (m = 0; m < t_pre_arcs_keys.length; m++) {//
      // var temp = t_pre_arcs_values[m][select_trans[cursorId]]
      // console.log(temp)
      var select_input_token = d3.keys(select_trans.possible_mark[m][Math.round(Math.random() * (firable_transition.length - 1))])[0]
      var select_input_token_mark = d3.values(select_trans.possible_mark[m][Math.round(Math.random() * (firable_transition.length - 1))])[0]
      firable_color_need_token.push({ [select_input_token]: select_input_token_mark })//需要从前向库所获取托肯颜色（可能有多个满足的托肯）     

    }
    console.log(firable_color_need_token)
    //var trans_color = colors(cursorId_color)
    //console.log(trans_color)
    //d3.selectAll("rect").filter(function (d) { return d.id == cursorId }).attr("fill", trans_color)
    setTimeout(trans_towhite, token_v * 2)
    TK_Move(input_places, xymid, output_places, g1, places); //计算托肯移动位置
    激发变迁_前后库所_标识处理(input_places, output_places, firable_color_need_token, cursorId, select_trans)

  }
  start(svg, transitions, links, connections);
  update(svg, g1);
  setTimeout(function () {
    start(svg, transitions, links, connections);
    update(svg, g1);
    ws.send("next")
  }, token_v * 2);

  //}*/
  // 核心防御：如果 g1 还没创建，直接返回，防止报错
  if (typeof g1 === "undefined" || !g1 || g1.empty()) {
    console.warn("收到消息但 D3 场景尚未就绪，跳过处理:", received_msg);
    return;
  }
  var cursorId = received_msg; // 接收到的变迁ID
  console.log('执行变迁:', cursorId);

// 安全检查 1: 确保 g1 已经初始化
  if (!g1) {
    console.error("错误：g1 尚未初始化，请等待页面加载完成");
    return;
  }

  // 安全检查 2: 确保能选中对应的 rect
  var targetRect = g1.select(`rect#${CSS.escape(cursorId)}`);
  if (targetRect.empty()) {
    console.error(`错误：找不到 ID 为 ${cursorId} 的变迁元素`);
    return;
  }


  // 1. 获取变迁位置（用于令牌移动动画）
 /*ar xymid = [{
    "cx": parseFloat(g1.select(`rect#${CSS.escape(cursorId)}`).attr("x")) + 6, // 变迁中心x
    "cy": parseFloat(g1.select(`rect#${CSS.escape(cursorId)}`).attr("y")) + 25 // 变迁中心y
  }];*/
  var x = parseFloat(targetRect.attr("x")) || 0;
  var y = parseFloat(targetRect.attr("y")) || 0;

  var xymid = [{
    "cx": x + 6,
    "cy": y + 25
  }];
  // 2. 获取输入输出库所
  var input_places = connections.filter((item) => item.target.id == cursorId).map(item => item.source.id);
  var output_places = connections.filter((item) => item.source.id == cursorId).map(item => item.target.id);

  console.log('输入库所:', input_places);
  console.log('输出库所:', output_places);

  // 3. 直接从变迁配置中获取需要的令牌颜色
  var transition_config = transition_json.find((item) => item.id == cursorId);
  var firable_color_need_token = [];

  if (transition_config && transition_config.pre_arcs) {
    // 获取第一个可用的颜色配置（简化处理）
    Object.keys(transition_config.pre_arcs).forEach((placeId, index) => {
      var colors = transition_config.pre_arcs[placeId];
      if (colors && colors.length > 0) {
        // 取第一个颜色，标记随机生成
        var color = colors[0];
        var mark = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z随机字母
        firable_color_need_token.push({ [color]: mark });
      }
    });
  }

  console.log('消耗token:', firable_color_need_token);

  // 4. 视觉反馈（可选）
  function trans_toColor() {
    d3.select(`rect#${CSS.escape(cursorId)}`).attr("fill", "red");
  }

  function trans_toWhite() {
    d3.select(`rect#${CSS.escape(cursorId)}`).attr("fill", "white");
  }

  // 5. 执行动画和状态更新
  trans_toColor(); // 高亮变迁

  // 输入库所高亮
  inputplaces_Togreen(input_places);
  setTimeout(() => { inputplaces_Towhite(input_places); }, token_v * 2);

  // 输出库所高亮
  setTimeout(() => { outputplaces_Togreen(output_places); }, token_v * 2);
  setTimeout(() => { outputplaces_Towhite(output_places); }, token_v * 3);

  // 令牌移动动画
  setTimeout(() => {
    TK_Move(input_places, xymid, output_places, g1, places);
  }, token_v);

  // 实际执行状态变更
  setTimeout(() => {
    激发变迁_前后库所_标识处理(input_places, output_places, firable_color_need_token, cursorId, { [cursorId]: 0 });
    trans_toWhite(); // 恢复变迁颜色
  }, token_v * 2);

  // 6. 更新界面
  setTimeout(() => {
    update(svg, g1); // 刷新显示
    if (ws) {
      ws.send("next"); // 请求下一个变迁
    }
  }, token_v * 3);

}

//托肯移动
//TK_Move(input_places, xymid, output_places, g1, places); //计算托肯移动位置
// function TK_Move(temp, xymid, temp_1, g1, places, trans_color) {
function TK_Move(temp, xymid, temp_1, g1, places, need_color) {
  var temp_x = 0; var temp_y = 0;
  var temp_Tk = []; var nothing = []; var xyend = [];
  for (m = 0; m < temp.length; m++) {
    // var temp=places.filter(function () {
    //   return d3.select(this).attr("id") == temp[m]
    // });
    // console.log(temp)
    temp_x = places.filter(function () {
      return d3.select(this).attr("id") == temp[m]
    }).attr("cx");
    console.log(temp_x)
    temp_y = places.filter(function () {
      return d3.select(this).attr("id") == temp[m]
    }).attr("cy");
    //tk_color=d3.keys(need_color[m])[0]
    //tk_mark=tk_color+d3.values(need_color[m])[0]
    //console.log(tk_color)
    //console.log(tk_mark)
    //temp_Tk.push({ "cx": temp_x, "cy": temp_y,"token_color":tk_color,"token_mark":tk_mark})//输入库所托肯所在位置
    temp_Tk.push({ "cx": temp_x, "cy": temp_y })
  };
  for (n = 0; n < temp_1.length; n++) {
    temp_x = places.filter(function () {
      return d3.select(this).attr("id") == temp_1[n]
    }).attr("cx");
    temp_y = places.filter(function () {
      return d3.select(this).attr("id") == temp_1[n]
    }).attr("cy");
    xyend.push({ "cx": temp_x, "cy": temp_y })//输出库所所在位置，即托肯移动终点
  }
  tempTK = g1.selectAll("#nothing").data(temp_Tk).enter().append("circle")
    .attr("cx", function (d) { return d.cx; })
    .attr("cy", function (d) { return d.cy; })
    .attr("r", tk_r)
  //.attr("fill",function(d){return colors(d.token_color)})
  //.attr('id',function(d){return d.token_mark})
  //.attr("fill", trans_color)
  tempTK.each(function () {
    d3.select(this).transition().duration(token_v) //前半段托肯移动delays
      .attr("cx", Number(xymid[0].cx) + 4)
      .attr("cy", Number(xymid[0].cy) + 25).remove();
  })
  //console.log("托肯移动前半段")
  setTimeout(function () {
    tempTK1 = g1.selectAll("#nothing").data(xyend).enter().append("circle")
      .attr("cx", Number(xymid[0].cx) + 4)
      .attr("cy", Number(xymid[0].cy) + 25)
      //.attr("endcx",function(){})
      .attr("r", tk_r)
    //.attr("fill", trans_color)

    tempTK1.each(function () {
      d3.select(this).transition().delay(token_v * 0).duration(token_v) //变迁激发delays和后半段托肯移动delays
        .attr("cx", function (d) { return d.cx })
        .attr("cy", function (d) { return d.cy }).remove();//
    })
  }, token_v);
  //console.log("托肯移动后半段")
}

function save_data() {
  // console.log(d3.selectAll('rect')["_groups"][0])

  const output_json = save_json()
  console.log(output_json)
  $.support.cors = true

  saveJSON(output_json, "position.json")
}
function save_json() {
  input_places = d3.selectAll('circle')["_groups"][0]
  console.log(input_places)
  formatting_places = Array.apply(null, input_places)
    .map(nodes => nodes.__data__)
    .filter(item => item.id) // 过滤掉没id的临时合成节点
    .map(nodes => { return { id: nodes.id, cx: nodes.x, cy: nodes.y } })

  transitions = d3.selectAll('rect')["_groups"][0]
  formatting_transitions = Array.apply(null, transitions)
    .map(nodes => nodes.__data__)
    .filter(item => item && item.id) // 添加空值检查和id过滤
    .map(nodes => {
      return {
        id: nodes.id,
        x: nodes.x || nodes.cx, // 兼容不同属性名
        y: nodes.y || nodes.cy
      }
    })

  places_location = position_json || {}

  var name_of_pn = $("#input_petriName_tosave").val() || "对象petri网"
  const translate = $('g')[0].attributes.transform.value

  //更改了jsono格式
  const output_json = {
    "title": name_of_pn,
    "keyword": "fixed_position",
    "timestamp": (new Date()).valueOf(),
    "places": formatting_places,
    "transitions": formatting_transitions,
    //"links": formatting_arcs,
    "fixed_positions": places_location,
    "parameters": {
      // token_v,
      // distance_row,
      // distance_col,
      // translate,
      token_v: token_v || 0,
      distance_row: distance_row || 0,
      distance_col: distance_col || 0,
      translate: translate,
    }
  }
  return output_json
}
    
//****************************************保存数据为JSON******************************************
function saveJSON(data, filename) {
  if (!data) {
    alert('data is null');
    return;
  }
  if (!filename) {
    filename = 'json.json'
  }
  if (typeof data === 'object') {
    data = JSON.stringify(data, undefined, 4)
  }
  var blob = new Blob([data], { type: 'text/json' });
  // var e = document.createEvent('MouseEvents');
  // var a = document.createElement('a');
  // a.download = filename;
  // a.href = window.URL.createObjectURL(blob);
  // a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  // e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  // a.dispatchEvent(e);
  var a = document.createElement('a');
  a.download = filename;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');

  // 创建点击事件并触发下载
  var clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  a.dispatchEvent(clickEvent);

}

// 兜底函数，防止代码再次崩溃
function getGroupElementsPositions() {
    // 啥也不做，直接跳过
}
function monitor_selection() {
    // 啥也不做，直接跳过
}

function WebSocketTest() {
  //当前浏览器是否支持websocket
  if ("WebSocket" in window) {
    // 打开一个 web socket
    // ws = new WebSocket("ws://169.254.192.79:5501");
    //ws = new WebSocket("ws://10.100.27.63:41840");
    //ws = new WebSocket("ws://192.168.1.169:8080");
    ws = new WebSocket("ws://127.0.0.1:41840");
    console.log("Try  Web Socket")
    // 连接建立后的回调函数
    ws.onopen = function () {
      console.log("Web Socket 已连接上")
      // Web Socket 已连接上，使用 send() 方法发送数据
      ws.send("admin:123456");
      // alert("正在发送：admin:123456");
    };
    // 接收到服务器消息后的回调函数
    ws.onmessage = function (evt) {
      var received_msg = evt.data;
      //var received_infor = received_msg.split(",");
      //console.log(received_infor)
      if (received_msg.indexOf("sorry") == -1) {
        /*  $.getJSON("Place_1.json",function(data){
            Place_=data ; 
            ws.send(0)
            console.log("there is a new file")
            console.log(Place_) */
        if (received_msg != "connected!") {
          console.log(received_msg)
          received_trans(received_msg)
          //setTimeout(function () { ws.send("hello c++ ,i am browser") }, 1000);
        }
        else {
          console.log(received_msg)
        }
      };
      // 连接关闭后的回调函数
      ws.onclose = function () {
        console.log("connection has been closed")
      };
    }
  }
}

// 🌟 D3 万能自动居中缩放函数
/*function autoCenterAndZoom() {
    // 获取 SVG 画布和主编组 <g> (师兄的代码通常是画在 svg 的第一个 g 标签里)
    var svgElement = d3.select("svg");
    var gElement = svgElement.select("g");
    
    if (gElement.empty()) return;

    // 获取当前图形的实际边界大小
    var bounds = gElement.node().getBBox();
    
    // 获取当前屏幕的可视区域大小
    var fullWidth = svgElement.node().clientWidth || window.innerWidth;
    var fullHeight = svgElement.node().clientHeight || window.innerHeight;

    var width = bounds.width;
    var height = bounds.height;
    var midX = bounds.x + width / 2;
    var midY = bounds.y + height / 2;

    if (width === 0 || height === 0) return; // 如果图还没画出来，就不缩放

    // 计算缩放比例 (0.85 是为了给边缘留 15% 的空白呼吸感，不至于顶着屏幕边框)
    var scale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
    
    // 限制最大和最小缩放倍数，防止过大或过小
    scale = Math.max(0.1, Math.min(scale, 2));

    // 计算平移距离，把中心点挪到屏幕正中央
    var translate = [
        fullWidth / 2 - scale * midX, 
        fullHeight / 2 - scale * midY
    ];

    // 假设师兄定义了 zoom 变量，或者我们直接获取 svg 上的 zoom 行为
    // 执行带有 750 毫秒丝滑动画的居中缩放
    svgElement.transition()
        .duration(750)
        .call(
            d3.zoom().transform, 
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
}
// 等 1.5 秒钟，让 D3 把图画完/抖完，然后一把拉回屏幕中央
//setTimeout(autoCenterAndZoom, 1500);*/

// 🌟 终极方案：添加悬浮按钮 + 完美自适应居中
function setupCenterButton() {
    // 1. 创建一个美观的悬浮按钮
    var btn = document.createElement("button");
    btn.innerHTML = "🎯 一键居中";
    btn.style.position = "fixed";
    btn.style.bottom = "40px";
    btn.style.right = "40px";
    btn.style.zIndex = "9999";
    btn.style.padding = "10px 20px";
    btn.style.fontSize = "14px";
    btn.style.fontWeight = "bold";
    btn.style.color = "#fff";
    btn.style.backgroundColor = "#409EFF";
    btn.style.border = "none";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";

    // 2. 居中核心逻辑
    // 🌟 强力诊断版居中逻辑
    btn.onclick = function() {
        var svg = d3.select("svg");
        
        // 尝试获取所有顶层 g 标签，计算一个最大的包裹框
        var gElements = svg.selectAll(":scope > g").nodes();
        var targetG = svg.select("g"); // 默认先取第一个
        
        var bounds = targetG.node().getBBox();
        // ✅ 拨乱反正：忽略 SVG 的假尺寸，获取 iframe 真实的可见长宽
        var fullWidth = window.innerWidth;
        var fullHeight = window.innerHeight;

        console.log("================ 🔍 诊断报告 ================");
        console.log("🖥️ 1. 画布大小 (Width x Height):", fullWidth, "x", fullHeight);
        console.log("📦 2. 探测到的图形边界 (BBox):", bounds);
        
        if (bounds.width === 0 || bounds.height === 0 || isNaN(bounds.width)) {
            console.error("❌ 致命错误：测量到图形大小为 0！可能是选错了容器，请按 F12 检查 Elements (元素) 标签，看 <svg> 下面到底有几个 <g>！");
            alert("图大小为0，居中失败，请看控制台红字！");
            return;
        }

        var midX = bounds.x + bounds.width / 2;
        var midY = bounds.y + bounds.height / 2;
        var scale = 0.85 / Math.max(bounds.width / fullWidth, bounds.height / fullHeight);
        
        console.log("📏 3. 原始计算缩放比:", scale);
        scale = Math.max(0.01, Math.min(scale, 1.5)); // 允许无限缩小，最大放大1.5倍
        
        var translateX = fullWidth / 2 - scale * midX;
        var translateY = fullHeight / 2 - scale * midY;

        console.log("🚀 4. 最终位移指令: X=", translateX, " Y=", translateY, " Scale=", scale);
        console.log("===========================================");

        // 执行位移
        targetG.transition().duration(750).attr("transform", "translate(" + translateX + "," + translateY + ") scale(" + scale + ")");
        try { svg.node().__zoom = d3.zoomIdentity.translate(translateX, translateY).scale(scale); } catch(e) {}
    };

    // 鼠标悬停特效
    btn.onmouseover = function() { btn.style.backgroundColor = "#66b1ff"; };
    btn.onmouseout = function() { btn.style.backgroundColor = "#409EFF"; };

    // 把按钮挂载到页面上
    document.body.appendChild(btn);

    // 3. 智能自动触发：
    // 等 6 秒钟，力导向图基本上“炸”完、散开稳定了，自动帮你点一次按钮！
    setTimeout(function() {
        console.log("⏳ 等待力导向图散开，触发自动居中...");
        btn.onclick();
    }, 6000);
}

// 延迟 1 秒加载按钮，确保整个页面 DOM 准备就绪
setTimeout(setupCenterButton, 1000);