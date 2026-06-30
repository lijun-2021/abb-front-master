function save_macroPlace_data() {
    const output_json = save_macroPlace_json()
    //console.log(output_json)
    $.support.cors = true//开启跨域资源共享
    saveJSON(output_json, "macroPlace.json")//保存数据为json
  }
  
  function save_macroPlace_json() {
    var data = {};
    for (var i = 0; i < time; i++) {
      var temp_place = []//用于存放宏库所中包含的库所和变迁
      var temp_trans = []
      var temp_link = []
      var inner_object = {}//存放宏库所各种属性
      var node_object = {}//存放node及其属性包括库所及变迁
      var interface_object={}
      var interface_nodes=[];//存放对外接口节点
      var selectedElements = d3.selectAll('.selected' + i)
      var half_init_selectedElements=d3.selectAll('.half_init_selected'+i)//箭头起始节点被选中
      var half_end_selectedElements=d3.selectAll('.half_end_selected'+i)
      half_init_selectedElements.each(function(d){
        var element_id = d3.select(this).attr("source");
        interface_nodes.push(element_id)
      })
      half_end_selectedElements.each(function(d){
        var element_id = d3.select(this).attr("target");
        interface_nodes.push(element_id)
      })
      selectedElements.each(function (d) {
        var element = d3.select(this);     
        var elementType = element.node().tagName.toLowerCase(); // 获取元素类型
        if (elementType === "circle") { // 如果是圆形或矩形
          temp_place.push(element)
        }
        else if (elementType === "rect") {
          temp_trans.push(element)
        }
        else if (elementType === "line") {
          temp_link.push(element)
        }
      })
      var temp_node = temp_place.concat(temp_trans)
      var temp_id = temp_node.map(function (node) { return node.attr("id") })
      var temp1=[]
      for(var m=0;m<temp_place.length;m++){     
        temp1.push(place_json.find((item, index) => {return item.id == temp_place[m].attr("id")}))
      }
      var temp2=[];
      for(var n=0;n<temp_trans.length;n++){     
        temp2.push(transition_json.find((item, index) => {return item.id == temp_trans[n].attr("id")}))
      }
      var temp3=[];
      for(var p=0;p<temp_link.length;p++){         
        temp3.push(connections.find((item, index) => {return item.source.id == temp_link[p].attr("source")&&item.target.id == temp_link[p].attr("target")}))
      }
      
      var formatting_places = temp1.map(function (d, i) {    
        return {
          "target": d.target, "delay": d.delay, "capacity": d.capacity, "colors": d.colors,
          "token": d.token, "pre_arcs": d.pre_arcs, "post_arcs": d.post_arcs, "id": d.id
        }
      })
      var formatting_trans = temp2.map(function (d, i) { return { "colors": d.colors, "pre_arcs": d.pre_arcs, "post_arcs": d.post_arcs} })
      var formatting_nodes = formatting_places.concat(formatting_trans);
      var formatting_links = temp3.map(function (d, i) { return { "source": d.source.id, "target": d.target.id } })
      // var formatting_interface=interface_nodes.map(function(d,i){
      //   var temp=d3.select("#"+d)
      //   return{
      //     "target": d.target, "delay": d.delay, "capacity": d.capacity, "colors": d.colors,
      //     "token": d.token, "pre_arcs": d.pre_arcs, "post_arcs": d.post_arcs, "id": d.id
      //   }
      // })
     
      //console.log(formatting_nodes)
      var outerkey = "macro_place" + i;
      data[outerkey] = inner_object;
      inner_object["node"] = node_object;
      for (var j = 0; j < temp_id.length; j++) {
        node_object[temp_id[j]] = formatting_nodes[j]
      }
      //node_object[temp_id] = formatting_nodes
      inner_object["links"] = formatting_links//对象数组
      // for (var q = 0; q < interface_nodes.length; q++) {
      //   interface_object[interface_nodes[q]] = formatting_interface[q]
      // }
      inner_object["interface"] = interface_nodes//对外接口
    }
   // console.log(data)
    const output_json = {
      "title": "ColoredPetriNet",
      "description": "macro_place file",
      "keyword": "reduce place",
      data,
      // "macro_place": {
      //   "nodes":formatting_nodes,
      //   "links":formatting_links,
      //   "interface":formatting_interface
      // }
    } 
    return output_json
  }
  function saveJSON(data, filename) {
    if (!data) {//检查data是否为空
      alert('data is null');
      return;
    }
    if (!filename) {//检查文件名是否为空
      filename = 'json.json'
    }
    if (typeof data === 'object') {//判断数据类型是否为对象
      data = JSON.stringify(data, undefined, 4)//将data转为字符串，缩进4个空格
    }
    var blob = new Blob([data], { type: 'text/json' });//创建blob对象，存储data
    var e = document.createEvent('MouseEvents');
    var a = document.createElement('a');//创建下载链接
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);
  }