// 新增全局变量
var ganttData = [];
var ganttStartTime = Date.now();
var xTimeScale = d3.scaleLinear().domain([0, 0]).range([0, 1000]);
var yBandScale = d3.scaleBand().domain([]).range([50, 250]).padding(0.1);

function initGantt() {
  const ganttSvg = d3.select("#gantt-chart");

  // 创建时间轴
  ganttSvg.append("g")
    .attr("class", "time-axis")
    .attr("transform", "translate(0,280)");

  // 创建过渡动画控制按钮
  d3.select("#gantt-container")
    .append("button")
    .text("暂停/继续")
    .on("click", function () {
      simulationIsEnable = !simulationIsEnable;
    });
}

function updateGantt() {
  const maxTime = d3.max(ganttData, d => d.start + d.duration);
  const transitions = [...new Set(ganttData.map(d => d.id))];

  // 更新比例尺
  xTimeScale.domain([0, maxTime]);
  yBandScale.domain(transitions);

  const ganttSvg = d3.select("#gantt-chart");

  // 更新时间轴
  ganttSvg.select(".time-axis")
    .call(d3.axisBottom(xTimeScale)
      .selectAll("text")
      .style("font-size", "10px"));

  // 绑定数据
  const bars = ganttSvg.selectAll(".gantt-bar")
    .data(ganttData, d => d.id + d.start);

  // 进入
  bars.enter()
    .append("rect")
    .attr("class", "gantt-bar")
    .attr("y", d => yBandScale(d.id))
    .attr("height", yBandScale.bandwidth())
    .attr("x", d => xTimeScale(d.start))
    .attr("width", d => xTimeScale(d.duration))
    .attr("fill", d => d.color);

  // 更新
  bars.transition()
    .duration(500)
    .attr("x", d => xTimeScale(d.start))
    .attr("width", d => xTimeScale(d.duration));

  // 退出
  bars.exit().remove();

  // 添加标签
  ganttSvg.selectAll(".transition-label")
    .data(transitions)
    .enter()
    .append("text")
    .attr("class", "transition-label")
    .attr("y", d => yBandScale(d) + 15)
    .text(d => d);
}