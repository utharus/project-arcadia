
(function() {

  var requestAnimationFrame =  
    window.requestAnimationFrame       ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.msRequestAnimationFrame     ||
    window.oRequestAnimationFrame      ||
    function(callback) {
      return setTimeout(callback, 1);
    };


  var Input = {
    KEY: {
      'BACKSPACE': 8, 'TAB': 9, 'NUM_PAD_CLEAR': 12,
      'ENTER': 13, 'SHIFT': 16, 'CTRL': 17, 'ALT': 18, 'PAUSE': 19, 'CAPS_LOCK': 20, 'ESCAPE': 27, 'SPACEBAR': 32,
      'PAGE_UP': 33, 'PAGE_DOWN': 34, 'END': 35, 'HOME': 36,
      'ARROW_LEFT': 37, 'ARROW_UP': 38, 'ARROW_RIGHT': 39, 'ARROW_DOWN': 40,
      'PRINT_SCREEN': 44, 'INSERT': 45, 'DELETE': 46, 'SEMICOLON': 59, 'WINDOWS_LEFT': 91, 'WINDOWS_RIGHT': 92,
      'SELECT': 93,
      'NUM_PAD_ASTERISK': 106, 'NUM_PAD_PLUS_SIGN': 107, 'NUM_PAD_HYPHEN-MINUS': 109, 'NUM_PAD_FULL_STOP': 110,
      'NUM_PAD_SOLIDUS': 111,
      'NUM_LOCK': 144, 'SCROLL_LOCK': 145, 'SEMICOLON': 186, 'EQUALS_SIGN': 187, 'COMMA': 188, 'HYPHEN-MINUS': 189,
      'FULL_STOP': 190, 'SOLIDUS': 191, 'GRAVE_ACCENT': 192, 'LEFT_SQUARE_BRACKET': 219, 'REVERSE_SOLIDUS': 220,
      'RIGHT_SQUARE_BRACKET': 221, 'APOSTROPHE': 222
    }
  };
  
  var Circle = function(game) {
    var radius = 20;
    var x = Math.random() * (game.width);
    var y = Math.random() * (game.height);
    
    var dx = .1;
    var dy = .1;
    
    this.update = function(dt) {
      
      x += dx * dt;
      y += dy * dt;
    
      if(x - radius <= 0) { x = radius + 1; dx *= -1 };
      if(y - radius <= 0) { y = radius + 1; dy *= -1 };
      if(x + radius >= game.width)  { x = game.width - radius - 1; dx *= -1 };
      if(y + radius >= game.height) { y = game.height - radius- 1; dy *= -1 };
      
      // console.log((x + radius) +' >= '+ (game.width));
      
      return true;
    };
    
    this.render = function() {
      // console.log('Circle::render()');
      // console.log('Circle::render() - arc('+x+', '+y+', '+ radius +', ...)');
      
      game.getContext().beginPath();
      game.getContext().arc(x, y, radius, 0, Math.PI * 2, true);
      game.getContext().closePath();
      game.getContext().fillStyle = "red";
      game.getContext().strokeStyle = "black";
      game.getContext().fill();
      game.getContext().stroke();
      return true;
    };
  };
  
  var Game = function() {
    var isRunning = true;
    var isUpdated = true;
    var canvas    = document.getElementById('canvas');
    
    var context   = canvas.getContext('2d');
    
    this.getContext = function() { return context; };
    
    this.width  = 640;
    this.height = 360;
    
    // console.log(context);
    
    var entities = { }
    var events = { };
    
    canvas.addEventListener('mousedown', function(event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      event.cancelBubble = true;
      events[event.timeStamp] = event;
    }, false);  
    
    canvas.addEventListener('mouseup', function(event) {
      event.preventDefault();
      // events[event.timeStamp] = event;
    }, false);
    
    canvas.addEventListener('contextmenu', function(event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      event.cancelBubble = true;
      return false;
    }, false);
    
    window.addEventListener('keydown', function(event) {
      event.preventDefault();
      events[event.timeStamp] = event;
    });
    
    window.addEventListener('keyup', function(event) {
      event.preventDefault();
      // events[event.timeStamp] = event;
    }, false);
    
    var u = 0;
    var update = function(dt) {
      u++
      tick();
      
      // position = position + velocity * dt
      
      for(var timeStamp in events) {
        var event = events[timeStamp];
        
        if(event.keyCode == Input.KEY.ESCAPE) {
          alert('Stopped!');
          isRunning = false;
          return false;
        }
          
        delete events[timeStamp];
        // console.log('Game::update('+dt+')::'+event.type);
      }
      
      isUpdated = false;
      for(var name in entities)
        if(entities[name].update(dt))
          isUpdated = true;
    };
    
    var r = 0;
    var render = function() {
      r++;
      
      if(isUpdated) {                                           // IF scene has changed
        context.clearRect(0, 0, 640, 360);
        for(var name in entities)
          entities[name].render();
      }
      
      // console.log('Game::render()');
    };
    var tick = function(dt) {
      events[(+new Date)] = new Event('tick');
    };
    
    var sleep = function(msec) {
      var mark = +new Date;
      while(true)
        if(mark + msec <= +new Date)
          break;
    };
    
    this.init = function(callback) {
      if(callback instanceof Function)
        callback.call(this, null);
      
      entities['circle'] = new Circle(this);
      
      return this;
    };
    
    this.run = function() {
      var curr = prev = +new Date;
      var UPS  = 30;                        // updates per second
      var tick = 1000 / UPS;                // update interval

      var intv = setInterval(function() { 
        var diff = curr - prev;
        while(diff > tick) {
          update(curr - prev);
          diff -= tick;
          prev = curr;
          curr = +new Date;
        }
        requestAnimationFrame(render);      
        curr = +new Date;

        if(!isRunning) clearInterval(intv);
      }, 0);
    };
    
    this.stop = function() {
      console.log('Game::stop()');
    }
  }; 

  (new Game()).init(function() {
    console.log('Game::running');
  }).run();

})();