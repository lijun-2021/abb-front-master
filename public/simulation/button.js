function stopsimulation(){
    if(simulationIsEnable)
    { //simulation.stop();
      simulationIsEnable=false;
    }
    else
      //alert("simulation has been stoped");
      console.log("simulation has been stoped");
  }
  function restartsimulation(){
    simulation.alphaTarget(.2).restart();
    simulationIsEnable=true;
  }

  function stop_play() {
    // 停止演化
    clearTimeout(timer)
    setTimeout(function () {
      start(svg);
      update(svg, g1);
  
    }, token_v * 2);
  }
  
 
  