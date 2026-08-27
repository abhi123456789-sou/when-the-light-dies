/* =========================================================
   WHEN THE LIGHT DIES
   WORLD SYSTEM
   Story-Driven Horror Environment
========================================================= */

"use strict";


const World = (() => {

    let initialized = false;

    let currentRoom = null;


    /* =====================================================
       WORLD CONFIGURATION
    ===================================================== */

    const rooms = {

        intro: {
            id: "intro",
            name: "The Beginning",
            width: 1600,
            height: 900,

            spawn: {
                x: 800,
                y: 450
            },

            darkness: 0.45,

            exits: {
                north: "hallway",
                east: "living-room"
            }
        },


        hallway: {
            id: "hallway",
            name: "The Hallway",
            width: 1800,
            height: 700,

            spawn: {
                x: 900,
                y: 350
            },

            darkness: 0.65,

            exits: {
                south: "intro",
                north: "bedroom",
                east: "basement"
            }
        },


        "living-room": {
            id: "living-room",
            name: "Living Room",
            width: 1400,
            height: 900,

            spawn: {
                x: 700,
                y: 450
            },

            darkness: 0.55,

            exits: {
                west: "intro",
                north: "kitchen"
            }
        },


        kitchen: {
            id: "kitchen",
            name: "Kitchen",
            width: 1200,
            height: 800,

            spawn: {
                x: 600,
                y: 400
            },

            darkness: 0.60,

            exits: {
                south: "living-room"
            }
        },


        bedroom: {
            id: "bedroom",
            name: "Bedroom",
            width: 1200,
            height: 800,

            spawn: {
                x: 600,
                y: 400
            },

            darkness: 0.72,

            exits: {
                south: "hallway"
            }
        },


        basement: {
            id: "basement",
            name: "Basement",
            width: 1800,
            height: 1100,

            spawn: {
                x: 900,
                y: 550
            },

            darkness: 0.90,

            exits: {
                west: "hallway"
            }
        }
    };


    /* =====================================================
       OBJECTS
    ===================================================== */

    const objects = {

        intro: [],

        hallway: [

            {
                id: "hallway-door",
                type: "door",

                x: 150,
                y: 300,

                targetRoom: "bedroom",

                locked: false
            },

            {
                id: "basement-door",
                type: "door",

                x: 1650,
                y: 300,

                targetRoom: "basement",

                locked: true,

                requiredItem:
                    "basement_key"
            }
        ],


        "living-room": [

            {
                id: "living-room-light",
                type: "light",

                x: 700,
                y: 150,

                active: true
            },

            {
                id: "old-television",
                type: "clue",

                x: 400,
                y: 400,

                clueId:
                    "television_message"
            }
        ],


        kitchen: [

            {
                id: "kitchen-cabinet",
                type: "container",

                x: 800,
                y: 300,

                opened: false,

                contains:
                    "small_key"
            }
        ],


        bedroom: [

            {
                id: "bedroom-diary",
                type: "clue",

                x: 500,
                y: 300,

                clueId:
                    "missing_person_diary"
            }
        ],


        basement: [

            {
                id: "basement-generator",
                type: "generator",

                x: 900,
                y: 400,

                activated: false
            }
        ]
    };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        if (initialized) {
            return;
        }

        initialized = true;

        currentRoom =
            rooms.intro;

        GameState.changeRoom(
            currentRoom.id
        );

        Player.setPosition(
            currentRoom.spawn.x,
            currentRoom.spawn.y
        );

        applyRoomEnvironment();
    }


    /* =====================================================
       UPDATE
    ===================================================== */

    function update(delta) {

        if (!initialized) {
            return;
        }

        const state =
            GameState.get();

        if (
            !state.gameStarted ||
            state.gamePaused ||
            state.gameOver
        ) {
            return;
        }


        updateBoundaries();

        checkRoomTransitions();

        updateEnvironment(
            delta
        );
    }


    /* =====================================================
       WORLD BOUNDARIES
    ===================================================== */

    function updateBoundaries() {

        if (!currentRoom) {
            return;
        }

        const position =
            Player.getPosition();

        const halfWidth = 25;
        const halfHeight = 25;


        const x =
            Math.max(
                halfWidth,
                Math.min(
                    currentRoom.width -
                    halfWidth,

                    position.x
                )
            );


        const y =
            Math.max(
                halfHeight,
                Math.min(
                    currentRoom.height -
                    halfHeight,

                    position.y
                )
            );


        if (
            x !== position.x ||
            y !== position.y
        ) {

            Player.setPosition(
                x,
                y
            );
        }
    }


    /* =====================================================
       ROOM TRANSITIONS
    ===================================================== */

    function checkRoomTransitions() {

        if (!currentRoom) {
            return;
        }

        const position =
            Player.getPosition();


        const margin = 30;


        /*
           NORTH
        */

        if (
            position.y <= margin &&
            currentRoom.exits.north
        ) {

            changeRoom(
                currentRoom.exits.north
            );

            return;
        }


        /*
           SOUTH
        */

        if (
            position.y >=
            currentRoom.height -
            margin &&

            currentRoom.exits.south
        ) {

            changeRoom(
                currentRoom.exits.south
            );

            return;
        }


        /*
           EAST
        */

        if (
            position.x >=
            currentRoom.width -
            margin &&

            currentRoom.exits.east
        ) {

            changeRoom(
                currentRoom.exits.east
            );

            return;
        }


        /*
           WEST
        */

        if (
            position.x <= margin &&
            currentRoom.exits.west
        ) {

            changeRoom(
                currentRoom.exits.west
            );
        }
    }


    /* =====================================================
       CHANGE ROOM
    ===================================================== */

    function changeRoom(
        roomId
    ) {

        const nextRoom =
            rooms[roomId];


        if (!nextRoom) {

            console.warn(
                "Unknown room:",
                roomId
            );

            return false;
        }


        currentRoom =
            nextRoom;


        GameState.changeRoom(
            roomId
        );


        Player.setPosition(
            nextRoom.spawn.x,
            nextRoom.spawn.y
        );


        applyRoomEnvironment();


        /*
           Notify story system.
        */

        if (
            typeof Story !==
            "undefined" &&
            typeof Story.onRoomEnter ===
            "function"
        ) {

            Story.onRoomEnter(
                roomId
            );
        }


        /*
           Trigger room event.
        */

        if (
            typeof Events !==
            "undefined" &&
            typeof Events.onRoomEnter ===
            "function"
        ) {

            Events.onRoomEnter(
                roomId
            );
        }


        return true;
    }


    /* =====================================================
       ROOM ENVIRONMENT
    ===================================================== */

    function applyRoomEnvironment() {

        if (!currentRoom) {
            return;
        }


        const background =
            document.getElementById(
                "world-background"
            );


        const darkness =
            document.getElementById(
                "darkness"
            );


        if (background) {

            background.dataset.room =
                currentRoom.id;
        }


        if (darkness) {

            darkness.style.opacity =
                currentRoom.darkness;
        }
    }


    /* =====================================================
       ENVIRONMENT UPDATE
    ===================================================== */

    function updateEnvironment(
        delta
    ) {

        if (!currentRoom) {
            return;
        }


        /*
           Future systems:
           weather
           lights
           environmental events
           moving objects
           scripted scenes
        */


        updateLighting(
            delta
        );
    }


    /* =====================================================
       LIGHTING
    ===================================================== */

    function updateLighting(
        delta
    ) {

        const state =
            GameState.get();


        const darkness =
            document.getElementById(
                "darkness"
            );


        if (!darkness) {
            return;
        }


        let darknessLevel =
            currentRoom.darkness;


        /*
           Flashlight reduces perceived
           darkness.
        */

        if (
            state.player.flashlightOn
        ) {

            darknessLevel -=
                0.25;
        }


        darknessLevel =
            Math.max(
                0,
                Math.min(
                    1,
                    darknessLevel
                )
            );


        darkness.style.opacity =
            darknessLevel;
    }


    /* =====================================================
       GET ROOM
    ===================================================== */

    function getCurrentRoom() {

        return currentRoom;
    }


    function getRoom(
        roomId
    ) {

        return rooms[roomId] ||
            null;
    }


    /* =====================================================
       GET OBJECTS
    ===================================================== */

    function getObjectsInRoom(
        roomId = null
    ) {

        const id =
            roomId ||
            currentRoom?.id;


        return objects[id] ||
            [];
    }


    function getObject(
        objectId,
        roomId = null
    ) {

        const roomObjects =
            getObjectsInRoom(
                roomId
            );


        return roomObjects.find(
            object =>
                object.id ===
                objectId
        ) || null;
    }


    /* =====================================================
       OBJECT STATE
    ===================================================== */

    function activateObject(
        objectId
    ) {

        const object =
            getObject(
                objectId
            );


        if (!object) {
            return false;
        }


        object.active =
            true;

        object.activated =
            true;


        GameState.setWorldFlag(
            objectId,
            true
        );


        return true;
    }


    /* =====================================================
       DOOR
    ===================================================== */

    function openDoor(
        objectId
    ) {

        const door =
            getObject(
                objectId
            );


        if (
            !door ||
            door.type !== "door"
        ) {

            return false;
        }


        if (
            door.locked
        ) {

            if (
                door.requiredItem &&
                !GameState.hasItem(
                    door.requiredItem
                )
            ) {

                return false;
            }


            door.locked =
                false;
        }


        if (
            door.targetRoom
        ) {

            return changeRoom(
                door.targetRoom
            );
        }


        return true;
    }


    /* =====================================================
       CONTAINER
    ===================================================== */

    function openContainer(
        objectId
    ) {

        const container =
            getObject(
                objectId
            );


        if (
            !container ||
            container.type !==
                "container"
        ) {

            return false;
        }


        if (
            container.opened
        ) {

            return false;
        }


        container.opened =
            true;


        GameState.setWorldFlag(
            `${objectId}_opened`,
            true
        );


        if (
            container.contains
        ) {

            GameState.addItem(
                container.contains
            );

            container.contains =
                null;
        }


        return true;
    }


    /* =====================================================
       GET WORLD DATA
    ===================================================== */

    function getAllRooms() {

        return {
            ...rooms
        };
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        update,

        changeRoom,

        getCurrentRoom,

        getRoom,

        getObjectsInRoom,

        getObject,

        activateObject,

        openDoor,

        openContainer,

        getAllRooms
    };

})();
