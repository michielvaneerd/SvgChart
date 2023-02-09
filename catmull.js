// For retina displays
var SCALE = window.devicePixelRatio || 1.0;

// The spline segments per curve
var SPLINE_STEPS=50;

var X = 0,
  Y = 1,
  T = 2;

$(function() {

  // our canvas and drawing context
  var canvas = document.getElementById('spline_canvas');
  var ctx = canvas.getContext('2d');

  // our veritable height and width constants
  var W = canvas.width;
  var H = canvas.height;

  // double-resolution on retina displays
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;

  // test path
  var path = getSplinePath([
    [0.1 * W, 0.3 * H],
    [0.3 * W, 0.3 * H],
    [0.4 * W, 0.3 * H],
    [0.6 * W, 0.3 * H],
    [0.7 * W, 0.5 * H],
    [0.8 * W, 0.1 * H],
    [0.9 * W, 0.2 * H]
  ]);

  
  render(0);
  
  var pct;
  
  function render(t) {

    console.log(path);
    
    ctx.save();
    ctx.scale(SCALE, SCALE);
    
    pct = Math.pow( t%4000/4000, 0.8);
    ctx.clearRect(0, 0, W, H);
    
    
    // Draw thin line across the entire set of points.
    ctx.strokeStyle = "#ace";
    ctx.lineWidth = 2.5;
    ctx.lineCap="round";
    drawSplineCurve(path, ctx);
    
    // ctx.strokeStyle = "#135";
    // ctx.lineWidth = 7.5;

    
    // var pct = pct * 1.4; // so we "go off the end"
    // drawSplineCurve(path, ctx, pct-.3, pct);
    //ctx.lineStyle = "#00f";
    //drawSplineCurve(path, ctx, pct - .05, pct);
    
    ctx.fillStyle = "#333";
    drawPathPoints(path, ctx);
    
    ctx.restore();
    
    //requestAnimationFrame( render );
  }

  function drawPathPoints(path, ctx) {
    _.each(path, function(pt) {
      ctx.beginPath();
      ctx.arc(pt[X], pt[Y], 9.5, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  

  /**
   * Renders a spline curve through a "path", an array of 2D points [[x,y][...]]
   */
  function drawSplineCurve(path, ctx, start_pct, end_pct) {

    if (typeof start_pct == 'undefined') start_pct = 0;
    if (typeof end_pct == 'undefined') end_pct = 1.0;

    // clamp start and end vals
    start_pct = Math.max(0, Math.min(start_pct, 1.0));
    end_pct = Math.max(0, Math.min(end_pct, 1.0));

    var p, x, y, i, j;
    var p0, p1, p2, p3;
    var n = path.length;
    var path_dist = path.slice(-1)[0][T];
    var start_dist = start_pct * path_dist;
    var end_dist = end_pct * path_dist;

    // starting and ending indexes
    var start_idx = getSplineIndexForPercent(path, start_pct);
    var end_idx = getSplineIndexForPercent(path, end_pct);

    ctx.beginPath();

    var t = start_dist;

    for (i = start_idx; i < Math.min(end_idx + 1, n); i++) {
      p = path[i];
      x = p[X];
      y = p[Y];
      p0 = path[Math.max(0, (i - 1))];
      p1 = path[i];
      p2 = path[Math.min((i + 1), n - 1)];
      p3 = path[Math.min((i + 2), n - 1)];

      // find pct to start at
      var sub_start_pct = 0;
      var sub_end_pct = 1.0;
      var steps = SPLINE_STEPS;
      var seg_len = (p2[T] - p1[T]);
      if (i == start_idx) {
        sub_start_pct = (start_dist - p1[T]) / seg_len;
      }
      if (i == end_idx && start_idx != n) {
        sub_end_pct = (end_dist - p1[T]) / seg_len;
      }

      // render catmull-rom spline curve
      var first_point = true,
        qx, qy;
      for (j = sub_start_pct; j <= sub_end_pct; j += (1.0 / steps)) {
        t = (path[i][T] + seg_len * j);
        qx = spline(p0[X], p1[X], p2[X], p3[X], j);
        qy = spline(p0[Y], p1[Y], p2[Y], p3[Y], j);
        if (first_point) {
          ctx.moveTo(qx, qy);
          first_point = false;
        } else {
          ctx.lineTo(qx, qy);
        }
      }
      // make sure we complete the line
      qx = spline(p0[X], p1[X], p2[X], p3[X], sub_end_pct);
      qy = spline(p0[Y], p1[Y], p2[Y], p3[Y], sub_end_pct);

      ctx.lineTo(qx, qy);

    }
    ctx.stroke();
  }

  // catmull-rom spline
  // http://www.mvps.org/directx/articles/catmull/
  function spline(p0, p1, p2, p3, t) {
    return 0.5 * ((2 * p1) + t * ((-p0 + p2) + t * ((2 * p0 - 5 * p1 + 4 * p2 - p3) + t * (-p0 + 3 * p1 - 3 * p2 + p3))));
  }

  // Update the path with distance stamps for each coordinate
  function getSplinePath(path) {
    // don't touch original config data
    path = _.map(path, _.clone);

    // calculate distances (like time stamps for each point on the path)
    var d = 0;
    _.each(path, function(p1, i) {
      if (i > 0) {
        var p0 = path[i - 1];
        d += distance(p0, p1);
      }
      // add distance/time stamp to pt (assuming fixed speed for now)
      p1[T] = d;
    });
    return path;
  }
  
  // find the index for the last point/keyframe before the percent
  function getSplineIndexForPercent(path, percent) {
    // uses pre-computed distances
    var path_dist = path.slice(-1)[0][T];
    var current_dist = percent * path_dist;
    var point_idx = -1;
    var n = path.length;
    // find most recently passed keyframe
    for (var i = 0; i < n; i++) {
      // find last keyframe
      if (path[i][T] <= current_dist) {
        point_idx = i;
      } else {
        continue;
      }
    }
    
    return point_idx;
  }

  function distance(p1, p2) {
    var dx = p2[X] - p1[X];
    var dy = p2[Y] - p1[Y];
    return Math.sqrt(dx * dx + dy * dy);
  }

});