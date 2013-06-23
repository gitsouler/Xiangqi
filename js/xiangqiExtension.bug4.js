var xqExtend = function(obj, source) {
    // Extends obj by source.
    for (var prop in source)
        obj[prop] = source[prop];
    return obj;
};

/*
    Bug4: 四人象棋
*/


xqExtend(XiangqiData.prototype, {
    bug4: function() {
        // 初始化函数
        this.reserve = [
            // {name: Pieces.Ma, player: 0}
        ]; // 保存对家吃子

        return this;
    },
});


xqExtend(XiangqiEngine.prototype, {
    bug4: function() {
        // 初始化函数
        
        return this;
    },
    reserve: function(eaten) {
        // eaten: {name: Pieces.Ma, player: 0}
        eaten.player =  (eaten.player==0)? 0 : 1;
        this.data.reserve.push(eaten);
    },
    
    reserveCanMove: function(name, player, board) {
        //规则测试区，按实际游戏性调整
        if (name == Pieces.JU || name == Pieces.MA || name == Pieces.PAO) {
            var possibletos=jStat.seq(player*5*9,player*5*9+5*9-1,5*9);
        } else if (name == Pieces.XIANG) {
            var possibletos=[2,6,18,22,26,38,42];
        } else if (name == Pieces.XIANG0) {
            var possibletos=[2+45,6+45,18+45,22+45,26+45,38+45,42+45];
        } else if (name == Pieces.SHI) {
            var possibletos=[3,5,13,21,23];
        } else if (name == Pieces.SHI0) {
            var possibletos=[66,68,76,84,86];        
        } else if (name == Pieces.BING) {
            var possibletos=jStat.seq(27,45-1,18);
        } else if (name == Pieces.ZU) {
            var possibletos=jStat.seq(45,63-1,18);
        } else {
            alert("error: "+ name +"can not be exchanged");
        }
        if (possibletos.length) {
            var tos=possibletos.filter(function (el) {
                return board[el]==null;
            });
            tos=tos.map(function (el) {
                return [el%9,(el-el%9)/9];
            });
            return tos;
        } else return [];

    },
    
    getAllReserves: function() {
        // 返回所有reserve棋子及其伪位置[-1,4]
        // 格式：
        //      {name: Pieces.JU, pos: [-1,4], player: 0}
        var result = this.data.reserve.map(function (el) {
            el.pos=[-1,4];
            return el;
        });
        return result;
    },
});


xqExtend(XiangqiView.prototype, {
    bug4: function(reserveHeight) {
        // 初始化函数
        this.reserveHeight = reserveHeight || this.ra*2;
        
        // 用于显示保留棋子
        this.reserveBox = 
            this.container.append("div").classed("reserve-box", true)
                .style("height", (this.reserveHeight)+"px")
                .style("width",  (this.width+this.pad*2)+"px")
                .style("background", "#F0F0F0");
        
        this.reservesvg = this.reserveBox.append("svg")
        .attr("height", this.reserveHeight)
        .attr("width",  this.width+this.pad*2);
        
        return this;
    },
    refreshReserve: function(allReserve) {
        // 更新保留框
        var self=this;
        var reserveqizis=this.reservesvg.selectAll("circle").data(allReserve);
        reserveqizis.enter().append("circle")
        .attr("class", "QiZi")
        .attr("cx", function (d,i) {return (2*i+1)*self.ra;})
        .attr("cy", self.ra)
        .attr("r", self.ra)
        .style("fill", function(d) {return (d.player==0)?"red":"grey";})
        .style("opacity", 0.5);
        
        var reservetext=this.reservesvg.selectAll("text").data(allReserve);
        reservetext.enter().append("text")
        .attr("class", "QiNames")
            .attr("x", function(d,i) {return (2*i+1)*self.ra;})
            .attr("y", self.ra)
            .style("font-size", "30px")
            .attr("text-anchor", "middle")          // horizontally middle
            .attr("dominant-baseline", "middle")    // vertically middle
            .text(function(d) { return d.name; });
        //self.d3MouseEvent(self.reservesvg); 
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
            // TODO: 有位移偏差
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
        self.reservesvg.selectAll("circle.QiZi").call(drag);
        self.reservesvg.selectAll("text.QiNames").call(drag);        
    },
    reserveMouseEvent: function() {
        // 鼠标事件处理，参考 d3MouseEvent
        var self=this;

    },
});

