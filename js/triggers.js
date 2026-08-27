/* =========================================================
   WHEN THE LIGHT DIES
   TRIGGER SYSTEM
========================================================= */

"use strict";


const Triggers = (() => {

    const activeTriggers = new Map();

    const firedTriggers = new Set();


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        activeTriggers.clear();

        firedTriggers.clear();
    }


    /* =====================================================
       LOAD ROOM TRIGGERS
    ===================================================== */

    function loadRoom(
        roomId
    ) {

        activeTriggers.clear();


        if (
            typeof Levels ===
            "undefined"
        ) {

            return false;
        }


        const triggers =
            Levels.getTriggers(
                roomId
            );


        if (
            !Array.isArray(
                triggers
            )
        ) {

            return false;
        }


        triggers.forEach(
            trigger => {

                if (
                    !trigger ||
                    !trigger.id
                ) {

                    return;
                }


                activeTriggers.set(
                    trigger.id,
                    {
                        ...trigger,

                        roomId
                    }
                );
            }
        );


        return true;
    }


    /* =====================================================
       UPDATE
    ===================================================== */

    function update() {

        const player =
            getPlayer();


        if (!player) {
            return;
        }


        activeTriggers.forEach(
            trigger => {

                checkTrigger(
                    trigger,
                    player
                );
            }
        );
    }


    /* =====================================================
       CHECK TRIGGER
    ===================================================== */

    function checkTrigger(
        trigger,
        player
    ) {

        if (
            !trigger.enabled
        ) {

            return;
        }


        if (
            trigger.once !== false &&
            firedTriggers.has(
                trigger.id
            )
        ) {

            return;
        }


        switch (
            trigger.type
        ) {

            case "enter":

                checkEnterTrigger(
                    trigger,
                    player
                );

                break;


            case "proximity":

                checkProximityTrigger(
                    trigger,
                    player
                );

                break;


            case "interaction":

                checkInteractionTrigger(
                    trigger
                );

                break;
        }
    }


    /* =====================================================
       ENTER TRIGGER
    ===================================================== */

    function checkEnterTrigger(
        trigger,
        player
    ) {

        const distance =
            distanceBetween(
                player.x,
                player.y,
                trigger.x,
                trigger.y
            );


        const radius =
            Number(
                trigger.radius
            ) || 50;


        if (
            distance <=
            radius
        ) {

            fire(
                trigger
            );
        }
    }


    /* =====================================================
       PROXIMITY TRIGGER
    ===================================================== */

    function checkProximityTrigger(
        trigger,
        player
    ) {

        const distance =
            distanceBetween(
                player.x,
                player.y,
                trigger.x,
                trigger.y
            );


        const radius =
            Number(
                trigger.radius
            ) || 100;


        if (
            distance <=
            radius
        ) {

            fire(
                trigger
            );
        }
    }


    /* =====================================================
       INTERACTION TRIGGER
    ===================================================== */

    function checkInteractionTrigger(
        trigger
    ) {

        /*
           Interaction triggers are activated
           by Interaction.js.
        */

        return false;
    }


    /* =====================================================
       FIRE TRIGGER
    ===================================================== */

    function fire(
        trigger
    ) {

        if (!trigger) {
            return false;
        }


        if (
            trigger.once !== false
        ) {

            if (
                firedTriggers.has(
                    trigger.id
                )
            ) {

                return false;
            }


            firedTriggers.add(
                trigger.id
            );
        }


        executeEvent(
            trigger.event,
            trigger
        );


        return true;
    }


    /* =====================================================
       EXECUTE EVENT
    ===================================================== */

    function executeEvent(
        eventName,
        trigger
    ) {

        if (!eventName) {
            return;
        }


        /*
           Main event system.
        */

        if (
            typeof Events !==
            "undefined" &&
            typeof Events.trigger ===
            "function"
        ) {

            Events.trigger(
                eventName,
                {
                    triggerId:
                        trigger.id,

                    roomId:
                        trigger.roomId,

                    x:
                        trigger.x,

                    y:
                        trigger.y
                }
            );
        }


        /*
           Built-in story events.
        */

        switch (
            eventName
        ) {

            case "chapter1_wake":

                startDialogue(
                    "intro_wake"
                );

                break;


            case "hallway_footsteps":

                startDialogue(
                    "hallway_footsteps"
                );

                break;


            case "storage_noise":

                startDialogue(
                    "storage_noise"
                );

                break;


            case "corridor_blackout":

                blackout();

                break;


            case "first_enemy_encounter":

                spawnFirstEnemy();

                break;


            case "basement_entity":

                startDialogue(
                    "basement_entity"
                );

                break;


            case "chapter1_complete":

                completeChapter1();

                break;
        }
    }


    /* =====================================================
       MANUAL TRIGGER
    ===================================================== */

    function trigger(
        triggerId
    ) {

        const trigger =
            activeTriggers.get(
                triggerId
            );


        if (!trigger) {
            return false;
        }


        return fire(
            trigger
        );
    }


    /* =====================================================
       ENABLE
    ===================================================== */

    function enable(
        triggerId
    ) {

        const trigger =
            activeTriggers.get(
                triggerId
            );


        if (trigger) {

            trigger.enabled =
                true;
        }
    }


    /* =====================================================
       DISABLE
    ===================================================== */

    function disable(
        triggerId
    ) {

        const trigger =
            activeTriggers.get(
                triggerId
            );


        if (trigger) {

            trigger.enabled =
                false;
        }
    }


    /* =====================================================
       RESET TRIGGER
    ===================================================== */

    function reset(
        triggerId
    ) {

        firedTriggers.delete(
            triggerId
        );
    }


    /* =====================================================
       RESET ALL
    ===================================================== */

    function resetAll() {

        firedTriggers.clear();
    }


    /* =====================================================
       BLACKOUT
    ===================================================== */

    function blackout() {

        if (
            typeof Lighting !==
            "undefined" &&
            typeof Lighting.forceBlackout ===
            "function"
        ) {

            Lighting.forceBlackout(
                4000
            );
        }


        if (
            typeof Events !==
            "undefined" &&
            typeof Events.trigger ===
            "function"
        ) {

            Events.trigger(
                "blackout",
                {}
            );
        }
    }


    /* =====================================================
       SPAWN FIRST ENEMY
    ===================================================== */

    function spawnFirstEnemy() {

        if (
            typeof EnemyAI ===
            "undefined"
        ) {

            return;
        }


        if (
            typeof EnemyAI.create !==
            "function"
        ) {

            return;
        }


        EnemyAI.create({

            id:
                "stalker_01",

            name:
                "THE STALKER",

            type:
                "stalker",

            x:
                1800,

            y:
                300,

            health:
                100,

            speed:
                1.1,

            chaseSpeed:
                2.4,

            detectionRange:
                260,

            aggressive:
                true
        });


        notify(
            "SOMETHING IS IN THE DARK"
        );
    }


    /* =====================================================
       COMPLETE CHAPTER
    ===================================================== */

    function completeChapter1() {

        const state =
            getGameState();


        if (!state) {
            return;
        }


        if (
            typeof GameState.setFlag ===
            "function"
        ) {

            GameState.setFlag(
                "chapter1Complete",
                true
            );
        }


        if (
            typeof Story !==
            "undefined" &&
            typeof Story.startDialogue ===
            "function"
        ) {

            Story.startDialogue(
                "chapter1_end"
            );
        }
    }


    /* =====================================================
       DIALOGUE
    ===================================================== */

    function startDialogue(
        dialogueId
    ) {

        if (
            typeof Story !==
            "undefined" &&
            typeof Story.startDialogue ===
            "function"
        ) {

            Story.startDialogue(
                dialogueId
            );
        }
    }


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    function notify(
        message
    ) {

        if (
            typeof Events !==
            "undefined" &&
            typeof Events.trigger ===
            "function"
        ) {

            Events.trigger(
                "notification",
                {
                    message
                }
            );
        }
    }


    /* =====================================================
       PLAYER
    ===================================================== */

    function getPlayer() {

        if (
            typeof Player ===
            "undefined" ||
            typeof Player.getState !==
            "function"
        ) {

            return null;
        }


        return Player.getState();
    }


    /* =====================================================
       GAME STATE
    ===================================================== */

    function getGameState() {

        if (
            typeof GameState ===
            "undefined" ||
            typeof GameState.get !==
            "function"
        ) {

            return null;
        }


        return GameState.get();
    }


    /* =====================================================
       DISTANCE
    ===================================================== */

    function distanceBetween(
        x1,
        y1,
        x2,
        y2
    ) {

        const dx =
            x2 - x1;


        const dy =
            y2 - y1;


        return Math.sqrt(
            dx * dx +
            dy * dy
        );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        loadRoom,

        update,

        fire,

        trigger,

        enable,

        disable,

        reset,

        resetAll
    };

})();
