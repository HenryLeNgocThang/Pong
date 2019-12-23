document.addEventListener("DOMContentLoaded", function () {

    var mouseX = window.innerWidth / 2,
        mouseY = window.innerHeight / 2
    playState = false
    playground = {
        el: document.querySelector("#pong-playground"),
        w: document.querySelector("#pong-playground").offsetWidth,
        h: document.querySelector("#pong-playground").offsetHeight
    }
    racket = {
        el: document.querySelector("#racket"),
        x: window.innerWidth / 2,
        y: window.innerHeight - 125,
        w: document.querySelector("#racket").offsetWidth,
        h: document.querySelector("#racket").offsetHeight,
        update: function () {
            l = this.x - this.w / 2;
            t = this.y;
            this.el.style.transform = 'translate3d(' + l + 'px, ' + t + 'px, 0)';
        }
    }
    ball = {
        el: document.querySelector("#ball"),
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        w: 25,
        h: 25,
        ballSpeedY: 30,
        ballSpeedX: 30,
        update: function () {
            l = this.x - this.w / 2;
            t = this.y - this.h / 2;
            this.el.style.transform = 'translate3d(' + l + 'px, ' + t + 'px, 0)';
        }
    }
    bricks = [];


    playground.el.addEventListener("click", function () {
        if (!playState) {
            playState = true;
            playground.el.classList.add("playState");
        }
    });

    document.addEventListener("keydown", function (e) {
        if (playState) {
            var e = window.event;

            if (e.keyCode == 27) {
                playState = false;
                playground.el.classList.remove("playState");
            }
        }
    });

    playground.el.addEventListener("mousemove", function (e) {
        if (playState) {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Here goes the code
        }
    });

    // Smooth animation
    setInterval(racketMovement, 1000 / 60);
    setInterval(ballMovement, 1);

    function racketMovement() {
        racket.x += (mouseX - racket.x) * 0.1;
        racket.update();
    }

    function ballMovement() {
        if (playState) {
            ball.x += ball.ballSpeedX * 0.1;
            ball.y += ball.ballSpeedY * 0.1;

            // Collide with racket
            if (ball.y > racket.y - racket.h && isCollapsed(ball.el, racket.el)) {
                ball.ballSpeedY *= -1;
            }
            else if (ball.y < racket.y) {
                ball.ballSpeedY *= +1;
            }

            // Collide with borders
            if (ball.x > playground.w) {
                ball.ballSpeedX *= -1;
            }
            else if (ball.x < 0) {
                ball.ballSpeedX *= -1;
            }

            if (ball.y > playground.h + ball.h) {
                alert("GAME OVER!");
                playState = false;
                window.location.reload();
            }
            else if (ball.y < 0 - ball.h) {
                ball.ballSpeedY *= -1;
            }

            ball.update();

            // Remove Brick if ball collides
        }
    }

    function isCollapsed(elem1, elem2) {
        var object1 = elem1.getBoundingClientRect();
        var object2 = elem2.getBoundingClientRect();

        if (
            object1.left < object2.left + object2.width &&
            object1.left + object1.width > object2.left &&
            object1.top < object2.top + object2.height &&
            object1.top + object1.height > object2.top
        ) {
            return true;
        } else {
            return false;
        }
    }

    function drawBricks(amout) {
        for (i = 0; i < amout; i++) {
            bricks[i] = document.createElement("div");
            playground.el.appendChild(bricks[i]);
            bricks[i].classList.add("brick");
            bricks[i].innerHTML = i;

            if (isCollapsed(bricks[i], ball.el)) {
                bricks[i].remove();
            }
        }
    }
    
    drawBricks(5);
});