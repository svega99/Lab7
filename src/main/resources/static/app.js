var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var conexionNumber = 0;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed

        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            
            stompClient.subscribe('/topic/newpoint.'+conexionNumber, function (eventbody) {
                var x = (JSON.parse(eventbody.body)).x;
                var y = (JSON.parse(eventbody.body)).y;
                var point = new Point(x,y);
                addPointToCanvas(point);
                
            });
			
			stompClient.subscribe('/topic/newpolygon.'+conexionNumber, function (eventbody) {
                var canvas = document.getElementById("canvas");
                var ctx = canvas.getContext("2d");
                var point0 = null;
                
                ctx.beginPath();
                (JSON.parse(eventbody.body)).map(function (elem, index) {
                    if(index === 0){
                        point0 = elem;
                        ctx.moveTo(elem.x, elem.y);
                    }else{
                        ctx.lineTo(elem.x, elem.y);
                        if(index === (JSON.parse(eventbody.body)).length){
                            ctx.lineTo(poin0.x, point0.y);
                        }
                    }
                })
                ctx.closePath();
                ctx.fill();
            })
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            
            //websocket connection
            //connectAndSubscribe();
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);

            //publicar el evento
            stompClient.send("/app/newpoint."+conexionNumber, {}, JSON.stringify(pt));
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        },

        connect: function () {
            conexionNumber = document.getElementById("conNumber").value;
            connectAndSubscribe();
        }
    };

})();