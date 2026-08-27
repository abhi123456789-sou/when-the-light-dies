/* =========================================================
   WHEN THE LIGHT DIES
   INTERACTION SYSTEM
   Version 0.1.1
========================================================= */

"use strict";


const Interaction = (() => {

    let initialized = false;

    let currentTarget = null;

    const interactionDistance = 90;


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        if (initialized) {
            return;
        }

        initialized = true;

        currentTarget = null;

        hidePrompt();
    }


    /* =====================================================
       UPDATE
    ===================================================== */

    function update() {

        if (
            typeof GameState === "undefined" ||
            typeof Player === "undefined" ||
            typeof World === "undefined" ||
            typeof Input === "undefined"
        ) {

            hidePrompt();

            currentTarget = null;

            return;
        }


        const state =
            GameState.get();


        if (
            !state ||
            !state.gameStarted ||
            state.gamePaused ||
            state.gameOver ||
            !state.player ||
            !state.player.isAlive
        ) {

            currentTarget = null;

            hidePrompt();

            return;
        }


        findTarget();


        if (currentTarget) {

            showPrompt(currentTarget);


            /*
               E key / mobile interaction.
            */

            if (
                Input.isInteractPressed()
            ) {

                interact(
                    currentTarget
                );

                /*
                   Prevent the same object from
                   being triggered repeatedly.
                */

                currentTarget = null;

                hidePrompt();
            }

        } else {

            hidePrompt();
        }
    }


    /* =====================================================
       FIND TARGET
    ===================================================== */

    function findTarget() {

        if (
            typeof World.getCurrentRoom !==
            "function" ||
            typeof World.getObjectsInRoom !==
            "function" ||
            typeof Player.getPosition !==
            "function"
        ) {

            currentTarget = null;

            return;
        }


        const room =
            World.getCurrentRoom();


        if (!room) {

            currentTarget = null;

            return;
        }


        const playerPosition =
            Player.getPosition();


        if (!playerPosition) {

            currentTarget = null;

            return;
        }


        const objects =
            World.getObjectsInRoom(
                room.id
            );


        if (!Array.isArray(objects)) {

            currentTarget = null;

            return;
        }


        let closest = null;

        let closestDistance =
            interactionDistance;


        objects.forEach(object => {

            if (!object) {
                return;
            }


            /*
               Objects without valid coordinates
               cannot be interacted with.
            */

            if (
                typeof object.x !== "number" ||
                typeof object.y !== "number"
            ) {

                return;
            }


            const distance =
                getDistance(
                    playerPosition.x,
                    playerPosition.y,
                    object.x,
                    object.y
                );


            if (
                distance <= closestDistance
            ) {

                closest =
                    object;

                closestDistance =
                    distance;
            }
        });


        currentTarget =
            closest;
    }


    /* =====================================================
       DISTANCE
    ===================================================== */

    function getDistance(
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
       INTERACT
    ===================================================== */

    function interact(object) {

        if (!object) {
            return;
        }


        switch (object.type) {

            case "door":

                interactDoor(object);

                break;


            case "clue":

                interactClue(object);

                break;


            case "container":

                interactContainer(object);

                break;


            case "generator":

                interactGenerator(object);

                break;


            case "light":

                interactLight(object);

                break;


            default:

                genericInteraction(object);

                break;
        }
    }


    /* =====================================================
       DOOR
    ===================================================== */

    function interactDoor(door) {

        if (door.locked) {

            if (
                door.requiredItem &&
                typeof GameState.hasItem ===
                "function" &&
                GameState.hasItem(
                    door.requiredItem
                )
            ) {

                door.locked = false;

                notify(
                    "The door is unlocked."
                );

            } else {

                notify(
                    "It's locked."
                );

                changeSanity(-0.5);

                return;
            }
        }


        if (
            door.targetRoom &&
            typeof World.changeRoom ===
            "function"
        ) {

            World.changeRoom(
                door.targetRoom
            );
        }
    }


    /* =====================================================
       CLUE
    ===================================================== */

    function interactClue(clue) {

        if (!clue.clueId) {

            notify(
                "There is nothing unusual here."
            );

            return;
        }


        if (
            typeof GameState.setStoryFlag ===
            "function"
        ) {

            GameState.setStoryFlag(
                clue.clueId,
                true
            );
        }


        if (
            typeof Story !== "undefined" &&
            typeof Story.discoverClue ===
            "function"
        ) {

            Story.discoverClue(
                clue.clueId
            );

        } else {

            notify(
                "You found something important."
            );
        }


        changeSanity(-1);
    }


    /* =====================================================
       CONTAINER
    ===================================================== */

    function interactContainer(container) {

        if (container.opened) {

            notify(
                "It's already open."
            );

            return;
        }


        if (
            typeof World.openContainer !==
            "function"
        ) {

            notify(
                "You can't open this right now."
            );

            return;
        }


        const opened =
            World.openContainer(
                container.id
            );


        if (opened) {

            notify(
                "You found something."
            );

        } else {

            notify(
                "There is nothing useful here."
            );
        }
    }


    /* =====================================================
       GENERATOR
    ===================================================== */

    function interactGenerator(generator) {

        if (generator.activated) {

            notify(
                "The generator is already running."
            );

            return;
        }


        generator.activated = true;


        if (
            typeof World.activateObject ===
            "function"
        ) {

            World.activateObject(
                generator.id
            );
        }


        notify(
            "The generator starts."
        );


        if (
            typeof Story !== "undefined" &&
            typeof Story.onGeneratorActivated ===
            "function"
        ) {

            Story.onGeneratorActivated(
                generator.id
            );
        }
    }


    /* =====================================================
       LIGHT
    ===================================================== */

    function interactLight(light) {

        light.active =
            !light.active;


        if (
            typeof World.activateObject ===
            "function"
        ) {

            World.activateObject(
                light.id
            );
        }


        notify(
            light.active
                ? "The light comes on."
                : "The light goes out."
        );
    }


    /* =====================================================
       GENERIC
    ===================================================== */

    function genericInteraction(object) {

        notify(
            "You examine it."
        );


        if (
            typeof Story !== "undefined" &&
            typeof Story.onInteraction ===
            "function"
        ) {

            Story.onInteraction(
                object.id
            );
        }
    }


    /* =====================================================
       UI PROMPT
    ===================================================== */

    function showPrompt(object) {

        const prompt =
            document.getElementById(
                "interaction-prompt"
            );


        const text =
            document.getElementById(
                "interaction-text"
            );


        const key =
            document.getElementById(
                "interaction-key"
            );


        if (!prompt) {
            return;
        }


        prompt.classList.add(
            "visible"
        );


        if (key) {

            key.textContent =
                "E";
        }


        if (text) {

            text.textContent =
                getInteractionText(
                    object
                );
        }
    }


    function hidePrompt() {

        const prompt =
            document.getElementById(
                "interaction-prompt"
            );


        if (!prompt) {
            return;
        }


        prompt.classList.remove(
            "visible"
        );
    }


    /* =====================================================
       INTERACTION TEXT
    ===================================================== */

    function getInteractionText(object) {

        if (!object) {
            return "INTERACT";
        }


        switch (object.type) {

            case "door":
                return "OPEN";


            case "clue":
                return "EXAMINE";


            case "container":
                return "SEARCH";


            case "generator":
                return "ACTIVATE";


            case "light":
                return "TOGGLE";


            default:
                return "INTERACT";
        }
    }


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    function notify(message) {

        const container =
            document.getElementById(
                "notification-container"
            );


        if (!container) {
            return;
        }


        const notification =
            document.createElement(
                "div"
            );


        notification.className =
            "game-notification";


        notification.textContent =
            message;


        container.appendChild(
            notification
        );


        window.setTimeout(
            () => {

                notification.classList.add(
                    "fade-out"
                );


                window.setTimeout(
                    () => {

                        notification.remove();

                    },
                    400
                );

            },
            2500
        );
    }


    /* =====================================================
       SANITY
    ===================================================== */

    function changeSanity(amount) {

        if (
            typeof GameState !== "undefined" &&
            typeof GameState.changeSanity ===
            "function"
        ) {

            GameState.changeSanity(
                amount
            );
        }
    }


    /* =====================================================
       CURRENT TARGET
    ===================================================== */

    function getCurrentTarget() {

        return currentTarget;
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        update,

        interact,

        getCurrentTarget,

        notify
    };

})();
