document.addEventListener("DOMContentLoaded", function () {
    var mouseX = window.innerWidth / 2,
        status = {
            startState: false,
            playState: false,
            pauseState: false
        },
        playground = {
            el: document.querySelector("#pong-playground"),
            w: document.querySelector("#pong-playground").offsetWidth,
            h: document.querySelector("#pong-playground").offsetHeight,
        },
        racket = {
            el: document.querySelector("#racket"),
            arr: document.querySelector(".arrow"),
            x: playground.w / 2,
            y: playground.h / 2 * 1.7,
            w: document.querySelector("#racket").offsetWidth,
            h: document.querySelector("#racket").offsetHeight,
            smooth: 1, // 10 Is no lerp, recommanded is 1
            update: function () {
                l = this.x - this.w / 2;
                t = this.y;
                this.el.style.transform = 'translate(' + l + 'px, ' + t + 'px)';
            }
        },
        ball = {
            el: document.querySelector("#ball"),
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            w: 25,
            h: 25,
            ballSpeedY: 10,
            ballSpeedX: 10,
            speedIncrease: 2,
            update: function () {
                l = this.x - this.w / 2;
                t = this.y - this.h / 2;
                this.el.style.transform = 'translate(' + l + 'px, ' + t + 'px)';
            }
        },
        bricks = [],
        score = {
            el: document.querySelector("#score"),
            points: 0,
            increase: 0
        },
        particle = [];

    // Change States when clicking on playground
    playground.el.addEventListener("click", function () {
        if (!status.playState && !status.pauseState && !status.startState) { // Start
            status.startState = true;
            playground.el.classList.add("startState");
        } else if (!status.playState && !status.pauseState && status.startState) { // Play
            status.playState = true;
            status.startState = false;
            playground.el.classList.add("playState");
            playground.el.classList.remove("startState");
            racket.el.classList.remove("arrow");
        } else if (!status.playState && status.pauseState && !status.startState) { // Continue play
            status.playState = true;
            status.pauseState = false;
            playground.el.classList.add("playState");
            playground.el.classList.remove("pauseState");
        }
    });

    // Continue play if press escape
    document.addEventListener("keydown", function (e) {
        var e = window.event;

        if (status.playState) {
            if (e.keyCode == 27) {
                status.playState = false;
                status.pauseState = true;
                playground.el.classList.add("pauseState");
                playground.el.classList.remove("playState");
            }
        }
    });

    playground.el.addEventListener("mousemove", function (e) {
        if (status.startState && !status.playState && !status.pauseState) {
            mouseX = e.pageX - playground.el.getBoundingClientRect().left;

            racket.arr.style.transform = "rotate(" + ((mouseX * 100 / playground.w) - 50) * 1.5 + "deg)";
        } else if (!status.startState && status.playState && !status.pauseState) {
            mouseX = e.pageX - playground.el.getBoundingClientRect().left;
        }
    });

    setInterval(racketMovement, 1000 / 60);
    setInterval(ballMovement, 1);

    function racketMovement() {
        // Increase Racket x pos to mouseX pos smooth
        racket.x += (mouseX - racket.x) * (racket.smooth / 10);
        racket.update();

        // Set ballX direction depends on racketX position and startState
        if (status.startState && !status.playState && !status.pauseState) {
            ball.x = racket.x;
            ball.y = racket.y - racket.h - ball.h / 2;
            ball.ballSpeedX = (mouseX - playground.w / 2) / 20;
            ball.update();
        }
    }

    function ballMovement() {
        if (status.playState && !status.pauseState && !status.startState) {
            // Moving ball
            ball.x += ball.ballSpeedX * 0.1;
            ball.y += ball.ballSpeedY * 0.1;

            // Collide with racket. Reflect when in same height as racket && position + racket.width
            if (ball.y + racket.h + ball.h / 2 > racket.y && ball.y + ball.h / 2 < racket.y &&
                ball.el.getBoundingClientRect().left < racket.el.getBoundingClientRect().left + racket.el.getBoundingClientRect().width &&
                ball.el.getBoundingClientRect().left + ball.el.getBoundingClientRect().width > racket.el.getBoundingClientRect().left
            ) {
                ball.ballSpeedY *= -1;

                // Collide with racket increase speed depends on position with corners
                if (ball.ballSpeedX >= 0) {
                    ball.ballSpeedX = (ball.el.getBoundingClientRect().left - racket.el.getBoundingClientRect().left) / (bricks.length * 2);
                } else if (ball.ballSpeedX <= 0) {
                    ball.ballSpeedX = (racket.el.getBoundingClientRect().right - ball.el.getBoundingClientRect().right) / (bricks.length * 2) * -1;
                }
            }

            // Collide with gameborder left and right
            if (ball.x + ball.w / 2 > playground.w) {
                ball.ballSpeedX *= -1;
            } else if (ball.x < 0 + ball.w / 2) {
                ball.ballSpeedX *= -1;
            }

            // GAME OVER when ball gets out of playground
            if (ball.y > playground.h + ball.h) {
                alert("GAME OVER! Score: " + score.points);
                status.playState = false;
                window.location.reload();
            } else if (ball.y < 0 - ball.h / 2) { // Reflect ball then it hits the top
                ball.ballSpeedY *= -1;
            }

            ball.update();

            // Remove Brick if ball collides
            if (document.querySelectorAll(".brick").length == 0) {
                alert("YOU WON! Score: " + score.points);
                status.playState = false;
                window.location.reload();
            } else {
                for (i = 0; i < document.querySelectorAll(".brick").length; i++) {
                    var gameBricks = document.querySelectorAll(".brick");

                    // Run logic if ball hits a brick
                    if (ball.el.getBoundingClientRect().top < gameBricks[i].getBoundingClientRect().top + gameBricks[i].getBoundingClientRect().height &&
                        ball.el.getBoundingClientRect().top + ball.el.getBoundingClientRect().height > gameBricks[i].getBoundingClientRect().top &&
                        ball.el.getBoundingClientRect().left < gameBricks[i].getBoundingClientRect().left + gameBricks[i].getBoundingClientRect().width &&
                        ball.el.getBoundingClientRect().left + ball.el.getBoundingClientRect().width > gameBricks[i].getBoundingClientRect().left) {
                        ball.ballSpeedY *= -1;

                        // Increase ballspeed
                        if (ball.ballSpeedY < 0) {
                            ball.ballSpeedY -= ball.speedIncrease;
                        } else if (ball.ballSpeedY > 0) {
                            ball.ballSpeedY += ball.speedIncrease;
                        }

                        // Increase score by the ballspeed
                        score.increase += Math.round(ball.ballSpeedY * Math.abs(ball.ballSpeedX));
                        var interval = setInterval(function () {
                            score.points++;
                            score.el.innerHTML = "<h2>Score: <p>" + score.points + "</p></h2>";

                            if (score.points >= score.increase) {
                                clearInterval(interval);
                            }
                        });

                        gameBricks[i].remove();
                    }
                }
            }
        }
    }

    function drawBricks(column, row, margin) {
        for (i = 0; i < column; i++) {
            for (j = 0; j < row; j++) {
                var xPos;
                var yPos = j * (margin * 2.5);

                bricks[j] = document.createElement("div");
                playground.el.appendChild(bricks[j]);
                bricks[j].classList.add("brick");
                bricks[j].style.width = playground.el.offsetWidth / column - margin + "px";
                xPos = i * playground.el.offsetWidth / column + margin / 2;
                bricks[j].style.transform = 'translate(' + xPos + 'px, ' + yPos + 'px)';
            }
        }
    }

    function getRandomNumber(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

    // Revert ball direction from bottom to top
    ball.ballSpeedY *= -1;

    drawBricks(getRandomNumber(4, 8), getRandomNumber(2, 3), 30);
    score.el.innerHTML = "<h2>Score: <p>" + score.points + "</p></h2>";
});