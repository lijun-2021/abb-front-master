//确定框选到的元素
function monitor_selection() {
    var selectionRect = svg.append("rect")
      .attr("class", "selection-rect")  // 可以添加一个 CSS 类
    var startX, startY, isSelecting = false;
  
    svg.on("mousedown", function (event) {
      console.log('调用mousedown')
      // svg.on(".zoom", null);
      startX = d3.event.x;
      startY = d3.event.y;
  
      if (d3.event.ctrlKey) {
        console.log('按下ctrl键')
        // 如果按下 Ctrl 键，表示框选     
        //d3.event.preventDefault();
        isSelecting = true;
        selectionRect.attr("x", startX).attr("y", startY).attr("width", 0).attr("height", 0).style("display", "block");
      } else {
        if (isSelecting) {
          var x = parseFloat(selectionRect.attr("x"));
          var y = parseFloat(selectionRect.attr("y"));
          var width = parseFloat(selectionRect.attr("width"));
          var height = parseFloat(selectionRect.attr("height"));
          // console.log(x)
          // console.log(y)
          // console.log(width)
          // console.log(height)
  
          var elementX, elementY;
          d3.selectAll('.circle').each(function (d, i) {
            elementX = parseFloat(d3.select(this).attr("temp_x"));
            elementY = parseFloat(d3.select(this).attr("temp_y"));
            //console.log(d3.select(this).attr('id'), 'elementX', elementX, 'elementY', elementY)
            var isInSelection = (elementX >= x && elementX <= x + width && elementY >= y && elementY <= y + height);
            //console.log(isInSelection)
            if (isInSelection) {
              console.log('该元素被选中', d3.select(this).attr('id'))
              d3.select(this).classed('selected' + time, true).attr('fill', 'blue')
            }
          })
          d3.selectAll('.rect').each(function (d, i) {
            elementX = parseFloat(d3.select(this).attr("temp_x"));
            elementY = parseFloat(d3.select(this).attr("temp_y"));
            //console.log(d3.select(this).attr('id'), 'elementX', elementX, 'elementY', elementY)
            var isInSelection = (elementX >= x && elementX <= x + width && elementY >= y && elementY <= y + height);
            if (isInSelection) {
              console.log('该元素被选中', d3.select(this).attr('id'))
              d3.select(this).classed('selected' + time, true).attr('fill', 'blue')
            }
          })
          d3.selectAll('text').each(function (d, i) {
            //console.log('判断选中文字')
            elementX = parseFloat(d3.select(this).attr("temp_x"));
            elementY = parseFloat(d3.select(this).attr("temp_y"));
            //console.log('判断选中',elementX,elementY)
            var isInSelection = (elementX >= x && elementX <= x + width && elementY >= y && elementY <= y + height);
            if (isInSelection) {
              console.log('该文字被选中')
              d3.select(this).classed('selected' + time, true).attr('fill', 'blue')
            }
          })
          d3.selectAll('.links').each(function (d, i) {
            var elementX = parseFloat(d3.select(this).attr("temp_x"));
            var elementY = parseFloat(d3.select(this).attr("temp_y"));
            var elementX1 = parseFloat(d3.select(this).attr("temp_x1"));
            var elementY1 = parseFloat(d3.select(this).attr("temp_y1"));
            var isInSelection = (elementX >= x && elementX <= x + width && elementY >= y && elementY <= y + height && elementX1 >= x && elementX1 <= x + width && elementY1 >= y && elementY1 <= y + height);
            if (isInSelection) {
              console.log('该直线被选中')
              d3.select(this).classed('selected' + time, true).attr('fill', 'blue')
            }
            else if ((elementX >= x && elementX <= x + width) && elementY >= y && elementY <= y + height) {//箭头起点在选框中
              d3.select(this).classed('half_init_selected' + time, true)
            }
            else if ((elementX1 >= x && elementX1 <= x + width) && elementY1 >= y && elementY1 <= y + height) {//箭头点在选框中
              d3.select(this).classed('half_end_selected' + time, true)
            }
          })
          // 结束框选
          //selectionRect.style("display", "none");
          isSelecting = false;
          select_end = true;
          // 可以在这里触发框选结束后的处理逻辑
          console.log("框选结束，选框坐标：" + x + ", " + y + ", 宽度：" + width + ", 高度：" + height);
          if (select_end) {
            console.log(select_end)
            var customContextMenu = document.getElementById("customContextMenu");
  
            // 监听右键菜单事件
            document.addEventListener("contextmenu", function (event) {
              // 阻止默认右键菜单
              event.preventDefault();
  
              // 在鼠标位置显示自定义菜单
              customContextMenu.style.left = event.pageX + "px";
              customContextMenu.style.top = event.pageY + "px";
  
              // 显示自定义菜单
              customContextMenu.style.display = "block";
            });
  
            // 点击页面任意位置关闭自定义菜单
            document.addEventListener("click", function (event) {
              customContextMenu.style.display = "none";
            });
            var option1 = document.getElementById("option1");
            var option2 = document.getElementById("option2");
            option1.addEventListener("click", fold_macro_place)
            //option2.addEventListener("click", new_unfold_function)
            // 在这里调用相应的函数              
          }
        } else {
          // 开始拖动整个页面
          d3.select(this).style("cursor", "grabbing");
        }
        selectionRect.style("display", "none");
      }
  
    });
  
    svg.on("mousemove", function (event) {
      //console.log('调用mousemove')
      if (isSelecting) {
        var width = d3.event.x - startX;
        var height = d3.event.y - startY;
        //console.log(width)
        //console.log(height)
        selectionRect.attr("width", width).attr("height", height);
      }
    });
  
  
  }
  //对选框操作，确定被选中元素要折叠的位置，调用折叠函数
  function fold_macro_place() {
    var temp_x_values_array = [];
    var temp_y_values_array = [];
    var selector = "selected" + time;
    d3.selectAll("." + selector).each(function (d, i) {
      var temp_x_value = parseFloat(d3.select(this).attr("temp_x"));
      var temp_y_value = parseFloat(d3.select(this).attr("cy"));
      temp_x_values_array.push(temp_x_value);
      temp_y_values_array.push(temp_y_value);
    });
    //console.log(temp_x_values_array)
  
    //d3.selectAll(".selected").data().map(function(d) {return d.temp_y})
    // 计算被选中元素的最大最小值
    var minX = d3.min(temp_x_values_array)
    var minY = d3.min(temp_y_values_array);
    var maxX = d3.max(temp_x_values_array);
    var maxY = d3.max(temp_y_values_array);
  
    // 计算矩形的宽度和高度
    var width = maxX - minX;
    var height = maxY - minY;
    console.log("矩形宽度和高度", width, height);
  
    // 计算矩形中心点的坐标
    var centerX = minX + width / 2;
    // var centerY = minY + height / 2 + Place_r / 2;
    let centerY = 0;
    if(minY < 0 && maxY < 0) {
      centerY = maxY;
    }else{
      centerY = minY;
    }
  
    // 中心点的坐标即为要折叠到的位置
    console.log("中心点坐标：", centerX);
    console.log("中心点坐标：", centerY);
    // 获取被选中元素的中心位置
    //var center = getCenter(selectedElements);
  
    // 移动所有被选中的元素到中心位置
    // selectedElements.transition()
    //   .duration(500)  // 设置过渡的持续时间，单位是毫秒
    //   .attr(transform, "translate(" + centerX + "," + centerY + ")");
  
    new_fold_function(centerX, centerY)
    customContextMenu.style.display = "none";
    select_end = false;
  }
  //经过缩放平移所有元素相对于g组的位置
  function getGroupElementsPositions(groupElement, transformed) {//相对g的位置
    //console.log('更新位置')
    var elements = groupElement.selectAll("*"); // 选择所有子元素
    //console.log(transformed.k)
    elements.each(function (d) {
      var element = d3.select(this);
      var elementType = element.node().tagName.toLowerCase(); // 获取元素类型
  
      if (elementType === "circle" || elementType === "rect") { // 如果是圆形或矩形
        var x, y;
        if (element.attr("cx") !== null && element.attr("cy") !== null) { // 如果是圆形
          x = +element.attr("cx") * transformed.k + transformed.x;
          y = +element.attr("cy") * transformed.k + transformed.y;
          element.attr("temp_x", x).attr("temp_y", y);
        } else if (element.attr("x") !== null && element.attr("y") !== null) { // 如果是矩形
          x = +element.attr("x") * transformed.k + transformed.x;
          y = +element.attr("y") * transformed.k + transformed.y;
          element.attr("temp_x", x).attr("temp_y", y);
        }
        //console.log(element.attr('id'), "Element position:", x, y);
      } else if (elementType === "text") {//如果是文字
        var temp_x = +element.attr("x") * transformed.k + transformed.x;
        var temp_y = +element.attr("y") * transformed.k + transformed.y;
        element.attr("temp_x", temp_x).attr("temp_y", temp_y);
        //console.log("Element position:", temp_x, temp_y);
      } else if (elementType === "line") { // 如果是直线
        var x1 = +element.attr("x1") * transformed.k + transformed.x;
        var y1 = +element.attr("y1") * transformed.k + transformed.y;
        var x2 = +element.attr("x2") * transformed.k + transformed.x;
        var y2 = +element.attr("y2") * transformed.k + transformed.y;
        element.attr("temp_x", x1).attr("temp_y", y1).attr("temp_x1", x2).attr("temp_y1", y2);
        //console.log("Element position:", { x1: x1, y1: y1, x2: x2, y2: y2 });
      }
      // 可以根据需要处理其他类型的元素
    });
  }
  function update_token_position() {
    var remo = svg.selectAll("circle").filter(function (d, i) {
      return d3.select(this).attr("class") == "node"
    });//选中所有托肯
    var nodesNum = 0;
    var token = [];
    places.each(function (d, i) {//为库所托肯确定位置
      //console.log(d3.select(this).property("token_color_num"))
      nodesNum = d3.sum(d3.select(this).property("token_color_num"))
      //console.log(nodesNum)
      if (nodesNum > 0) {
        if (nodesNum == 1) {
          for (i = 0; i < d3.select(this).property("token_color_num").length; i++) {
            if (d3.select(this).property("token_color_num")[i] != 0) {
              token.push({
                cx: Number(d3.select(this).attr("cx")), cy: Number(d3.select(this).attr("cy")), r: tk_r, tk_color: d3.select(this).property("token_color")[i]
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
                  cx: cx1, cy: cy1, r: tk_r, tk_color: d3.select(this).property("token_color")[m]
                })
              }
            }
          }
        }
      }
    });
    remo.data(token) //托肯的位置
      .attr("class", "node")
      .attr("cx", function (d) { return d.cx; })
      .attr("cy", function (d) { return d.cy; })
      .attr("r", function (d) { return d.r; })
  
  
  }
  function update_macroPlace_token_position(Place_x, Place_y, token_place_id) {
    var nodesNum;
    var token = [];
    var remo = svg.selectAll("circle").filter(function (d, i) {
      return d3.select(this).attr("class") == "node"
    });//选中所有托肯
    places.each(function (d, i) {//为库所托肯确定位置
      nodesNum = d3.sum(d3.select(this).property("token_color_num"))
      if (nodesNum > 0) {
        if (nodesNum == 1) {
          for (i = 0; i < d3.select(this).property("token_color_num").length; i++) {
            if (d3.select(this).property("token_color_num")[i] != 0) {
              if (token_place_id.includes(d3.select(this).attr('id'))) {  //
                token.push({
                  cx: Place_x, cy: Place_y, r: tk_r, tk_color: d3.select(this).property("token_color")[i]
                })
              }
              else {
                token.push({
                  cx: Number(d3.select(this).attr("cx")), cy: Number(d3.select(this).attr("cy")), r: tk_r, tk_color: d3.select(this).property("token_color")[i]
                })
              }
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
                if (token_place_id.includes(d3.select(this).attr('id'))) {
                  var cx1 = Place_x + 5 * Math.cos(pp * 2 * Math.PI / nodesNum)
                  var cy1 = Place_y + 5 * Math.sin(pp * 2 * Math.PI / nodesNum)
                  token.push({
                    cx: cx1, cy: cy1, r: tk_r, tk_color: d3.select(this).property("token_color")[m]
                  })
                }
                else {
                  var cx1 = Number(d3.select(this).attr("cx")) + 5 * Math.cos(pp * 2 * Math.PI / nodesNum)//
                  var cy1 = Number(d3.select(this).attr("cy")) + 5 * Math.sin(pp * 2 * Math.PI / nodesNum)
                  token.push({
                    cx: cx1, cy: cy1, r: tk_r, tk_color: d3.select(this).property("token_color")[m]
                  })
                }
              }
            }
          }
        }
      }
    });
    remo.data(token) //托肯的位置
      .attr("class", "node")
      .transition()
      .duration(500) // 过渡时间
      .attr("cx", function (d) { return d.cx; })
      .attr("cy", function (d) { return d.cy; })
      .attr("r", function (d) { return d.r; })
    remo.raise();
  
  }
  
  //框选元素的折叠函数
  function new_fold_function(newX, newY) {
    var temp_time = time
    var selector = "selected" + time;
    newX = (newX - transformed.x) / transformed.k;//转换为相对于g位置
    //newY = (newY - transformed.y) / transformed.k;
    console.log('newX', newX, newY);
    var token_place_id = [];
    var Place_x = newX;
    var Place_y = newY;
  
    // 创建宏库所及文本
    var macro_place = g1.append('circle')
      .attr('id', 'macro_place' + time)
      .attr('cx', newX)
      .attr('cy', newY)
      .attr('r', Place_r)
      .attr("fill", "white")
      .style('opacity', 1)
      .attr("stroke-width", 5.5)
      .attr("stroke", "red")//cx cy
      .property("token_color", null)
      .property("token_color_num", 0)
      .on("click", function () { new_unfold_function(d3.select(this).attr('id'), temp_time) });
    var macro_text = g1.append("text")
      .attr("id", 'textElement' + "selected" + temp_time)
      .attr("x", Place_x) // 根据圆心位置设置 x 坐标
      .attr("y", Place_y - 45)
      //.attr("dy", ".35em") // 垂直对齐方式
      .style("text-anchor", "middle") // 水平对齐方式
      .style("font-size", "200%")
      .text('macro_place' + time);
  
  
    d3.selectAll("." + selector).each(function () {
      var tagName = d3.select(this).node().tagName.toLowerCase();//.node()获取DOM元素 获取标签名
  
      if (tagName === "circle") {
        //console.log("这是一个圆形元素");
        console.log(d3.select(this).attr('id'), d3.select(this).attr('temp_x'), d3.select(this).attr('temp_y'))
        var token_num = d3.select(this).property("token_color_num")
        if (token_num) {
          token_place_id.push(d3.select(this).attr('id'))
        }
        var post_cx = parseFloat(d3.select(this).attr('temp_x'))
        var post_cy = parseFloat(d3.select(this).attr('temp_y'))
        //console.log('折叠前位置post_cy',post_cy,id)
        d3.select(this)
          .transition()
          .duration(500) // 过渡时间
          .attr("cx", Place_x)
          .attr("cy", Place_y)
          .attr('post_cx', post_cx)
          .attr('post_cy', post_cy)
          .style('opacity', 0)
          //.style("pointer-events", "none")
          .on('end', function () {
            d3.select(this).attr('fx', Place_x);
            d3.select(this).attr('fy', Place_y);
  
          })
      } else if (tagName === "rect") {
        //console.log("这是一个矩形元素");
        var post_x = parseFloat(d3.select(this).attr('temp_x'))
        var post_y = parseFloat(d3.select(this).attr('temp_y'))
        d3.select(this)
          .transition()
          .duration(500) // 过渡时间
          .attr('x', Place_x)
          .attr('y', Place_y)
          .attr('post_x', post_x)
          .attr('post_y', post_y)
          .style('opacity', 0)
          .style("pointer-events", "none")
          .on('end', function () {
            d3.select(this).attr('fx', Place_x);
            d3.select(this).attr('fy', Place_y);
            //console.log('target.fx', d3.select(this).attr('fx'));
          });
  
      } else if (tagName === "line") {
        //console.log("这是一个直线元素");
        var currentLine = d3.select(this)
        //console.log(currentLine)
        var post_x1 = parseFloat(currentLine.attr("temp_x"));
        var post_y1 = parseFloat(currentLine.attr("temp_y"));
        var post_x2 = parseFloat(currentLine.attr("temp_x1"));
        var post_y2 = parseFloat(currentLine.attr("temp_y1"));
  
        currentLine.attr('post_x1', post_x1)
          .attr('post_y1', post_y1)
          .attr('post_x2', post_x2)
          .attr('post_y2', post_y2)
          .transition()
          .duration(500)
          .attr('x1', Place_x)
          .attr('y1', Place_y)
          .attr('x2', Place_x)
          .attr('y2', Place_y)
          .style('opacity', 0)
          //.style("pointer-events", "none")
          .on("end", function () {
            currentLine.attr("source").fx = Place_x;
            currentLine.attr("source").fy = Place_y;
            currentLine.attr("target").fx = Place_x;
            currentLine.attr("target").fy = Place_y;
          })
      } else if (tagName === "text") {
        //console.log("这是一个文字元素");
        var current_text = d3.select(this)
        var post_x = current_text.attr('temp_x');
        var post_y = current_text.attr('temp_y');
        current_text.attr('post_x', post_x)
          .attr('post_y', post_y)
          .transition()
          .duration(500) // 过渡时间
          .attr('x', Place_x)
          .attr('y', Place_y)
          .style('opacity', 0)
          .style("pointer-events", "none")
          .on('end', function () {
            current_text.fx = Place_x;
            current_text.fy = Place_y;
            simulation.stop(); // 停止力导向图的模拟       
          })
      } else {
        console.log("未知类型的元素");
      }
    });
    //console.log(d3.selectAll("."+'half_init_selected'+half_selected_time))
    d3.selectAll("." + 'half_init_selected' + temp_time).each(function () {
      var currentLine = d3.select(this)
      var post_x1 = parseFloat(currentLine.attr("temp_x"));
      var post_y1 = parseFloat(currentLine.attr("temp_y"));
      currentLine.attr('post_x1', post_x1)
        .attr('post_y1', post_y1)
        .transition()
        .duration(500)
        .attr('x1', Place_x)
        .attr('y1', Place_y)
        //.style('opacity', 0)
        //.style("pointer-events", "none")
        .on("end", function () {
          currentLine.attr("source").fx = Place_x;
          currentLine.attr("source").fy = Place_y;
        })
    })
    d3.selectAll("." + 'half_end_selected' + temp_time).each(function () {
      var currentLine = d3.select(this)
      var post_x2 = parseFloat(currentLine.attr("temp_x1"));
      var post_y2 = parseFloat(currentLine.attr("temp_y1"));
      currentLine.attr('post_x2', post_x2)
        .attr('post_y2', post_y2)
        .transition()
        .duration(500)
        .attr('x2', Place_x)
        .attr('y2', Place_y)
        //.style('opacity', 0)
        //.style("pointer-events", "none")
        .on("end", function () {
          currentLine.attr("target").fx = Place_x;
          currentLine.attr("target").fy = Place_y;
        })
    })
    update_macroPlace_token_position(Place_x, Place_y, token_place_id)
    time++;
    //half_selected_time++;
  }
  function new_unfold_function(macroPlace, temp_time) {
    var token_place_id = []
    //console.log('#macro_place' + temp_time)
    d3.select('#macro_place' + temp_time).remove()
    d3.select('#' + 'textElement' + "selected" + temp_time).remove();
    d3.selectAll(".selected" + temp_time).each(function () {
      var tagName = d3.select(this).node().tagName.toLowerCase();//.node()获取DOM元素 获取标签名
      if (tagName === "circle") {
        console.log("这是一个圆形元素");
        //console.log(d3.select(this).attr('id'),d3.select(this).attr('temp_x'), d3.select(this).attr('temp_y'))
        var token_num = d3.select(this).property("token_color_num")
        if (token_num) {
          token_place_id.push(d3.select(this).attr('id'))
        }
        var post_cx = parseFloat(d3.select(this).attr('post_cx'))
        var post_cy = parseFloat(d3.select(this).attr('post_cy'))
        post_cx = (post_cx - transformed.x) / transformed.k;//转换为相对于g位置
        post_cy = (post_cy - transformed.y) / transformed.k;
        //console.log('折叠前位置post_cy',post_cy,id)
        d3.select(this)
          .transition()
          .duration(500) // 过渡时间
          .attr("cx", post_cx)
          .attr("cy", post_cy)
          .attr("fill", "white")
          .style('opacity', 1)
          //.style("pointer-events", "auto")
          .on('end', function () {
            d3.select(this).attr('fx', post_cx);
            d3.select(this).attr('fy', post_cy);
  
          })
      } else if (tagName === "rect") {
        console.log("这是一个矩形元素");
        var post_x = parseFloat(d3.select(this).attr('post_x'))
        var post_y = parseFloat(d3.select(this).attr('post_y'))
        post_x = (post_x - transformed.x) / transformed.k;//转换为相对于g位置
        post_y = (post_y - transformed.y) / transformed.k;
        d3.select(this)
          .transition()
          .duration(500) // 过渡时间
          .attr('x', post_x)
          .attr('y', post_y)
          .attr("fill", "white")
          .style('opacity', 1)
          //.style("pointer-events", "none")
          .on('end', function () {
            d3.select(this).attr('fx', post_x);
            d3.select(this).attr('fy', post_y);
            //console.log('target.fx', d3.select(this).attr('fx'));
          });
  
      } else if (tagName === "line") {
        console.log("这是一个直线元素");
        var currentLine = d3.select(this)
        //console.log(currentLine)
        var post_x1 = parseFloat(currentLine.attr("post_x1"));
        var post_y1 = parseFloat(currentLine.attr("post_y1"));
        var post_x2 = parseFloat(currentLine.attr("post_x2"));
        var post_y2 = parseFloat(currentLine.attr("post_y2"));
        post_x1 = (post_x1 - transformed.x) / transformed.k;//转换为相对于g位置
        post_y1 = (post_y1 - transformed.y) / transformed.k;
        post_x2 = (post_x2 - transformed.x) / transformed.k;//转换为相对于g位置
        post_y2 = (post_y2 - transformed.y) / transformed.k;
  
        currentLine.transition()
          .duration(500)
          .attr('x1', post_x1)
          .attr('y1', post_y1)
          .attr('x2', post_x2)
          .attr('y2', post_y2)
          .attr("fill", "white")
          .style('opacity', 1)
          //.style("pointer-events", "none")
          .on("end", function () {
            currentLine.attr("source").fx = post_x1;
            currentLine.attr("source").fy = post_y1;
            currentLine.attr("target").fx = post_x2;
            currentLine.attr("target").fy = post_y2;
          })
      } else if (tagName === "text") {
        console.log("这是一个文字元素");
        var current_text = d3.select(this)
        var post_x = current_text.attr('post_x');
        var post_y = current_text.attr('post_y');
        post_x = (post_x - transformed.x) / transformed.k;//转换为相对于g位置
        post_y = (post_y - transformed.y) / transformed.k;
        current_text.transition()
          .duration(500) // 过渡时间
          .attr('x', post_x)
          .attr('y', post_y)
          .attr("fill", "black")
          .style('opacity', 1)
          // .style("pointer-events", "none")
          .on('end', function () {
            current_text.fx = post_x;
            current_text.fy = post_y;
            simulation.stop(); // 停止力导向图的模拟       
          })
      } else {
        console.log("未知类型的元素");
      }
    })
    //console.log(d3.selectAll("."+'half_init_selected'+half_selected_time))
    d3.selectAll("." + 'half_init_selected' + temp_time).each(function () {
      console.log("执行展开操作");
      var currentLine = d3.select(this)
      var post_x1 = parseFloat(currentLine.attr("post_x1"));
      var post_y1 = parseFloat(currentLine.attr("post_y1"));
      post_x1 = (post_x1 - transformed.x) / transformed.k;//转换为相对于g位置
      post_y1 = (post_y1 - transformed.y) / transformed.k;
      console.log('post_x1', post_x1)
      currentLine
        .transition()
        .duration(500)
        .attr('x1', post_x1)
        .attr('y1', post_y1)
        .style('opacity', 1)
        //.style("pointer-events", "none")
        .on("end", function () {
          currentLine.attr("source").fx = post_x1;
          currentLine.attr("source").fy = post_y1;
        })
    })
    d3.selectAll("." + 'half_end_selected' + temp_time).each(function () {
      var currentLine = d3.select(this)
      var post_x2 = parseFloat(currentLine.attr("post_x2"));
      var post_y2 = parseFloat(currentLine.attr("post_y2"));
      post_x2 = (post_x2 - transformed.x) / transformed.k;//转换为相对于g位置
      post_y2 = (post_y2 - transformed.y) / transformed.k;
      currentLine.transition()
        .duration(500)
        .attr('x2', post_x2)
        .attr('y2', post_y2)
        .style('opacity', 1)
        //.style("pointer-events", "none")
        .on("end", function () {
          currentLine.attr("target").fx = post_x2;
          currentLine.attr("target").fy = post_y2;
        })
    })
    //更新托肯位置
    var nodesNum;
    var token = [];
    var remo = svg.selectAll("circle").filter(function (d, i) {
      return d3.select(this).attr("class") == "node"
    });//选中所有托肯
    places.each(function (d, i) {//为库所托肯确定位置
      nodesNum = d3.sum(d3.select(this).property("token_color_num"))
      if (nodesNum > 0) {
        var post_cx = parseFloat(d3.select(this).attr('post_cx'))
        var post_cy = parseFloat(d3.select(this).attr('post_cy'))
        post_cx = (post_cx - transformed.x) / transformed.k;//转换为相对于g位置
        post_cy = (post_cy - transformed.y) / transformed.k;
        if (nodesNum == 1) {
          for (i = 0; i < d3.select(this).property("token_color_num").length; i++) {
            if (d3.select(this).property("token_color_num")[i] != 0) {
              if (token_place_id.includes(d3.select(this).attr('id'))) {
                token.push({
                  cx: post_cx, cy: post_cy, r: tk_r, tk_color: d3.select(this).property("token_color")[i]
                })
              }
              else {
                token.push({
                  cx: Number(d3.select(this).attr("cx")), cy: Number(d3.select(this).attr("cy")), r: tk_r, tk_color: d3.select(this).property("token_color")[i]
                })
              }
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
                if (token_place_id.includes(d3.select(this).attr('id'))) {
                  console.log("计算托肯位置")
                  var cx1 = post_cx + 5 * Math.cos(pp * 2 * Math.PI / nodesNum)
                  var cy1 = post_cy + 5 * Math.sin(pp * 2 * Math.PI / nodesNum)
                  token.push({
                    cx: cx1, cy: cy1, r: tk_r, tk_color: d3.select(this).property("token_color")[m]
                  })
                }
                else {
                  var cx1 = Number(d3.select(this).attr("cx")) + 5 * Math.cos(pp * 2 * Math.PI / nodesNum)//
                  var cy1 = Number(d3.select(this).attr("cy")) + 5 * Math.sin(pp * 2 * Math.PI / nodesNum)
                  token.push({
                    cx: cx1, cy: cy1, r: tk_r, tk_color: d3.select(this).property("token_color")[m]
                  })
                }
              }
            }
          }
        }
      }
    });
    remo.data(token) //托肯的位置
      .attr("class", "node")
      .transition()
      .duration(500) // 过渡时间
      .attr("cx", function (d) { return d.cx; })
      .attr("cy", function (d) { return d.cy; })
      .attr("r", function (d) { return d.r; })
    remo.raise();
    //update_macroPlace_token_position(Place_x,Place_y,token_place_id);
    //ticked();;
  }