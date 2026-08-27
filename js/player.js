/* =========================================================
   WHEN THE LIGHT DIES
   PLAYER SYSTEM
========================================================= */

"use strict";

const Player = (() => {

    const movement = {

        speed: 3,

        runMultiplier: 1.7,

        enabled: true
    };


    const flashlight = {

        drainPerSecond: 0.35,

        batteryWarning: 20
    };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        const state =
            GameState.get();


        state.player.health = 100;

        state.player.sanity = 100;

        state.player.battery = 100;

        state.player.isAlive = true;

        state.player.isRunning = false;

        state.player.isMoving = false;

        state.player.flashlightOn = false;
    }


    /* =====================================================
       UPDATE
    ===================================================== */

    function update(delta) {

        const state =
            GameState.get();


        if (
            !state.gameStarted ||
            state.gamePaused ||
            state.gameOver ||
            !state.player.isAlive
        ) {

            return;
        }


        updateMovement(
            delta
        );


        updateFlashlight(
            delta
        );


        updateSanity(
            delta
        );
    }


    /* =====================================================
       MOVEMENT
    ===================================================== */

    function updateMovement(delta) {

        if (!movement.enabled) {

            return;
        }


        const up =
            Input.isDown("KeyW") ||
            Input.isDown("ArrowUp");


        const down =
            Input.isDown("KeyS") ||
            Input.isDown("ArrowDown");


        const left =
            Input.isDown("KeyA") ||
            Input.isDown("ArrowLeft");


        const right =
            Input.isDown("KeyD") ||
            Input.isDown("ArrowRight");


        const running =
            Input.isDown("ShiftLeft") ||
            Input.isDown("ShiftRight");


        const horizontal =
            (right ? 1 : 0) -
            (left ? 1 : 0);


        const vertical =
            (down ? 1 : 0) -
            (up ? 1 : 0);


        const moving =
            horizontal !== 0 ||
            vertical !== 0;


        const state =
            GameState.get();


        state.player.isMoving =
            moving;


        state.player.isRunning =
            running && moving;


        if (!moving) {

            return;
        }


        const speed =
            movement.speed *
            (
                state.player.isRunning
                    ? movement.runMultiplier
                    : 1
            );


        /*
           Actual world/camera movement will be
           connected when world.js is created.

           For now the player system only calculates
           movement state.
        */

        const movementX =
            horizontal *
            speed *
            delta;


        const movementY =
            vertical *
            speed *
            delta;


        state.player.lastMovement = {

            x: movementX,

            y: movementY
        };
    }


    /* =====================================================
       FLASHLIGHT
    ===================================================== */

    function updateFlashlight(delta) {

        const state =
            GameState.get();


        if (
            !state.player.flashlightOn
        ) {

            return;
        }


        if (
            state.player.battery <= 0
        ) {

            state.player.flashlightOn =
                false;

            return;
        }


        GameState.drainBattery(
            flashlight.drainPerSecond *
            delta
        );
    }


    /* =====================================================
       TOGGLE FLASHLIGHT
    ===================================================== */

    function toggleFlashlight() {

        const state =
            GameState.get();


        if (
            state.player.battery <= 0 ||
            !state.player.isAlive
        ) {

            state.player.flashlightOn =
                false;

            return;
        }


        state.player.flashlightOn =
            !state.player.flashlightOn;
    }


    /* =====================================================
       DAMAGE
    ===================================================== */

    function damage(amount) {

        GameState.damagePlayer(
            amount
        );
    }


    /* =====================================================
       HEAL
    ===================================================== */

    function heal(amount) {

        GameState.healPlayer(
            amount
        );
    }


    /* =====================================================
       SANITY
    ===================================================== */

    function modifySanity(amount) {

        GameState.changeSanity(
            amount
        );
    }


    /* =====================================================
       BATTERY
    ===================================================== */

    function rechargeBattery(amount) {

        const state =
            GameState.get();


        state.player.battery =
            Math.min(
                100,
                state.player.battery +
                amount
            );
    }


    /* =====================================================
       ENABLE / DISABLE MOVEMENT
    ===================================================== */

    function enableMovement() {

        movement.enabled = true;
    }


    function disableMovement() {

        movement.enabled = false;


        const state =
            GameState.get();


        state.player.isMoving = false;

        state.player.isRunning = false;
    }


    /* =====================================================
       IS ALIVE
    ===================================================== */

    function isAlive() {

        return GameState.get()
            .player
            .isAlive;
    }


    /* =====================================================
       GET PLAYER
    ===================================================== */

    function getState() {

        return GameState.get()
            .player;
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        update,

        toggleFlashlight,

        damage,
        heal,

        modifySanity,

        rechargeBattery,

        enableMovement,
        disableMovement,

        isAlive,

        getState
    };

})();