xqExtend(XiangqiController.prototype, {
    bug4: function(id, bug4Controller) {
        // 初始化函数
        this.bug4Controller = bug4Controller;
        this.id = id; // 棋盘id. bug4Controller方法中传入以识别棋盘
        
        return this;
    },
    
    jumpTo: function(moveNo) {
        // 跳至第moveNo步
        this.bug4Controller.jumpToBug4(this.id, moveNo);    
    },
    
    nextTurn: function(move) {
        // 控制游戏流程
        // 重写nextTurn，在此调用bug4Controller的方法
        this.currentPlayer =  (move.player==0)? 1 : 0;
        this.bug4Controller.nextTurnBug4(this.id, move);
    },
    
    moveStart: function(pos,name,player) {
        // 开始一步棋, 返回是否成功
        // 重写nextTurn，在此调用bug4Controller的方法

        // 判断是否为该棋手出棋
        if (this.id != this.bug4Controller.currentBoard ||
            player != this.currentPlayer)
            return false;
        
        // 判断有无可移动位置
        if (pos[0]>-1) {
            var tos=this.engine.canMove(pos, player, this.engine.data.board);
        } else {
            var tos=this.engine.reserveCanMove(name,player,this.engine.data.board);
        }
        if (tos.length) {
            for (var i=0; i<tos.length; i++) {
                if (this.engine.data.board[tos[i][0]+tos[i][1]*9]==null) {
                    this.view.drawPossiblePosition(tos[i]);
                } else {
                    this.view.drawEatingPosition(tos[i]);
                }
            }
        } else {
            return false;
            // alert("The piece have no legal move");
        }
        return true;

    },
    
    moveEnd: function(from, to, name, player) {
        // 一步棋落定, 返回是否成功
        // 若成功, 更改棋盘, 设定下一步; 若不成功, 清理moveStart作出的修改
        if (from[0]>-1) {
            var tos=this.engine.canMove(from, this.currentPlayer, this.engine.data.board);
        } else {
            var tos=this.engine.reserveCanMove(name,player,this.engine.data.board);           
        }
        for (var i=0; i<tos.length; i++) {
            if (tos[i][0]==to[0] && tos[i][1]==to[1]) {
                // Available
                // 更改棋盘
                if (from[0]>-1) {
                    var move = this.engine.newMove(from, to, this.engine.data.board[from[0]+from[1]*9].name, this.currentPlayer);
                } else {
                    var move = this.engine.newMove(null, to, name, this.currentPlayer);               
                }
                this.view.drawPieces(this.engine.getAllPieces());
                this.view.d3MouseEvent(); // Very bad practice... May have memory leaks...
                this.view.clearEatingPosition();
                this.view.clearPossiblePosition();
                //this.showAllScripts();
                
                // 设定下一步
                // 下一步更换player, (注：此为游戏逻辑)
                this.nextTurn(move)
                
                return true;
            }
        }
        // 清理
        this.view.clearEatingPosition();
        this.view.clearPossiblePosition();
    },
});


function XiangqiBug4Controller() {
    // bug4
    // 负责控制view和data/engine，包含控制游戏流程。例如处理用户交互，处理多棋局间交互等等。
    //this.data = null;
    this.engines = [];
    this.views = [];
    this.controllers = [];
    this.currentBoard = 0; // 当前棋盘
}

XiangqiBug4Controller.prototype = {
    constructor: XiangqiBug4Controller,
    
    init: function() {
        // 初始化游戏
        for (var i=0; i<2; i++) {
            var controller = this.controllers[i] =
                new XiangqiController().bug4(i, this);
            this.views[i].controller = controller;
            controller.view = this.views[i];
            controller.engine = this.engines[i];
            controller.init();
        }
        this.controllers[1].boardRotate();
        this.controllers[1].currentPlayer = 0;
    },
    
    nextTurnBug4: function(boardId, move) {
        // 棋盘boardId请求下一步
        this.currentBoard = (this.currentBoard==0)? 1 : 0;
        if (move.eaten!=null) {
            this.engines[this.currentBoard].reserve(move.eaten);
            this.views[this.currentBoard].refreshReserve(this.engines[this.currentBoard].getAllReserves(this.engines[this.currentBoard].data.reserve));
        }
        
    },
    
    jumpToBug4: function(boardId, moveNo) {
        // 跳至棋盘boardId的第moveNo步
    },
    
    undo: function() {
    
    },
    
    redo: function() {
    
    },
    
    
};








