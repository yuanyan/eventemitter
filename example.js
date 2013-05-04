function Database(){};
Database.connect = function(dbname, callback){
    
    setTimeout(function(){callback(new Database)},100);
}

Database.prototype.open = function(table, callback){

    setTimeout(function(){callback(new Table)},200);
}

function Table(){
}

Table.prototype.select = function(name, callback){
    if(name === "sql1")
        setTimeout(function(){callback("value1")},300);
    else if(name === 'sql2')
         setTimeout(function(){callback("value2")},300);
    else
        setTimeout(function(){callback("value")},300);
}

var start  = new Date;
// callback-nested 
Database.connect("db",function(db){
  db.open("table",function(table){
      table.select("name",function(val){
          console.log(val);

          console.log("1:",new Date - start);
      });
  });
});

console.log("0:",new Date - start);






//Function.run(
//  connect.bind(this, "db", Function.callback() ),
//  open.bind(this, "table", Function.callback() ),
//  select.bind(this, "name", Function.callback() ),
//  function(val){
//      console.log(val);
//  }
//);
var Callback = function(fns){
    this.fns = fns;
    this.args = [];
    this.next = this.next();
    this.callback = this.callback();
}

Callback.prototype.callback = function(){
    var that = this;
    return function(){
        that.args = arguments;
        that.next.apply(that, arguments);
    }
};

Callback.prototype.next = function(){
    var that = this, fn;
    
    return function(){

        if ( !(fn = that.fns.shift()) ) {
            return;
        }

        var preArgs = that.result();

        fn.apply(that, preArgs);
    }
}

Callback.prototype.stop = function(){
    var that = this;

    return function(){

        that.fns = [];

    }
}

Callback.prototype.result = function(){
    return this.args;
}

Function.run = function(){
    var args =  Array.prototype.slice.call(arguments);

    var pre = new Callback(args);

    return pre.next;

}
var start  = new Date;
// un-nested
Function.run(
    function(){
        Database.connect("db", this.callback);
    },

    function(db){
        db.open("table", this.callback);
    },

    function(table){
        table.select("sql", this.callback);
    },

    function(val){
        console.log(val);
        console.log("2:",new Date - start);
    }
)();



//Function.run(
//    function(){
//        Database.connect("db", this.callback);
//    },
//
//    [function(db){
//        db.open("table1", this.callback);
//    },
//    function(db){
//        db.open("table2", this.callback);
//    }],
//
//    function(table){
//        table.select("sql", this.callback);
//    },
//
//    function(val){
//        console.log(val);
//    }
//)();



// rebuild it
var emitter = new EventEmitter;
var start = new  Date;
emitter.on("connect", open);
emitter.on("open", select1);
emitter.on("open", select2);


emitter.once("select1", "select2", print);
emitter.on("select1", print);
emitter.on("select2", print);

function connect(dbname){
    Database.connect(dbname, function(db){
        emitter.emit("connect", db);
    });

}

function open(db){
    db.open("table", function(table){
        emitter.emit("open", table);
    });
}


function select1(table){
    table.select("sql1", function(table){
        emitter.emit("select1", table);
    });
}

function select2(table){
    table.select("sql2", function(table){
        emitter.emit("select2", table);
    });
}

var counter = 0;
function print(val1,val2){
    
    console.log(val1,val2);
    console.log("3:",new Date - start);
    
    if(++counter == 3){
        connect("db");
    }

}

connect("db");


