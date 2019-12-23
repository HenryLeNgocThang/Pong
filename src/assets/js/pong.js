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
        ballSpeedY: 10,
        ballSpeedX: 10,
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
            } else if (ball.y < racket.y) {
                ball.ballSpeedY *= +1;
            }

            // Collide with racket increase speed depends on position with corners
            if (isCollapsed(racket.el, ball.el) && ball.ballSpeedX >= 0) {
                ball.ballSpeedX = (ball.el.getBoundingClientRect().left - racket.el.getBoundingClientRect().left) / 10;
            } else if (isCollapsed(racket.el, ball.el) && ball.ballSpeedX <= 0) {
                ball.ballSpeedX = (racket.el.getBoundingClientRect().right - ball.el.getBoundingClientRect().right) / 10 * -1;
            }

            // Collide with borders
            if (ball.x > playground.w) {
                ball.ballSpeedX *= -1;
            } else if (ball.x < 0) {
                ball.ballSpeedX *= -1;
            }

            if (ball.y > playground.h + ball.h) {
                alert("GAME OVER!");
                playState = false;
                window.location.reload();
            } else if (ball.y < 0 - ball.h) {
                ball.ballSpeedY *= -1;
            }

            ball.update();

            // Remove Brick if ball collides
            if (document.querySelectorAll(".brick").length == 0) {
                alert("YOU WON!");
                playState = false;
                window.location.reload();
            } else {
                for (i = 0; i < document.querySelectorAll(".brick").length; i++) {
                    if (isCollapsed(document.querySelectorAll(".brick")[i], ball.el)) {
                        document.querySelectorAll(".brick")[i].remove();
                        ball.ballSpeedY *= -1;
                        ball.ballSpeedY += 3;
                    }
                }
            }
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

    function drawBricks(column, row, margin) {
        for (i = 0; i < column; i++) {
            for (j = 0; j < row; j++) {
                var xPos;
                var yPos = j * 75;

                bricks[j] = document.createElement("div");
                playground.el.appendChild(bricks[j]);
                bricks[j].classList.add("brick");
                bricks[j].style.width = playground.el.offsetWidth / column - margin + "px";
                xPos = i * playground.el.offsetWidth / column + margin / 2;
                bricks[j].style.transform = 'translate(' + xPos + 'px, ' + yPos + 'px)';
            }
        }
    }

    drawBricks(8, 3, 50);
});