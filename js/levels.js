/* =========================================================
   WHEN THE LIGHT DIES
   LEVEL / WORLD DATA SYSTEM
========================================================= */

"use strict";


const Levels = (() => {

    const levels = {

        /* =================================================
           CHAPTER 1
        ================================================= */

        chapter1: {

            id: 1,

            title:
                "THE AWAKENING",

            startRoom:
                "room_01",

            rooms: {

                /* =========================================
                   ROOM 01
                ========================================= */

                room_01: {

                    id:
                        "room_01",

                    name:
                        "THE ROOM",

                    width:
                        1200,

                    height:
                        800,

                    background:
                        "room_dark",

                    spawn: {

                        x: 600,

                        y: 400
                    },

                    exits: {

                        north:
                            "room_02",

                        east:
                            null,

                        south:
                            null,

                        west:
                            null
                    },

                    objects: [

                        {

                            id:
                                "door_main",

                            type:
                                "door",

                            x:
                                1050,

                            y:
                                400,

                            locked:
                                true,

                            requiredItem:
                                "old_key"
                        },

                        {

                            id:
                                "floor_note",

                            type:
                                "document",

                            x:
                                520,

                            y:
                                500,

                            interactable:
                                true,

                            event:
                                "read_first_note"
                        },

                        {

                            id:
                                "old_flashlight",

                            type:
                                "item",

                            x:
                                650,

                            y:
                                470,

                            interactable:
                                true,

                            item:
                                "flashlight"
                        }
                    ],

                    triggers: [

                        {

                            id:
                                "wake_trigger",

                            type:
                                "enter",

                            x:
                                600,

                            y:
                                400,

                            radius:
                                120,

                            event:
                                "chapter1_wake"
                        }
                    ]
                },


                /* =========================================
                   ROOM 02
                ========================================= */

                room_02: {

                    id:
                        "room_02",

                    name:
                        "THE HALLWAY",

                    width:
                        1800,

                    height:
                        700,

                    background:
                        "hallway_dark",

                    spawn: {

                        x:
                            100,

                        y:
                            350
                    },

                    exits: {

                        north:
                            "room_03",

                        east:
                            "room_04",

                        south:
                            "room_01",

                        west:
                            null
                    },

                    objects: [

                        {

                            id:
                                "hall_light",

                            type:
                                "light",

                            x:
                                900,

                            y:
                                150,

                            interactable:
                                false
                        },

                        {

                            id:
                                "hall_door",

                            type:
                                "door",

                            x:
                                1700,

                            y:
                                350,

                            locked:
                                false
                        }
                    ],

                    triggers: [

                        {

                            id:
                                "hallway_footsteps",

                            type:
                                "enter",

                            x:
                                850,

                            y:
                                350,

                            radius:
                                150,

                            event:
                                "hallway_footsteps"
                        }
                    ]
                },


                /* =========================================
                   ROOM 03
                ========================================= */

                room_03: {

                    id:
                        "room_03",

                    name:
                        "THE STORAGE ROOM",

                    width:
                        1000,

                    height:
                        700,

                    background:
                        "storage_dark",

                    spawn: {

                        x:
                            500,

                        y:
                            600
                    },

                    exits: {

                        north:
                            null,

                        east:
                            null,

                        south:
                            "room_02",

                        west:
                            null
                    },

                    objects: [

                        {

                            id:
                                "battery_01",

                            type:
                                "item",

                            x:
                                350,

                            y:
                                300,

                            interactable:
                                true,

                            item:
                                "battery"
                        },

                        {

                            id:
                                "storage_key",

                            type:
                                "item",

                            x:
                                700,

                            y:
                                250,

                            interactable:
                                true,

                            item:
                                "old_key"
                        }
                    ],

                    triggers: [

                        {

                            id:
                                "storage_sound",

                            type:
                                "enter",

                            x:
                                500,

                            y:
                                300,

                            radius:
                                100,

                            event:
                                "storage_noise"
                        }
                    ]
                },


                /* =========================================
                   ROOM 04
                ========================================= */

                room_04: {

                    id:
                        "room_04",

                    name:
                        "THE DARK CORRIDOR",

                    width:
                        2200,

                    height:
                        600,

                    background:
                        "corridor_dark",

                    spawn: {

                        x:
                            100,

                        y:
                            300
                    },

                    exits: {

                        north:
                            null,

                        east:
                            "room_05",

                        south:
                            null,

                        west:
                            "room_02"
                    },

                    objects: [],

                    triggers: [

                        {

                            id:
                                "corridor_blackout",

                            type:
                                "enter",

                            x:
                                900,

                            y:
                                300,

                            radius:
                                180,

                            event:
                                "corridor_blackout"
                        },

                        {

                            id:
                                "corridor_enemy",

                            type:
                                "enter",

                            x:
                                1500,

                            y:
                                300,

                            radius:
                                200,

                            event:
                                "first_enemy_encounter"
                        }
                    ]
                },


                /* =========================================
                   ROOM 05
                ========================================= */

                room_05: {

                    id:
                        "room_05",

                    name:
                        "THE BASEMENT",

                    width:
                        1600,

                    height:
                        1000,

                    background:
                        "basement_dark",

                    spawn: {

                        x:
                            200,

                        y:
                            500
                    },

                    exits: {

                        north:
                            "room_06",

                        east:
                            null,

                        south:
                            null,

                        west:
                            "room_04"
                    },

                    objects: [

                        {

                            id:
                                "basement_generator",

                            type:
                                "generator",

                            x:
                                1100,

                            y:
                                500,

                            interactable:
                                true,

                            event:
                                "generator_start"
                        }
                    ],

                    triggers: [

                        {

                            id:
                                "basement_awakening",

                            type:
                                "enter",

                            x:
                                800,

                            y:
                                500,

                            radius:
                                250,

                            event:
                                "basement_entity"
                        }
                    ]
                },


                /* =========================================
                   ROOM 06
                ========================================= */

                room_06: {

                    id:
                        "room_06",

                    name:
                        "THE EXIT",

                    width:
                        1200,

                    height:
                        800,

                    background:
                        "exit_dark",

                    spawn: {

                        x:
                            600,

                        y:
                            700
                    },

                    exits: {

                        north:
                            null,

                        east:
                            null,

                        south:
                            "room_05",

                        west:
                            null
                    },

                    objects: [

                        {

                            id:
                                "exit_door",

                            type:
                                "door",

                            x:
                                600,

                            y:
                                100,

                            locked:
                                true,

                            requiredFlag:
                                "generatorActivated"
                        }
                    ],

                    triggers: [

                        {

                            id:
                                "chapter1_end",

                            type:
                                "enter",

                            x:
                                600,

                            y:
                                200,

                            radius:
                                100,

                            event:
                                "chapter1_complete"
                        }
                    ]
                }
            }
        }
    };


    /* =====================================================
       GET LEVEL
    ===================================================== */

    function getLevel(
        levelId
    ) {

        return (
            levels[levelId] ||
            null
        );
    }


    /* =====================================================
       GET ROOM
    ===================================================== */

    function getRoom(
        roomId
    ) {

        const chapter =
            levels.chapter1;


        if (!chapter) {
            return null;
        }


        return (
            chapter.rooms[
                roomId
            ] ||
            null
        );
    }


    /* =====================================================
       GET START ROOM
    ===================================================== */

    function getStartRoom(
        chapterId = 1
    ) {

        const chapter =
            levels[
                `chapter${chapterId}`
            ];


        if (!chapter) {
            return null;
        }


        return chapter.startRoom;
    }


    /* =====================================================
       GET ROOM OBJECTS
    ===================================================== */

    function getObjects(
        roomId
    ) {

        const room =
            getRoom(
                roomId
            );


        if (!room) {
            return [];
        }


        return room.objects || [];
    }


    /* =====================================================
       GET ROOM TRIGGERS
    ===================================================== */

    function getTriggers(
        roomId
    ) {

        const room =
            getRoom(
                roomId
            );


        if (!room) {
            return [];
        }


        return room.triggers || [];
    }


    /* =====================================================
       GET EXIT
    ===================================================== */

    function getExit(
        roomId,
        direction
    ) {

        const room =
            getRoom(
                roomId
            );


        if (!room) {
            return null;
        }


        return (
            room.exits?.[
                direction
            ] ||
            null
        );
    }


    /* =====================================================
       CHECK DOOR
    ===================================================== */

    function canOpenObject(
        object
    ) {

        if (!object) {
            return false;
        }


        if (
            object.locked !== true
        ) {

            return true;
        }


        const state =
            getGameState();


        if (!state) {
            return false;
        }


        if (
            object.requiredFlag
        ) {

            return Boolean(
                state.storyFlags?.[
                    object.requiredFlag
                ]
            );
        }


        if (
            object.requiredItem
        ) {

            return hasItem(
                state,
                object.requiredItem
            );
        }


        return false;
    }


    /* =====================================================
       HAS ITEM
    ===================================================== */

    function hasItem(
        state,
        itemId
    ) {

        const inventory =
            state.player?.inventory;


        if (
            !Array.isArray(
                inventory
            )
        ) {

            return false;
        }


        return inventory.includes(
            itemId
        );
    }


    /* =====================================================
       GAME STATE
    ===================================================== */

    function getGameState() {

        if (
            typeof GameState ===
            "undefined"
        ) {

            return null;
        }


        if (
            typeof GameState.get !==
            "function"
        ) {

            return null;
        }


        return GameState.get();
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        getLevel,

        getRoom,

        getStartRoom,

        getObjects,

        getTriggers,

        getExit,

        canOpenObject
    };

})();
