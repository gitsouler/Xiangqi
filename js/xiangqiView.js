

// View
function XiangqiView(container, width, height, qipuBox, branchBox) {
    this.container = d3.select(container);
    this.qipuBox = d3.select(qipuBox);
    this.branchBox = d3.select(branchBox);
    //width,height,pad,ra分别为棋盘长、宽、边距、棋子大小 
    this.width = width || 500;
    this.height = height || 500;
    this.pad = 40;
    this.ra = 25;
    this.controller = null; //reference to XiangqiController;
    
    this.gridToX = d3.scale.linear().domain([0, 8]).range([0,this.width]);
    this.gridToY = d3.scale.linear().domain([0, 9]).range([this.height,0]);
    
    this.svg = this.container.append("svg")
        .attr("height", this.height + this.pad*2)
        .attr("width",  this.width + this.pad*2);
}

XiangqiView.prototype = {
    constructor: XiangqiView,
    
    
    drawBoard: function() {
        // 画棋盘网格
        var gridToX = this.gridToX,
            gridToY = this.gridToY;
        
        var rules = this.svg.append("svg:g").classed("rules", true)
            .attr("transform", "translate("+ this.pad +","+ this.pad +")");
        
        function make_x_axis() {
          return d3.svg.axis()
              .scale(gridToX)
              .orient("bottom")
              .ticks(9)
        }
        
        function make_y_axis() {
          return d3.svg.axis()
              .scale(gridToY)
              .orient("left")
        }
        
        rules.append("svg:g").classed("grid y_grid", true)
            .call(make_y_axis()
              .tickSize(-this.width,0,0)
              .tickFormat("")
            );
        
        var line = d3.svg.line()
            .x(function(d, i) { return gridToX(d.x); })
            .y(function(d, i) { return gridToY(d.y); });
            
        var dataInitlines = [
             [{x:3, y:2}, {x:5, y:0}],
             [{x:3, y:0}, {x:5, y:2}],
             [{x:3, y:9}, {x:5, y:7}],
             [{x:3, y:7}, {x:5, y:9}],
             [{x:0, y:0}, {x:0, y:9}],
             [{x:8, y:0}, {x:8, y:9}],
             [{x:1, y:0}, {x:1, y:4}],
             [{x:1, y:5}, {x:1, y:9}],
             [{x:2, y:0}, {x:2, y:4}],
             [{x:2, y:5}, {x:2, y:9}],
             [{x:3, y:0}, {x:3, y:4}],
             [{x:3, y:5}, {x:3, y:9}],
             [{x:4, y:0}, {x:4, y:4}],
             [{x:4, y:5}, {x:4, y:9}],
             [{x:5, y:0}, {x:5, y:4}],
             [{x:5, y:5}, {x:5, y:9}],
             [{x:6, y:0}, {x:6, y:4}],
             [{x:6, y:5}, {x:6, y:9}],
             [{x:7, y:0}, {x:7, y:4}],
             [{x:7, y:5}, {x:7, y:9}]
        ];
        var datatext = [{name:"楚河", x:2, y:4.5},
                        {name:"汉界", x:6, y:4.5}];
        
        var initlines = rules.append("svg:g")
                        .selectAll("path")
                        .data(dataInitlines);
        initlines.enter().append("path")
                 .attr("d", line);
                 
        var text = rules.append("svg:g").selectAll("text")
                .data(datatext); // 楚河汉界

        text.enter().append("text")
            .attr("x", function(d) {return gridToX(d.x);})
            .attr("y", function(d) {return gridToY(d.y);})
            .attr("text-anchor", "middle")          // horizontally middle
            .attr("dominant-baseline", "middle")    // vertically middle
            //.attr("transform", "translate(" + "-40" + "," + 15 + ")")
            .text(function(d) { return d.name; })
            .style("font-size", "40px");
        
        //return {con : con, svg : svg, 
        //        data : data, x : x, y : y};
    },
    
    
    drawPieces: function(allPieces) {
        // 画棋子，会清空原有棋子
        var self = this; // 内部函数中的this用self代替
        
        this.svg.selectAll("g.qizis").remove();
        
        var qizis = this.svg
            .append("svg:g").classed("qizis", true)
            .attr("transform", "translate("+ this.pad +","+ this.pad +")")
            .selectAll("g")
            .data(allPieces)
            .enter().append("svg:g")
            .attr("id", function(d) {return "qizi-"+d.pos[0]+"-"+d.pos[1]});
            // Each qizi is a <g> element
        
        qizis.append("circle").attr("class", "QiZi")
            .attr("cx", function(d) {return self.gridToX(d.pos[0]);})
            .attr("cy", function(d) {return self.gridToY(d.pos[1]);})
            .attr("r", this.ra)
            .style("fill", function(d) {return (d.player==0)?"red":"grey";})
            .style("opacity", 0.5);
        qizis.append("text")
            .attr("class", "QiNames")
            .attr("x", function(d) {return self.gridToX(d.pos[0]);})
            .attr("y", function(d) {return self.gridToY(d.pos[1]);})
            .attr("text-anchor", "middle")          // horizontally middle
            .attr("dominant-baseline", "middle")    // vertically middle
            .text(function(d) { return d.name; });
        //add onclick listener    
        //qizis.on("click", function(d,i) {
        //    self.selectqizi(d,i,this);
        //});
        
    },
    
    drawCircle: function(pos, clazz) {
        // 在pos位置添加以clazz为类的circle
        var self = this;
        self.svg.append("circle")
            .attr("class", clazz)
            .attr("cx", function(d) {return self.gridToX(pos[0]);})
            .attr("cy", function(d) {return self.gridToY(pos[1]);})
            .attr("r", self.ra)
            .attr("transform", "translate(" + 40 + "," + 40 + ")")
            //.style("stroke-width","3px")
            //.style("fill-opacity",0)
            //.style("stroke", "blue");
    },
    
    drawPossiblePosition: function(pos) {
        this.drawCircle(pos, "possible-position");
    },
    drawEatingPosition: function(pos) {
        this.svg.select("#qizi-"+pos[0]+"-"+pos[1])
          .classed("eating-position", true);
    },
        
    clearPossiblePosition: function() {
        this.svg.selectAll(".possible-position").remove();
    },
    clearEatingPosition: function() {
        this.svg.selectAll(".eating-position").classed("eating-position", false);
    },
    
    
    
    //mouseEventHandler: function(event) {
    //    // 处理鼠标事件，拖放等
    //},
    selectqizi: function (d,i,gg) {
        var self=this;
        d.selected = self.controller.moveStart(d.pos,d.name,d.player); // 通知controller新一步开始

        if (d.selected) {
            d3.select(gg).selectAll("circle")
                .style("stroke-width", 3)
                .style("stroke", "blue")
                .style("stroke-opacity",1);
            if (d.pos==null) $("svg").on("mouseenter",function () {self.drawGhost(d);});
            else self.drawGhost(d);
        } else {
            d3.select(document.body).classed("not-allowed", true);
        }
    },
    
    drawGhost: function (d) {
        var self=this;
        var pos=d3.mouse(self.svg[0][0]);
        var ghost = self.svg.append("svg:g");
        ghost.attr("class", "dragging-ghost")
            .attr("transform", "translate("+ self.pad +","+ self.pad +")")
            ;
        ghost.append("circle")
            .attr("class", "QiZi")
            .attr("cx", pos[0])
            .attr("cy", pos[1])
            .attr("r", self.ra)
            .style("fill", (d.player==0)?"red":"grey");
        ghost.append("svg:text")
            .attr("class", "QiNames")
            .attr("x", pos[0])
            .attr("y", pos[1])
            .attr("text-anchor", "middle")          // horizontally middle
            .attr("dominant-baseline", "middle")    // vertically middle
            .text(d.name);
        
        
        // Mouse event codes are removed:
        //ghost should move

        //self.svg.on("mousemove", self.ghostDance);
        
        //ghost disappear after click
        //self.svg.on("click", function() {self.moveEnd(d);});
    },
    
    ghostDance: function () {

        var pos = d3.mouse(this);
        d3.select(this).select("g.dragging-ghost circle")
            .attr("cx", pos[0])
            .attr("cy", pos[1]);
        d3.select(this).select("g.dragging-ghost text")
            .attr("x", pos[0])
            .attr("y", pos[1]);
    },
    
    moveEnd: function(d) {
        if (d.dragStarted) {
            self.svg.select("g.dragging-ghost").remove();
            var pos = d3.mouse(this);
            pos = [
                d3.round(self.gridToX.invert(pos[0])),
                d3.round(self.gridToY.invert(pos[1]))
            ];
            self.controller.moveEnd(d.pos, pos, d.name, d.player);
        } else {
            d3.select(document.body).classed("not-allowed", false);
        }    
    },
    
    d3MouseEvent: function(svg) {
        // TODO: 此为临时代码
        var self = this;
        //棋子拖动
        var drag = d3.behavior.drag()
            .origin(Object)
            .on("dragstart", dragstart)
            .on("drag", dragmove)
            .on("dragend", dragend);
        
        function dragstart(d,i) {
            d.dragStarted = self.controller.moveStart(d.pos,d.name,d.player); // 通知controller新一步开始
            
            if (d.dragStarted) {
                // 绘制ghost棋子
                var ghost = self.svg.append("svg:g").attr("class", "dragging-ghost")
                    .attr("transform", "translate("+ self.pad +","+ self.pad +")");
                ghost.append("circle")
                    .attr("class", "QiZi")
                    .attr("cx", self.gridToX(d.pos[0]))
                    .attr("cy", self.gridToY(d.pos[1]))
                    .attr("r", self.ra)
                    .style("fill", (d.player==0)?"red":"grey");
                ghost.append("svg:text")
                    .attr("class", "QiNames")
                    .attr("x", self.gridToX(d.pos[0]))
                    .attr("y", self.gridToY(d.pos[1]))
                    .attr("text-anchor", "middle")          // horizontally middle
                    .attr("dominant-baseline", "middle")    // vertically middle
                    .text(d.name);
            } else {
                d3.select(document.body).classed("not-allowed", true);
            }
        }
        
        function dragmove(d, i) {
            if (d.dragStarted) {
                // 随鼠标移动ghost棋子
                var pos = d3.mouse(this);
                self.svg.select("g.dragging-ghost circle")
                    .attr("cx", pos[0])
                    .attr("cy", pos[1]);
                self.svg.select("g.dragging-ghost text")
                    .attr("x", pos[0])
                    .attr("y", pos[1]);
            }
        }

        function dragend(d) {
            if (d.dragStarted) {
                self.svg.select("g.dragging-ghost").remove();
                var pos = d3.mouse(this);
                pos = [
                    d3.round(self.gridToX.invert(pos[0])),
                    d3.round(self.gridToY.invert(pos[1]))
                ];
                self.controller.moveEnd(d.pos, pos, d.name, d.player);
            } else {
                d3.select(document.body).classed("not-allowed", false);
            }
        }
        var s=(svg)? svg:this.svg;
        s.selectAll("circle.QiZi").call(drag);
        s.selectAll("text.QiNames").call(drag);
    },
    
    showAllScripts: function(scripts, current, action, audios, branchpoints) {
        var self=this;
        
        scripts.splice(0, 0, "========");
        current++;
        
        var newQipu = this.qipuBox
            .selectAll("li")
            .data(scripts);
        newQipu.exit()
            .transition().duration(300)
            .style("opacity",0).remove();
        newQipu.enter()
            .append("li")
            .on("click", function(d, i) {
                    action.call(self.controller, i-1);
                })
            .style("opacity",0)
            .transition().duration(300)
            .style("opacity",1);
        newQipu
            .html(function (d) {return d;})
            .classed("current-step", function (d, i) {return i==current;});
        
        // 音频解说：
        if (audios)
            newQipu.classed("audio-explanation", function (d,i) {return audios[i-1]!=null;});
        else
            newQipu
                .classed("audio-explanation", false);
        
        // 分支：
        if (branchpoints) {
            newQipu.classed("branch-point", function (d,i) {return branchpoints[i-1];});
        } else
            newQipu
                .classed("branch-point", false);
    },
    
    showAllBranches: function(branches, current, action) {
        // 在分支框中显示该步的分支
        // branches: [[分支第一步, 分支编号], ...]
        // TODO: transitions
        var self=this;
        
        var newBranch = this.branchBox
            .selectAll("li")
            .data(branches);
        newBranch.exit().remove();
        newBranch.enter()
            .append("li")
            .on("click", function(d) {
                    action.call(self.controller, d[1]);
                });
        newBranch
            .html(function (d) {return d[0];})
            .classed("current-branch", function (d, i) {return i==current;});
        
    },
    
};

