/* =========================================================
   WHEN THE LIGHT DIES
   QUEST / OBJECTIVE SYSTEM
========================================================= */

"use strict";


const Quests = (() => {

    const quests = {

        intro_start: {

            id: "intro_start",

            title: "FIND A WAY OUT",

            description:
                "Something is wrong. Find out where you are.",

            type: "main",

            chapter: 1,

            required: [],

            completed: false,

            hidden: false
        },


        search_room: {

            id: "search_room",

            title: "SEARCH THE ROOM",

            description:
                "Look around the room for anything useful.",

            type: "main",

            chapter: 1,

            required: [
                {
                    type: "flag",
                    id: "searchedRoom",
                    value: true
                }
            ],

            completed: false,

            hidden: true
        },


        find_flashlight: {

            id: "find_flashlight",

            title: "FIND A LIGHT",

            description:
                "The darkness is making it impossible to see. Find a source of light.",

            type: "main",

            chapter: 1,

            required: [
                {
                    type: "item",
                    id: "flashlight",
                    amount: 1
                }
            ],

            completed: false,

            hidden: true
        },


        find_key: {

            id: "find_key",

            title: "FIND THE OLD KEY",

            description:
                "Find something that can open the locked door.",

            type: "main",

            chapter: 1,

            required: [
                {
                    type: "item",
                    id: "old_key",
                    amount: 1
                }
            ],

            completed: false,

            hidden: true
        },


        leave_room: {

            id: "leave_room",

            title: "LEAVE THE ROOM",

            description:
                "Use the key and find a way into the hallway.",

            type: "main",

            chapter: 1,

            required: [
                {
                    type: "flag",
                    id: "mainDoorOpened",
                    value: true
                }
            ],

            completed: false,

            hidden: true
        },


        reach_basement: {

            id: "reach_basement",

            title: "DESCEND INTO THE BASEMENT",

            description:
                "Something is waiting below. Find a way into the basement.",

            type: "main",

            chapter: 1,

            required: [
                {
                    type: "room",
                    id: "room_05"
                }
            ],

            completed: false,

            hidden: true
        },


        activate_generator: {

            id: "activate_generator",

            title: "RESTORE THE POWER",

            description:
                "Find the generator and restore power to the building.",

            type: "main",

            chapter: 1,

            required: [
                {
                    type: "flag",
                    id: "generatorActivated",
                    value: true
                }
            ],

            completed: false,

            hidden: true
        },


        escape: {

            id: "escape",

            title: "ESCAPE",

            description:
                "The exit is open. Get out before it is too late.",

            type: "main",

            chapter: 1,

            required: [
                {
                    type: "flag",
                    id: "escaped",
                    value: true
                }
            ],

            completed: false,

            hidden: true
        }
    };


    let activeQuestId = null;


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        activeQuestId =
            null;

        Object.values(
            quests
        ).forEach(
            quest => {

                quest.completed =
                    false;
            }
        );
    }


    /* =====================================================
       GET QUEST
    ===================================================== */

    function get(
        questId
    ) {

        return (
            quests[questId] ||
            null
        );
    }


    /* =====================================================
       GET ALL
    ===================================================== */

    function getAll() {

        return Object.values(
            quests
        );
    }


    /* =====================================================
       GET ACTIVE
    ===================================================== */

    function getActive() {

        if (!activeQuestId) {
            return null;
        }

        return get(
            activeQuestId
        );
    }


    /* =====================================================
       SET ACTIVE
    ===================================================== */

    function setActive(
        questId
    ) {

        const quest =
            get(questId);


        if (!quest) {
            return false;
        }


        quest.hidden =
            false;


        activeQuestId =
            questId;


        updateHUD();


        return true;
    }


    /* =====================================================
       COMPLETE
    ===================================================== */

    function complete(
        questId
    ) {

        const quest =
            get(questId);


        if (!quest) {
            return false;
        }


        if (
            quest.completed
        ) {

            return true;
        }


        quest.completed =
            true;


        if (
            activeQuestId ===
            questId
        ) {

            activeQuestId =
                null;
        }


        triggerEvent(
            "quest_completed",
            {
                questId
            }
        );


        updateHUD();


        return true;
    }


    /* =====================================================
       CHECK ACTIVE QUEST
    ===================================================== */

    function checkActive() {

        const quest =
            getActive();


        if (!quest) {
            return false;
        }


        if (
            checkRequirements(
                quest
            )
        ) {

            complete(
                quest.id
            );

            return true;
        }


        return false;
    }


    /* =====================================================
       CHECK QUEST
    ===================================================== */

    function check(
        questId
    ) {

        const quest =
            get(questId);


        if (!quest) {
            return false;
        }


        return checkRequirements(
            quest
        );
    }


    /* =====================================================
       REQUIREMENTS
    ===================================================== */

    function checkRequirements(
        quest
    ) {

        if (
            !quest.required ||
            quest.required.length === 0
        ) {

            return true;
        }


        return quest.required.every(
            requirement =>
                checkRequirement(
                    requirement
                )
        );
    }


    /* =====================================================
       SINGLE REQUIREMENT
    ===================================================== */

    function checkRequirement(
        requirement
    ) {

        if (!requirement) {
            return false;
        }


        switch (
            requirement.type
        ) {

            case "flag":

                return checkFlag(
                    requirement
                );


            case "item":

                return checkItem(
                    requirement
                );


            case "room":

                return checkRoom(
                    requirement
                );


            case "health":

                return checkHealth(
                    requirement
                );


            case "sanity":

                return checkSanity(
                    requirement
                );


            case "choice":

                return checkChoice(
                    requirement
                );


            default:

                return false;
        }
    }


    /* =====================================================
       FLAG
    ===================================================== */

    function checkFlag(
        requirement
    ) {

        const state =
            getGameState();


        if (!state) {
            return false;
        }


        const flags =
            state.storyFlags || {};


        return (
            flags[
                requirement.id
            ] ===
            requirement.value
        );
    }


    /* =====================================================
       ITEM
    ===================================================== */

    function checkItem(
        requirement
    ) {

        if (
            typeof Items !==
            "undefined" &&
            typeof Items.count ===
            "function"
        ) {

            return (
                Items.count(
                    requirement.id
                ) >=
                (
                    requirement.amount ||
                    1
                )
            );
        }


        const state =
            getGameState();


        const inventory =
            state?.player?.inventory;


        if (
            !Array.isArray(
                inventory
            )
        ) {

            return false;
        }


        const count =
            inventory.filter(
                item =>
                    item ===
                    requirement.id
            ).length;


        return (
            count >=
            (
                requirement.amount ||
                1
            )
        );
    }


    /* =====================================================
       ROOM
    ===================================================== */

    function checkRoom(
        requirement
    ) {

        const state =
            getGameState();


        if (!state) {
            return false;
        }


        return (
            state.room ===
            requirement.id ||
            state.currentRoom ===
            requirement.id
        );
    }


    /* =====================================================
       HEALTH
    ===================================================== */

    function checkHealth(
        requirement
    ) {

        const state =
            getGameState();


        if (
            !state?.player
        ) {

            return false;
        }


        return (
            state.player.health >=
            requirement.value
        );
    }


    /* =====================================================
       SANITY
    ===================================================== */

    function checkSanity(
        requirement
    ) {

        const state =
            getGameState();


        if (
            !state?.player
        ) {

            return false;
        }


        return (
            state.player.sanity >=
            requirement.value
        );
    }


    /* =====================================================
       CHOICE
    ===================================================== */

    function checkChoice(
        requirement
    ) {

        const state =
            getGameState();


        if (!state) {
            return false;
        }


        const choices =
            state.choices || {};


        return (
            choices[
                requirement.id
            ] ===
            requirement.value
        );
    }


    /* =====================================================
       AUTO PROGRESSION
    ===================================================== */

    function update() {

        if (!activeQuestId) {
            return;
        }


        const completed =
            checkActive();


        if (!completed) {
            return;
        }


        progressStory();
    }


    /* =====================================================
       STORY PROGRESSION
    ===================================================== */

    function progressStory() {

        const state =
            getGameState();


        if (!state) {
            return;
        }


        const completedQuest =
            getActive();


        /*
           Intro
        */

        if (
            state.storyFlags?.searchedRoom
        ) {

            const quest =
                get("search_room");

            if (
                quest &&
                !quest.completed
            ) {

                complete(
                    quest.id
                );
            }
        }


        /*
           Flashlight
        */

        if (
            hasItem(
                "flashlight"
            )
        ) {

            const quest =
                get("find_flashlight");

            if (
                quest &&
                !quest.completed
            ) {

                complete(
                    quest.id
                );
            }
        }


        /*
           Key
        */

        if (
            hasItem(
                "old_key"
            )
        ) {

            const quest =
                get("find_key");

            if (
                quest &&
                !quest.completed
            ) {

                complete(
                    quest.id
                );
            }
        }


        /*
           Generator
        */

        if (
            state.storyFlags?.generatorActivated
        ) {

            complete(
                "activate_generator"
            );

            setActive(
                "escape"
            );
        }
    }


    /* =====================================================
       ITEM HELPER
    ===================================================== */

    function hasItem(
        itemId
    ) {

        if (
            typeof Items !==
            "undefined" &&
            typeof Items.has ===
            "function"
        ) {

            return Items.has(
                itemId
            );
        }


        return false;
    }


    /* =====================================================
       HUD
    ===================================================== */

    function updateHUD() {

        const quest =
            getActive();


        const objective =
            document.getElementById(
                "objective-text"
            );


        if (!objective) {
            return;
        }


        if (!quest) {

            objective.textContent =
                "...";

            return;
        }


        objective.textContent =
            quest.title;
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
       EVENT BRIDGE
    ===================================================== */

    function triggerEvent(
        eventName,
        data
    ) {

        if (
            typeof Events !==
            "undefined" &&
            typeof Events.trigger ===
            "function"
        ) {

            Events.trigger(
                eventName,
                data
            );
        }
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        get,

        getAll,

        getActive,

        setActive,

        complete,

        check,

        checkActive,

        update
    };

})();
