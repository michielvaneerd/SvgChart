var $ = function(sel, el) {
  return (el || document).querySelector(sel);
};

var $$ = function(sel, el) {
  return (el || document).querySelectorAll(sel);
};

function executeGraph(graphId) {
  var canvas = $("#" + graphId);
  var newCanvas = document.createElement("canvas");
  newCanvas.id = graphId;
  newCanvas.width = 400;
  newCanvas.height = 300;
  if (!canvas) {
    var a = $("a[data-canvasid='" + graphId + "']");
    if (a) {
      a.parentNode.replaceChild(newCanvas, a);
      a = null;
    }
  } else {
    canvas.parentNode.replaceChild(newCanvas, canvas);
  }
  
  var pre = $("textarea[data-id='" + graphId + "']");
  try {
    eval(pre.value);
  } catch (ex) {
    alert(ex);
  }
}

Array.prototype.forEach.call($$("textarea"), function(pre) {
  executeGraph(pre.getAttribute("data-id"));
});