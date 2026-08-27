/* =========================================================
   WHEN THE LIGHT DIES
   PLAYER SYSTEM
   PC + MOBILE
========================================================= */

"use strict";


const Player = (() => {

    let initialized = false;

    const player = {

        x: 0,
        y: 0,

        speed: 180,
        runSpeed: 280,

        health: 100,
        sanity: 100,
        battery: 100,

        flashlightOn: false,

        running: false,
        moving: false
    };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        if (initialized) {
            return;
        }

        initialized = true;

        syncFromState();

        resetPosition();
    }


    /* =====================================================
       RESET POSITION
    ===================================================== */

    function resetPosition() {

        player.x = 0;
        player.y = 0;

        player.running = false;
        player.moving = false;

        player.flashlightOn = false;

        syncToState();
    }


    /* =====================================================
       SYNC FROM GAME STATE
    ===================================================== */

    function syncFromState() {

        if (
            typeof GameState === "undefined"
        ) {
            return;
        }

        const state =
            GameState.get();

        if (!state || !state.player) {
            return;
        }

        player.health =
            state.player.health ?? 100;

        player.sanity =
            state.player.sanity ?? 100;

        player.battery =
            state.player.battery ?? 100;

        player.flashlightOn =
            Boolean(
                state.player.flashlightOn
            );

        player.x =
            state.player.position?.x ?? 0;

        player.y =
            state.player.position?.y ?? 0;
    }


    /* =====================================================
       SYNC TO GAME STATE
    ===================================================== */

    function syncToState() {

        if (
            typeof GameState === "undefined"
        ) {
            return;
        }

        const state =
            GameState.get();

        if (!state || !state.player) {
            return;
        }

        state.player.health =
            player.health;

        state.player.sanity =
            player.sanity;

        state.player.battery =
            player.battery;

        state.player.flashlightOn =
            player.flashlightOn;

        state.player.isMoving =
            player.moving;

        state.player.isRunning =
            player.running;

        state.player.position.x =
            player.x;

        state.player.position.y =
            player.y;
    }


    /* =====================================================
       UPDATE
    ===================================================== */

    function update(delta) {

        if (
            typeof GameState === "undefined" ||
            typeof Input === "undefined"
        ) {
            return;
        }

        const state =
            GameState.get();

        if (
            !state ||
            !state.gameStarted ||
            state.gamePaused ||
            state.gameOver ||
            !state.player.isAlive
        ) {
            return;
        }


        const movement =
            Input.getMovement();


        player.moving =
            movement.moving;


        /*
           SHIFT / MOBILE RUN
        */

        const running =
            Input.isDown("ShiftLeft") ||
            Input.isDown("ShiftRight");


        player.running =
            player.moving &&
            running;


        const currentSpeed =
            player.running
                ? player.runSpeed
                : player.speed;


        /*
           MOVEMENT
        */

        player.x +=
            movement.x *
            currentSpeed *
            delta;

        player.y +=
            movement.y *
            currentSpeed *
            delta;


        /*
           BATTERY
        */

        if (
            player.flashlightOn
        ) {

            GameState.drainBattery(
                2.5 * delta
            );

            player.battery =
                GameState.get()
                    .player
                    .battery;


            if (
                player.battery <= 0
            ) {

                player.flashlightOn =
                    false;
            }
        }


        /*
           RUNNING AFFECTS SANITY
           AND FUTURE STAMINA SYSTEM.
        */

        if (
            player.running
        ) {

            GameState.changeSanity(
                -0.15 * delta
            );
        }


        /*
           VERY DARK ENVIRONMENT
           SLOW SANITY LOSS.
        */

        if (
            !player.flashlightOn
        ) {

            GameState.changeSanity(
                -0.03 * delta
            );
        }


        syncToState();
    }


    /* =====================================================
       FLASHLIGHT
    ===================================================== */

    function toggleFlashlight() {

        if (
            typeof GameState === "undefined"
        ) {
            return false;
        }

        const state =
            GameState.get();

        if (
            !state.gameStarted ||
            state.gamePaused ||
            state.gameOver
        ) {
            return false;
        }

        if (
            player.battery <= 0
        ) {

            player.flashlightOn =
                false;

            syncToState();

            return false;
        }


        player.flashlightOn =
            !player.flashlightOn;


        syncToState();


        if (
            typeof AudioSystem !==
            "undefined" &&
            typeof AudioSystem.playSFX ===
            "function"
        ) {

            AudioSystem.playSFX(
                "flashlight"
            );
        }


        return player.flashlightOn;
    }


    /* =====================================================
       DAMAGE
    ===================================================== */

    function damage(amount) {

        if (
            typeof GameState === "undefined"
        ) {
            return;
        }

        GameState.damagePlayer(
            amount
        );

        syncFromState();
    }


    /* =====================================================
       HEAL
    ===================================================== */

    function heal(amount) {

        if (
            typeof GameState === "undefined"
        ) {
            return;
        }

        GameState.healPlayer(
            amount
        );

        syncFromState();
    }


    /* =====================================================
       SANITY
    ===================================================== */

    function changeSanity(amount) {

        if (
            typeof GameState === "undefined"
        ) {
            return;
        }

        GameState.changeSanity(
            amount
        );

        syncFromState();
    }


    /* =====================================================
       BATTERY
    ===================================================== */

    function rechargeBattery(
        amount
    ) {

        if (
            typeof GameState === "undefined"
        ) {
            return;
        }

        GameState.rechargeBattery(
            amount
        );

        syncFromState();
    }


    /* =====================================================
       POSITION
    ===================================================== */

    function setPosition(
        x,
        y
    ) {

        player.x =
            Number.isFinite(x)
                ? x
                : 0;

        player.y =
            Number.isFinite(y)
                ? y
                : 0;

        syncToState();
    }


    function getPosition() {

        return {

            x: player.x,

            y: player.y
        };
    }


    /* =====================================================
       GET PLAYER
    ===================================================== */

    function get() {

        return {

            ...player
        };
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        update,

        resetPosition,

        toggleFlashlight,

        damage,

        heal,

        changeSanity,

        rechargeBattery,

        setPosition,

        getPosition,

        get
    };

})();
