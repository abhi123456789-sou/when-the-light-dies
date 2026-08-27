/* =========================================================
   WHEN THE LIGHT DIES
   ITEM SYSTEM
========================================================= */

"use strict";


const Items = (() => {

    const itemDatabase = {

        flashlight: {
            id: "flashlight",
            name: "OLD FLASHLIGHT",
            type: "equipment",
            description: "An old flashlight. Its battery is almost dead.",
            usable: true,
            stackable: false,
            maxStack: 1
        },

        battery: {
            id: "battery",
            name: "BATTERY",
            type: "consumable",
            description: "A replacement battery for the flashlight.",
            usable: true,
            stackable: true,
            maxStack: 5
        },

        old_key: {
            id: "old_key",
            name: "OLD KEY",
            type: "key",
            description: "A rusted key. It may open an old door.",
            usable: false,
            stackable: false,
            maxStack: 1
        },

        first_note: {
            id: "first_note",
            name: "OLD NOTE",
            type: "document",
            description: "A handwritten note containing a disturbing message.",
            usable: true,
            stackable: false,
            maxStack: 1
        },

        medicine: {
            id: "medicine",
            name: "MEDICAL KIT",
            type: "consumable",
            description: "Basic medical supplies.",
            usable: true,
            stackable: true,
            maxStack: 3
        },

        ritual_object: {
            id: "ritual_object",
            name: "STRANGE OBJECT",
            type: "story",
            description: "Something that should not exist.",
            usable: true,
            stackable: false,
            maxStack: 1
        }
    };


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        /*
           Item definitions are static.
           Player inventory is controlled by GameState.
        */

        return true;
    }


    /* =====================================================
       GET ITEM
    ===================================================== */

    function get(itemId) {

        return (
            itemDatabase[itemId] ||
            null
        );
    }


    /* =====================================================
       EXISTS
    ===================================================== */

    function exists(itemId) {

        return Boolean(
            itemDatabase[itemId]
        );
    }


    /* =====================================================
       GET ALL ITEMS
    ===================================================== */

    function getAll() {

        return Object.values(
            itemDatabase
        );
    }


    /* =====================================================
       ADD ITEM
    ===================================================== */

    function add(itemId, amount = 1) {

        const item =
            get(itemId);

        if (!item) {

            console.warn(
                "Unknown item:",
                itemId
            );

            return false;
        }


        if (
            typeof GameState ===
            "undefined" ||
            typeof GameState.addItem !==
            "function"
        ) {

            return false;
        }


        const quantity =
            Math.max(
                1,
                Number(amount) || 1
            );


        for (
            let i = 0;
            i < quantity;
            i++
        ) {

            GameState.addItem(
                itemId
            );
        }


        return true;
    }


    /* =====================================================
       REMOVE ITEM
    ===================================================== */

    function remove(
        itemId,
        amount = 1
    ) {

        const item =
            get(itemId);

        if (!item) {
            return false;
        }


        if (
            typeof GameState ===
            "undefined" ||
            typeof GameState.removeItem !==
            "function"
        ) {

            return false;
        }


        const quantity =
            Math.max(
                1,
                Number(amount) || 1
            );


        for (
            let i = 0;
            i < quantity;
            i++
        ) {

            GameState.removeItem(
                itemId
            );
        }


        return true;
    }


    /* =====================================================
       HAS ITEM
    ===================================================== */

    function has(itemId) {

        const state =
            getGameState();


        if (!state) {
            return false;
        }


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
       COUNT ITEM
    ===================================================== */

    function count(itemId) {

        const state =
            getGameState();


        if (!state) {
            return 0;
        }


        const inventory =
            state.player?.inventory;


        if (
            !Array.isArray(
                inventory
            )
        ) {

            return 0;
        }


        return inventory.filter(
            id =>
                id === itemId
        ).length;
    }


    /* =====================================================
       USE ITEM
    ===================================================== */

    function use(itemId) {

        if (!has(itemId)) {
            return false;
        }


        switch (itemId) {

            case "battery":

                useBattery();

                return true;


            case "medicine":

                useMedicine();

                return true;


            case "first_note":

                readNote();

                return true;


            case "ritual_object":

                useRitualObject();

                return true;


            case "flashlight":

                useFlashlight();

                return true;


            default:

                return false;
        }
    }


    /* =====================================================
       BATTERY
    ===================================================== */

    function useBattery() {

        if (!has("battery")) {
            return false;
        }


        if (
            typeof Player !==
            "undefined" &&
            typeof Player.rechargeBattery ===
            "function"
        ) {

            Player.rechargeBattery(
                35
            );
        }


        remove(
            "battery"
        );


        notify(
            "FLASHLIGHT BATTERY RECHARGED"
        );


        return true;
    }


    /* =====================================================
       MEDICINE
    ===================================================== */

    function useMedicine() {

        if (!has("medicine")) {
            return false;
        }


        if (
            typeof Player !==
            "undefined" ||
            typeof Player.heal ===
            "function"
        ) {

            Player.heal(
                25
            );
        }


        remove(
            "medicine"
        );


        notify(
            "HEALTH RESTORED"
        );


        return true;
    }


    /* =====================================================
       FLASHLIGHT
    ===================================================== */

    function useFlashlight() {

        if (
            typeof Player !==
            "undefined" &&
            typeof Player.toggleFlashlight ===
            "function"
        ) {

            Player.toggleFlashlight();

            return true;
        }


        return false;
    }


    /* =====================================================
       READ NOTE
    ===================================================== */

    function readNote() {

        if (
            typeof Story !==
            "undefined" &&
            typeof Story.startDialogue ===
            "function"
        ) {

            Story.startDialogue(
                "first_note"
            );

            return true;
        }


        return false;
    }


    /* =====================================================
       RITUAL OBJECT
    ===================================================== */

    function useRitualObject() {

        if (
            typeof Events !==
            "undefined" &&
            typeof Events.trigger ===
            "function"
        ) {

            Events.trigger(
                "ritual_object_used",
                {
                    item:
                        "ritual_object"
                }
            );


            return true;
        }


        return false;
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
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        get,

        exists,

        getAll,

        add,

        remove,

        has,

        count,

        use
    };

})();
